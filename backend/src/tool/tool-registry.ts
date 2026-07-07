import { extractSkillsDefinition } from './definitions/extractSkills.definition.js';
import { extractSkillsHandler } from './handlers/extractSkills.handler.js';
import type { SkillsOutput } from './handlers/extractSkills.handler.js';

type ToolHandler = (input: Record<string, string>) => Promise<unknown>;

const registry = new Map<string, ToolHandler>();

registry.set(extractSkillsDefinition.name, (input) =>
  extractSkillsHandler(input['sessionId'] ?? '')
);

export const invokeTool = async (name: string, input: Record<string, string>): Promise<unknown> => {
  const handler = registry.get(name);
  if (!handler) throw new Error(`Tool not found: ${name}`);
  return handler(input);
};

export type { SkillsOutput };
