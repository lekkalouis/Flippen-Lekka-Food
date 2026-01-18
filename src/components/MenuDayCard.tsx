import React from "react";
import { Button } from "./ui/Button";
import { Card } from "./ui/Card";

export type MenuDayCardProps = {
  id: string;
  weekday: string;
  dateLabel: string;
  dish: string;
  slotItems: string[];
  locked: boolean;
  isSpinning: boolean;
  onToggleLock: (id: string) => void;
  onRegenerate: (id: string) => void;
};

export function MenuDayCard({
  id,
  weekday,
  dateLabel,
  dish,
  slotItems,
  locked,
  isSpinning,
  onToggleLock,
  onRegenerate,
}: MenuDayCardProps) {
  return (
    <Card
      title={weekday}
      eyebrow={dateLabel}
      footer={
        <div className="menu-day-card__footer">
          <Button
            variant={locked ? "secondary" : "ghost"}
            onClick={() => onToggleLock(id)}
          >
            {locked ? "Unlock" : "Lock"}
          </Button>
          <Button variant="secondary" onClick={() => onRegenerate(id)} disabled={locked}>
            Regenerate Day
          </Button>
        </div>
      }
    >
      <div className="menu-day-card__body">
        <div className="menu-day-card__slot">
          <div className={`menu-day-card__slot-window ${isSpinning ? "is-spinning" : ""}`}>
            <div
              className="menu-day-card__slot-list"
              style={{ "--slot-count": slotItems.length } as React.CSSProperties}
            >
              {slotItems.map((item, index) => (
                <span key={`${item}-${index}`} className="menu-day-card__slot-item">
                  {item}
                </span>
              ))}
            </div>
          </div>
          <div className="menu-day-card__meta">
            <span className="menu-day-card__label">Featured Dish</span>
            <span className={`menu-day-card__status ${locked ? "is-locked" : ""}`}>
              {locked ? "Locked" : "Unlocked"}
            </span>
          </div>
        </div>
        <p className="menu-day-card__description">
          {dish} paired with seasonal sides and chef notes.
        </p>
      </div>
    </Card>
  );
}
