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

export interface ProfessionMatchRequest {
  text: string;
}

export interface ProfessionMatchResponse {
  profession: string;
}
