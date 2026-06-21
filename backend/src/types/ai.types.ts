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

export interface ProfessionMatchResponse {
  profession: string;
}
