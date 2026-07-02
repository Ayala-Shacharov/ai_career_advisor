import type { Request, Response } from 'express';
import { AIService } from '../services/ai.service.js';
import type {
  GenerateQuestionsRequest,
  GetRecommendationRequest,
  QAItem,
} from '../types/ai.types.js';
import { readDb, writeDb, findSession } from '../db/db.service.js';

const aiService = new AIService();

const MAX_EXTRA_ROUNDS = 2;

const isValidText = (value: unknown): value is string =>
  typeof value === 'string' && value.trim().length > 0;

const isValidAnswers = (value: unknown): value is string[] =>
  Array.isArray(value) &&
  value.length >= 2 &&
  value.every((a) => typeof a === 'string' && a.trim().length > 0);

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

    const sessionId = crypto.randomUUID();
    const qa: QAItem[] = result.questions.map((q) => ({
      question: q.question,
      options: q.options as [string, string, string, string],
    }));

    const sessions = await readDb();
    sessions.push({ sessionId, freeText: text, qa, recommendation: null, extraRounds: 0, createdAt: Date.now() });
    await writeDb(sessions);

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
  const { sessionId, answers } = req.body;

  if (!isValidText(sessionId)) {
    return res.status(400).json({ message: 'sessionId is required.' });
  }

  if (!isValidAnswers(answers)) {
    return res.status(400).json({ message: 'At least 2 valid answers are required.' });
  }

  try {
    const sessions = await readDb();
    const session = findSession(sessions, sessionId);

    if (!session) {
      return res.status(404).json({ message: 'Session not found.' });
    }

    // Append answers to qa in session
    answers.forEach((answer, i) => {
      const qaItem = session.qa[session.qa.length - answers.length + i];
      if (qaItem) {
        qaItem.answer = answer;
      }
    });

    const allAnswers = session.qa.filter((q) => q.answer).map((q) => q.answer as string);

    // Sufficiency check — only if under the hard limit
    if (session.extraRounds < MAX_EXTRA_ROUNDS) {
      const { sufficient } = await aiService.checkSufficiency(session.freeText, session.qa, allAnswers);

      if (!sufficient) {
        const followUp = await aiService.generateFollowUpQuestions(session.freeText, session.qa, allAnswers);

        const newQA: QAItem[] = followUp.questions.map((q) => ({
          question: q.question,
          options: q.options as [string, string, string, string],
        }));

        session.qa.push(...newQA);
        session.extraRounds += 1;
        await writeDb(sessions);
        console.log(`[Session ${sessionId}] Insufficient info — sending extra round ${session.extraRounds}/${MAX_EXTRA_ROUNDS}`);

        return res.status(200).json({
          needsMoreInfo: true,
          extraRound: session.extraRounds,
          qa: newQA,
        });
      }
    }

    // Proceed with recommendation
    console.log(`[Session ${sessionId}] Generating recommendation after ${session.extraRounds} extra round(s)${session.extraRounds === 0 ? ' — no extra rounds needed' : ''}`);
    const result = await aiService.matchProfession(session.freeText, session.qa, allAnswers);
    session.recommendation = result.professions;
    await writeDb(sessions);

    return res.status(200).json({ needsMoreInfo: false, recommendation: result.professions });
  } catch (error) {
    console.error('matchProfession controller error:', error);
    return res.status(500).json({ message: 'Unable to match profession.' });
  }
};
