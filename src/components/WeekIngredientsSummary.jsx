import { useState } from 'react';
import { X, CheckCircle, XCircle, AlertCircle, ShoppingCart, ChevronLeft, ChevronRight } from 'lucide-react';
import { scaleMeasure } from '../utils/mealdb';
import { convertMeasure } from '../utils/units';
import { normalizeName } from '../utils/normalize';
import { getMondayKey } from '../hooks/useWeeklyPlan';

const SLOTS = ['breakfast', 'lunch', 'dinner'];

// ── Unit normalization ────────────────────────────────────────────────────────

const UNIT_MAP = {
  lb: 'lb', lbs: 'lb', pound: 'lb', pounds: 'lb',
  oz: 'oz', ounce: 'oz', ounces: 'oz',
  cup: 'cup', cups: 'cup',
  tbsp: 'tbsp', tbs: 'tbsp', tablespoon: 'tbsp', tablespoons: 'tbsp',
  tsp: 'tsp', teaspoon: 'tsp', teaspoons: 'tsp',
  g: 'g', gram: 'g', grams: 'g',
  kg: 'kg', kilogram: 'kg', kilograms: 'kg',
  ml: 'ml', milliliter: 'ml', milliliters: 'ml',
  l: 'l', liter: 'l', liters: 'l',
  clove: 'clove', cloves: 'clove',
  slice: 'slice', slices: 'slice',
  can: 'can', cans: 'can',
  piece: 'piece', pieces: 'piece',
};

function normalizeUnit(u) {
  return UNIT_MAP[u?.toLowerCase().trim()] ?? u?.toLowerCase().trim() ?? '';
}

// ── Unit conversion tables ────────────────────────────────────────────────────

const VOL_TO_ML = {
  ml: 1, milliliter: 1, milliliters: 1,
  l: 1000, liter: 1000, liters: 1000,
  tsp: 4.929, teaspoon: 4.929, teaspoons: 4.929,
  tbsp: 14.787, tbs: 14.787, tablespoon: 14.787, tablespoons: 14.787,
  'fl oz': 29.574,
  cup: 236.588, cups: 236.588,
  pint: 473.176, quart: 946.353, gallon: 3785.41,
};

const WEIGHT_TO_G = {
  g: 1, gram: 1, grams: 1,
  kg: 1000, kilogram: 1000, kilograms: 1000,
  oz: 28.3495, ounce: 28.3495, ounces: 28.3495,
  lb: 453.592, lbs: 453.592, pound: 453.592, pounds: 453.592,
};

const COUNT_LIKE = new Set(['', 'count', 'item', 'item(s)', 'items', 'piece', 'pieces', 'unit', 'units', 'each', 'ea']);
const CULINARY_UNITS = new Set(['tsp', 'tbsp', 'tbs', 'cup', 'cups', 'teaspoon', 'teaspoons', 'tablespoon', 'tablespoons', 'pinch', 'dash', 'sprig', 'handful', 'fl oz']);

function toML(qty, unit) {
  const f = VOL_TO_ML[unit?.toLowerCase?.() ?? ''];
  return f != null ? qty * f : null;
}
function toG(qty, unit) {
  const f = WEIGHT_TO_G[unit?.toLowerCase?.() ?? ''];
  return f != null ? qty * f : null;
}

function mlToDisplay(ml) {
  if (ml >= 1000) return { value: ml / 1000, unit: 'l' };
  if (ml >= 236) return { value: ml / 236.588, unit: 'cup' };
  if (ml >= 14.787) return { value: ml / 14.787, unit: 'tbsp' };
  return { value: ml / 4.929, unit: 'tsp' };
}

function gToDisplay(g) {
  if (g >= 453) return { value: g / 453.592, unit: 'lb' };
  if (g >= 28) return { value: g / 28.3495, unit: 'oz' };
  return { value: g, unit: 'g' };
}

// ── Measure parsing ───────────────────────────────────────────────────────────

