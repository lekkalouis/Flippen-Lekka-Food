import React, { useEffect, useMemo, useState } from "react";
import { Card } from "./ui/Card";
import { Slider } from "./ui/Slider";
import { Button } from "./ui/Button";
import { listRecipes } from "../storage/recipes";
import {
  GenerationRules,
  loadGenerationRules,
  resetGenerationRules,
  saveGenerationRules,
} from "../services/generator";

const recipeListLabel = (count: number) =>
  count === 1 ? "1 saved recipe" : `${count} saved recipes`;

export function RulesPanel() {
  const recipes = useMemo(() => listRecipes(), []);
  const [rules, setRules] = useState<GenerationRules>(() => loadGenerationRules());

  useEffect(() => {
    saveGenerationRules(rules);
  }, [rules]);

  const updateRule = <Key extends keyof GenerationRules>(key: Key, value: GenerationRules[Key]) => {
    setRules((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const toggleRecipe = (key: "includeRecipeIds" | "excludeRecipeIds", id: string) => {
    setRules((prev) => {
      const existing = new Set(prev[key]);
      const oppositeKey = key === "includeRecipeIds" ? "excludeRecipeIds" : "includeRecipeIds";
      const opposite = new Set(prev[oppositeKey]);

      if (existing.has(id)) {
        existing.delete(id);
      } else {
        existing.add(id);
        opposite.delete(id);
      }

      return {
        ...prev,
        [key]: Array.from(existing),
        [oppositeKey]: Array.from(opposite),
      };
    });
  };

  const handleReset = () => {
    setRules(resetGenerationRules());
  };

  return (
    <Card title="Generation Rules" eyebrow="Settings">
      <p className="rules-panel__description">
        Tune the generator inputs and preselect recipes to include or avoid.
      </p>
      <div className="rules-panel__sliders">
        <Slider
          label="Servings"
          min={1}
          max={12}
          step={1}
          value={rules.servings}
          onChange={(event) => updateRule("servings", Number(event.target.value))}
          valueLabel={`${rules.servings} servings`}
        />
        <Slider
          label="Variety"
          min={1}
          max={10}
          step={1}
          value={rules.variety}
          onChange={(event) => updateRule("variety", Number(event.target.value))}
          valueLabel={`${rules.variety} picks`}
        />
        <Slider
          label="Cost limit"
          min={10}
          max={200}
          step={5}
          value={rules.costLimit}
          onChange={(event) => updateRule("costLimit", Number(event.target.value))}
          valueLabel={`$${rules.costLimit}`}
        />
        <Slider
          label="Max prep time"
          min={15}
          max={120}
          step={5}
          value={rules.maxPrepMinutes}
          onChange={(event) => updateRule("maxPrepMinutes", Number(event.target.value))}
          valueLabel={`${rules.maxPrepMinutes} min`}
        />
      </div>
      <div className="rules-panel__lists">
        <div className="rules-panel__list">
          <div className="rules-panel__list-header">
            <div>
              <h4>Include recipes</h4>
              <span>{recipeListLabel(recipes.length)}</span>
            </div>
          </div>
          {recipes.length === 0 ? (
            <p className="rules-panel__empty">Add recipes in the Admin tab to build lists.</p>
          ) : (
            <ul>
              {recipes.map((recipe) => (
                <li key={`include-${recipe.id}`}>
                  <label>
                    <input
                      type="checkbox"
                      checked={rules.includeRecipeIds.includes(recipe.id)}
                      onChange={() => toggleRecipe("includeRecipeIds", recipe.id)}
                    />
                    <span>{recipe.name}</span>
                  </label>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="rules-panel__list">
          <div className="rules-panel__list-header">
            <div>
              <h4>Exclude recipes</h4>
              <span>{recipeListLabel(recipes.length)}</span>
            </div>
          </div>
          {recipes.length === 0 ? (
            <p className="rules-panel__empty">Add recipes in the Admin tab to build lists.</p>
          ) : (
            <ul>
              {recipes.map((recipe) => (
                <li key={`exclude-${recipe.id}`}>
                  <label>
                    <input
                      type="checkbox"
                      checked={rules.excludeRecipeIds.includes(recipe.id)}
                      onChange={() => toggleRecipe("excludeRecipeIds", recipe.id)}
                    />
                    <span>{recipe.name}</span>
                  </label>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
      <div className="rules-panel__footer">
        <Button variant="ghost" onClick={handleReset}>
          Reset rules
        </Button>
      </div>
    </Card>
  );
}
