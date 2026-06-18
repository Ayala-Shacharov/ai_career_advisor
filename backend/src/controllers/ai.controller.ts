import type { Request, Response } from 'express';
import { AIService } from '../services/ai.service.js';
import type {
  GenerateQuestionsRequest,
  ProfessionMatchRequest,
} from '../types/ai.types.js';

const aiService = new AIService();

const isValidText = (value: unknown): value is string =>
  typeof value === 'string' && value.trim().length > 0;

export const generateQuestions = async (
  req: Request<{}, {}, GenerateQuestionsRequest>,
  res: Response,
): Promise<Response> => {
  const { text } = req.body;

  if (!isValidText(text)) {
    return res.status(400).json({ message: 'Text is required.' });
  }

  try {
    const result = await aiService.generateQuestions(text);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ message: 'Unable to generate questions.' });
  }
};

export const matchProfession = async (
  req: Request<{}, {}, ProfessionMatchRequest>,
  res: Response,
): Promise<Response> => {
  const { text } = req.body;

  if (!isValidText(text)) {
    return res.status(400).json({ message: 'Text is required.' });
  }

  try {
    const result = await aiService.matchProfession(text);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ message: 'Unable to match profession.' });
  }
};
