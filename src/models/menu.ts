import type { Recipe } from './recipe';

export type MenuDay = {
  date: string;
  recipeId: string | null;
  locked: boolean;
};

export type GenerationRules = {
  servings: number;
  budget: number;
  variety: number;
  includeIds: string[];
  excludeIds: string[];
  sampleBias: number;
};

export type WeeklyMenu = {
  id: string;
  weekStart: string;
  createdAt: string;
  rules: GenerationRules;
  days: MenuDay[];
};

export type MenuSnapshot = WeeklyMenu & {
  recipes: Recipe[];
};