function parseMeasure(measure) {
  if (!measure?.trim()) return { value: null, unit: '' };
  const t = measure.trim();

  // "1 1/2 cups"
  const m = t.match(/^(\d+)\s+(\d+)\/(\d+)\s*(.*)/);
  if (m) return { value: parseInt(m[1]) + parseInt(m[2]) / parseInt(m[3]), unit: normalizeUnit(m[4]) };

  // "3/4 cup"
  const f = t.match(/^(\d+)\/(\d+)\s*(.*)/);
  if (f) return { value: parseInt(f[1]) / parseInt(f[2]), unit: normalizeUnit(f[3]) };

  // "2 tbsp" / "500g"
  const n = t.match(/^(\d+\.?\d*)\s*(.*)/);
  if (n) return { value: parseFloat(n[1]), unit: normalizeUnit(n[2]) };

  return { value: null, unit: normalizeUnit(t) };
}

function formatValue(n) {
  if (n === Math.floor(n)) return String(Math.floor(n));
  const frac = n - Math.floor(n);
  const whole = Math.floor(n);
  for (const [num, den] of [[1, 4], [1, 3], [1, 2], [2, 3], [3, 4]]) {
    if (Math.abs(frac - num / den) < 0.05) {
      return whole > 0 ? `${whole} ${num}/${den}` : `${num}/${den}`;
    }
  }
  return n.toFixed(1).replace(/\.0$/, '');
}

// Sum an array of measure strings into one display string
function sumMeasures(measures) {
  const byUnit = {};
  const nonNumeric = new Set();

  for (const m of measures) {
    const { value, unit } = parseMeasure(m);
    if (value == null) { nonNumeric.add(unit || m.trim().toLowerCase()); }
    else { byUnit[unit] = (byUnit[unit] ?? 0) + value; }
  }

  const parts = Object.entries(byUnit).map(([unit, total]) =>
    unit ? `${formatValue(total)} ${unit}` : formatValue(total)
  );
  return [...parts, ...[...nonNumeric]].join(' + ') || '';
}

// Returns { net: string|null, fullyMet: bool } after subtracting kitchen quantity.
// Handles cross-unit comparison: "750 ml" covers "2 tbsp" by converting to the same dimension.
function subtractKitchen(measures, kitchenItem) {
  const haveQty = kitchenItem.quantity != null ? Number(kitchenItem.quantity) : null;
  const haveUnit = (kitchenItem.unit ?? '').toLowerCase().trim();

  if (haveQty == null) return { net: null, fullyMet: true }; // unknown qty — assume covered

  // Accumulate needed amounts by dimension: vol (ml), weight (g), count, or exact unit
  let needML = 0, needG = 0, needCount = 0;
  const byUnit = {};
  const nonNumeric = new Set();

  for (const m of measures) {
    const { value, unit } = parseMeasure(m);
    if (value == null) { nonNumeric.add(unit || m.trim().toLowerCase()); continue; }
    const ml = toML(value, unit);
    const g = toG(value, unit);
    if (ml != null) needML += ml;
    else if (g != null) needG += g;
    else if (COUNT_LIKE.has(unit)) needCount += value;
    else byUnit[unit] = (byUnit[unit] ?? 0) + value;
  }

  // Subtract kitchen supply in the matching dimension
  const haveML = toML(haveQty, haveUnit);
  const haveG = toG(haveQty, haveUnit);
  const haveCount = COUNT_LIKE.has(haveUnit) ? haveQty : null;

  if (haveML != null && needML > 0) needML = Math.max(0, needML - haveML);
  else if (haveG != null && needG > 0) needG = Math.max(0, needG - haveG);
  else if (haveCount != null && needCount > 0) needCount = Math.max(0, needCount - haveCount);
  else {
    const haveNorm = normalizeUnit(haveUnit);
    if (byUnit[haveNorm] !== undefined) {
      const rem = byUnit[haveNorm] - haveQty;
      if (rem <= 0) delete byUnit[haveNorm];
      else byUnit[haveNorm] = rem;
    }
  }

  // Reconstruct remaining as display strings
  const parts = [];
  if (needML > 0) { const { value, unit } = mlToDisplay(needML); parts.push(`${formatValue(value)} ${unit}`); }
  if (needG > 0) { const { value, unit } = gToDisplay(needG); parts.push(`${formatValue(value)} ${unit}`); }
  if (needCount > 0) parts.push(formatValue(needCount));
  for (const [unit, total] of Object.entries(byUnit)) {
    parts.push(unit ? `${formatValue(total)} ${unit}` : formatValue(total));
  }

  const net = [...parts, ...[...nonNumeric]].join(' + ');
  return { net: net || null, fullyMet: !net };
}

