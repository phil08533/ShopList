import { useState, useCallback } from 'react';

const KEY = 'smart_pantry_recipes_v1';

function load() {
  try { return JSON.parse(localStorage.getItem(KEY) ?? '[]'); } catch { return []; }
}

function persist(recipes) {
  try { localStorage.setItem(KEY, JSON.stringify(recipes)); } catch {}
}

export function useCustomRecipes() {
  const [recipes, setRecipes] = useState(load);

  const addRecipe = useCallback((recipe) => {
    const entry = { ...recipe, idMeal: `custom_${Date.now()}`, isCustom: true };
    setRecipes(prev => { const next = [...prev, entry]; persist(next); return next; });
    return entry;
  }, []);

  const updateRecipe = useCallback((id, updates) => {
    setRecipes(prev => {
      const next = prev.map(r => r.idMeal === id ? { ...r, ...updates } : r);
      persist(next); return next;
    });
  }, []);

  const deleteRecipe = useCallback((id) => {
    setRecipes(prev => { const next = prev.filter(r => r.idMeal !== id); persist(next); return next; });
  }, []);

  const importRecipes = useCallback((incoming) => {
    const next = Array.isArray(incoming) ? incoming : [];
    persist(next); setRecipes(next);
  }, []);

  return { recipes, addRecipe, updateRecipe, deleteRecipe, importRecipes };
}
