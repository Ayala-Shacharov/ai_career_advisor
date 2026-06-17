import { aiClient } from '../config/aiClient';
import {
  buildQuestionPrompt,
  buildProfessionPrompt,
} from '../utils/prompt.util';
import type {
  GenerateQuestionsResponse,
  ProfessionMatchResponse,
} from '../types/ai.types';

const MODEL = process.env.GROQ_MODEL || 'llama-3.1-8b-instant';

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

    return {
      question: item.question,
      options: item.options,
    };
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

export class AIService {
  async generateQuestions(text: string): Promise<GenerateQuestionsResponse> {
    const response = await aiClient.post('/chat/completions', {
      model: MODEL,
      messages: [
        {
          role: 'system',
          content: buildQuestionPrompt(),
        },
        {
          role: 'user',
          content: text,
        },
      ],
      temperature: 0.4,
    });

    const content = response.data?.choices?.[0]?.message?.content;
    if (typeof content !== 'string') {
      throw new Error('Invalid AI response.');
    }

    return validateQuestions(parseJsonObject(content));
  }

  async matchProfession(text: string): Promise<ProfessionMatchResponse> {
    const response = await aiClient.post('/chat/completions', {
      model: MODEL,
      messages: [
        {
          role: 'system',
          content: buildProfessionPrompt(),
        },
        {
          role: 'user',
          content: text,
        },
      ],
      temperature: 0.3,
    });

    const content = response.data?.choices?.[0]?.message?.content;
    if (typeof content !== 'string') {
      throw new Error('Invalid AI response.');
    }

    return validateProfession(parseJsonObject(content));
  }
}
