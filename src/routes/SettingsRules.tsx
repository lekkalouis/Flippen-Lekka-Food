import React from "react";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { RulesPanel } from "../components/RulesPanel";

export function SettingsRules() {
  return (
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
