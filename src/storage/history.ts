import type { WeeklyMenu } from '../models/menu';

const STORAGE_KEY = 'menu-history';

const isBrowser = () => typeof window !== 'undefined' && !!window.localStorage;

const readHistory = (): WeeklyMenu[] => {
  if (!isBrowser()) {
    return [];
  }

  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    return [];
  }

  try {
    const parsed = JSON.parse(stored) as WeeklyMenu[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const writeHistory = (history: WeeklyMenu[]) => {
  if (!isBrowser()) {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
};

export const listHistory = (): WeeklyMenu[] => readHistory();

export const addHistoryEntry = (entry: WeeklyMenu): void => {
  const history = readHistory();
  history.unshift(entry);
  writeHistory(history.slice(0, 52));
};

export const clearHistory = (): void => {
  writeHistory([]);
};
