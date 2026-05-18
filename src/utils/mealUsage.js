import { normalizeName } from './normalize';
import { scaleMeasure } from './mealdb';

const SLOTS = ['breakfast', 'lunch', 'dinner'];

function parseQty(measure) {
  if (!measure?.trim()) return 0;
  const t = measure.trim();
  const m = t.match(/^(\d+)\s+(\d+)\/(\d+)/);
  if (m) return parseInt(m[1]) + parseInt(m[2]) / parseInt(m[3]);
  const f = t.match(/^(\d+)\/(\d+)/);
  if (f) return parseInt(f[1]) / parseInt(f[2]);
  const n = t.match(/^(\d+\.?\d*)/);
  if (n) return parseFloat(n[1]);
  return 0;
}

// Returns { [normalizedName]: { qtyPerWeek, meals: string[] } }
// Averages across all weeks that have at least one planned meal.
export function computeWeeklyUsage(plans, people) {
  const weeks = Object.values(plans ?? {}).filter(w =>
    w.some(day => SLOTS.some(s => day[s]))
  );
  if (!weeks.length) return {};

  const totals = {};

  weeks.forEach(week => {
    week.forEach(day => {
      SLOTS.forEach(slot => {
        const meal = day[slot];
        if (!meal) return;
        const factor = people / (meal.defaultServings ?? 4);
        (meal.ingredients ?? []).forEach(({ name, measure }) => {
          const key = normalizeName(name);
          if (!key) return;
          if (!totals[key]) totals[key] = { qtySum: 0, meals: new Set() };
          const qty = parseQty(scaleMeasure(measure ?? '', factor));
          totals[key].qtySum += qty;
          totals[key].meals.add(meal.mealName);
        });
      });
    });
  });

  const weekCount = weeks.length;
  const usage = {};
  for (const [key, { qtySum, meals }] of Object.entries(totals)) {
    usage[key] = { qtyPerWeek: qtySum / weekCount, meals: [...meals] };
  }
  return usage;
}
