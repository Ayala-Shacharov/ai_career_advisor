import type { Request, Response } from 'express';
import { AIService } from '../services/ai.service.js';
import type {
  GenerateQuestionsRequest,
  GetRecommendationRequest,
  QAItem,
} from '../types/ai.types.js';
import { readDb, writeDb, findSession } from '../db/db.service.js';

const aiService = new AIService();

const isValidText = (value: unknown): value is string =>
  typeof value === 'string' && value.trim().length > 0;

const isValidAnswers = (value: unknown): value is string[] =>
  Array.isArray(value) && value.length === 4 && value.every((a) => typeof a === 'string' && a.trim().length > 0);

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
    const result = await aiService.generateQuestions(text);

    const sessionId = crypto.randomUUID();
    const qa: QAItem[] = result.questions.map((q) => ({
      question: q.question,
      options: q.options as [string, string, string, string],
    }));

    const sessions = await readDb();
    sessions.push({ sessionId, freeText: text, qa, recommendation: null });
    await writeDb(sessions);

    console.log('generateQuestions success response:', { sessionId, qa });
    return res.status(200).json({ sessionId, qa });
  } catch (error) {
    console.error('generateQuestions controller error:', error);
    return res.status(500).json({ message: 'Unable to generate questions.' });
  }
};

export const matchProfession = async (
  req: Request<{}, {}, GetRecommendationRequest>,
  res: Response,
): Promise<Response> => {
  console.log('matchProfession request body:', req.body);

  const { sessionId, answers } = req.body;

  if (!isValidText(sessionId)) {
    console.log('matchProfession validation failed; sessionId is missing.');
    return res.status(400).json({ message: 'sessionId is required.' });
  }

  if (!isValidAnswers(answers)) {
    console.log('matchProfession validation failed; answers must contain exactly 4 valid items.');
    return res.status(400).json({ message: 'Exactly 4 answers are required.' });
  }

  try {
    const sessions = await readDb();
    const session = findSession(sessions, sessionId);

    if (!session) {
      console.log('matchProfession session not found:', sessionId);
      return res.status(404).json({ message: 'Session not found.' });
    }

    const result = await aiService.matchProfession(session.freeText, session.qa, answers);

    session.recommendation = result.profession;
    await writeDb(sessions);

    console.log('matchProfession success response:', result);
    return res.status(200).json({ recommendation: result.profession });
  } catch (error) {
    console.error('matchProfession controller error:', error);
    return res.status(500).json({ message: 'Unable to match profession.' });
  }
};