import type { GenerationRules, MenuDay, WeeklyMenu } from '../models/menu';
import type { Recipe } from '../models/recipe';
import { getRecipeCost } from '../storage/recipes';
import type { SampleWeek } from '../storage/sampleWeeks';

const getStartOfWeek = (date: Date) => {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  return start;
};

export const buildNext7Days = (startDate = new Date()): MenuDay[] => {
  const start = getStartOfWeek(startDate);
  return Array.from({ length: 7 }, (_, index) => {
    const day = new Date(start);
    day.setDate(start.getDate() + index);
    return {
      date: day.toISOString(),
      recipeId: null,
      locked: false,
    };
  });
};

const buildSampleWeights = (samples: SampleWeek[]): Record<string, number> => {
  const counts: Record<string, number> = {};
  samples.forEach((sample) => {
    sample.recipeIds.forEach((id) => {
      counts[id] = (counts[id] ?? 0) + 1;
    });
  });
  return counts;
};

const getRecipePool = (recipes: Recipe[], rules: GenerationRules) => {
  const excludeSet = new Set(rules.excludeIds);
  return recipes.filter((recipe) => !excludeSet.has(recipe.id));
};

const pickRecipe = (
  pool: Recipe[],
  usedIds: string[],
  rules: GenerationRules,
  sampleWeights: Record<string, number>,
  enforceUnique: boolean,
): Recipe | undefined => {
  if (pool.length === 0) {
    return undefined;
  }

  const includeSet = new Set(rules.includeIds);
  const available = enforceUnique
    ? pool.filter((recipe) => !usedIds.includes(recipe.id))
    : pool;
  const fallback = available.length > 0 ? available : pool;

  const prioritized = fallback.sort((a, b) => {
    const aIncluded = includeSet.has(a.id) ? 1 : 0;
    const bIncluded = includeSet.has(b.id) ? 1 : 0;
    if (aIncluded !== bIncluded) {
      return bIncluded - aIncluded;
    }

    const aWeight = (sampleWeights[a.id] ?? 0) * rules.sampleBias;
    const bWeight = (sampleWeights[b.id] ?? 0) * rules.sampleBias;
    if (aWeight !== bWeight) {
      return bWeight - aWeight;
    }

    const aCost = getRecipeCost(a);
    const bCost = getRecipeCost(b);
    if (rules.budget > 0 && aCost !== bCost) {
      return aCost - bCost;
    }

    return a.name.localeCompare(b.name);
  });

  return prioritized[0];
};

export const generateMenu = (
  recipes: Recipe[],
  rules: GenerationRules,
  existingDays: MenuDay[],
  sampleWeeks: SampleWeek[],
): MenuDay[] => {
  const pool = getRecipePool(recipes, rules);
  const sampleWeights = buildSampleWeights(sampleWeeks);
  const usedIds = existingDays.filter((day) => day.locked).map((day) => day.recipeId ?? '');
  const enforceUnique = rules.variety >= 3;

  return existingDays.map((day) => {
    if (day.locked) {
      return day;
    }

    const recipe = pickRecipe(pool, usedIds, rules, sampleWeights, enforceUnique);
    if (recipe) {
      usedIds.push(recipe.id);
    }

    return {
      ...day,
      recipeId: recipe?.id ?? null,
      locked: false,
    };
  });
};

export const buildWeeklyMenu = (
  recipes: Recipe[],
  rules: GenerationRules,
  sampleWeeks: SampleWeek[],
): WeeklyMenu => {
  const now = new Date();
  const days = generateMenu(recipes, rules, buildNext7Days(now), sampleWeeks);
  const weekStart = new Date(days[0]?.date ?? now.toISOString()).toISOString();
  const id =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : `menu-${Date.now()}`;

  return {
    id,
    weekStart,
    createdAt: now.toISOString(),
    rules,
    days,
  };
};
