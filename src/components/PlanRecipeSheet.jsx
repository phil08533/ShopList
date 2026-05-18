import { useState } from 'react';
import { X, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import { getMealById, scaleMeasure } from '../utils/mealdb';

export default function PlanRecipeSheet({ meal, people, onClose, onRemove }) {
  const [instructions, setInstructions] = useState(null);
  const [loadingInstr, setLoadingInstr] = useState(false);
  const [showInstr, setShowInstr] = useState(false);

  const defaultServings = meal.defaultServings ?? 4;
  const factor = people / defaultServings;

  const ingredients = (meal.ingredients ?? []).map(({ name, measure }) => ({
    name,
    measure: scaleMeasure(measure, factor),
  }));

  const toggleInstructions = async () => {
    if (showInstr) { setShowInstr(false); return; }
    setShowInstr(true);
    if (instructions === null) {
      setLoadingInstr(true);
      try {
        const full = await getMealById(meal.mealId);
        setInstructions(full?.strInstructions ?? '');
      } catch { setInstructions(''); }
      finally { setLoadingInstr(false); }
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-end justify-center bg-black/40">
      <div className="w-full max-w-lg bg-white rounded-t-2xl flex flex-col" style={{ maxHeight: '88dvh' }}>
        <div className="flex items-center gap-2 px-4 pt-4 pb-3 flex-shrink-0 border-b border-gray-100">
          <h2 className="text-base font-bold text-gray-800 flex-1 truncate">{meal.mealName}</h2>
          <button onClick={onClose} className="p-2 rounded-xl text-gray-400 hover:bg-gray-100">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {meal.thumb && (
            <img src={meal.thumb} alt={meal.mealName} className="w-full aspect-video object-cover" />
          )}
          <div className="px-4 pt-4 pb-6 space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-2">
                Ingredients{' '}
                <span className="font-normal text-gray-400">
                  ({people} {people === 1 ? 'person' : 'people'}, serves {defaultServings})
                </span>
              </h3>
              {ingredients.length === 0 ? (
                <p className="text-sm text-gray-400">No ingredients stored.</p>
              ) : (
                <ul className="space-y-1.5">
                  {ingredients.map(({ name, measure }, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-gray-700">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0" />
                      {measure && <span className="font-medium">{measure}</span>}
                      <span>{name}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <button
              onClick={toggleInstructions}
              className="w-full flex items-center justify-between py-2.5 px-3 bg-gray-50 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <span>Instructions</span>
              {loadingInstr
                ? <Loader2 size={16} className="animate-spin text-emerald-600" />
                : showInstr ? <ChevronUp size={16} /> : <ChevronDown size={16} />
              }
            </button>
            {showInstr && !loadingInstr && (
              instructions
                ? <div className="px-3 text-sm text-gray-600 leading-relaxed whitespace-pre-line">{instructions}</div>
                : <p className="px-3 text-sm text-gray-400">No instructions available.</p>
            )}
          </div>
        </div>

        <div className="flex-shrink-0 px-4 pt-3 border-t border-gray-100 bg-white"
          style={{ paddingBottom: 'max(12px, env(safe-area-inset-bottom))' }}>
          <button
            onClick={onRemove}
            className="w-full py-3 rounded-xl border border-red-200 text-red-500 text-sm font-semibold hover:bg-red-50 transition-colors"
          >
            Remove from Plan
          </button>
        </div>
      </div>
    </div>
  );
}
