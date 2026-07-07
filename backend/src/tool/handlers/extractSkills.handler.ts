import { GoogleGenAI } from '@google/genai';
import { readDb, findSession } from '../../db/db.service.js';

const MODEL = process.env.GEMINI_MODEL ?? 'gemini-2.5-flash';
const FALLBACK: SkillsOutput = { skills: [], summary: '' };

export interface SkillItem {
    name: string;
    score: number;
}

export interface SkillsOutput {
    skills: SkillItem[];
    summary: string;
}

const buildSkillsPrompt = (): string => `
You are a skills analyst. Given a user's free-text description and their Q&A answers, identify skills that can be UNDERSTOOD about the person.
 
Return ONLY valid JSON with this exact schema:
{
  "skills": [{ "name": "string", "score": number }],
  "summary": "string"
}

Rules:
- Always return 3–5 skills. NEVER return an empty array unless the input is completely blank or gibberish.
- Prefer abstractions over literal words (e.g. "נטייה ליצירה חזותית" over "ציור"), but if the only evidence is literal, use a slightly abstracted form rather than returning nothing.
- "name": a Hebrew phrase describing an ability or orientation — ideally one level of abstraction above the source words.
- "score": confidence 0–1. Clear evidence → 0.7–0.95. Thin evidence → 0.4–0.65.
- "summary": one sentence in Hebrew describing the overall skill profile.
- No career recommendations.
- Do not add any text outside the JSON.
`;


const parseSkillsOutput = (raw: string): SkillsOutput => {
    const normalized = raw.replace(/```json/gi, '').replace(/```/gi, '').trim();
    const first = normalized.indexOf('{');
    const last = normalized.lastIndexOf('}');
    const candidate = first !== -1 && last > first ? normalized.slice(first, last + 1) : normalized;
    const parsed = JSON.parse(candidate);

    if (!parsed || !Array.isArray(parsed.skills) || typeof parsed.summary !== 'string') {
        throw new Error('Invalid skills payload');
    }
    return {
        skills: parsed.skills.slice(0, 5).map((s: any) => ({ name: String(s.name), score: Number(s.score) })),
        summary: parsed.summary,
    };
};

const sanitizeInput = (text: string): string =>
    text.replace(/ignore\s+(all\s+)?previous\s+instructions?/gi, '[filtered]')
        .replace(/system\s*:/gi, '[filtered]')
        .slice(0, 1000);

export const extractSkillsHandler = async (sessionId: string): Promise<SkillsOutput> => {
    const sessions = await readDb();
    const session = findSession(sessions, sessionId);
    if (!session) return FALLBACK;

    const userPayload = [
        `[תיאור חופשי]: ${sanitizeInput(session.freeText)}`,
        `[שאלות ותשובות]:`,
        ...session.qa.map((item, i) =>
            `  שאלה ${i + 1}: ${item.question}\n  תשובה: ${sanitizeInput(item.answer ?? '')}`
        ),
    ].join('\n');


    const apiKey = process.env.GEMINI_API_KEY ?? process.env.GOOGLE_API_KEY;
    if (!apiKey) return FALLBACK;

    const callGemini = async (): Promise<string> => {
        const ai = new GoogleGenAI({ apiKey });
        const contents = [
            { role: 'user', parts: [{ text: `${buildSkillsPrompt()}\n\n${userPayload}` }] }
        ];
        const response = await ai.models.generateContent({ model: MODEL, contents, config: { temperature: 0.2 } });
        if (typeof response.text !== 'string' || response.text.length === 0) throw new Error('Empty response');
        return response.text;
    };

    let raw: string;
    try {
        raw = await callGemini();
        console.log('[extractSkills] raw:', raw.slice(0, 300));
    } catch (e) {
        console.error('[extractSkills] API failed:', e);
        return FALLBACK;
    }

    try {
        return parseSkillsOutput(raw);
    } catch (e) {
        console.error('[extractSkills] parse failed:', e);
        try {
            raw = await callGemini();
            return parseSkillsOutput(raw);
        } catch (e2) {
            console.error('[extractSkills] retry failed:', e2);
            return FALLBACK;
        }
    }

};
