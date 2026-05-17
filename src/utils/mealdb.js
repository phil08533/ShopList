const BASE = 'https://www.themealdb.com/api/json/v1/1';

export async function searchMeals(query) {
  const res = await fetch(`${BASE}/search.php?s=${encodeURIComponent(query)}`);
  if (!res.ok) throw new Error('Failed to search meals');
  const data = await res.json();
  return data.meals ?? [];
}

export async function getMealById(id) {
  const res = await fetch(`${BASE}/lookup.php?i=${encodeURIComponent(id)}`);
  if (!res.ok) throw new Error('Failed to fetch meal');
  const data = await res.json();
  return data.meals?.[0] ?? null;
}

export async function getCategories() {
  const res = await fetch(`${BASE}/categories.php`);
  if (!res.ok) throw new Error('Failed to fetch categories');
  const data = await res.json();
  return data.categories ?? [];
}

export async function getMealsByCategory(category) {
  const res = await fetch(`${BASE}/filter.php?c=${encodeURIComponent(category)}`);
  if (!res.ok) throw new Error('Failed to fetch meals by category');
  const data = await res.json();
  return data.meals ?? [];
}

export function parseIngredients(meal) {
  const ingredients = [];
  for (let i = 1; i <= 20; i++) {
    const name = meal[`strIngredient${i}`];
    const measure = meal[`strMeasure${i}`];
    if (name && name.trim()) {
      ingredients.push({ name: name.trim(), measure: (measure ?? '').trim() });
    }
  }
  return ingredients;
}

/**
 * Scale a measure string by a numeric factor.
 * Handles leading integers, fractions, and mixed numbers (e.g. "1 1/2 cup").
 * Returns the string unchanged if no numeric prefix can be parsed.
 */
export function scaleMeasure(measure, factor) {
  if (!measure || factor === 1) return measure;

  // Match optional whole number, optional fraction, and trailing text
  // Patterns: "3/4 cup", "1 1/2 cups", "2 tbsp", "1/3", "½ tsp"
  // We handle ASCII fractions only (strMeasure uses plain text)
  const trimmed = measure.trim();

  // Try to parse leading numeric part: whole? fraction? rest
  const numRegex = /^(\d+)?\s*(?:(\d+)\s*\/\s*(\d+))?\s*(.*)/;
  const match = trimmed.match(numRegex);

  if (!match) return measure;

  const wholeStr = match[1];
  const numStr = match[2];
  const denStr = match[3];
  const rest = match[4] ?? '';

  const whole = wholeStr ? parseInt(wholeStr, 10) : 0;
  const numerator = numStr ? parseInt(numStr, 10) : 0;
  const denominator = denStr ? parseInt(denStr, 10) : 1;

  if (whole === 0 && numerator === 0) return measure;

  const value = whole + (denominator !== 0 ? numerator / denominator : 0);
  const scaled = value * factor;

  // Format back: convert to mixed number if sensible
  const formatted = formatNumber(scaled);
  return rest ? `${formatted} ${rest}` : formatted;
}

function formatNumber(n) {
  if (n === 0) return '0';

  const whole = Math.floor(n);
  const frac = n - whole;

  if (frac < 0.01) return String(whole);

  // Find best fraction approximation with denominator up to 8
  const denoms = [2, 3, 4, 6, 8];
  let bestNum = 0;
  let bestDen = 1;
  let bestDiff = Infinity;

  for (const d of denoms) {
    const num = Math.round(frac * d);
    const diff = Math.abs(frac - num / d);
    if (diff < bestDiff) {
      bestDiff = diff;
      bestNum = num;
      bestDen = d;
    }
  }

  // If fraction rounds to whole
  if (bestNum === bestDen) {
    return String(whole + 1);
  }

  if (bestNum === 0) return String(whole);

  const fracStr = `${bestNum}/${bestDen}`;
  return whole > 0 ? `${whole} ${fracStr}` : fracStr;
}
