import type { IngredientCategory, Recipe } from '../models/recipe';

const STORAGE_KEY = 'recipes';

type RecipeSortKey = 'name' | 'createdAt' | 'updatedAt' | 'cost';

type RecipeSortDirection = 'asc' | 'desc';

export interface RecipeListOptions {
  search?: string;
  categories?: IngredientCategory[];
  sortKey?: RecipeSortKey;
  sortDirection?: RecipeSortDirection;
}

const isBrowser = () => typeof window !== 'undefined' && !!window.localStorage;

const readRecipes = (): Recipe[] => {
  if (!isBrowser()) {
    return [];
  }

  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    return [];
  }

  try {
    const parsed = JSON.parse(stored) as Recipe[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const writeRecipes = (recipes: Recipe[]) => {
  if (!isBrowser()) {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(recipes));
};

export const getRecipeCost = (recipe: Recipe): number =>
  recipe.ingredients.reduce(
    (total, ingredient) => total + ingredient.cost * ingredient.quantity,
    0,
  );

export const listRecipes = (): Recipe[] => readRecipes();

export const listRecipesWithOptions = (options: RecipeListOptions = {}): Recipe[] => {
  const { search, categories, sortKey = 'updatedAt', sortDirection = 'desc' } = options;
  let recipes = listRecipes();

  if (search && search.trim().length > 0) {
    recipes = filterRecipesBySearch(recipes, search);
  }

  if (categories && categories.length > 0) {
    recipes = filterRecipesByCategories(recipes, categories);
  }

  recipes = sortRecipes(recipes, sortKey, sortDirection);

  return recipes;
};

export const getRecipeById = (id: string): Recipe | undefined =>
  readRecipes().find((recipe) => recipe.id === id);

export const createRecipe = (recipe: Recipe): Recipe => {
  const recipes = readRecipes();
  recipes.push(recipe);
  writeRecipes(recipes);
  return recipe;
};

export const updateRecipe = (updatedRecipe: Recipe): Recipe | undefined => {
  const recipes = readRecipes();
  const index = recipes.findIndex((recipe) => recipe.id === updatedRecipe.id);

  if (index === -1) {
    return undefined;
  }

  recipes[index] = updatedRecipe;
  writeRecipes(recipes);
  return updatedRecipe;
};

export const deleteRecipe = (id: string): boolean => {
  const recipes = readRecipes();
  const filtered = recipes.filter((recipe) => recipe.id !== id);

  if (filtered.length === recipes.length) {
    return false;
  }

  writeRecipes(filtered);
  return true;
};

export const filterRecipesBySearch = (recipes: Recipe[], search: string): Recipe[] => {
  const term = search.trim().toLowerCase();
  if (!term) {
    return recipes;
  }

  return recipes.filter((recipe) => {
    const matchesName = recipe.name.toLowerCase().includes(term);
    const matchesDescription = recipe.description?.toLowerCase().includes(term) ?? false;
    const matchesIngredient = recipe.ingredients.some((ingredient) =>
      ingredient.name.toLowerCase().includes(term),
    );

    return matchesName || matchesDescription || matchesIngredient;
  });
};

export const filterRecipesByCategories = (
  recipes: Recipe[],
  categories: IngredientCategory[],
): Recipe[] => {
  if (categories.length === 0) {
    return recipes;
  }

  const categorySet = new Set(categories);

  return recipes.filter((recipe) =>
    recipe.ingredients.some((ingredient) => categorySet.has(ingredient.category)),
  );
};

export const sortRecipes = (
  recipes: Recipe[],
  sortKey: RecipeSortKey,
  sortDirection: RecipeSortDirection,
): Recipe[] => {
  const sorted = [...recipes];
  const multiplier = sortDirection === 'asc' ? 1 : -1;

  sorted.sort((a, b) => {
    switch (sortKey) {
      case 'name':
        return a.name.localeCompare(b.name) * multiplier;
      case 'createdAt':
        return (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()) * multiplier;
      case 'cost':
        return (getRecipeCost(a) - getRecipeCost(b)) * multiplier;
      case 'updatedAt':
      default:
        return (new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime()) * multiplier;
    }
  });

  return sorted;
};
