export const buildQuestionPrompt = (): string => `
You are generating career assessment questions from the user's text only.
Return ONLY valid JSON in this exact schema:
{
  "questions": [
    {
      "question": "string",
      "options": ["string", "string", "string", "string"]
    }
  ]
}
Rules:
- Exactly 4 questions.
- Exactly 4 options for each question.
- Questions must be based only on the user's text.
- Do not include any extra text outside the JSON object.
`;

export const buildProfessionPrompt = (): string => `
You are matching a user profile to a profession.
Return ONLY valid JSON in this exact schema:
{
  "profession": "string"
}
Rules:
- Base the answer only on the user's text and answers.
- Do not include any extra text outside the JSON object.
`;
