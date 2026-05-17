import { useState, useEffect, useRef, useCallback } from 'react';
import { X, Search, Loader2 } from 'lucide-react';
import { searchMeals, getCategories, getMealsByCategory, getMealById } from '../utils/mealdb';

export default function RecipeSearchModal({ onClose, onSelect }) {
  const [query, setQuery] = useState('');
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState(null);
  const [results, setResults] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loadingResults, setLoadingResults] = useState(false);
  const [loadingMeal, setLoadingMeal] = useState(false);
  const [error, setError] = useState(null);
  const debounceRef = useRef(null);

  // Load categories on mount
  useEffect(() => {
    setLoadingCategories(true);
    getCategories()
      .then(cats => setCategories(cats))
      .catch(() => setError('Couldn\'t load categories'))
      .finally(() => setLoadingCategories(false));
  }, []);

  // Debounced search
  const handleQueryChange = useCallback((value) => {
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (value.trim()) {
      setActiveCategory(null);
      debounceRef.current = setTimeout(async () => {
        setLoadingResults(true);
        setError(null);
        try {
          const meals = await searchMeals(value.trim());
          setResults(meals);
        } catch {
          setError('Couldn\'t load search results');
          setResults([]);
        } finally {
          setLoadingResults(false);
        }
      }, 400);
    } else {
      setResults([]);
    }
  }, []);

  // Category tap
  const handleCategory = useCallback(async (cat) => {
    setActiveCategory(cat);
    setQuery('');
    setResults([]);
    setLoadingResults(true);
    setError(null);
    try {
      const meals = await getMealsByCategory(cat);
      setResults(meals);
    } catch {
      setError('Couldn\'t load meals for this category');
    } finally {
      setLoadingResults(false);
    }
  }, []);

  // Meal card tap: fetch full detail and call onSelect
  const handleMealTap = useCallback(async (mealId) => {
    setLoadingMeal(true);
    setError(null);
    try {
      const meal = await getMealById(mealId);
      if (meal) onSelect(meal);
    } catch {
      setError('Couldn\'t load meal details');
    } finally {
      setLoadingMeal(false);
    }
  }, [onSelect]);

  const showPrompt = !query.trim() && !activeCategory;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40">
      <div className="w-full max-w-lg bg-white rounded-t-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-4 pt-4 pb-2 flex-shrink-0">
          <h2 className="text-lg font-bold text-gray-800">Find a Recipe</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-gray-400 hover:bg-gray-100 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Search input */}
        <div className="px-4 pb-2 flex-shrink-0">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={query}
              onChange={e => handleQueryChange(e.target.value)}
              placeholder="Search meals..."
              className="w-full pl-9 pr-4 py-2.5 bg-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              autoFocus
            />
          </div>
        </div>

        {/* Category chips */}
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

        {/* Content area */}
        <div className="flex-1 overflow-y-auto px-4 pb-4">
          {loadingMeal && (
            <div className="flex items-center justify-center py-8 gap-2 text-emerald-600">
              <Loader2 size={20} className="animate-spin" />
              <span className="text-sm">Loading recipe…</span>
            </div>
          )}

          {!loadingMeal && error && (
            <div className="text-center py-8 text-red-500 text-sm">{error}</div>
          )}

          {!loadingMeal && !error && showPrompt && (
            <div className="flex flex-col items-center justify-center py-12 text-gray-400 text-sm gap-2">
              <Search size={32} className="text-gray-300" />
              <span>Search or pick a category</span>
            </div>
          )}

          {!loadingMeal && !error && !showPrompt && loadingResults && (
            <div className="flex items-center justify-center py-8 gap-2 text-emerald-600">
              <Loader2 size={20} className="animate-spin" />
              <span className="text-sm">Loading…</span>
            </div>
          )}

          {!loadingMeal && !error && !showPrompt && !loadingResults && results.length === 0 && (
            <div className="text-center py-8 text-gray-400 text-sm">No meals found</div>
          )}

          {!loadingMeal && !loadingResults && results.length > 0 && (
            <div className="grid grid-cols-2 gap-3">
              {results.map(meal => (
                <button
                  key={meal.idMeal}
                  onClick={() => handleMealTap(meal.idMeal)}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden text-left hover:shadow-md transition-shadow"
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
