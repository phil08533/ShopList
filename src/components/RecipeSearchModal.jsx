import { useState, useEffect, useRef, useCallback } from 'react';
import { X, Search, Loader2, ChevronLeft, ChevronDown, ChevronUp, Plus } from 'lucide-react';
import {
  searchMeals,
  getCategories,
  getMealsByCategory,
  getMealById,
  parseIngredients,
  scaleMeasure,
} from '../utils/mealdb';

export default function RecipeSearchModal({ onClose, onAddToPlan, people }) {
  // Single modal, two views: 'search' | 'detail'
  const [view, setView] = useState('search');

  // Search state
  const [query, setQuery] = useState('');
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState(null);
  const [results, setResults] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loadingResults, setLoadingResults] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [error, setError] = useState(null);
  const debounceRef = useRef(null);

  // Detail state
  const [selectedMeal, setSelectedMeal] = useState(null);
  const [instructionsOpen, setInstructionsOpen] = useState(false);

  useEffect(() => {
    getCategories()
      .then(setCategories)
      .catch(() => {})
      .finally(() => setLoadingCategories(false));
  }, []);

  const handleQueryChange = useCallback((value) => {
    setQuery(value);
    setError(null);
    clearTimeout(debounceRef.current);
    if (value.trim()) {
      setActiveCategory(null);
      debounceRef.current = setTimeout(async () => {
        setLoadingResults(true);
        try {
          setResults(await searchMeals(value.trim()));
        } catch {
          setError('Search failed — check your connection.');
          setResults([]);
        } finally {
          setLoadingResults(false);
        }
      }, 400);
    } else {
      setResults([]);
    }
  }, []);

  const handleCategory = useCallback(async (cat) => {
    if (activeCategory === cat) {
      setActiveCategory(null);
      setResults([]);
      return;
    }
    setActiveCategory(cat);
    setQuery('');
    setError(null);
    setLoadingResults(true);
    try {
      setResults(await getMealsByCategory(cat));
    } catch {
      setError("Couldn't load category — check your connection.");
      setResults([]);
    } finally {
      setLoadingResults(false);
    }
  }, [activeCategory]);

  const handleMealTap = useCallback(async (mealId) => {
    setLoadingDetail(true);
    setError(null);
    try {
      const meal = await getMealById(mealId);
      if (meal) {
        setSelectedMeal(meal);
        setInstructionsOpen(false);
        setView('detail');
      } else {
        setError('Recipe not found.');
      }
    } catch {
      setError("Couldn't load recipe — check your connection.");
    } finally {
      setLoadingDetail(false);
    }
  }, []);

  const handleAdd = useCallback(() => {
    if (!selectedMeal) return;
    onAddToPlan({
      mealId: selectedMeal.idMeal,
      mealName: selectedMeal.strMeal,
      thumb: selectedMeal.strMealThumb,
      ingredients: parseIngredients(selectedMeal),
    });
    onClose();
  }, [selectedMeal, onAddToPlan, onClose]);

  // ── Detail view ───────────────────────────────────────────────────────────
  if (view === 'detail' && selectedMeal) {
    const scaleFactor = people / 2;
    const ingredients = parseIngredients(selectedMeal).map(({ name, measure }) => ({
      name,
      measure: scaleMeasure(measure, scaleFactor),
    }));

    return (
      <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40">
        <div className="w-full max-w-lg bg-white rounded-t-2xl flex flex-col" style={{ maxHeight: '92vh' }}>
          <div className="flex items-center gap-1 px-3 pt-4 pb-3 flex-shrink-0 border-b border-gray-100">
            <button
              onClick={() => setView('search')}
              className="p-2 rounded-xl text-gray-500 hover:bg-gray-100 transition-colors"
            >
              <ChevronLeft size={20} />
            </button>
            <h2 className="text-sm font-bold text-gray-800 flex-1 truncate px-1">
              {selectedMeal.strMeal}
            </h2>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-gray-400 hover:bg-gray-100 transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto">
            <img
              src={selectedMeal.strMealThumb}
              alt={selectedMeal.strMeal}
              className="w-full aspect-video object-cover"
            />
            <div className="px-4 pt-4 pb-6">
              <div className="flex gap-2 flex-wrap mb-4">
                {selectedMeal.strCategory && (
                  <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 text-xs font-medium rounded-full">
                    {selectedMeal.strCategory}
                  </span>
                )}
                {selectedMeal.strArea && (
                  <span className="px-2.5 py-0.5 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">
                    {selectedMeal.strArea}
                  </span>
                )}
              </div>

              <h3 className="text-sm font-semibold text-gray-700 mb-2">
                Ingredients{' '}
                <span className="text-gray-400 font-normal">
                  ({people} {people === 1 ? 'person' : 'people'})
                </span>
              </h3>
              <ul className="mb-4 space-y-1.5">
                {ingredients.map(({ name, measure }, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-gray-700">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0" />
                    {measure && <span className="font-medium">{measure}</span>}
                    <span>{name}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => setInstructionsOpen(o => !o)}
                className="w-full flex items-center justify-between py-2.5 px-3 bg-gray-50 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <span>Instructions</span>
                {instructionsOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
              {instructionsOpen && (
                <div className="mt-2 px-3 text-sm text-gray-600 leading-relaxed whitespace-pre-line">
                  {selectedMeal.strInstructions}
                </div>
              )}
            </div>
          </div>

          <div className="flex-shrink-0 px-4 py-3 border-t border-gray-100 bg-white">
            <button
              onClick={handleAdd}
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

  // ── Search view ───────────────────────────────────────────────────────────
  const showPrompt = !query.trim() && !activeCategory;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40">
      <div className="w-full max-w-lg bg-white rounded-t-2xl flex flex-col" style={{ maxHeight: '90vh' }}>
        <div className="flex items-center justify-between px-4 pt-4 pb-2 flex-shrink-0">
          <h2 className="text-lg font-bold text-gray-800">Find a Recipe</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-gray-400 hover:bg-gray-100 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="px-4 pb-2 flex-shrink-0">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={query}
              onChange={e => handleQueryChange(e.target.value)}
              placeholder="Search meals…"
              className="w-full pl-9 pr-4 py-2.5 bg-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              autoFocus
            />
          </div>
        </div>

        <div className="px-4 pb-2 flex-shrink-0">
          {loadingCategories ? (
            <div className="flex items-center gap-2 text-gray-400 text-sm py-1">
              <Loader2 size={14} className="animate-spin" /> Loading categories…
            </div>
          ) : (
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
              {categories.map(cat => (
                <button
                  key={cat.idCategory}
                  onClick={() => handleCategory(cat.strCategory)}
                  className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${
                    activeCategory === cat.strCategory
                      ? 'bg-emerald-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {cat.strCategory}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto px-4 pb-4">
          {loadingDetail && (
            <div className="flex items-center justify-center py-8 gap-2 text-emerald-600">
              <Loader2 size={20} className="animate-spin" />
              <span className="text-sm">Loading recipe…</span>
            </div>
          )}

          {!loadingDetail && error && (
            <div className="text-center py-6 text-red-500 text-sm">{error}</div>
          )}

          {!loadingDetail && !error && showPrompt && (
            <div className="flex flex-col items-center justify-center py-12 text-gray-400 gap-2">
              <Search size={32} className="text-gray-300" />
              <span className="text-sm">Search or pick a category above</span>
            </div>
          )}

          {!loadingDetail && !error && !showPrompt && loadingResults && (
            <div className="flex items-center justify-center py-8 gap-2 text-emerald-600">
              <Loader2 size={20} className="animate-spin" />
              <span className="text-sm">Loading…</span>
            </div>
          )}

          {!loadingDetail && !error && !showPrompt && !loadingResults && results.length === 0 && (
            <div className="text-center py-8 text-gray-400 text-sm">No meals found</div>
          )}

          {!loadingDetail && !loadingResults && results.length > 0 && (
            <div className="grid grid-cols-2 gap-3">
              {results.map(meal => (
                <button
                  key={meal.idMeal}
                  onClick={() => handleMealTap(meal.idMeal)}
                  disabled={loadingDetail}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden text-left hover:shadow-md transition-shadow active:scale-95 disabled:opacity-50"
                >
                  <img
                    src={meal.strMealThumb}
                    alt={meal.strMeal}
                    className="w-full aspect-square object-cover"
                    loading="lazy"
                  />
                  <div className="p-2">
                    <p className="text-xs font-medium text-gray-800 line-clamp-2 leading-snug">
                      {meal.strMeal}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
