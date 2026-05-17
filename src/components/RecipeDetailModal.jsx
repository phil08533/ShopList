import { useState } from 'react';
import { X, ChevronDown, ChevronUp, Plus } from 'lucide-react';
import { parseIngredients, scaleMeasure } from '../utils/mealdb';

export default function RecipeDetailModal({ meal, people, onAddToPlan, onClose }) {
  const [instructionsOpen, setInstructionsOpen] = useState(false);

  if (!meal) return null;

  const scaleFactor = people / 2;
  const ingredients = parseIngredients(meal).map(({ name, measure }) => ({
    name,
    measure: scaleMeasure(measure, scaleFactor),
  }));

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40">
      <div className="w-full max-w-lg bg-white rounded-t-2xl flex flex-col max-h-[92vh]">
        {/* Close button */}
        <div className="absolute top-4 right-4 z-10">
          <button
            onClick={onClose}
            className="p-2 bg-white/80 backdrop-blur rounded-xl text-gray-600 hover:bg-white transition-colors shadow"
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto">
          {/* Hero image */}
          <div className="relative">
            <img
              src={meal.strMealThumb}
              alt={meal.strMeal}
              className="w-full aspect-video object-cover"
            />
          </div>

          <div className="px-4 pt-4 pb-6">
            {/* Title + tags */}
            <h2 className="text-xl font-bold text-gray-900 leading-tight mb-2">
              {meal.strMeal}
            </h2>
            <div className="flex gap-2 flex-wrap mb-4">
              {meal.strCategory && (
                <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 text-xs font-medium rounded-full">
                  {meal.strCategory}
                </span>
              )}
              {meal.strArea && (
                <span className="px-2.5 py-0.5 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">
                  {meal.strArea}
                </span>
              )}
            </div>

            {/* Ingredients */}
            <h3 className="text-sm font-semibold text-gray-700 mb-2">
              Ingredients <span className="text-gray-400 font-normal">({people} people)</span>
            </h3>
            <ul className="mb-4 space-y-1.5">
              {ingredients.map(({ name, measure }, i) => (
                <li key={i} className="flex items-center gap-2 text-sm text-gray-700">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0" />
                  <span className="font-medium">{measure}</span>
                  <span>{name}</span>
                </li>
              ))}
            </ul>

            {/* Collapsible instructions */}
            <button
              onClick={() => setInstructionsOpen(o => !o)}
              className="w-full flex items-center justify-between py-2.5 px-3 bg-gray-50 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <span>Instructions</span>
              {instructionsOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
            {instructionsOpen && (
              <div className="mt-2 px-3 text-sm text-gray-600 leading-relaxed whitespace-pre-line">
                {meal.strInstructions}
              </div>
            )}
          </div>
        </div>

        {/* Sticky Add button */}
        <div className="flex-shrink-0 px-4 py-3 border-t border-gray-100 bg-white">
          <button
            onClick={onAddToPlan}
            className="w-full flex items-center justify-center gap-2 bg-emerald-600 text-white py-3 rounded-xl font-semibold text-sm hover:bg-emerald-700 transition-colors"
          >
            <Plus size={18} />
            Add to Plan
          </button>
        </div>
      </div>
    </div>
  );
}
