import type { AnswerItem, GenerateQuestionsResponse, ProfessionMatchResponse } from '../types/ai.types.js';
export declare class AIService {
    private callModel;
    generateQuestions(text: string): Promise<GenerateQuestionsResponse>;
    matchProfession(text: string, answers: AnswerItem[]): Promise<ProfessionMatchResponse>;
}
//# sourceMappingURL=ai.service.d.ts.map