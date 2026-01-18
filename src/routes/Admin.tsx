import React from "react";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Chip } from "../components/ui/Chip";

export function Admin() {
  return (
    <div className="grid two">
      <Card title="Recipe Library" eyebrow="Admin / Recipes">
        <p>
          Curate core dishes, upload new recipe blueprints, and tag flavor profiles for the
          generator.
        </p>
        <div className="ui-card__footer">
          <Chip label="150 Active" />
          <Chip label="12 Drafts" tone="muted" />
          <Chip label="3 Alerts" tone="danger" />
        </div>
      </Card>
      <Card title="Supplier Sync" eyebrow="Ingredients">
        <p>
          Monitor inventory feeds, substitute ingredients, and schedule seasonal rotations.
        </p>
        <div className="ui-card__footer">
          <Button>Import CSV</Button>
          <Button variant="secondary">Review Signals</Button>
        </div>
      </Card>
      <Card title="Quality Control" eyebrow="Compliance">
        <p>Track allergen checks and ensure every recipe meets your dietary policies.</p>
        <Button variant="ghost">Open QC Dashboard</Button>
      </Card>
      <Card title="Access Control" eyebrow="Team">
        <p>Assign editors, lock premium recipes, and manage release windows.</p>
        <Button variant="secondary">Manage Roles</Button>
      </Card>
    </div>
  );
}
