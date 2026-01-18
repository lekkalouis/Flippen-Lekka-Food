import type { Recipe } from '../models/recipe';
import type { MenuDay } from '../models/menu';

export type ShoppingItem = {
  name: string;
  unit: string;
  quantity: number;
  category: string;
  cost: number;
};

const scaleQuantity = (quantity: number, servings: number) => quantity * servings;

export const buildShoppingList = (
  days: MenuDay[],
  recipes: Recipe[],
  servings: number,
): ShoppingItem[] => {
  const map = new Map<string, ShoppingItem>();

  days.forEach((day) => {
    if (!day.recipeId) {
      return;
    }

    const recipe = recipes.find((item) => item.id === day.recipeId);
    if (!recipe) {
      return;
    }

    recipe.ingredients.forEach((ingredient) => {
      const key = `${ingredient.name}-${ingredient.unit}-${ingredient.category}`;
      const quantity = scaleQuantity(ingredient.quantity, servings);
      const cost = ingredient.cost * quantity;

      if (!map.has(key)) {
        map.set(key, {
          name: ingredient.name,
          unit: ingredient.unit,
          quantity,
          category: ingredient.category,
          cost,
        });
      } else {
        const existing = map.get(key)!;
        map.set(key, {
          ...existing,
          quantity: existing.quantity + quantity,
          cost: existing.cost + cost,
        });
      }
    });
  });

  return Array.from(map.values()).sort((a, b) => {
    if (a.category !== b.category) {
      return a.category.localeCompare(b.category);
    }

    return a.name.localeCompare(b.name);
  });
};
