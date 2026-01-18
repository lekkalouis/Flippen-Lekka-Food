import type { Recipe } from "../models/recipe";
import { getRecipeCost } from "../storage/recipes";

const STORAGE_KEY = "generationRules";

export type GenerationRules = {
  servings: number;
  variety: number;
  costLimit: number;
  maxPrepMinutes: number;
  includeRecipeIds: string[];
  excludeRecipeIds: string[];
};

export type GenerationPlan = {
  rules: GenerationRules;
  selectedRecipes: Recipe[];
  totalCost: number;
};

const defaultRules: GenerationRules = {
  servings: 4,
  variety: 3,
  costLimit: 80,
  maxPrepMinutes: 45,
  includeRecipeIds: [],
  excludeRecipeIds: [],
};

const isBrowser = () => typeof window !== "undefined" && !!window.localStorage;

const normalizeRules = (rules: Partial<GenerationRules> = {}): GenerationRules => ({
  ...defaultRules,
  ...rules,
  includeRecipeIds: Array.isArray(rules.includeRecipeIds) ? rules.includeRecipeIds : [],
  excludeRecipeIds: Array.isArray(rules.excludeRecipeIds) ? rules.excludeRecipeIds : [],
});

export const loadGenerationRules = (): GenerationRules => {
  if (!isBrowser()) {
    return { ...defaultRules };
  }

  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    return { ...defaultRules };
  }

  try {
    const parsed = JSON.parse(stored) as Partial<GenerationRules>;
    return normalizeRules(parsed);
  } catch {
    return { ...defaultRules };
  }
};

export const saveGenerationRules = (rules: GenerationRules) => {
  if (!isBrowser()) {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(rules));
};

export const resetGenerationRules = (): GenerationRules => {
  const rules = { ...defaultRules };
  saveGenerationRules(rules);
  return rules;
};

export const generatePlan = (recipes: Recipe[], rules: GenerationRules): GenerationPlan => {
  const normalized = normalizeRules(rules);
  const includeSet = new Set(normalized.includeRecipeIds);
  const excludeSet = new Set(normalized.excludeRecipeIds);

  const included = recipes.filter((recipe) =>
    includeSet.has(recipe.id) && !excludeSet.has(recipe.id),
  );

  const candidates = recipes.filter(
    (recipe) => !excludeSet.has(recipe.id) && !includeSet.has(recipe.id),
  );

  const costFiltered = normalized.costLimit
    ? candidates.filter((recipe) => getRecipeCost(recipe) <= normalized.costLimit)
    : candidates;

  const sorted = [...costFiltered].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
  );

  const selection = [...included];
  for (const recipe of sorted) {
    if (selection.length >= normalized.variety) {
      break;
    }
    selection.push(recipe);
  }

  const totalCost = selection.reduce((sum, recipe) => sum + getRecipeCost(recipe), 0);

  return {
    rules: normalized,
    selectedRecipes: selection,
    totalCost,
  };
};