// ── Kitchen matching ──────────────────────────────────────────────────────────

function findKitchenMatch(name, kitchen) {
  const needle = normalizeName(name);
  return kitchen.find(item => {
    const hay = normalizeName(item.name ?? '');
    return hay === needle || hay.includes(needle) || needle.includes(hay);
  }) ?? null;
}

// ── Ingredient grouping ───────────────────────────────────────────────────────

function groupIngredients(plan, people, excludeWater = false) {
  const groups = {};

  plan.forEach(day => {
    SLOTS.forEach(slot => {
      const meal = day[slot];
      if (!meal) return;
      const factor = people / (meal.defaultServings ?? 4);
      (meal.ingredients ?? []).forEach(({ name, measure }) => {
        const key = normalizeName(name);
        if (!key) return;
        if (excludeWater && key === 'water') return;
        if (!groups[key]) groups[key] = { displayName: name.trim(), measures: [], meals: [] };
        groups[key].measures.push(scaleMeasure(measure, factor));
        if (!groups[key].meals.includes(meal.mealName)) groups[key].meals.push(meal.mealName);
      });
    });
  });

  return Object.values(groups).sort((a, b) => a.displayName.localeCompare(b.displayName));
}

function weekShortLabel(offset) {
  if (offset === 0) return 'This Week';
  if (offset === 1) return 'Next Week';
  if (offset === -1) return 'Last Week';
  const monStr = getMondayKey(offset);
  const mon = new Date(monStr + 'T12:00:00');
  const sun = new Date(mon);
  sun.setDate(mon.getDate() + 6);
  const fmt = d => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  return `${fmt(mon)} – ${fmt(sun)}`;
}

