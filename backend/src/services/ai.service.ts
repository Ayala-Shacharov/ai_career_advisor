import { GoogleGenAI, type Content } from '@google/genai';
import {
  buildQuestionPrompt,
  buildProfessionPrompt,
  buildSufficiencyPrompt,
  buildFollowUpQuestionsPrompt,
} from '../utils/prompt.util.js';
import type {
  GenerateQuestionsResponse,
  ProfessionMatchResponse,
  SufficiencyCheckResponse,
  QAItem,
} from '../types/ai.types.js';
import { extractSkillsDefinition } from '../tool/definitions/extractSkills.definition.js';
import { invokeTool } from '../tool/tool-registry.js';
import type { SkillsOutput } from '../tool/tool-registry.js';

const PRIMARY_MODEL = process.env.GEMINI_MODEL ?? 'gemini-2.5-flash-lite';
const FALLBACK_MODEL = process.env.GEMINI_FALLBACK_MODEL ?? 'gemini-2.5-flash';

const getApiKey = (): string => {
  const key = process.env.GEMINI_API_KEY ?? process.env.GOOGLE_API_KEY;
  if (!key) throw new Error('Gemini API key is not configured');
  return key;
};

const parseJsonObject = (rawContent: string): unknown => {
  const normalized = rawContent
    .replace(/```json/gi, '')
    .replace(/```/gi, '')
    .trim();

  const firstBrace = normalized.indexOf('{');
  const lastBrace = normalized.lastIndexOf('}');

  const candidate =
    firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace
      ? normalized.slice(firstBrace, lastBrace + 1)
      : normalized;

  return JSON.parse(candidate);
};

const validateQuestions = (payload: unknown, count = 4): GenerateQuestionsResponse => {
  if (
    !payload ||
    typeof payload !== 'object' ||
    !('questions' in payload) ||
    !Array.isArray((payload as any).questions) ||
    (payload as any).questions.length !== count
  ) {
    throw new Error(`Invalid questions payload (expected ${count}).`);
  }

  const questions = (payload as any).questions.map((item: any) => {
    if (
      !item ||
      typeof item !== 'object' ||
      typeof item.question !== 'string' ||
      !Array.isArray(item.options) ||
      item.options.length !== 4 ||
      item.options.some((o: unknown) => typeof o !== 'string')
    ) {
      throw new Error('Invalid question structure.');
    }
    return { question: item.question, options: item.options };
  });

  return { questions };
};

const validateProfessions = (payload: unknown): ProfessionMatchResponse => {
  if (
    !payload ||
    typeof payload !== 'object' ||
    !('professions' in payload) ||
    !Array.isArray((payload as any).professions) ||
    (payload as any).professions.length !== 3
  ) {
    throw new Error('Invalid professions payload.');
  }

  const professions = (payload as any).professions.map((item: any) => {
    if (
      !item ||
      typeof item !== 'object' ||
      typeof item.title !== 'string' ||
      typeof item.reason !== 'string' ||
      typeof item.matchPercent !== 'number'
    ) {
      throw new Error('Invalid profession structure.');
    }
    return { title: item.title, reason: item.reason, matchPercent: item.matchPercent };
  });

  return { professions };
};

const validateSufficiency = (payload: unknown): SufficiencyCheckResponse => {
  if (
    !payload ||
    typeof payload !== 'object' ||
    !('sufficient' in payload) ||
    typeof (payload as any).sufficient !== 'boolean'
  ) {
    throw new Error('Invalid sufficiency payload.');
  }
  return { sufficient: (payload as any).sufficient };
};

const getErrorMessage = (e: unknown): string =>
  e instanceof Error ? e.message : 'Unknown error';

export interface ProfessionWithSkillsResponse {
  professions: ProfessionMatchResponse['professions'];
  skills: SkillsOutput;
}

export class AIService {
  private async callModel(systemPrompt: string, userText: string, temperature: number): Promise<string> {
    const ai = new GoogleGenAI({ apiKey: getApiKey() });
    const contents = `System:\n${systemPrompt}\n\nUser:\n${userText}`;

    const tryModel = async (model: string): Promise<string> => {
      console.log(`[AI] Trying model: ${model}`);
      const response = await ai.models.generateContent({ model, contents, config: { temperature } });
      const content = response.text;
      console.log(`[AI] Response OK from model: ${model}`);
      if (typeof content !== 'string' || content.length === 0) throw new Error('Invalid AI response.');
      return content;
    };

    const isRetryable = (e: unknown) =>
      e instanceof Error && e.message.includes('503');

    try {
      return await tryModel(PRIMARY_MODEL);
    } catch (e) {
      if (!isRetryable(e)) throw e;

      console.warn(`[AI] Primary model failed: ${PRIMARY_MODEL}`, e);
      console.warn(`[AI] Switching to fallback: ${FALLBACK_MODEL}`);

      return await tryModel(FALLBACK_MODEL);
    }
  }

