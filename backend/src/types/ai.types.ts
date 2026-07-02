export interface GenerateQuestionsRequest {
  text: string;
}

export interface QuestionOption {
  question: string;
  options: [string, string, string, string];
}

export interface GenerateQuestionsResponse {
  questions: QuestionOption[];
}

export interface AnswerItem {
  question: string;
  answer: string;
}

export interface ProfessionMatchRequest {
  text: string;
  answers: AnswerItem[];
}

export interface ProfessionRecommendation {
  title: string;
  reason: string;
  matchPercent: number;
}

export interface ProfessionMatchResponse {
  professions: ProfessionRecommendation[];
}

export interface QAItem {
  question: string;
  options: [string, string, string, string];
  answer?: string;
}

export interface SufficiencyCheckResponse {
  sufficient: boolean;
}

export interface SessionRecord {
  sessionId: string;
  freeText: string;
  qa: QAItem[];
  recommendation: ProfessionRecommendation[] | null;
  extraRounds: number;
}

export interface GetRecommendationRequest {
  sessionId: string;
  answers: string[];
}

export interface SessionRecord {
  sessionId: string;
  freeText: string;
  qa: QAItem[];
  recommendation: ProfessionRecommendation[] | null;
  extraRounds: number;
  createdAt: number;
}