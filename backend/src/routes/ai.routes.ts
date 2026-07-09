import { Router } from 'express';
import { generateQuestions, matchProfession } from '../controllers/ai.controller.js';
import { getCareerRecommendation } from '../controllers/agent.controller.js';

const router = Router();

router.post('/questions/generate', generateQuestions);
router.post('/profession/match', matchProfession);
router.post('/agent/recommend', getCareerRecommendation);

export default router;
