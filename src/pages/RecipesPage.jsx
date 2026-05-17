import { useState } from 'react';
import { Plus, X, Trash2, ShoppingCart, Minus } from 'lucide-react';
import RecipeSearchModal from '../components/RecipeSearchModal';
import RecipeDetailModal from '../components/RecipeDetailModal';
import WeekIngredientsSummary from '../components/WeekIngredientsSummary';
import { parseIngredients, scaleMeasure } from '../utils/mealdb';

const DAY_NAMES = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const SLOTS = ['breakfast', 'lunch', 'dinner'];
const SLOT_LABELS = { breakfast: 'Breakfast', lunch: 'Lunch', dinner: 'Dinner' };

function getWeekDates() {
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0 = Sun
  // Shift so Monday = 0
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const monday = new Date(today);
  monday.setDate(today.getDate() + mondayOffset);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
}

function formatDate(date) {
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function isToday(date) {
  const today = new Date();
  return date.toDateString() === today.toDateString();
}

export default function RecipesPage({
  kitchen,
  addShoppingItem,
  shoppingList,
  people,
  plan,
  setMeal,
  clearAll,
  setPeople,
}) {
  const [searchTarget, setSearchTarget] = useState(null); // { dayIndex, slot }
  const [pendingMeal, setPendingMeal] = useState(null); // full meal object awaiting detail view
  const [showSummary, setShowSummary] = useState(false);

  const weekDates = getWeekDates();

  const handleAddClick = (dayIndex, slot) => {
    setSearchTarget({ dayIndex, slot });
  };

  const handleSearchSelect = (meal) => {
    setPendingMeal(meal);
  };

  const handleAddToPlan = () => {
    if (!pendingMeal || !searchTarget) return;
    const ingredients = parseIngredients(pendingMeal);
    const mealEntry = {
      mealId: pendingMeal.idMeal,
      mealName: pendingMeal.strMeal,
      thumb: pendingMeal.strMealThumb,
      ingredients,
    };
    setMeal(searchTarget.dayIndex, searchTarget.slot, mealEntry);
    setPendingMeal(null);
    setSearchTarget(null);
  };

  const handleRemoveMeal = (dayIndex, slot) => {
    setMeal(dayIndex, slot, null);
  };

  const handleAddToShoppingList = (item) => {
    // Avoid duplicates by name
    const alreadyOnList = shoppingList.some(
      s => s.name?.toLowerCase() === item.name?.toLowerCase()
    );
    if (!alreadyOnList) {
      addShoppingItem(item);
    }
  };

  return (
    <div className="pb-24">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-100 px-4 pt-5 pb-3">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-2xl font-bold text-gray-900">Meals</h1>
          <button
            onClick={() => setShowSummary(true)}
            className="flex items-center gap-1.5 bg-emerald-600 text-white px-3 py-2 rounded-xl text-xs font-semibold hover:bg-emerald-700 transition-colors"
          >
            <ShoppingCart size={14} />
            Week's List
          </button>
        </div>

        {/* People stepper + clear all */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPeople(people - 1)}
              disabled={people <= 1}
              className="w-7 h-7 flex items-center justify-center rounded-lg bg-gray-100 text-gray-600 disabled:opacity-40 hover:bg-gray-200 transition-colors"
            >
              <Minus size={14} />
            </button>
            <span className="text-sm font-semibold text-gray-700 min-w-[72px] text-center">
              {people} {people === 1 ? 'Person' : 'People'}
            </span>
            <button
              onClick={() => setPeople(people + 1)}
              className="w-7 h-7 flex items-center justify-center rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
            >
              <Plus size={14} />
            </button>
          </div>
          <button
            onClick={clearAll}
            className="flex items-center gap-1 text-xs text-gray-400 hover:text-red-500 transition-colors px-2 py-1 rounded-lg hover:bg-red-50"
          >
            <Trash2 size={12} />
            Clear all
          </button>
        </div>
      </div>

      {/* Week grid */}
      <div className="px-4 pt-4 space-y-3">
        {plan.map((day, dayIndex) => {
          const date = weekDates[dayIndex];
          const todayFlag = isToday(date);
          return (
            <div
              key={dayIndex}
              className={`bg-white rounded-2xl border shadow-sm overflow-hidden ${
                todayFlag ? 'border-emerald-400' : 'border-gray-100'
              }`}
            >
              {/* Day header */}
              <div className={`px-3 py-2 flex items-center justify-between ${
                todayFlag ? 'bg-emerald-50' : 'bg-gray-50'
              }`}>
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-bold ${todayFlag ? 'text-emerald-700' : 'text-gray-700'}`}>
                    {DAY_NAMES[dayIndex]}
                  </span>
                  {todayFlag && (
                    <span className="text-[10px] bg-emerald-600 text-white px-1.5 py-0.5 rounded-full font-semibold">
                      Today
                    </span>
                  )}
                </div>
                <span className="text-xs text-gray-400">{formatDate(date)}</span>
              </div>

              {/* Meal slots */}
              <div className="divide-y divide-gray-50">
                {SLOTS.map(slot => {
                  const meal = day[slot];
                  return (
                    <div key={slot} className="px-3 py-2 flex items-center gap-2 min-h-[52px]">
                      <span className="text-xs text-gray-400 w-16 flex-shrink-0">{SLOT_LABELS[slot]}</span>
                      {meal ? (
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <img
                            src={meal.thumb}
                            alt={meal.mealName}
                            className="w-9 h-9 rounded-lg object-cover flex-shrink-0"
                          />
                          <span className="text-sm font-medium text-gray-800 flex-1 truncate">
                            {meal.mealName}
                          </span>
                          <button
                            onClick={() => handleRemoveMeal(dayIndex, slot)}
                            className="p-1 text-gray-300 hover:text-red-400 transition-colors flex-shrink-0"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleAddClick(dayIndex, slot)}
                          className="flex items-center gap-1 text-xs text-emerald-600 font-medium hover:bg-emerald-50 px-2 py-1 rounded-lg transition-colors"
                        >
                          <Plus size={13} />
                          Add
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Search modal */}
      {searchTarget && !pendingMeal && (
        <RecipeSearchModal
          onClose={() => setSearchTarget(null)}
          onSelect={handleSearchSelect}
        />
      )}

      {/* Detail modal */}
      {pendingMeal && (
        <RecipeDetailModal
          meal={pendingMeal}
          people={people}
          onAddToPlan={handleAddToPlan}
          onClose={() => {
            setPendingMeal(null);
            // Keep searchTarget open so user can pick another meal
          }}
        />
      )}

      {/* Ingredient summary */}
      {showSummary && (
        <WeekIngredientsSummary
          plan={plan}
          people={people}
          kitchen={kitchen}
          onAddToShoppingList={handleAddToShoppingList}
          onClose={() => setShowSummary(false)}
        />
      )}
    </div>
  );
}
