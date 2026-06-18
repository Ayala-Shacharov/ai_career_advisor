import { Router } from 'express';
import {
  generateQuestions,
  matchProfession,
} from '../controllers/ai.controller';

const router = Router();

router.post('/questions/generate', generateQuestions);
router.post('/profession/match', matchProfession);

export default router;
