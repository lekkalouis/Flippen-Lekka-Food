export type SampleWeek = {
  id: string;
  name: string;
  recipeIds: string[];
  createdAt: string;
};

const STORAGE_KEY = 'sample-weeks';

const isBrowser = () => typeof window !== 'undefined' && !!window.localStorage;

const readSamples = (): SampleWeek[] => {
  if (!isBrowser()) {
    return [];
  }

  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    return [];
  }

  try {
    const parsed = JSON.parse(stored) as SampleWeek[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const writeSamples = (samples: SampleWeek[]) => {
  if (!isBrowser()) {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(samples));
};

export const listSampleWeeks = (): SampleWeek[] => readSamples();

export const addSampleWeek = (sample: SampleWeek): void => {
  const samples = readSamples();
  samples.unshift(sample);
  writeSamples(samples.slice(0, 52));
};

export const deleteSampleWeek = (id: string): void => {
  const samples = readSamples().filter((sample) => sample.id !== id);
  writeSamples(samples);
};
