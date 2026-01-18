import { useMemo, useState } from 'react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Modal } from '../components/ui/Modal';
import { Slider } from '../components/ui/Slider';
import type { MenuDay, WeeklyMenu } from '../models/menu';
import type { Recipe } from '../models/recipe';
import { listRecipes, getRecipeCost } from '../storage/recipes';
import { listSampleWeeks } from '../storage/sampleWeeks';
import { addHistoryEntry } from '../storage/history';
import { buildNext7Days, generateMenu } from '../services/generator';
import { buildShoppingList } from '../services/shoppingList';

const weekdayFormatter = new Intl.DateTimeFormat('en-US', {
  weekday: 'long',
  month: 'short',
  day: 'numeric',
});

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);

const createDefaultMenu = (): WeeklyMenu => {
  const days = buildNext7Days();
  const now = new Date().toISOString();
  return {
    id: `menu-${Date.now()}`,
    weekStart: days[0]?.date ?? now,
    createdAt: now,
    rules: {
      servings: 4,
      budget: 200,
      variety: 3,
      includeIds: [],
      excludeIds: [],
      sampleBias: 3,
    },
    days,
  };
};

export function Generate() {
  const [recipes, setRecipes] = useState<Recipe[]>(() => listRecipes());
  const [menu, setMenu] = useState<WeeklyMenu>(() => createDefaultMenu());
  const [isGenerating, setIsGenerating] = useState(false);
  const [spinningIndex, setSpinningIndex] = useState<number | null>(null);
  const [selectedDay, setSelectedDay] = useState<MenuDay | null>(null);
  const [portionSize, setPortionSize] = useState(menu.rules.servings);

  const availableRecipes = useMemo(() => recipes, [recipes]);

  const shoppingList = useMemo(
    () => buildShoppingList(menu.days, recipes, menu.rules.servings),
    [menu.days, recipes, menu.rules.servings],
  );

  const totalCost = useMemo(
    () =>
      menu.days.reduce((total, day) => {
        const recipe = recipes.find((item) => item.id === day.recipeId);
        if (!recipe) {
          return total;
        }

        return total + getRecipeCost(recipe) * menu.rules.servings;
      }, 0),
    [menu.days, recipes, menu.rules.servings],
  );

  const refreshRecipes = () => {
    setRecipes(listRecipes());
  };

  const updateRules = (partial: Partial<WeeklyMenu['rules']>) => {
    setMenu((current) => ({
      ...current,
      rules: {
        ...current.rules,
        ...partial,
      },
    }));
  };

  const toggleId = (list: string[], id: string) =>
    list.includes(id) ? list.filter((value) => value !== id) : [...list, id];

  const handleGenerate = () => {
    if (availableRecipes.length === 0) {
      return;
    }

    setIsGenerating(true);
    const samples = listSampleWeeks();
    const finalDays = generateMenu(availableRecipes, menu.rules, menu.days, samples);

    finalDays.forEach((day, index) => {
      setTimeout(() => {
        setSpinningIndex(index);
        setMenu((current) => ({
          ...current,
          days: current.days.map((item, idx) => (idx === index ? day : item)),
        }));

        if (index === finalDays.length - 1) {
          setTimeout(() => {
            setIsGenerating(false);
            setSpinningIndex(null);
            setMenu((current) => {
              const updatedMenu = {
                ...current,
                id: `menu-${Date.now()}`,
                createdAt: new Date().toISOString(),
              };
              addHistoryEntry(updatedMenu);
              return updatedMenu;
            });
          }, 250);
        }
      }, 200 * index);
    });
  };

  const handleRegenerateUnlocked = () => {
    if (availableRecipes.length === 0) {
      return;
    }

    const samples = listSampleWeeks();
    const finalDays = generateMenu(availableRecipes, menu.rules, menu.days, samples);
    setMenu((current) => ({ ...current, days: finalDays }));
  };

  const handleRegenerateDay = (index: number) => {
    const day = menu.days[index];
    if (!day || day.locked) {
      return;
    }

    const samples = listSampleWeeks();
    const updated = generateMenu(availableRecipes, menu.rules, [day], samples);
    setMenu((current) => ({
      ...current,
      days: current.days.map((item, idx) => (idx === index ? updated[0] : item)),
    }));
  };

  const toggleLock = (index: number) => {
    setMenu((current) => ({
      ...current,
      days: current.days.map((day, idx) =>
        idx === index ? { ...day, locked: !day.locked } : day,
      ),
    }));
  };

  const handleOpenDetails = (day: MenuDay) => {
    setSelectedDay(day);
    setPortionSize(menu.rules.servings);
  };

  const selectedRecipe = selectedDay
    ? recipes.find((recipe) => recipe.id === selectedDay.recipeId)
    : null;

  return (
    <div className="generate-layout">
      <div className="generate-layout__controls">
        <Card title="Rules & Controls" eyebrow="Generate">
          <p>Craft the constraints for the next seven-day menu and its ingredient budget.</p>
          <div className="grid">
            <Slider
              label={`Servings (${menu.rules.servings} people)`}
              min={1}
              max={12}
              value={menu.rules.servings}
              onChange={(event) => updateRules({ servings: Number(event.target.value) })}
            />
            <Slider
              label={`Weekly budget (${formatCurrency(menu.rules.budget)})`}
              min={50}
              max={500}
              step={10}
              value={menu.rules.budget}
              onChange={(event) => updateRules({ budget: Number(event.target.value) })}
            />
            <Slider
              label={`Variety (${menu.rules.variety})`}
              min={1}
              max={5}
              value={menu.rules.variety}
              onChange={(event) => updateRules({ variety: Number(event.target.value) })}
            />
            <Slider
              label={`Sample week bias (${menu.rules.sampleBias})`}
              min={0}
              max={5}
              value={menu.rules.sampleBias}
              onChange={(event) => updateRules({ sampleBias: Number(event.target.value) })}
            />
          </div>
          <div className="helper-text">
            Pricing estimate uses stored ingredient costs (local market snapshot). Refresh after
            updating recipes.
          </div>
          <div className="ui-card__footer">
            <Button onClick={handleGenerate} disabled={isGenerating}>
              {isGenerating ? 'Generating...' : 'Generate menu'}
            </Button>
            <Button variant="secondary" onClick={handleRegenerateUnlocked}>
              Regenerate unlocked
            </Button>
            <Button variant="ghost" onClick={refreshRecipes}>
              Refresh recipes
            </Button>
          </div>
        </Card>

        <Card title="Include & Exclude" eyebrow="Preferences">
          <div className="dual-list">
            <div>
              <h4>Include</h4>
              <div className="pill-list">
                {availableRecipes.map((recipe) => (
                  <label key={`include-${recipe.id}`} className="pill">
                    <input
                      type="checkbox"
                      checked={menu.rules.includeIds.includes(recipe.id)}
                      onChange={() =>
                        updateRules({
                          includeIds: toggleId(menu.rules.includeIds, recipe.id),
                        })
                      }
                    />
                    <span>{recipe.name}</span>
                  </label>
                ))}
              </div>
            </div>
            <div>
              <h4>Exclude</h4>
              <div className="pill-list">
                {availableRecipes.map((recipe) => (
                  <label key={`exclude-${recipe.id}`} className="pill">
                    <input
                      type="checkbox"
                      checked={menu.rules.excludeIds.includes(recipe.id)}
                      onChange={() =>
                        updateRules({
                          excludeIds: toggleId(menu.rules.excludeIds, recipe.id),
                        })
                      }
                    />
                    <span>{recipe.name}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </Card>
      </div>

      <div className="generate-layout__results">
        <Card title="Weekly menu" eyebrow="Next 7 days">
          <div className="menu-grid">
            {menu.days.map((day, index) => {
              const recipe = recipes.find((item) => item.id === day.recipeId);
              const isSpinning = isGenerating && spinningIndex === index;
              return (
                <div
                  key={day.date}
                  className={`menu-day ${day.locked ? 'menu-day--locked' : ''} ${
                    isSpinning ? 'menu-day--spinning' : ''
                  }`}
                  onClick={() => recipe && handleOpenDetails(day)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' && recipe) {
                      handleOpenDetails(day);
                    }
                  }}
                >
                  <div className="menu-day__header">
                    <span>{weekdayFormatter.format(new Date(day.date))}</span>
                    <span className="menu-day__controls">
                      <button
                        type="button"
                        className="icon-button"
                        onClick={(event) => {
                          event.stopPropagation();
                          toggleLock(index);
                        }}
                      >
                        {day.locked ? '🔒' : '🔓'}
                      </button>
                      <button
                        type="button"
                        className="icon-button"
                        onClick={(event) => {
                          event.stopPropagation();
                          handleRegenerateDay(index);
                        }}
                      >
                        ↻
                      </button>
                    </span>
                  </div>
                  <div className="menu-day__body">
                    <h3>{recipe?.name ?? 'Awaiting selection'}</h3>
                    <p>{recipe?.description ?? 'Tap Generate to assign a dish.'}</p>
                  </div>
                  <div className="menu-day__footer">
                    <span>{recipe ? formatCurrency(getRecipeCost(recipe) * menu.rules.servings) : '--'}</span>
                    <span>{day.locked ? 'Locked' : 'Editable'}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        <Card title="Total estimate" eyebrow="Ingredients">
          <div className="cost-summary">
            <div>
              <span className="eyebrow">Weekly ingredient total</span>
              <strong>{formatCurrency(totalCost)}</strong>
            </div>
            <div>
              <span className="eyebrow">Servings</span>
              <strong>{menu.rules.servings} people</strong>
            </div>
            <div>
              <span className="eyebrow">Pricing source</span>
              <strong>Local market snapshot</strong>
            </div>
          </div>
        </Card>

        <Card title="Shopping list" eyebrow="Auto-generated">
          <div className="shopping-header">
            <p>Grouped by aisle for fast procurement.</p>
            <div className="ui-card__footer">
              <Button variant="secondary" onClick={() => window.print()}>
                Print menu & list
              </Button>
            </div>
          </div>
          <div className="shopping-list">
            {shoppingList.length === 0 ? (
              <p className="helper-text">Generate a menu to see the shopping list.</p>
            ) : (
              shoppingList.map((item) => (
                <div key={`${item.name}-${item.unit}`} className="shopping-item">
                  <div>
                    <strong>{item.name}</strong>
                    <div className="muted">{item.category}</div>
                  </div>
                  <div>
                    {item.quantity.toFixed(2)} {item.unit}
                  </div>
                  <div>{formatCurrency(item.cost)}</div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

      <Modal
        title={selectedRecipe?.name ?? 'Dish details'}
        description={selectedRecipe?.description}
        isOpen={!!selectedRecipe}
        actions={
          <>
            <Button variant="secondary" onClick={() => setSelectedDay(null)}>
              Close
            </Button>
            <Button
              onClick={() => {
                updateRules({ servings: portionSize });
                setSelectedDay(null);
              }}
            >
              Apply servings
            </Button>
          </>
        }
      >
        {selectedRecipe ? (
          <div className="details-modal">
            <div className="details-modal__controls">
              <label htmlFor="portion-size">Portion size</label>
              <input
                id="portion-size"
                type="number"
                min={1}
                max={20}
                value={portionSize}
                className="input"
                onChange={(event) => setPortionSize(Number(event.target.value))}
              />
            </div>
            <div className="details-modal__list">
              {selectedRecipe.ingredients.map((ingredient) => (
                <div key={ingredient.name} className="details-modal__item">
                  <div>
                    <strong>{ingredient.name}</strong>
                    <div className="muted">{ingredient.category}</div>
                  </div>
                  <div>
                    {(ingredient.quantity * portionSize).toFixed(2)} {ingredient.unit}
                  </div>
                  <div>{formatCurrency(ingredient.cost * ingredient.quantity * portionSize)}</div>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </Modal>
import React, { useMemo, useState } from "react";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Chip } from "../components/ui/Chip";
import { Slider } from "../components/ui/Slider";
import { listRecipes } from "../storage/recipes";
import {
  GenerationPlan,
  generatePlan,
  loadGenerationRules,
} from "../services/generator";

export function Generate() {
  const recipes = useMemo(() => listRecipes(), []);
  const [plan, setPlan] = useState<GenerationPlan | null>(null);

  const handleGenerate = () => {
    const rules = loadGenerationRules();
    setPlan(generatePlan(recipes, rules));
  };

  return (
    <div className="grid two">
      <Card title="Prompt Builder" eyebrow="Generate">
        <p>Blend cuisine styles, dietary rules, and desired prep time for new recipe drafts.</p>
        <div className="grid">
          <Slider label="Creativity" min={0} max={10} defaultValue={7} valueLabel="7 / 10" />
          <Slider label="Difficulty" min={1} max={5} defaultValue={3} valueLabel="3 / 5" />
        </div>
        <div className="ui-card__footer">
          <Chip label="Vegan" />
          <Chip label="Low Sodium" tone="muted" />
          <Chip label="Spicy" tone="accent" />
        </div>
      </Card>
      <Card title="Launch Generate" eyebrow="Batch">
        <p>Produce AI-assisted recipe drafts, auto-tagged and ready for chef review.</p>
        <div className="ui-card__footer">
          <Button onClick={handleGenerate}>Generate plan</Button>
          <Button variant="ghost">Schedule Run</Button>
        </div>
        <div className="generation-plan">
          {plan ? (
            <>
              <p>
                Using {plan.rules.servings} servings, {plan.rules.variety} picks, and a $
                {plan.rules.costLimit} cost limit.
              </p>
              {plan.selectedRecipes.length === 0 ? (
                <p className="generation-plan__empty">No recipes match the current rules.</p>
              ) : (
                <ul>
                  {plan.selectedRecipes.map((recipe) => (
                    <li key={recipe.id}>{recipe.name}</li>
                  ))}
                </ul>
              )}
            </>
          ) : (
            <p className="generation-plan__empty">
              Run the generator to see recipes based on your saved rules.
            </p>
          )}
        </div>
      </Card>
      <Card title="Model Signals" eyebrow="Realtime">
        <p>Inference speed stable. 2 generation lanes active.</p>
        <div className="ui-card__footer">
          <Button variant="secondary">View Telemetry</Button>
        </div>
      </header>
      <div className="grid week">
        {days.map((day) => (
          <MenuDayCard
            key={day.id}
            id={day.id}
            weekday={day.weekday}
            dateLabel={day.dateLabel}
            dish={day.dish}
            slotItems={day.slotItems}
            locked={day.locked}
            isSpinning={day.isSpinning}
            onToggleLock={toggleLock}
            onRegenerate={regenerateDay}
          />
        ))}
      </div>
    </div>
  );
}
