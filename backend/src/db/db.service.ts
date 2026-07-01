import { readFile, writeFile } from 'fs/promises';
import { resolve } from 'path';
import type { SessionRecord } from '../types/ai.types.js';

const DB_PATH = resolve('db.json');

export const readDb = async (): Promise<SessionRecord[]> => {
  try {
    const raw = await readFile(DB_PATH, 'utf-8');
    return JSON.parse(raw) as SessionRecord[];
  } catch {
    return [];
  }
};

export const writeDb = async (sessions: SessionRecord[]): Promise<void> => {
  await writeFile(DB_PATH, JSON.stringify(sessions, null, 2), 'utf-8');
};

export const clearDb = async (): Promise<void> => {
  await writeFile(DB_PATH, '[]', 'utf-8');
};

export const findSession = (
  sessions: SessionRecord[],
  sessionId: string,
): SessionRecord | undefined => sessions.find((s) => s.sessionId === sessionId);