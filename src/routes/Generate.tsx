import React from "react";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Chip } from "../components/ui/Chip";
import { Slider } from "../components/ui/Slider";

export function Generate() {
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
        <p>
          Produce AI-assisted recipe drafts, auto-tagged and ready for chef review.
        </p>
        <div className="ui-card__footer">
          <Button>Generate 4 Drafts</Button>
          <Button variant="ghost">Schedule Run</Button>
        </div>
      </Card>
      <Card title="Model Signals" eyebrow="Realtime">
        <p>Inference speed stable. 2 generation lanes active.</p>
        <div className="ui-card__footer">
          <Button variant="secondary">View Telemetry</Button>
        </div>
      </Card>
      <Card title="Flavor Matrix" eyebrow="Experimental">
        <p>Cross-pollinate ingredients with trending palettes across regions.</p>
        <Button variant="secondary">Explore Matrix</Button>
      </Card>
    </div>
  );
}
