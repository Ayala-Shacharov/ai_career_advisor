export const extractSkillsDefinition = {
  name: 'extract_skills',
  description: 'Extracts skills demonstrated in a session based on freeText and Q&A answers.',
  inputSchema: {
    type: 'object',
    properties: {
      sessionId: { type: 'string' },
    },
    required: ['sessionId'],
  },
} as const;
