import { useMemo, useState } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { listRecipes } from '../storage/recipes';
import { addSampleWeek, deleteSampleWeek, listSampleWeeks } from '../storage/sampleWeeks';
import React from "react";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { RulesPanel } from "../components/RulesPanel";

export function SettingsRules() {
  const [revision, setRevision] = useState(0);
  const [sampleName, setSampleName] = useState('');
  const [selectedRecipes, setSelectedRecipes] = useState<string[]>([]);
  const recipes = useMemo(() => listRecipes(), []);
  const sampleWeeks = useMemo(() => listSampleWeeks(), [revision]);

  const toggleRecipe = (id: string) => {
    setSelectedRecipes((current) =>
      current.includes(id) ? current.filter((value) => value !== id) : [...current, id],
    );
  };

  const handleSaveSample = () => {
    if (!sampleName.trim() || selectedRecipes.length !== 7) {
      return;
    }

    const sample = {
      id:
        typeof crypto !== 'undefined' && 'randomUUID' in crypto
          ? crypto.randomUUID()
          : `sample-${Date.now()}`,
      name: sampleName.trim(),
      recipeIds: selectedRecipes,
      createdAt: new Date().toISOString(),
    };

    addSampleWeek(sample);
    setSampleName('');
    setSelectedRecipes([]);
    setRevision((current) => current + 1);
  };

  const handleDeleteSample = (id: string) => {
    deleteSampleWeek(id);
    setRevision((current) => current + 1);
  };

  return (
    <div className="grid two settings-layout">
      <Card title="Sample week builder" eyebrow="Training">
        <p>Select seven dishes for a typical week so the generator understands your tastes.</p>
        <div className="form-grid">
          <div className="form-field">
            <label htmlFor="sample-name">Week name</label>
            <input
              id="sample-name"
              className="input"
              placeholder="e.g. Weekday favorites"
              value={sampleName}
              onChange={(event) => setSampleName(event.target.value)}
            />
          </div>
        </div>
        <div className="pill-list pill-list--scroll">
          {recipes.map((recipe) => (
            <label
              key={recipe.id}
              className={`pill ${selectedRecipes.includes(recipe.id) ? 'pill--active' : ''}`}
            >
              <input
                type="checkbox"
                checked={selectedRecipes.includes(recipe.id)}
                onChange={() => toggleRecipe(recipe.id)}
              />
              <span>{recipe.name}</span>
            </label>
          ))}
        </div>
        <div className="helper-text">
          Choose exactly 7 dishes. Selected: {selectedRecipes.length}
        </div>
        <div className="ui-card__footer">
          <Button onClick={handleSaveSample} disabled={selectedRecipes.length !== 7}>
            Save sample week
          </Button>
        </div>
      </Card>

      <Card title="Saved sample weeks" eyebrow="Library">
        <p>Use these samples to steer the generator toward your preferred menu styles.</p>
        <div className="sample-week-list">
          {sampleWeeks.length === 0 ? (
            <p className="helper-text">No sample weeks saved yet.</p>
          ) : (
            sampleWeeks.map((sample) => (
              <div key={sample.id} className="sample-week-card">
                <div>
                  <strong>{sample.name}</strong>
                  <div className="muted">{sample.recipeIds.length} dishes</div>
                </div>
                <Button variant="ghost" onClick={() => handleDeleteSample(sample.id)}>
                  Delete
                </Button>
              </div>
            ))
          )}
        </div>
    <div className="grid two">
      <RulesPanel />
      <Card title="Taste Profiles" eyebrow="Calibration">
        <p>Adjust spice tolerance, sweetness bands, and regional flavor weights.</p>
        <Button variant="secondary">Tune Profile</Button>
      </Card>
      <Card title="Automation" eyebrow="Workflows">
        <p>Trigger auto-approvals and schedule nightly recipe refreshes.</p>
        <Button>Configure Automation</Button>
      </Card>
      <Card title="Notifications" eyebrow="Alerts">
        <p>Set alert thresholds for low inventory or repeated rejections.</p>
        <Button variant="ghost">Manage Alerts</Button>
      </Card>
    </div>
  );
}
