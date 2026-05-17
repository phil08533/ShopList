import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'smart_pantry_meals_v1';

const DAYS = 7;

function buildEmptyPlan() {
  return Array.from({ length: DAYS }, () => ({
    breakfast: null,
    lunch: null,
    dinner: null,
  }));
}

function loadPlan() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { plan: buildEmptyPlan(), people: 2 };
    const parsed = JSON.parse(raw);
    // Ensure plan always has 7 days
    const plan = Array.from({ length: DAYS }, (_, i) =>
      parsed.plan?.[i] ?? { breakfast: null, lunch: null, dinner: null }
    );
    return { plan, people: parsed.people ?? 2 };
  } catch {
    return { plan: buildEmptyPlan(), people: 2 };
  }
}

export function useWeeklyPlan() {
  const [state, setState] = useState(() => loadPlan());

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // quota exceeded — silently fail
    }
  }, [state]);

  const setMeal = useCallback((dayIndex, slot, mealEntry) => {
    setState(prev => {
      const plan = prev.plan.map((day, i) =>
        i === dayIndex ? { ...day, [slot]: mealEntry } : day
      );
      return { ...prev, plan };
    });
  }, []);

  const clearDay = useCallback((dayIndex) => {
    setState(prev => {
      const plan = prev.plan.map((day, i) =>
        i === dayIndex ? { breakfast: null, lunch: null, dinner: null } : day
      );
      return { ...prev, plan };
    });
  }, []);

  const clearAll = useCallback(() => {
    setState(prev => ({ ...prev, plan: buildEmptyPlan() }));
  }, []);

  const setPeople = useCallback((n) => {
    setState(prev => ({ ...prev, people: Math.max(1, n) }));
  }, []);

  return {
    plan: state.plan,
    people: state.people,
    setMeal,
    clearDay,
    clearAll,
    setPeople,
  };
}
