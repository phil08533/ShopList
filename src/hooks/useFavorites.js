import { useState, useCallback } from 'react';

const STORAGE_KEY = 'smart_pantry_favorites_v1';

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function useFavorites() {
  const [favorites, setFavorites] = useState(load);

  const toggleFavorite = useCallback((meal) => {
    setFavorites(prev => {
      const exists = prev.some(f => f.idMeal === meal.idMeal);
      const next = exists
        ? prev.filter(f => f.idMeal !== meal.idMeal)
        : [...prev, { idMeal: meal.idMeal, strMeal: meal.strMeal, strMealThumb: meal.strMealThumb }];
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch {}
      return next;
    });
  }, []);

  const isFavorite = useCallback(
    (mealId) => favorites.some(f => f.idMeal === mealId),
    [favorites]
  );

  return { favorites, toggleFavorite, isFavorite };
}
