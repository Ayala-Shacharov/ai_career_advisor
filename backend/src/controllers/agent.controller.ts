import type { Request, Response } from 'express';
import { runCareerAgent } from '../services/agent.service.js';
import { readDb, findSession } from '../db/db.service.js';

export const getCareerRecommendation = async (req: Request, res: Response): Promise<Response> => {
  const { sessionId } = req.body;
  if (typeof sessionId !== 'string' || !sessionId.trim()) {
    return res.status(400).json({ message: 'sessionId is required.' });
  }
  try {
    const sessions = await readDb();
    const session = findSession(sessions, sessionId.trim());
    if (!session) {
      return res.status(404).json({ message: 'Session not found.' });
    }

    const agentResult = await runCareerAgent(sessionId.trim());

    return res.status(200).json({
      skillsSummary: session.skillsSummary ?? '',
      skills: session.skills ?? [],
      recommendations: agentResult.recommendations,
    });
  } catch (error) {
    console.error('[agent] error:', error);
    return res.status(500).json({ message: 'Agent failed to produce a recommendation.' });
  }
};
