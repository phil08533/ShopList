import { useState } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';

const FOOD_CATEGORIES = [
  'Beef','Breakfast','Chicken','Dessert','Goat','Lamb','Miscellaneous',
  'Pasta','Pork','Seafood','Side','Starter','Vegan','Vegetarian',
];

export default function CreateRecipeModal({ onClose, onSave, onDelete, initial }) {
  const [name, setName]           = useState(initial?.strMeal ?? '');
  const [category, setCategory]   = useState(initial?.strCategory ?? 'Miscellaneous');
  const [serves, setServes]       = useState(initial?.serves ?? 4);
  const [calories, setCalories]   = useState(initial?.calories ?? '');
  const [instructions, setInstructions] = useState(initial?.strInstructions ?? '');
  const [ingredients, setIngredients] = useState(
    initial?._ingredients?.length ? initial._ingredients : [{ name: '', measure: '' }]
  );

  const setIng = (i, field, val) =>
    setIngredients(prev => prev.map((row, j) => j === i ? { ...row, [field]: val } : row));

  const handleSave = () => {
    if (!name.trim()) return;
    onSave({
      strMeal: name.trim(),
      strCategory: category,
      strArea: 'Custom',
      strInstructions: instructions.trim(),
      strMealThumb: null,
      serves: Math.max(1, Number(serves) || 4),
      calories: calories ? Math.round(Number(calories)) : null,
      _ingredients: ingredients.filter(r => r.name.trim()),
    });
  };

  const input = 'w-full bg-gray-100 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500';

  return (
    <div className="fixed inset-0 z-[300] flex items-end justify-center bg-black/40">
      <div className="w-full max-w-lg bg-white rounded-t-2xl flex flex-col" style={{ maxHeight: '94dvh' }}>

        <div className="flex items-center justify-between px-4 pt-4 pb-3 flex-shrink-0 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-800">{initial ? 'Edit Recipe' : 'Create Recipe'}</h2>
          <button onClick={onClose} className="p-2 rounded-xl text-gray-400 hover:bg-gray-100"><X size={20} /></button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Recipe Name *</label>
            <input autoFocus value={name} onChange={e => setName(e.target.value)}
              placeholder="e.g. Mom's Spaghetti" className={input} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Category</label>
              <select value={category} onChange={e => setCategory(e.target.value)} className={input}>
                {FOOD_CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Serves</label>
              <input type="number" min={1} max={20} value={serves}
                onChange={e => setServes(e.target.value)} className={input} />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Calories per serving (optional)</label>
            <input type="number" min={0} value={calories}
              onChange={e => setCalories(e.target.value)}
              placeholder="e.g. 450" className={input} />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Ingredients</label>
            <div className="space-y-2">
              {ingredients.map((row, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <input value={row.measure} onChange={e => setIng(i, 'measure', e.target.value)}
                    placeholder="Amount" className="w-24 flex-shrink-0 bg-gray-100 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
                  <input value={row.name} onChange={e => setIng(i, 'name', e.target.value)}
                    placeholder="Ingredient" className="flex-1 bg-gray-100 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
                  {ingredients.length > 1 && (
                    <button onClick={() => setIngredients(p => p.filter((_, j) => j !== i))}
                      className="p-2 text-gray-300 hover:text-red-400 flex-shrink-0">
                      <Trash2 size={15} />
                    </button>
                  )}
                </div>
              ))}
              <button onClick={() => setIngredients(p => [...p, { name: '', measure: '' }])}
                className="flex items-center gap-1.5 text-sm text-primary-600 font-medium hover:bg-primary-50 px-2 py-1.5 rounded-lg transition-colors">
                <Plus size={15} /> Add ingredient
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Instructions (optional)</label>
            <textarea value={instructions} onChange={e => setInstructions(e.target.value)}
              placeholder="Step-by-step instructions…" rows={5}
              className={`${input} resize-none leading-relaxed`} />
          </div>

          {initial && onDelete && (
            <button onClick={onDelete}
              className="w-full py-2.5 rounded-xl border border-red-200 text-red-500 text-sm font-medium hover:bg-red-50 transition-colors">
              Delete Recipe
            </button>
          )}
        </div>

        <div className="flex-shrink-0 px-4 pt-3 border-t border-gray-100 bg-white"
          style={{ paddingBottom: 'max(12px, env(safe-area-inset-bottom))' }}>
          <button onClick={handleSave} disabled={!name.trim()}
            className="w-full py-3 rounded-xl bg-primary-600 text-white font-semibold text-sm hover:bg-primary-700 disabled:opacity-40 transition-colors">
            {initial ? 'Save Changes' : 'Create Recipe'}
          </button>
        </div>
      </div>
    </div>
  );
}
