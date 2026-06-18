import { Router } from 'express';
import {
  generateQuestions,
  matchProfession,
} from '../controllers/ai.controller.js';

const router = Router();

router.post('/questions/generate', generateQuestions);
router.post('/profession/match', matchProfession);

export default router;