  async generateQuestions(text: string): Promise<GenerateQuestionsResponse> {
    try {
      const content = await this.callModel(buildQuestionPrompt(), text, 0.4);
      return validateQuestions(parseJsonObject(content), 4);
    } catch (error) {
      console.error('generateQuestions error:', error);
      throw new Error(`Failed to generate questions: ${getErrorMessage(error)}`);
    }
  }

  async matchProfession(text: string, qa: QAItem[], answers: string[]): Promise<ProfessionMatchResponse> {
    try {
      const payload = [
        `[תיאור חופשי של המשתמש]: ${text}`,
        `[שאלות ותשובות]:`,
        ...qa.map((item, i) => `  שאלה ${i + 1}: ${item.question}\n  תשובה: ${item.answer ?? answers[i] ?? ''}`),
      ].join('\n');
      const content = await this.callModel(buildProfessionPrompt(), payload, 0.3);
      return validateProfessions(parseJsonObject(content));
    } catch (error) {
      console.error('matchProfession error:', error);
      throw new Error(`Failed to match profession: ${getErrorMessage(error)}`);
    }
  }

  async checkSufficiency(freeText: string, qa: QAItem[], answers: string[]): Promise<SufficiencyCheckResponse> {
    try {
      const payload = [
        `[תיאור חופשי של המשתמש]: ${freeText}`,
        `[שאלות ותשובות]:`,
        ...qa.map((item, i) => `  שאלה ${i + 1}: ${item.question}\n  תשובה: ${item.answer ?? answers[i] ?? ''}`),
      ].join('\n');
      const content = await this.callModel(buildSufficiencyPrompt(), payload, 0.1);
      return validateSufficiency(parseJsonObject(content));
    } catch (error) {
      console.error('checkSufficiency error:', error);
      throw new Error(`Failed to check sufficiency: ${getErrorMessage(error)}`);
    }
  }

  async generateFollowUpQuestions(freeText: string, qa: QAItem[], answers: string[]): Promise<GenerateQuestionsResponse> {
    try {
      const payload = [
        `[תיאור חופשי של המשתמש]: ${freeText}`,
        `[שאלות ותשובות]:`,
        ...qa.map((item, i) => `  שאלה ${i + 1}: ${item.question}\n  תשובה: ${item.answer ?? answers[i] ?? ''}`),
      ].join('\n');
      const content = await this.callModel(buildFollowUpQuestionsPrompt(), payload, 0.4);
      return validateQuestions(parseJsonObject(content), 2);
    } catch (error) {
      console.error('generateFollowUpQuestions error:', error);
      throw new Error(`Failed to generate follow-up questions: ${getErrorMessage(error)}`);
    }
  }

  async matchProfessionWithTools(
    sessionId: string,
    text: string,
    qa: QAItem[],
    answers: string[],
  ): Promise<ProfessionWithSkillsResponse> {
    const MAX_TOOL_ROUNDS = 3;
    const ai = new GoogleGenAI({ apiKey: getApiKey() });

    const userPayload = [
      `[תיאור חופשי של המשתמש]: ${text}`,
      `[שאלות ותשובות]:`,
      ...qa.map((item, i) => `  שאלה ${i + 1}: ${item.question}\n  תשובה: ${item.answer ?? answers[i] ?? ''}`),
      `[sessionId]: ${sessionId}`,
    ].join('\n');

    const contents: Content[] = [
      { role: 'user', parts: [{ text: `System:\n${buildProfessionPrompt()}\n\nUser:\n${userPayload}` }] },
    ];

    const tools = [{ functionDeclarations: [extractSkillsDefinition] }];
    let skills: SkillsOutput = { skills: [], summary: '' };

    for (let round = 0; round < MAX_TOOL_ROUNDS; round++) {
      console.log(`[AI:tools] Round ${round + 1}`);
      const response = await ai.models.generateContent({
        model: PRIMARY_MODEL,
        contents,
        config: { temperature: 0.3, tools } as any,
      });
    
      const parts = response.candidates?.[0]?.content?.parts ?? [];
      const fnCallPart = parts.find((p: any) => p.functionCall);

      if (!fnCallPart) {
        const finalText = response.text;
        if (typeof finalText !== 'string' || finalText.length === 0)
          throw new Error('Empty final response from Gemini.');
        return { professions: validateProfessions(parseJsonObject(finalText)).professions, skills };
      }

      const { name, args } = (fnCallPart as any).functionCall;
      console.log(`[AI:tools] Gemini called: ${name}`, args);

      const toolResult = await invokeTool(name, args as Record<string, string>).catch(
        (): SkillsOutput => ({ skills: [], summary: '' }),
      ) as SkillsOutput;

      if (name === 'extract_skills') skills = toolResult;

      contents.push({ role: 'model', parts: [fnCallPart as any] });
      contents.push({
        role: 'user',
        parts: [{ functionResponse: { name, response: { output: toolResult } } } as any],
      });
    }

    throw new Error('Tool call loop exceeded maximum rounds.');
  }
}
