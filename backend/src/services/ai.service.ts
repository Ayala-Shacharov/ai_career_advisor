import { GoogleGenAI } from '@google/genai';
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

const MODEL = process.env.GEMINI_MODEL ?? 'gemini-2.5-flash';

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
      e instanceof Error && (e.message.includes('503') || e.message.includes('429'));

    try {
      return await tryModel(MODEL);
    } catch (e) {
      if (!isRetryable(e)) throw e;
      console.warn(`[AI] Primary model failed: ${MODEL}`);
      console.warn(`[AI] Switching to fallback: gemini-2.5-flash`);
      return await tryModel('gemini-2.5-flash');
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
}
