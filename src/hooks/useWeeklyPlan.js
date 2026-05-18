import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'smart_pantry_meals_v1';

function buildEmptyPlan() {
  return Array.from({ length: 7 }, () => ({
    breakfast: null,
    lunch: null,
    dinner: null,
  }));
}

export function getMondayKey(weekOffset = 0) {
  const today = new Date();
  const dow = today.getDay();
  const mondayDiff = dow === 0 ? -6 : 1 - dow;
  const mon = new Date(today);
  mon.setDate(today.getDate() + mondayDiff + weekOffset * 7);
  return mon.toISOString().slice(0, 10);
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { plans: {}, people: 2 };
    const parsed = JSON.parse(raw);
    // Migrate old single-plan format
    if (Array.isArray(parsed.plan)) {
      const weekKey = getMondayKey(0);
      return { plans: { [weekKey]: parsed.plan }, people: parsed.people ?? 2 };
    }
    return { plans: parsed.plans ?? {}, people: parsed.people ?? 2 };
  } catch {
    return { plans: {}, people: 2 };
  }
}

export function useWeeklyPlan() {
  const [state, setState] = useState(loadState);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {}
  }, [state]);

  const getWeekPlan = useCallback(
    (weekKey) => state.plans[weekKey] ?? buildEmptyPlan(),
    [state.plans]
  );

  const setMeal = useCallback((weekKey, dayIndex, slot, entry) => {
    setState(prev => {
      const week = prev.plans[weekKey] ?? buildEmptyPlan();
      const updated = week.map((day, i) =>
        i === dayIndex ? { ...day, [slot]: entry } : day
      );
      return { ...prev, plans: { ...prev.plans, [weekKey]: updated } };
    });
  }, []);

  const clearWeek = useCallback((weekKey) => {
    setState(prev => ({
      ...prev,
      plans: { ...prev.plans, [weekKey]: buildEmptyPlan() },
    }));
  }, []);

  const setPeople = useCallback((n) => {
    setState(prev => ({ ...prev, people: Math.max(1, n) }));
  }, []);

  const importPlans = useCallback((mealsData) => {
    const next = {
      plans: mealsData?.plans ?? {},
      people: mealsData?.people ?? 2,
    };
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch {}
    setState(next);
  }, []);

  return {
    getWeekPlan, setMeal, clearWeek, setPeople, importPlans,
    people: state.people,
    plans: state.plans,
  };
}
