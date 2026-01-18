import { useMemo, useState } from 'react';

import type { IngredientCategory, Recipe } from '../models/recipe';
import {
  createRecipe,
  deleteRecipe,
  getRecipeCost,
  listRecipes,
  listRecipesWithOptions,
} from '../storage/recipes';

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(value);

const formatDate = (value: string) => new Date(value).toLocaleDateString();

const categoryLabel = (category: IngredientCategory) =>
  category.charAt(0).toUpperCase() + category.slice(1);

const getRecipeCategories = (recipes: Recipe[]) => {
  const categories = new Set<IngredientCategory>();

  recipes.forEach((recipe) => {
    recipe.ingredients.forEach((ingredient) => categories.add(ingredient.category));
  });

  return Array.from(categories).sort((a, b) => a.localeCompare(b));
};

const ingredientCategories: IngredientCategory[] = [
  'produce',
  'protein',
  'dairy',
  'dry',
  'spice',
  'bakery',
  'frozen',
  'other',
];

const buildIngredient = () => ({
  name: '',
  unit: 'g',
  quantity: 1,
  category: 'produce' as IngredientCategory,
  cost: 0,
});

const AdminRecipes = () => {
  const [search, setSearch] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<IngredientCategory[]>([]);
  const [sortKey, setSortKey] = useState<'updatedAt' | 'name' | 'createdAt' | 'cost'>(
    'updatedAt',
  );
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [revision, setRevision] = useState(0);
  const [recipeName, setRecipeName] = useState('');
  const [recipeDescription, setRecipeDescription] = useState('');
  const [ingredients, setIngredients] = useState([buildIngredient()]);

  const allRecipes = useMemo(() => listRecipes(), [revision]);
  const categoryOptions = useMemo(() => getRecipeCategories(allRecipes), [allRecipes]);

  const recipes = useMemo(
    () =>
      listRecipesWithOptions({
        search,
        categories: selectedCategories,
        sortKey,
        sortDirection,
      }),
    [search, selectedCategories, sortKey, sortDirection, revision],
  );

  const toggleCategory = (category: IngredientCategory) => {
    setSelectedCategories((current) =>
      current.includes(category)
        ? current.filter((item) => item !== category)
        : [...current, category],
    );
  };

  const handleClearFilters = () => {
    setSearch('');
    setSelectedCategories([]);
    setSortKey('updatedAt');
    setSortDirection('desc');
  };

  const updateIngredient = (index: number, field: string, value: string | number) => {
    setIngredients((current) =>
      current.map((ingredient, idx) =>
        idx === index ? { ...ingredient, [field]: value } : ingredient,
      ),
    );
  };

  const addIngredient = () => {
    setIngredients((current) => [...current, buildIngredient()]);
  };

  const removeIngredient = (index: number) => {
    setIngredients((current) => current.filter((_, idx) => idx !== index));
  };

  const handleSaveRecipe = () => {
    if (!recipeName.trim()) {
      return;
    }

    const now = new Date().toISOString();
    const id =
      typeof crypto !== 'undefined' && 'randomUUID' in crypto
        ? crypto.randomUUID()
        : `recipe-${Date.now()}`;

    const cleanedIngredients = ingredients
      .filter((ingredient) => ingredient.name.trim().length > 0)
      .map((ingredient) => ({
        ...ingredient,
        name: ingredient.name.trim(),
        unit: ingredient.unit.trim() || 'unit',
        quantity: Number(ingredient.quantity) || 0,
        cost: Number(ingredient.cost) || 0,
      }));

    const newRecipe: Recipe = {
      id,
      name: recipeName.trim(),
      description: recipeDescription.trim() || undefined,
      ingredients: cleanedIngredients,
      createdAt: now,
      updatedAt: now,
    };

    createRecipe(newRecipe);
    setRecipeName('');
    setRecipeDescription('');
    setIngredients([buildIngredient()]);
    setRevision((current) => current + 1);
  };

  const handleDeleteRecipe = (id: string) => {
    deleteRecipe(id);
    setRevision((current) => current + 1);
  };

  return (
    <section className="admin-recipes">
      <header className="admin-recipes__header">
        <div>
          <h1>Recipes</h1>
          <p>Manage dish blueprints, pricing estimates, and ingredient requirements.</p>
        </div>
        <div className="admin-recipes__meta">
          <div>
            <span className="eyebrow">Total recipes</span>
            <strong>{allRecipes.length}</strong>
          </div>
          <div>
            <span className="eyebrow">Average cost</span>
            <strong>
              {formatCurrency(
                allRecipes.length === 0
                  ? 0
                  : allRecipes.reduce((total, recipe) => total + getRecipeCost(recipe), 0) /
                      allRecipes.length,
              )}
            </strong>
          </div>
        </div>
      </header>

      <div className="grid two admin-recipes__panels">
        <div className="surface admin-recipes__panel">
          <h2>Add dish</h2>
          <p>Create new menu-ready dishes and define exact ingredient needs.</p>
          <div className="form-grid">
            <div className="form-field">
              <label htmlFor="recipe-name">Dish name</label>
              <input
                id="recipe-name"
                className="input"
                type="text"
                placeholder="e.g. Jollof rice & grilled chicken"
                value={recipeName}
                onChange={(event) => setRecipeName(event.target.value)}
              />
            </div>
            <div className="form-field">
              <label htmlFor="recipe-description">Description</label>
              <textarea
                id="recipe-description"
                className="input textarea"
                placeholder="Short notes, flavor profile, or prep notes."
                value={recipeDescription}
                onChange={(event) => setRecipeDescription(event.target.value)}
              />
            </div>
          </div>

          <div className="ingredient-builder">
            <div className="ingredient-builder__header">
              <h3>Ingredients</h3>
              <button type="button" className="ui-button ui-button--secondary" onClick={addIngredient}>
                Add ingredient
              </button>
            </div>
            {ingredients.map((ingredient, index) => (
              <div key={`${ingredient.name}-${index}`} className="ingredient-row">
                <input
                  className="input"
                  type="text"
                  placeholder="Ingredient name"
                  value={ingredient.name}
                  onChange={(event) => updateIngredient(index, 'name', event.target.value)}
                />
                <input
                  className="input"
                  type="number"
                  min="0"
                  step="0.1"
                  placeholder="Qty"
                  value={ingredient.quantity}
                  onChange={(event) =>
                    updateIngredient(index, 'quantity', Number(event.target.value))
                  }
                />
                <input
                  className="input"
                  type="text"
                  placeholder="Unit"
                  value={ingredient.unit}
                  onChange={(event) => updateIngredient(index, 'unit', event.target.value)}
                />
                <select
                  className="input select"
                  value={ingredient.category}
                  onChange={(event) =>
                    updateIngredient(index, 'category', event.target.value as IngredientCategory)
                  }
                >
                  {ingredientCategories.map((category) => (
                    <option key={category} value={category}>
                      {categoryLabel(category)}
                    </option>
                  ))}
                </select>
                <input
                  className="input"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="Unit cost"
                  value={ingredient.cost}
                  onChange={(event) => updateIngredient(index, 'cost', Number(event.target.value))}
                />
                <button
                  type="button"
                  className="ui-button ui-button--ghost"
                  onClick={() => removeIngredient(index)}
                  aria-label="Remove ingredient"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>

          <div className="admin-recipes__actions">
            <button type="button" className="ui-button" onClick={handleSaveRecipe}>
              Save dish
            </button>
            <span className="helper-text">
              Stored locally. Costs will appear in menu totals and shopping lists.
            </span>
          </div>
        </div>

        <div className="surface admin-recipes__panel">
          <h2>Search & filters</h2>
          <div className="form-grid">
            <div className="form-field">
              <label htmlFor="recipe-search">Search</label>
              <input
                id="recipe-search"
                className="input"
                type="search"
                placeholder="Search recipes or ingredients"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>
            <div className="form-field">
              <label htmlFor="recipe-sort">Sort by</label>
              <select
                id="recipe-sort"
                className="input select"
                value={sortKey}
                onChange={(event) =>
                  setSortKey(event.target.value as 'updatedAt' | 'name' | 'createdAt' | 'cost')
                }
              >
                <option value="updatedAt">Recently updated</option>
                <option value="createdAt">Date created</option>
                <option value="name">Name</option>
                <option value="cost">Total cost</option>
              </select>
            </div>
            <div className="form-field">
              <label htmlFor="recipe-sort-direction">Direction</label>
              <select
                id="recipe-sort-direction"
                className="input select"
                value={sortDirection}
                onChange={(event) => setSortDirection(event.target.value as 'asc' | 'desc')}
              >
                <option value="desc">Descending</option>
                <option value="asc">Ascending</option>
              </select>
            </div>
          </div>

          <div className="filter-chips">
            <span className="eyebrow">Filter by ingredient category</span>
            {categoryOptions.length === 0 ? (
              <p className="helper-text">No ingredient categories available yet.</p>
            ) : (
              categoryOptions.map((category) => (
                <button
                  key={category}
                  type="button"
                  className={`chip ${selectedCategories.includes(category) ? 'chip--active' : ''}`}
                  onClick={() => toggleCategory(category)}
                  aria-pressed={selectedCategories.includes(category)}
                >
                  {categoryLabel(category)}
                </button>
              ))
            )}
          </div>

          <button type="button" className="ui-button ui-button--ghost" onClick={handleClearFilters}>
            Clear filters
          </button>
        </div>
      </div>

      <div className="surface admin-recipes__panel">
        <h2>Recipe list</h2>
        {recipes.length === 0 ? (
          <p className="helper-text">No recipes match the current filters.</p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Ingredients</th>
                <th>Categories</th>
                <th>Total Cost</th>
                <th>Last Updated</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {recipes.map((recipe) => (
                <tr key={recipe.id}>
                  <td>
                    <strong>{recipe.name}</strong>
                    <div className="muted">{recipe.description}</div>
                  </td>
                  <td>{recipe.ingredients.length}</td>
                  <td>
                    {Array.from(
                      new Set(recipe.ingredients.map((ingredient) => ingredient.category)),
                    )
                      .sort((a, b) => a.localeCompare(b))
                      .map(categoryLabel)
                      .join(', ')}
                  </td>
                  <td>{formatCurrency(getRecipeCost(recipe))}</td>
                  <td>{formatDate(recipe.updatedAt)}</td>
                  <td>
                    <button
                      type="button"
                      className="ui-button ui-button--ghost"
                      onClick={() => handleDeleteRecipe(recipe.id)}
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
};

export default AdminRecipes;
