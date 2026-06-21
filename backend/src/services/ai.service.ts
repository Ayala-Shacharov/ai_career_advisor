import { GoogleGenAI } from '@google/genai';
import {
  buildQuestionPrompt,
  buildProfessionPrompt,
} from '../utils/prompt.util.js';
import type {
  AnswerItem,
  GenerateQuestionsResponse,
  ProfessionMatchResponse,
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

const validateQuestions = (payload: unknown): GenerateQuestionsResponse => {
  if (
    !payload ||
    typeof payload !== 'object' ||
    !('questions' in payload) ||
    !Array.isArray(payload.questions) ||
    payload.questions.length !== 4
  ) {
    throw new Error('Invalid questions payload.');
  }

  const questions = payload.questions.map((item) => {
    if (
      !item ||
      typeof item !== 'object' ||
      !('question' in item) ||
      !('options' in item) ||
      typeof item.question !== 'string' ||
      !Array.isArray(item.options) ||
      item.options.length !== 4 ||
      item.options.some((option: unknown) => typeof option !== 'string')
    ) {
      throw new Error('Invalid question structure.');
    }

    return { question: item.question, options: item.options };
  });

  return { questions };
};

const validateProfession = (payload: unknown): ProfessionMatchResponse => {
  if (
    !payload ||
    typeof payload !== 'object' ||
    !('profession' in payload) ||
    typeof payload.profession !== 'string'
  ) {
    throw new Error('Invalid profession payload.');
  }

  return { profession: payload.profession };
};

const getErrorMessage = (error: unknown): string =>
  error instanceof Error ? error.message : 'Unknown error';

export class AIService {
  private async callModel(
    systemPrompt: string,
    userText: string,
    temperature: number,
  ): Promise<string> {
    const ai = new GoogleGenAI({ apiKey: getApiKey() });

    const response = await ai.models.generateContent({
      model: MODEL,
      contents: `System:\n${systemPrompt}\n\nUser:\n${userText}`,
      config: { temperature },
    });

    const content = response.text;
    if (typeof content !== 'string' || content.length === 0) {
      throw new Error('Invalid AI response.');
    }

    return content;
  }

  async generateQuestions(text: string): Promise<GenerateQuestionsResponse> {
    try {
      const content = await this.callModel(buildQuestionPrompt(), text, 0.4);
      return validateQuestions(parseJsonObject(content));
    } catch (error) {
      throw new Error(`Failed to generate questions: ${getErrorMessage(error)}`);
    }
  }

  async matchProfession(
    text: string,
    answers: AnswerItem[],
  ): Promise<ProfessionMatchResponse> {
    try {
      const payload = JSON.stringify(
        {
          text,
          answers,
        },
        null,
        2,
      );
      const content = await this.callModel(
        buildProfessionPrompt(),
        payload,
        0.3,
      );
      return validateProfession(parseJsonObject(content));
    } catch (error) {
      throw new Error(`Failed to match profession: ${getErrorMessage(error)}`);
    }
  }
}
