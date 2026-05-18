import { useState } from 'react';
import { Plus, X, Trash2, ShoppingCart, Minus, ChevronLeft, ChevronRight } from 'lucide-react';
import RecipeSearchModal from '../components/RecipeSearchModal';
import WeekIngredientsSummary from '../components/WeekIngredientsSummary';
import { getMondayKey } from '../hooks/useWeeklyPlan';

const DAY_NAMES = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const SLOTS = ['breakfast', 'lunch', 'dinner'];
const SLOT_LABELS = { breakfast: 'Breakfast', lunch: 'Lunch', dinner: 'Dinner' };

function getWeekDates(weekOffset = 0) {
  const today = new Date();
  const dow = today.getDay();
  const mondayDiff = dow === 0 ? -6 : 1 - dow;
  const monday = new Date(today);
  monday.setDate(today.getDate() + mondayDiff + weekOffset * 7);
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
  return date.toDateString() === new Date().toDateString();
}

function weekLabel(offset, dates) {
  if (offset === 0) return 'This Week';
  if (offset === 1) return 'Next Week';
  if (offset === -1) return 'Last Week';
  return `${formatDate(dates[0])} – ${formatDate(dates[6])}`;
}

export default function RecipesPage({
  kitchen,
  addShoppingItem,
  shoppingList,
  people,
  getWeekPlan,
  setMeal,
  clearWeek,
  setPeople,
  unitSystem = 'us',
  favorites = [],
  toggleFavorite,
  isFavorite,
  customRecipes = [],
  addCustomRecipe,
  updateCustomRecipe,
  deleteCustomRecipe,
}) {
  const [weekOffset, setWeekOffset] = useState(0);
  const [searchTarget, setSearchTarget] = useState(null); // { dayIndex, slot }
  const [showSummary, setShowSummary] = useState(false);

  const weekKey = getMondayKey(weekOffset);
  const plan = getWeekPlan(weekKey);
  const weekDates = getWeekDates(weekOffset);

  const handleAddToPlan = (mealEntry) => {
    if (!searchTarget) return;
    setMeal(weekKey, searchTarget.dayIndex, searchTarget.slot, mealEntry);
    setSearchTarget(null);
  };

  const handleRemoveMeal = (dayIndex, slot) => {
    setMeal(weekKey, dayIndex, slot, null);
  };

  const handleAddToShoppingList = (item) => {
    const exists = shoppingList.some(
      s => s.name?.toLowerCase() === item.name?.toLowerCase()
    );
    if (!exists) addShoppingItem(item);
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

        {/* Week navigation */}
        <div className="flex items-center justify-between mb-2">
          <button
            onClick={() => setWeekOffset(o => o - 1)}
            className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
          >
            <ChevronLeft size={16} />
          </button>
          <span className="text-sm font-semibold text-gray-700">
            {weekLabel(weekOffset, weekDates)}
          </span>
          <button
            onClick={() => setWeekOffset(o => o + 1)}
            className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
          >
            <ChevronRight size={16} />
          </button>
        </div>

        {/* People + clear */}
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
            onClick={() => clearWeek(weekKey)}
            className="flex items-center gap-1 text-xs text-gray-400 hover:text-red-500 transition-colors px-2 py-1 rounded-lg hover:bg-red-50"
          >
            <Trash2 size={12} />
            Clear week
          </button>
        </div>
      </div>

      {/* Week grid */}
      <div className="px-4 pt-4 space-y-3">
        {plan.map((day, dayIndex) => {
          const date = weekDates[dayIndex];
          const todayFlag = weekOffset === 0 && isToday(date);
          return (
            <div
              key={dayIndex}
              className={`bg-white rounded-2xl border shadow-sm overflow-hidden ${
                todayFlag ? 'border-emerald-400' : 'border-gray-100'
              }`}
            >
              <div
                className={`px-3 py-2 flex items-center justify-between ${
                  todayFlag ? 'bg-emerald-50' : 'bg-gray-50'
                }`}
              >
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

              <div className="divide-y divide-gray-50">
                {SLOTS.map(slot => {
                  const meal = day[slot];
                  return (
                    <div key={slot} className="px-3 py-2 flex items-center gap-2 min-h-[52px]">
                      <span className="text-xs text-gray-400 w-16 flex-shrink-0">
                        {SLOT_LABELS[slot]}
                      </span>
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
                          onClick={() => setSearchTarget({ dayIndex, slot })}
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

      {searchTarget && (
        <RecipeSearchModal
          onClose={() => setSearchTarget(null)}
          onAddToPlan={handleAddToPlan}
          people={people}
          favorites={favorites}
          toggleFavorite={toggleFavorite}
          isFavorite={isFavorite}
          customRecipes={customRecipes}
          addCustomRecipe={addCustomRecipe}
          updateCustomRecipe={updateCustomRecipe}
          deleteCustomRecipe={deleteCustomRecipe}
        />
      )}

      {showSummary && (
        <WeekIngredientsSummary
          plan={plan}
          people={people}
          kitchen={kitchen}
          onAddToShoppingList={handleAddToShoppingList}
          onClose={() => setShowSummary(false)}
          unitSystem={unitSystem}
        />
      )}
    </div>
  );
}
