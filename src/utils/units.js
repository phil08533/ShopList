const METRIC = new Set(['g','gram','grams','kg','kilogram','kilograms','ml','milliliter','milliliters','l','liter','liters']);

export const isMetric = (unit) => METRIC.has(unit?.toLowerCase().trim());

function toUS(value, unit) {
  switch (unit?.toLowerCase().trim()) {
    case 'g': case 'gram': case 'grams':
      return value >= 450
        ? { value: value / 453.592, unit: 'lb' }
        : { value: value / 28.3495, unit: 'oz' };
    case 'kg': case 'kilogram': case 'kilograms':
      return { value: value * 2.20462, unit: 'lb' };
    case 'ml': case 'milliliter': case 'milliliters':
      if (value >= 60)  return { value: value / 240, unit: 'cup' };
      if (value >= 15)  return { value: value / 15,  unit: 'tbsp' };
      return { value: value / 5, unit: 'tsp' };
    case 'l': case 'liter': case 'liters':
      return { value: value * 4.22675, unit: 'cup' };
    default:
      return { value, unit };
  }
}

function fmt(n) {
  if (n === Math.floor(n)) return String(Math.floor(n));
  const whole = Math.floor(n);
  const frac  = n - whole;
  for (const [num, den] of [[1,8],[1,4],[1,3],[3,8],[1,2],[5,8],[2,3],[3,4],[7,8]]) {
    if (Math.abs(frac - num / den) < 0.07) {
      return whole > 0 ? `${whole} ${num}/${den}` : `${num}/${den}`;
    }
  }
  return n.toFixed(1).replace(/\.0$/, '');
}

function parseStr(s) {
  if (!s?.trim()) return null;
  const t = s.trim();
  const m = t.match(/^(\d+)\s+(\d+)\/(\d+)\s*(.*)/);
  if (m) return { value: parseInt(m[1]) + parseInt(m[2]) / parseInt(m[3]), unit: m[4].trim() };
  const f = t.match(/^(\d+)\/(\d+)\s*(.*)/);
  if (f) return { value: parseInt(f[1]) / parseInt(f[2]), unit: f[3].trim() };
  const n = t.match(/^(\d+\.?\d*)\s*(.*)/);
  if (n) return { value: parseFloat(n[1]), unit: n[2].trim() };
  return null;
}

// Convert a full measure string like "500 g" → "1.1 oz" when unitSystem is 'us'
export function convertMeasure(str, unitSystem) {
  if (unitSystem !== 'us') return str;
  const p = parseStr(str);
  if (!p || !isMetric(p.unit)) return str;
  const { value, unit } = toUS(p.value, p.unit);
  return unit ? `${fmt(value)} ${unit}` : fmt(value);
}

// Convert a separate quantity + unit pair for display
export function convertAmount(quantity, unit, unitSystem) {
  if (unitSystem !== 'us' || !quantity || !unit || !isMetric(unit)) {
    return { quantity, unit };
  }
  const { value, unit: newUnit } = toUS(Number(quantity), unit);
  return { quantity: fmt(value), unit: newUnit };
}
