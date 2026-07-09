import { GoogleGenAI, Type } from '@google/genai';
import { readDb, findSession } from '../db/db.service.js';

const PRIMARY_MODEL = process.env.GEMINI_MODEL ?? 'gemini-2.5-flash-lite';
const FALLBACK_MODEL = process.env.GEMINI_FALLBACK_MODEL ?? 'gemini-2.5-flash';

export interface AgentRecommendationResult {
  recommendations: { profession: string; matchPercentage: number; reason: string }[];
}

const tools = [
  {
    functionDeclarations: [
      {
        name: 'get_session',
        description: 'Retrieves session data including freeText, Q&A, and extracted skills for a given sessionId.',
        parameters: {
          type: Type.OBJECT,
          properties: { sessionId: { type: Type.STRING } },
          required: ['sessionId'],
        },
      },
    ],
  },
];

const SYSTEM_PROMPT = `
You are an AI career advisor agent. You have access to one tool:
1. get_session — call this first to retrieve the user's session data.

The session contains:
- freeText: the user's original self-description
- qa: the questions asked and the user's answers
- skills: pre-extracted skills with confidence scores (0-1) from a previous analysis step
- skillsSummary: a summary of the extracted skills from the previous step

Use the extracted skills and skillsSummary as analyzed evidence — do not ignore them and do not invent new skills.
Base the matchPercentage on the skill confidence scores and how well each profession aligns with them.
Each reason must reference the user's actual answers or extracted skills — not generic profession descriptions.

After the tool call completes, produce ONLY the following strict JSON (no markdown, no extra text):
{
  "recommendations": [
    {
      "profession": "<Hebrew profession title>",
      "matchPercentage": <60-99>,
      "reason": "<specific Hebrew sentence referencing the user's actual answers or extracted skills>"
    }
  ]
}

Rules:
- Exactly 3 recommendations, ordered most to least suitable.
- Do not invent skills or personal information beyond what is in the session.
- All user-facing text must be in Hebrew.
- matchPercentage values must each differ by at least 3 points.
`.trim();

const handleToolCall = async (name: string, args: Record<string, string>): Promise<string> => {
  if (name === 'get_session') {
    const sessions = await readDb();
    const session = findSession(sessions, args['sessionId'] ?? '');
    if (!session) return JSON.stringify({ error: 'Session not found' });
    return JSON.stringify({
      freeText: session.freeText,
      qa: session.qa,
      skills: session.skills ?? [],
      skillsSummary: session.skillsSummary ?? '',
    });
  }
  return JSON.stringify({ error: `Unknown tool: ${name}` });
};

const parseOutput = (raw: string): AgentRecommendationResult => {
  const normalized = raw.replace(/```json/gi, '').replace(/```/gi, '').trim();
  const first = normalized.indexOf('{');
  const last = normalized.lastIndexOf('}');
  return JSON.parse(first !== -1 && last > first ? normalized.slice(first, last + 1) : normalized);
};

const generateWithFallback = async (
  ai: GoogleGenAI,
  contents: any[]
) => {
  try {
    console.log(`[agent] Trying model: ${PRIMARY_MODEL}`);

    return await ai.models.generateContent({
      model: PRIMARY_MODEL,
      contents,
      config: { systemInstruction: SYSTEM_PROMPT, temperature: 0.3, tools },
    });

  } catch (error) {
    if (!(error instanceof Error) || !error.message.includes('503')) {
      throw error;
    }

    console.warn(`[agent] Primary failed: ${PRIMARY_MODEL}`);
    console.warn(`[agent] Switching to fallback: ${FALLBACK_MODEL}`);

    return await ai.models.generateContent({
      model: FALLBACK_MODEL,
      contents,
      config: { systemInstruction: SYSTEM_PROMPT, temperature: 0.3, tools },
    });
  }
};

export const runCareerAgent = async (sessionId: string): Promise<AgentRecommendationResult> => {
  const apiKey = process.env.GEMINI_API_KEY ?? process.env.GOOGLE_API_KEY;
  if (!apiKey) throw new Error('Gemini API key is not configured');

  const ai = new GoogleGenAI({ apiKey });

  const contents: any[] = [
    { role: 'user', parts: [{ text: `Run career analysis for sessionId: ${sessionId}` }] },
  ];

  for (let turn = 0; turn < 6; turn++) {
    const response = await generateWithFallback(ai, contents);

    const candidate = response.candidates?.[0];
    const parts = candidate?.content?.parts ?? [];
    const functionCalls = parts.filter((p: any) => p.functionCall);

    if (functionCalls.length === 0) {
      const text = response.text;
      if (typeof text !== 'string' || text.length === 0) throw new Error('Empty agent response');
      return parseOutput(text);
    }

    contents.push({ role: 'model', parts });

    const toolResultParts = await Promise.all(
      functionCalls.map(async (p: any) => {
        const { name, args } = p.functionCall;
        const output = await handleToolCall(name, args ?? {});
        return { functionResponse: { name, response: { output } } };
      })
    );

    contents.push({ role: 'user', parts: toolResultParts });
  }

  throw new Error('Agent did not produce a final response within the allowed turns');
};
