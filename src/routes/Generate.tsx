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
