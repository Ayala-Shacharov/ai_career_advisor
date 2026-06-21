import { mkdir, writeFile } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import type { Request, Response } from 'express';
import { AIService } from '../services/ai.service.js';
import type {
  AnswerItem,
  GenerateQuestionsRequest,
  ProfessionMatchRequest,
} from '../types/ai.types.js';

const aiService = new AIService();
const DB_FILE = fileURLToPath(
  new URL('../../data/user-inputs.json', import.meta.url),
);

const isValidText = (value: unknown): value is string =>
  typeof value === 'string' && value.trim().length > 0;

const isValidAnswers = (value: unknown): value is AnswerItem[] => {
  if (!Array.isArray(value) || value.length !== 4) {
    return false;
  }

  return value.every(
    (item) =>
      item &&
      typeof item === 'object' &&
      'question' in item &&
      'answer' in item &&
      typeof item.question === 'string' &&
      typeof item.answer === 'string' &&
      item.question.trim().length > 0 &&
      item.answer.trim().length > 0,
  );
};

const saveTextToDb = async (text: string): Promise<void> => {
  const dir = path.dirname(DB_FILE);
  await mkdir(dir, { recursive: true });
  const payload = {
    text,
    createdAt: new Date().toISOString(),
  };

  await writeFile(DB_FILE, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
};

export const generateQuestions = async (
  req: Request<{}, {}, GenerateQuestionsRequest>,
  res: Response,
): Promise<Response> => {
  console.log('generateQuestions request body:', req.body);

  const { text } = req.body;

  if (!isValidText(text)) {
    console.log('generateQuestions validation failed; text is missing or empty.');
    return res.status(400).json({ message: 'Text is required.' });
  }

  try {
    await saveTextToDb(text);
    const result = await aiService.generateQuestions(text);
    console.log('generateQuestions success response:', result);
    return res.status(200).json(result);
  } catch (error) {
    console.error('generateQuestions controller error:', error);
    return res.status(500).json({ message: 'Unable to generate questions.' });
  }
};

export const matchProfession = async (
  req: Request<{}, {}, ProfessionMatchRequest>,
  res: Response,
): Promise<Response> => {
  console.log('matchProfession request body:', req.body);

  const { text, answers } = req.body;

  if (!isValidText(text)) {
    console.log('matchProfession validation failed; text is missing or empty.');
    return res.status(400).json({ message: 'Text is required.' });
  }

  if (!isValidAnswers(answers)) {
    console.log(
      'matchProfession validation failed; answers must contain exactly 4 valid items.',
    );
    return res.status(400).json({
      message: 'Exactly 4 answers are required.',
    });
  }

  try {
    const result = await aiService.matchProfession(text, answers);
    console.log('matchProfession success response:', result);
    return res.status(200).json(result);
  } catch (error) {
    console.error('matchProfession controller error:', error);
    return res.status(500).json({ message: 'Unable to match profession.' });
  }
};
