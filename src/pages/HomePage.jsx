import { useMemo } from 'react';
import { ChevronRight, Plus } from 'lucide-react';
import { getMondayKey } from '../hooks/useWeeklyPlan';
import { stockStatus } from '../utils/prediction';
import { normalizeName } from '../utils/normalize';

const SLOTS = ['breakfast', 'lunch', 'dinner'];

export default function HomePage({ kitchen, shoppingList, getWeekPlan, people, weeklyUsage, onNavigate }) {
  const today = new Date();
  const dow = today.getDay();
  const dayIndex = dow === 0 ? 6 : dow - 1; // Mon=0 … Sun=6
  const todayPlan = getWeekPlan(getMondayKey(0))[dayIndex];

  const hour = today.getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const dateStr = today.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  const getUsage = (item) => weeklyUsage[normalizeName(item.name)] ?? null;

  const { criticalCount, lowCount, goodCount } = useMemo(() => ({
    criticalCount: kitchen.filter(i => stockStatus(i, getUsage(i)) === 'critical').length,
    lowCount:      kitchen.filter(i => stockStatus(i, getUsage(i)) === 'low').length,
    goodCount:     kitchen.filter(i => stockStatus(i, getUsage(i)) === 'good').length,
  }), [kitchen, weeklyUsage]);

  const toBuyCount = shoppingList.filter(i => !i.checked).length;

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto pb-24">

        {/* Greeting banner */}
        <div className="bg-primary-600 px-5 pt-5 pb-6">
          <p className="text-primary-100 text-sm">{dateStr}</p>
          <h1 className="text-2xl font-bold text-white mt-0.5">{greeting} 👋</h1>
        </div>

        <div className="px-4 space-y-4 -mt-3">

          {/* Today's meals card */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-4 pt-4 pb-2">
              <p className="font-semibold text-gray-800">Today's Meals</p>
              <button
                onClick={() => onNavigate('meals')}
                className="text-xs text-primary-600 font-medium hover:text-primary-700"
              >
                View plan →
              </button>
            </div>
            {SLOTS.map((slot, i) => {
              const meal = todayPlan?.[slot];
              return (
                <div
                  key={slot}
                  className={`flex items-center gap-3 px-4 py-2.5 ${i < SLOTS.length - 1 ? 'border-b border-gray-50' : 'pb-4'}`}
                >
                  <span className="text-xs text-gray-400 w-16 capitalize">{slot}</span>
                  {meal ? (
                    <div className="flex items-center gap-2.5 flex-1 min-w-0">
                      {meal.thumb
                        ? <img src={meal.thumb} alt="" className="w-9 h-9 rounded-lg object-cover flex-shrink-0" />
                        : <div className="w-9 h-9 rounded-lg bg-primary-100 flex items-center justify-center text-primary-700 text-sm font-bold flex-shrink-0">{meal.mealName[0]}</div>
                      }
                      <span className="text-sm font-medium text-gray-800 truncate">{meal.mealName}</span>
                    </div>
                  ) : (
                    <button
                      onClick={() => onNavigate('meals')}
                      className="flex items-center gap-1 text-xs text-gray-400 hover:text-primary-600 transition-colors"
                    >
                      <Plus size={12} /> Add meal
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {/* Quick-glance cards */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => onNavigate('kitchen')}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 text-left hover:shadow-md transition-shadow"
            >
              <span className="text-2xl">📦</span>
              <p className="font-semibold text-gray-900 mt-2">{kitchen.length} items</p>
              <p className="text-xs text-gray-400">in your pantry</p>
              {criticalCount > 0 && (
                <p className="text-xs text-red-500 font-medium mt-2">{criticalCount} critical</p>
              )}
              {criticalCount === 0 && lowCount > 0 && (
                <p className="text-xs text-amber-600 font-medium mt-2">{lowCount} running low</p>
              )}
              {criticalCount === 0 && lowCount === 0 && kitchen.length > 0 && (
                <p className="text-xs text-emerald-600 font-medium mt-2">All stocked ✓</p>
              )}
            </button>

            <button
              onClick={() => onNavigate('shopping')}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 text-left hover:shadow-md transition-shadow"
            >
              <span className="text-2xl">🛒</span>
              <p className="font-semibold text-gray-900 mt-2">{toBuyCount} item{toBuyCount !== 1 ? 's' : ''}</p>
              <p className="text-xs text-gray-400">to buy</p>
              {toBuyCount > 0 && (
                <p className="text-xs text-primary-600 font-medium mt-2">Tap to shop →</p>
              )}
            </button>
          </div>

          {/* Pantry at a glance */}
          {kitchen.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
              <p className="font-semibold text-gray-800 mb-3">Pantry at a Glance</p>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div>
                  <p className="text-2xl font-bold text-emerald-600">{goodCount}</p>
                  <p className="text-xs text-gray-400 mt-0.5">Well stocked</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-amber-500">{lowCount}</p>
                  <p className="text-xs text-gray-400 mt-0.5">Running low</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-red-500">{criticalCount}</p>
                  <p className="text-xs text-gray-400 mt-0.5">Critical</p>
                </div>
              </div>
              {/* Progress bar */}
              {kitchen.length > 0 && (
                <div className="mt-3 h-2 rounded-full bg-gray-100 overflow-hidden flex">
                  {goodCount > 0 && (
                    <div className="bg-emerald-500 h-full transition-all" style={{ width: `${(goodCount / kitchen.length) * 100}%` }} />
                  )}
                  {lowCount > 0 && (
                    <div className="bg-amber-400 h-full transition-all" style={{ width: `${(lowCount / kitchen.length) * 100}%` }} />
                  )}
                  {criticalCount > 0 && (
                    <div className="bg-red-500 h-full transition-all" style={{ width: `${(criticalCount / kitchen.length) * 100}%` }} />
                  )}
                </div>
              )}
            </div>
          )}

          {/* Quick actions */}
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Quick Actions</p>
            <div className="space-y-2">
              {[
                { icon: '🍽', label: 'Plan this week\'s meals', tab: 'meals' },
                { icon: '📦', label: 'Update pantry stock', tab: 'kitchen' },
                { icon: '🛒', label: 'View shopping list', tab: 'shopping' },
                { icon: '⚙️', label: 'Settings & preferences', tab: 'settings' },
              ].map(({ icon, label, tab }) => (
                <button
                  key={tab}
                  onClick={() => onNavigate(tab)}
                  className="w-full bg-white rounded-xl border border-gray-100 px-4 py-3 flex items-center gap-3 text-left hover:shadow-sm transition-shadow"
                >
                  <span className="text-xl">{icon}</span>
                  <span className="text-sm font-medium text-gray-800 flex-1">{label}</span>
                  <ChevronRight size={16} className="text-gray-300 flex-shrink-0" />
                </button>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
