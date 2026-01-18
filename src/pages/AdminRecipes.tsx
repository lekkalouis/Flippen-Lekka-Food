import { useMemo, useState } from 'react';

import type { IngredientCategory, Recipe } from '../models/recipe';
import {
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

const AdminRecipes = () => {
  const [search, setSearch] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<IngredientCategory[]>([]);
  const [sortKey, setSortKey] = useState<'updatedAt' | 'name' | 'createdAt' | 'cost'>(
    'updatedAt',
  );
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const allRecipes = useMemo(() => listRecipes(), []);
  const categoryOptions = useMemo(() => getRecipeCategories(allRecipes), [allRecipes]);

  const recipes = useMemo(
    () =>
      listRecipesWithOptions({
        search,
        categories: selectedCategories,
        sortKey,
        sortDirection,
      }),
    [search, selectedCategories, sortKey, sortDirection],
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

  return (
    <section>
      <header>
        <h1>Recipes</h1>
        <p>Manage recipe details, ingredients, and costs.</p>
      </header>

      <div>
        <label htmlFor="recipe-search">Search</label>
        <input
          id="recipe-search"
          type="search"
          placeholder="Search recipes or ingredients"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
      </div>

      <div>
        <h2>Filters</h2>
        <div>
          {categoryOptions.length === 0 ? (
            <p>No ingredient categories available yet.</p>
          ) : (
            categoryOptions.map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => toggleCategory(category)}
                aria-pressed={selectedCategories.includes(category)}
              >
                {categoryLabel(category)}
              </button>
            ))
          )}
        </div>
      </div>

      <div>
        <h2>Sort</h2>
        <label htmlFor="recipe-sort">Sort by</label>
        <select
          id="recipe-sort"
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

        <label htmlFor="recipe-sort-direction">Direction</label>
        <select
          id="recipe-sort-direction"
          value={sortDirection}
          onChange={(event) => setSortDirection(event.target.value as 'asc' | 'desc')}
        >
          <option value="desc">Descending</option>
          <option value="asc">Ascending</option>
        </select>

        <button type="button" onClick={handleClearFilters}>
          Clear filters
        </button>
      </div>

      <div>
        <h2>Recipe list</h2>
        {recipes.length === 0 ? (
          <p>No recipes match the current filters.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Ingredients</th>
                <th>Categories</th>
                <th>Total Cost</th>
                <th>Last Updated</th>
              </tr>
            </thead>
            <tbody>
              {recipes.map((recipe) => (
                <tr key={recipe.id}>
                  <td>{recipe.name}</td>
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
