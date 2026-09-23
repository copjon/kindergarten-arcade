export interface SessionEntry {
  id: string;
  gameId: string;
  gameTitle: string;
  timestamp: number;
  score: number;
  maxScore: number;
  total: number;
  gotFirstTry: number;
  avgTimeMs: number;
  missedLetters: string[];
  slowLetters: string[];
}

const STORAGE_KEY = 'phonics.history.v1';
const MAX_ENTRIES = 200;

export function loadHistory(): SessionEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveSessionEntry(entry: Omit<SessionEntry, 'id'>): void {
  try {
    const history = loadHistory();
    const withId: SessionEntry = { ...entry, id: `${entry.timestamp}-${Math.random().toString(36).slice(2, 8)}` };
    history.unshift(withId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history.slice(0, MAX_ENTRIES)));
  } catch {
    /* localStorage unavailable — history just won't persist */
  }
}

export function clearHistory(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}
