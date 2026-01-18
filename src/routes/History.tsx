import { useMemo, useState } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { listHistory, clearHistory } from '../storage/history';
import { listRecipes } from '../storage/recipes';

const formatDate = (value: string) => new Date(value).toLocaleDateString();

const getWeekNumber = (date: Date) => {
  const start = new Date(date.getFullYear(), 0, 1);
  const diff = date.getTime() - start.getTime();
  return Math.ceil((diff / 86400000 + start.getDay() + 1) / 7);
};

export function History() {
  const [revision, setRevision] = useState(0);
  const history = useMemo(() => listHistory(), [revision]);
  const recipes = useMemo(() => listRecipes(), []);

  const handleClear = () => {
    clearHistory();
    setRevision((current) => current + 1);
  };

  return (
    <div className="grid two history-layout">
      <Card title="Past generations" eyebrow="History">
        <p>Review menu runs from each week, including locked dishes and rules.</p>
        <div className="history-list">
          {history.length === 0 ? (
            <p className="helper-text">No menu generations saved yet.</p>
          ) : (
            history.map((entry) => {
              const weekDate = new Date(entry.weekStart);
              const weekNumber = getWeekNumber(weekDate);
              const monthLabel = weekDate.toLocaleString('en-US', { month: 'long' });
              return (
                <div key={entry.id} className="history-card">
                  <div>
                    <strong>
                      Week {weekNumber} • {monthLabel}
                    </strong>
                    <div className="muted">Generated {formatDate(entry.createdAt)}</div>
                  </div>
                  <div className="history-card__meta">
                    <span>{entry.days.filter((day) => day.recipeId).length} dishes</span>
                    <span>{entry.rules.servings} servings</span>
                  </div>
                  <div className="history-card__menu">
                    {entry.days.map((day) => {
                      const recipe = recipes.find((item) => item.id === day.recipeId);
                      return (
                        <span key={day.date} className="history-card__pill">
                          {recipe?.name ?? 'Unassigned'}
                        </span>
                      );
                    })}
                  </div>
                </div>
              );
            })
          )}
        </div>
        <div className="ui-card__footer">
          <Button variant="ghost" onClick={handleClear}>
            Clear history
          </Button>
        </div>
      </Card>

      <Card title="Saved intelligence" eyebrow="Summary">
        <p>
          The generator saves a snapshot of the rules, lock states, and selected dishes to help
          understand what works best for your weekly operations.
        </p>
        <ul className="summary-list">
          <li>Use the Settings tab to add sample weeks you love.</li>
          <li>Every generation stores its menu for monthly review.</li>
          <li>Lock a dish in Generate to keep it fixed across regeneration runs.</li>
        </ul>
      </Card>
    </div>
  );
}
