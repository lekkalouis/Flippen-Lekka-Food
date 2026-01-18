export type IngredientCategory =
  | 'produce'
  | 'protein'
  | 'dairy'
  | 'dry'
  | 'spice'
  | 'bakery'
  | 'frozen'
  | 'other';

export interface Ingredient {
  name: string;
  unit: string;
  quantity: number;
  category: IngredientCategory;
  cost: number;
}

export interface Recipe {
  id: string;
  name: string;
  description?: string;
  ingredients: Ingredient[];
  createdAt: string;
  updatedAt: string;
}
