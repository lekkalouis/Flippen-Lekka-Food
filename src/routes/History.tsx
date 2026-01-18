import React from "react";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Chip } from "../components/ui/Chip";

export function History() {
  return (
    <div className="grid two">
      <Card title="Recent Runs" eyebrow="History">
        <p>Review the latest batch results and export approved recipes.</p>
        <div className="ui-card__footer">
          <Chip label="24 Approved" />
          <Chip label="6 Pending" tone="muted" />
          <Chip label="1 Flagged" tone="danger" />
        </div>
      </Card>
      <Card title="Audit Trail" eyebrow="Compliance">
        <p>Every edit, rejection, and approval is logged for governance reporting.</p>
        <Button variant="secondary">Open Logs</Button>
      </Card>
      <Card title="Insights" eyebrow="Analytics">
        <p>See success rates by cuisine type and cooking duration.</p>
        <Button>View Analytics</Button>
      </Card>
      <Card title="Exports" eyebrow="Delivery">
        <p>Package approved recipes for POS, PDF, or kitchen display systems.</p>
        <Button variant="ghost">Export Center</Button>
      </Card>
    </div>
  );
}
