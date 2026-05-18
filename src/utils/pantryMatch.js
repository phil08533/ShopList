function norm(name) {
  return (name ?? '').toLowerCase().replace(/[^a-z0-9 ]/g, '').trim();
}

export function calcPantryMatch(ingredients, kitchen) {
  if (!ingredients.length) return { matched: 0, total: 0, pct: 0 };
  const kitchenNorms = kitchen.map(i => norm(i.name));
  let matched = 0;
  for (const { name } of ingredients) {
    const n = norm(name);
    if (n && kitchenNorms.some(h => h.includes(n) || n.includes(h))) matched++;
  }
  return { matched, total: ingredients.length, pct: matched / ingredients.length };
}

export function getTopKitchenIngredients(kitchen, limit = 6) {
  return kitchen
    .filter(i => i.name?.trim())
    .slice(0, limit)
    .map(i => i.name.trim());
}
