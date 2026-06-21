import type { Request, Response } from 'express';
import type { GenerateQuestionsRequest, ProfessionMatchRequest } from '../types/ai.types.js';
export declare const generateQuestions: (req: Request<{}, {}, GenerateQuestionsRequest>, res: Response) => Promise<Response>;
export declare const matchProfession: (req: Request<{}, {}, ProfessionMatchRequest>, res: Response) => Promise<Response>;
//# sourceMappingURL=ai.controller.d.ts.map