// Split a display measure like "2 lb" or "3/4 cup" into { qty, unit }
function splitMeasure(measure) {
  if (!measure) return { qty: 1, unit: 'as needed' };
  const t = measure.trim();
  const m = t.match(/^(\d+)\s+(\d+)\/(\d+)\s*(.*)/);
  if (m) return { qty: parseFloat(m[1]) + parseInt(m[2]) / parseInt(m[3]), unit: m[4].trim() || 'item(s)' };
  const f = t.match(/^(\d+)\/(\d+)\s*(.*)/);
  if (f) return { qty: parseInt(f[1]) / parseInt(f[2]), unit: f[3].trim() || 'item(s)' };
  const n = t.match(/^(\d+\.?\d*)\s*(.*)/);
  if (n) return { qty: parseFloat(n[1]), unit: n[2].trim() || 'item(s)' };
  return { qty: 1, unit: t };
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function WeekIngredientsSummary({ initialWeekOffset = 0, getWeekPlan, people, kitchen, excludeWater = false, onAddToShoppingList, onClose, unitSystem = 'us' }) {
  const [localOffset, setLocalOffset] = useState(initialWeekOffset);
  const plan = getWeekPlan(getMondayKey(localOffset));
  const grouped = groupIngredients(plan, people, excludeWater);

  const cv = (s) => convertMeasure(s, unitSystem);

  const items = grouped.map(({ displayName, measures, meals }) => {
    const totalMeasure = cv(sumMeasures(measures));
    const kitchenMatch = findKitchenMatch(displayName, kitchen);

    if (!kitchenMatch) {
      return { displayName, totalMeasure, netMeasure: totalMeasure, status: 'need', haveLabel: null, meals };
    }

    const haveLabel = kitchenMatch.quantity != null
      ? `${kitchenMatch.quantity}${kitchenMatch.unit ? ' ' + kitchenMatch.unit : ''}`
      : 'some';

    const { net, fullyMet } = subtractKitchen(measures, kitchenMatch);

    if (fullyMet) {
      return { displayName, totalMeasure, netMeasure: null, status: 'have', haveLabel, meals };
    }
    return { displayName, totalMeasure, netMeasure: cv(net) ?? totalMeasure, status: 'partial', haveLabel, meals };
  });

  const needItems = items.filter(i => i.status === 'need');
  const partialItems = items.filter(i => i.status === 'partial');
  const haveItems = items.filter(i => i.status === 'have');
  const toBuyItems = [...needItems, ...partialItems];

  const handleAddMissing = () => {
    toBuyItems.forEach(item => {
      const { qty, unit } = splitMeasure(item.netMeasure);
      const isCulinary = CULINARY_UNITS.has((unit ?? '').toLowerCase());
      onAddToShoppingList({
        name: item.displayName,
        quantity: isCulinary ? 1 : (qty || 1),
        unit: isCulinary ? 'item(s)' : (unit || 'item(s)'),
        category: 'Other',
        note: isCulinary
          ? `Recipe needs ${item.netMeasure} · For: ${item.meals.join(', ')}`
          : `For: ${item.meals.join(', ')}`,
      });
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-end justify-center bg-black/40">
      <div className="w-full max-w-lg bg-white rounded-t-2xl flex flex-col" style={{ maxHeight: '90dvh' }}>
        <div className="flex-shrink-0 border-b border-gray-100">
          <div className="flex items-center justify-between px-4 pt-4 pb-2">
            <h2 className="text-lg font-bold text-gray-800">Week's Shopping</h2>
            <button onClick={onClose} className="p-2 rounded-xl text-gray-400 hover:bg-gray-100 transition-colors">
              <X size={20} />
            </button>
          </div>
          <div className="flex items-center justify-between px-4 pb-3">
            <button
              onClick={() => setLocalOffset(o => o - 1)}
              className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
            >
              <ChevronLeft size={16} />
            </button>
            <div className="text-center">
              <p className="text-sm font-semibold text-gray-700">{weekShortLabel(localOffset)}</p>
              <p className="text-xs text-gray-400 mt-0.5">
                {grouped.length} ingredient{grouped.length !== 1 ? 's' : ''} · {people} {people === 1 ? 'person' : 'people'}
              </p>
            </div>
            <button
              onClick={() => setLocalOffset(o => o + 1)}
              className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-5">
          {grouped.length === 0 ? (
            <div className="text-center py-12 text-gray-400 text-sm">
              No meals planned yet. Add meals to see your shopping list.
            </div>
          ) : (
            <>
              {toBuyItems.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
                    Need to buy ({toBuyItems.length})
                  </p>
                  <ul className="space-y-2.5">
                    {toBuyItems.map((item, i) => (
                      <li key={i} className="flex items-start gap-2.5">
                        {item.status === 'partial'
                          ? <AlertCircle size={16} className="text-amber-400 flex-shrink-0 mt-0.5" />
                          : <XCircle size={16} className="text-red-400 flex-shrink-0 mt-0.5" />
                        }
                        <div className="min-w-0 flex-1">
                          <div className="flex items-baseline gap-1.5 flex-wrap">
                            <span className="font-semibold text-gray-800 text-sm">{item.displayName}</span>
                            {item.netMeasure && (
                              <span className="text-sm text-gray-700">— {item.netMeasure}</span>
                            )}
                          </div>
                          {item.status === 'partial' && (
                            <p className="text-xs text-amber-600 mt-0.5">
                              Have {item.haveLabel} · need {item.totalMeasure} total
                            </p>
                          )}
                          <p className="text-xs text-gray-400 mt-0.5">{item.meals.join(', ')}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {haveItems.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
                    Already in pantry ({haveItems.length})
                  </p>
                  <ul className="space-y-2.5">
                    {haveItems.map((item, i) => (
                      <li key={i} className="flex items-start gap-2.5">
                        <CheckCircle size={16} className="text-emerald-500 flex-shrink-0 mt-0.5" />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-baseline gap-1.5 flex-wrap">
                            <span className="font-semibold text-gray-700 text-sm">{item.displayName}</span>
                            <span className="text-sm text-gray-400">— {item.totalMeasure}</span>
                          </div>
                          <p className="text-xs text-gray-400 mt-0.5">{item.meals.join(', ')}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          )}
        </div>

        {toBuyItems.length > 0 && (
          <div
            className="flex-shrink-0 px-4 pt-3 border-t border-gray-100 bg-white"
            style={{ paddingBottom: 'max(12px, env(safe-area-inset-bottom))' }}
          >
            <button
              onClick={handleAddMissing}
              className="w-full flex items-center justify-center gap-2 bg-primary-600 text-white py-3 rounded-xl font-semibold text-sm hover:bg-primary-700 transition-colors"
            >
              <ShoppingCart size={18} />
              Add {toBuyItems.length} item{toBuyItems.length !== 1 ? 's' : ''} to shopping list
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
