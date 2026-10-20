import { describe, expect, it } from 'vitest';
import { clearHistory, loadHistory, saveSessionEntry, type SessionEntry } from './history';

const STORAGE_KEY = 'phonics.history.v1';

function entry(overrides: Partial<SessionEntry> = {}): Omit<SessionEntry, 'id'> {
  return {
    gameId: 'sight-words',
    gameTitle: 'Word Invaders',
    timestamp: 1000,
    score: 100,
    maxScore: 270,
    total: 9,
    gotFirstTry: 7,
    avgTimeMs: 2500,
    missedLetters: ['the'],
    slowLetters: ['am'],
    ...overrides,
  };
}

describe('history', () => {
  it('starts empty', () => {
    expect(loadHistory()).toEqual([]);
  });

  it('saves entries newest first with a generated id', () => {
    saveSessionEntry(entry({ timestamp: 1 }));
    saveSessionEntry(entry({ timestamp: 2 }));
    const history = loadHistory();
    expect(history.map((e) => e.timestamp)).toEqual([2, 1]);
    expect(history[0].id).toMatch(/^2-/);
    expect(history[0].id).not.toBe(history[1].id);
  });

  it('keeps at most 200 entries', () => {
    for (let i = 0; i < 205; i++) saveSessionEntry(entry({ timestamp: i }));
    const history = loadHistory();
    expect(history).toHaveLength(200);
    expect(history[0].timestamp).toBe(204);
  });

  it('survives corrupted or unexpected stored data', () => {
    localStorage.setItem(STORAGE_KEY, '{not json');
    expect(loadHistory()).toEqual([]);
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ not: 'an array' }));
    expect(loadHistory()).toEqual([]);
  });

  it('clears everything', () => {
    saveSessionEntry(entry());
    clearHistory();
    expect(loadHistory()).toEqual([]);
  });
});
