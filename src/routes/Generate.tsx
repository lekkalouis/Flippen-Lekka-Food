import React, { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "../components/ui/Button";
import { MenuDayCard } from "../components/MenuDayCard";

type MenuDay = {
  id: string;
  weekday: string;
  dateLabel: string;
  dish: string;
  slotItems: string[];
  locked: boolean;
  isSpinning: boolean;
  pendingDish?: string;
};

const DISHES = [
  "Miso Butter Salmon",
  "Harissa Chickpea Bowl",
  "Citrus Herb Chicken",
  "Coconut Lemongrass Stew",
  "Smoked Paprika Gnocchi",
  "Maple Dijon Tofu",
  "Sesame Ginger Noodles",
  "Roasted Eggplant Tagine",
  "Black Garlic Ramen",
  "Turmeric Cauliflower Steaks",
  "Pesto Shrimp Orzo",
  "Lentil & Kale Ragout",
  "Saffron Risotto",
  "Spicy Kimchi Fried Rice",
];

const SLOT_SPIN_DURATION = 900;

const randomDish = () => DISHES[Math.floor(Math.random() * DISHES.length)];

const buildSlotItems = (finalDish: string) => {
  const items = Array.from({ length: 5 }, () => randomDish());
  return [...items, finalDish];
};

const buildWeek = () => {
  const today = new Date();
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() + index);
    const dish = randomDish();
    return {
      id: `${date.toISOString()}-${index}`,
      weekday: date.toLocaleDateString("en-US", { weekday: "long" }),
      dateLabel: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      dish,
      slotItems: [dish],
      locked: false,
      isSpinning: false,
    };
  });
};

export function Generate() {
  const [days, setDays] = useState<MenuDay[]>(() => buildWeek());
  const spinTimers = useRef<Record<string, number>>({});

  const unlockCount = useMemo(() => days.filter((day) => !day.locked).length, [days]);

  const toggleLock = (id: string) => {
    setDays((prev) =>
      prev.map((day) => (day.id === id ? { ...day, locked: !day.locked } : day))
    );
  };

  const finalizeSpin = (id: string) => {
    setDays((prev) =>
      prev.map((day) => {
        if (day.id !== id) {
          return day;
        }
        const dish = day.pendingDish ?? day.dish;
        return {
          ...day,
          dish,
          isSpinning: false,
          slotItems: [dish],
          pendingDish: undefined,
        };
      })
    );
  };

  const regenerateDay = (id: string) => {
    setDays((prev) =>
      prev.map((day) => {
        if (day.id !== id || day.locked) {
          return day;
        }
        const nextDish = randomDish();
        return {
          ...day,
          isSpinning: true,
          slotItems: buildSlotItems(nextDish),
          pendingDish: nextDish,
        };
      })
    );

    if (spinTimers.current[id]) {
      window.clearTimeout(spinTimers.current[id]);
    }

    spinTimers.current[id] = window.setTimeout(() => finalizeSpin(id), SLOT_SPIN_DURATION);
  };

  const regenerateAllUnlocked = () => {
    days
      .filter((day) => !day.locked)
      .forEach((day) => {
        regenerateDay(day.id);
      });
  };

  useEffect(() => {
    return () => {
      Object.values(spinTimers.current).forEach((timer) => window.clearTimeout(timer));
    };
  }, []);

  return (
    <div className="generate-page">
      <header className="generate-page__header">
        <div>
          <p className="section-title">Weekly Menu Generator</p>
          <h2 className="generate-page__title">
            Spin up dishes for the next 7 days and lock the winners.
          </h2>
        </div>
        <div className="generate-page__actions">
          <Button variant="secondary" onClick={regenerateAllUnlocked} disabled={unlockCount === 0}>
            Regenerate All Unlocked
          </Button>
          <span className="generate-page__count">{unlockCount} days open</span>
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
