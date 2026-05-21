import { useState, useEffect, useRef, useCallback } from 'react';
import { X, Search, Loader2, ChevronLeft, ChevronDown, ChevronUp, Plus, Heart, BookOpen, PenLine, ChefHat } from 'lucide-react';
import {
  searchMeals, getCategories, getMealsByCategory, getMealById,
  getMealsByIngredient, parseIngredients, scaleMeasure,
} from '../utils/mealdb';
import { calcPantryMatch, getTopKitchenIngredients } from '../utils/pantryMatch';
import CreateRecipeModal from './CreateRecipeModal';

function CustomThumb({ name }) {
  const colors = ['bg-emerald-100','bg-blue-100','bg-purple-100','bg-amber-100','bg-rose-100'];
  const col = colors[name.charCodeAt(0) % colors.length];
  return (
    <div className={`w-full aspect-square ${col} flex items-center justify-center`}>
      <span className="text-4xl font-bold text-white/70 select-none">
        {name.charAt(0).toUpperCase()}
      </span>
    </div>
  );
}

function MatchBadge({ match }) {
  const pct = match.pct;
  const cls = pct >= 0.8
    ? 'bg-emerald-600 text-white'
    : pct >= 0.5
    ? 'bg-amber-400 text-white'
    : 'bg-gray-400 text-white';
  return (
    <span className={`absolute top-1.5 right-1.5 text-[10px] font-bold px-1.5 py-0.5 rounded-full ${cls}`}>
      {match.matched}/{match.total}
    </span>
  );
}

async function fetchPantryMatches(kitchen) {
  const ingredients = getTopKitchenIngredients(kitchen, 6);
  if (!ingredients.length) return [];

  const lists = await Promise.all(
    ingredients.map(ing => getMealsByIngredient(ing).catch(() => []))
  );

  const seen = new Set();
  const candidates = [];
  for (const list of lists) {
    for (const meal of list) {
      if (!seen.has(meal.idMeal)) { seen.add(meal.idMeal); candidates.push(meal); }
    }
  }

  const top = candidates.slice(0, 15);
  const details = await Promise.all(top.map(m => getMealById(m.idMeal).catch(() => null)));

  return details
    .filter(Boolean)
    .map(meal => ({ ...meal, _pantryMatch: calcPantryMatch(parseIngredients(meal), kitchen) }))
    .sort((a, b) => b._pantryMatch.pct - a._pantryMatch.pct);
}

export default function RecipeSearchModal({
  onClose, onAddToPlan, people,
  favorites = [], toggleFavorite, isFavorite,
  customRecipes = [], addCustomRecipe, updateCustomRecipe, deleteCustomRecipe,
  kitchen = [],
}) {
  const [view, setView] = useState('search'); // 'search' | 'detail'
  const [showCreate, setShowCreate] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState(null);

  const [query, setQuery]               = useState('');
  const [categories, setCategories]     = useState([]);
  const [activeCategory, setActiveCategory] = useState(null);
  const [results, setResults]           = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loadingResults, setLoadingResults]       = useState(false);
  const [loadingDetail, setLoadingDetail]         = useState(false);
  const [error, setError]               = useState(null);
  const debounceRef = useRef(null);

  const [selectedMeal, setSelectedMeal]       = useState(null);
  const [instructionsOpen, setInstructionsOpen] = useState(false);

  useEffect(() => {
    getCategories().then(setCategories).catch(() => {}).finally(() => setLoadingCategories(false));
  }, []);

  useEffect(() => {
    if (activeCategory === '__myrecipes__') setResults([...customRecipes]);
  }, [customRecipes, activeCategory]);

  const handleQueryChange = useCallback((value) => {
    setQuery(value); setError(null);
    clearTimeout(debounceRef.current);
    if (value.trim()) {
      setActiveCategory(null);
      debounceRef.current = setTimeout(async () => {
        setLoadingResults(true);
        try { setResults(await searchMeals(value.trim())); }
        catch { setError('Search failed — check your connection.'); setResults([]); }
        finally { setLoadingResults(false); }
      }, 400);
    } else { setResults([]); }
  }, []);

  const handleCategory = useCallback(async (cat) => {
    if (activeCategory === cat) { setActiveCategory(null); setResults([]); return; }
    setActiveCategory(cat); setQuery(''); setError(null); setResults([]);

    if (cat === '__favorites__') { setResults(favorites); return; }
    if (cat === '__myrecipes__') { setResults([...customRecipes]); return; }

    if (cat === '__pantry__') {
      if (!kitchen.length) {
        setError('Add items to your kitchen first to get pantry suggestions.');
        return;
      }
      setLoadingResults(true);
      try { setResults(await fetchPantryMatches(kitchen)); }
      catch { setError("Couldn't load pantry suggestions — check your connection."); setResults([]); }
      finally { setLoadingResults(false); }
      return;
    }

    setLoadingResults(true);
    try { setResults(await getMealsByCategory(cat)); }
    catch { setError("Couldn't load category — check your connection."); setResults([]); }
    finally { setLoadingResults(false); }
  }, [activeCategory, favorites, customRecipes, kitchen]);

  const handleMealTap = useCallback(async (mealId) => {
    const custom = customRecipes.find(r => r.idMeal === mealId);
    if (custom) { setSelectedMeal(custom); setInstructionsOpen(false); setView('detail'); return; }
    setLoadingDetail(true); setError(null);
    try {
      const meal = await getMealById(mealId);
      if (meal) {
        // Carry pantry match data through to detail view if present
        const pantryMeal = results.find(r => r.idMeal === mealId);
        setSelectedMeal(pantryMeal?._pantryMatch ? { ...meal, _pantryMatch: pantryMeal._pantryMatch } : meal);
        setInstructionsOpen(false); setView('detail');
      } else setError('Recipe not found.');
    } catch { setError("Couldn't load recipe — check your connection."); }
    finally { setLoadingDetail(false); }
  }, [customRecipes, results]);

  const handleAdd = useCallback(() => {
    if (!selectedMeal) return;
    const ingredients = selectedMeal.isCustom
      ? (selectedMeal._ingredients ?? [])
      : parseIngredients(selectedMeal);
    onAddToPlan({
      mealId: selectedMeal.idMeal,
      mealName: selectedMeal.strMeal,
      thumb: selectedMeal.strMealThumb ?? '',
      ingredients,
      defaultServings: selectedMeal.isCustom ? (selectedMeal.serves ?? 4) : 4,
    });
    onClose();
  }, [selectedMeal, onAddToPlan, onClose]);

  const handleCreateSave = (recipe) => {
    if (editingRecipe) {
      updateCustomRecipe(editingRecipe.idMeal, recipe);
      setSelectedMeal(prev => ({ ...prev, ...recipe }));
    } else {
      addCustomRecipe(recipe);
    }
    setShowCreate(false); setEditingRecipe(null);
  };

  const handleDeleteRecipe = () => {
    if (!editingRecipe) return;
    deleteCustomRecipe(editingRecipe.idMeal);
    setShowCreate(false); setEditingRecipe(null);
    setView('search');
  };

  // ── Detail view ──────────────────────────────────────────────────────────
  if (view === 'detail' && selectedMeal) {
    const defaultServings = selectedMeal.isCustom ? (selectedMeal.serves ?? 4) : 4;
    const scaleFactor = people / defaultServings;
    const ingredients = selectedMeal.isCustom
      ? (selectedMeal._ingredients ?? []).map(({ name, measure }) => ({ name, measure: scaleMeasure(measure, scaleFactor) }))
      : parseIngredients(selectedMeal).map(({ name, measure }) => ({ name, measure: scaleMeasure(measure, scaleFactor) }));

    return (
      <>
        <div className="fixed inset-0 z-[200] flex items-end justify-center bg-black/40">
          <div className="w-full max-w-lg bg-white rounded-t-2xl flex flex-col" style={{ maxHeight: '92dvh' }}>
            <div className="flex items-center gap-1 px-3 pt-4 pb-3 flex-shrink-0 border-b border-gray-100">
              <button onClick={() => setView('search')} className="p-2 rounded-xl text-gray-500 hover:bg-gray-100 transition-colors">
                <ChevronLeft size={20} />
              </button>
              <h2 className="text-sm font-bold text-gray-800 flex-1 truncate px-1">{selectedMeal.strMeal}</h2>
              {selectedMeal.isCustom ? (
                <button onClick={() => { setEditingRecipe(selectedMeal); setShowCreate(true); }}
                  className="p-2 rounded-xl text-gray-400 hover:bg-gray-100 transition-colors">
                  <PenLine size={18} />
                </button>
              ) : (
                <button onClick={() => toggleFavorite?.(selectedMeal)}
                  className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
                  <Heart size={20} className={isFavorite?.(selectedMeal.idMeal) ? 'fill-red-500 text-red-500' : 'text-gray-400'} />
                </button>
              )}
              <button onClick={onClose} className="p-2 rounded-xl text-gray-400 hover:bg-gray-100 transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              {selectedMeal.strMealThumb
                ? <img src={selectedMeal.strMealThumb} alt={selectedMeal.strMeal} className="w-full aspect-video object-cover" />
                : <div className="w-full aspect-video bg-gradient-to-br from-emerald-50 to-emerald-100 flex items-center justify-center">
                    <span className="text-8xl font-bold text-emerald-200 select-none">{selectedMeal.strMeal.charAt(0)}</span>
                  </div>
              }
              <div className="px-4 pt-4 pb-6">
                <div className="flex gap-2 flex-wrap mb-4">
                  {selectedMeal.strCategory && (
                    <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 text-xs font-medium rounded-full">{selectedMeal.strCategory}</span>
                  )}
                  {selectedMeal.isCustom
                    ? <span className="px-2.5 py-0.5 bg-violet-50 text-violet-600 text-xs font-medium rounded-full">My Recipe</span>
                    : selectedMeal.strArea && <span className="px-2.5 py-0.5 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">{selectedMeal.strArea}</span>
                  }
                  {selectedMeal._pantryMatch && (
                    <span className={`px-2.5 py-0.5 text-xs font-medium rounded-full ${
                      selectedMeal._pantryMatch.pct >= 0.8 ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                    }`}>
                      {selectedMeal._pantryMatch.matched}/{selectedMeal._pantryMatch.total} in pantry
                    </span>
                  )}
                  {selectedMeal.calories && (
                    <span className="px-2.5 py-0.5 bg-orange-50 text-orange-600 text-xs font-medium rounded-full">
                      {Math.round(selectedMeal.calories * scaleFactor)} cal
                    </span>
                  )}
                </div>

                <h3 className="text-sm font-semibold text-gray-700 mb-2">
                  Ingredients <span className="text-gray-400 font-normal">
                    ({people} {people === 1 ? 'person' : 'people'}, serves {defaultServings})
                  </span>
                </h3>
                {ingredients.length === 0
                  ? <p className="text-sm text-gray-400 mb-4">No ingredients listed.</p>
                  : <ul className="mb-4 space-y-1.5">
                      {ingredients.map(({ name, measure }, i) => (
                        <li key={i} className="flex items-center gap-2 text-sm text-gray-700">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0" />
                          {measure && <span className="font-medium">{measure}</span>}
                          <span>{name}</span>
                        </li>
                      ))}
                    </ul>
                }

                {selectedMeal.strInstructions && (
                  <>
                    <button onClick={() => setInstructionsOpen(o => !o)}
                      className="w-full flex items-center justify-between py-2.5 px-3 bg-gray-50 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-100 transition-colors">
                      <span>Instructions</span>
                      {instructionsOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>
                    {instructionsOpen && (
                      <div className="mt-2 px-3 text-sm text-gray-600 leading-relaxed whitespace-pre-line">
                        {selectedMeal.strInstructions}
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            <div className="flex-shrink-0 px-4 pt-3 border-t border-gray-100 bg-white"
              style={{ paddingBottom: 'max(12px, env(safe-area-inset-bottom))' }}>
              <button onClick={handleAdd}
                className="w-full flex items-center justify-center gap-2 bg-primary-600 text-white py-3 rounded-xl font-semibold text-sm hover:bg-primary-700 transition-colors">
                <Plus size={18} /> Add to Plan
              </button>
            </div>
          </div>
        </div>

        {showCreate && (
          <CreateRecipeModal
            onClose={() => { setShowCreate(false); setEditingRecipe(null); }}
            onSave={handleCreateSave}
            onDelete={editingRecipe ? handleDeleteRecipe : undefined}
            initial={editingRecipe}
          />
        )}
      </>
    );
  }

  // ── Search view ──────────────────────────────────────────────────────────
  const showPrompt = !query.trim() && !activeCategory;
  const showMyRecipes = activeCategory === '__myrecipes__';
  const showPantry = activeCategory === '__pantry__';

  return (
    <>
      <div className="fixed inset-0 z-[200] flex items-end justify-center bg-black/40">
        <div className="w-full max-w-lg bg-white rounded-t-2xl flex flex-col" style={{ maxHeight: '90dvh' }}>

          <div className="flex items-center justify-between px-4 pt-4 pb-2 flex-shrink-0">
            <h2 className="text-lg font-bold text-gray-800">Find a Recipe</h2>
            <div className="flex items-center gap-1">
              <button onClick={() => { setEditingRecipe(null); setShowCreate(true); }}
                className="flex items-center gap-1 text-xs text-primary-600 font-semibold bg-primary-50 hover:bg-primary-100 px-2.5 py-1.5 rounded-xl transition-colors">
                <Plus size={13} /> Create
              </button>
              <button onClick={onClose} className="p-2 rounded-xl text-gray-400 hover:bg-gray-100 transition-colors">
                <X size={20} />
              </button>
            </div>
          </div>

          <div className="px-4 pb-2 flex-shrink-0">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type="text" value={query} onChange={e => handleQueryChange(e.target.value)}
                placeholder="Search meals…"
                className="w-full pl-9 pr-4 py-2.5 bg-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                autoFocus />
            </div>
          </div>

          <div className="px-4 pb-2 flex-shrink-0">
            {loadingCategories
              ? <div className="flex items-center gap-2 text-gray-400 text-sm py-1"><Loader2 size={14} className="animate-spin" /> Loading…</div>
              : <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                  {favorites.length > 0 && (
                    <button onClick={() => handleCategory('__favorites__')}
                      className={`flex-shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${activeCategory === '__favorites__' ? 'bg-red-500 text-white' : 'bg-red-50 text-red-500 hover:bg-red-100'}`}>
                      <Heart size={11} className={activeCategory === '__favorites__' ? 'fill-white text-white' : 'fill-red-500 text-red-500'} />
                      Saved
                    </button>
                  )}
                  <button onClick={() => handleCategory('__myrecipes__')}
                    className={`flex-shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${activeCategory === '__myrecipes__' ? 'bg-violet-600 text-white' : 'bg-violet-50 text-violet-600 hover:bg-violet-100'}`}>
                    <BookOpen size={11} />
                    My Recipes
                  </button>
                  <button onClick={() => handleCategory('__pantry__')}
                    className={`flex-shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${activeCategory === '__pantry__' ? 'bg-orange-500 text-white' : 'bg-orange-50 text-orange-600 hover:bg-orange-100'}`}>
                    <ChefHat size={11} />
                    From Pantry
                  </button>
                  {categories.map(cat => (
                    <button key={cat.idCategory} onClick={() => handleCategory(cat.strCategory)}
                      className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${activeCategory === cat.strCategory ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                      {cat.strCategory}
                    </button>
                  ))}
                </div>
            }
          </div>

          <div className="flex-1 overflow-y-auto px-4 pb-4">
            {loadingDetail && (
              <div className="flex items-center justify-center py-8 gap-2 text-primary-600">
                <Loader2 size={20} className="animate-spin" /><span className="text-sm">Loading recipe…</span>
              </div>
            )}
            {!loadingDetail && error && <div className="text-center py-6 text-red-500 text-sm">{error}</div>}

            {!loadingDetail && !error && showPrompt && (
              <div className="flex flex-col items-center justify-center py-12 text-gray-400 gap-2">
                <Search size={32} className="text-gray-300" />
                <span className="text-sm">Search or pick a category above</span>
              </div>
            )}

            {/* My Recipes grid */}
            {!loadingDetail && !error && showMyRecipes && (
              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => { setEditingRecipe(null); setShowCreate(true); }}
                  className="rounded-2xl border-2 border-dashed border-primary-200 bg-primary-50 hover:bg-primary-100 transition-colors flex flex-col items-center justify-center gap-1.5"
                  style={{ aspectRatio: '1' }}>
                  <Plus size={24} className="text-primary-600" />
                  <span className="text-xs font-semibold text-primary-600">New Recipe</span>
                </button>
                {customRecipes.map(recipe => (
                  <button key={recipe.idMeal} onClick={() => handleMealTap(recipe.idMeal)}
                    disabled={loadingDetail}
                    className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden text-left hover:shadow-md transition-shadow active:scale-95">
                    <CustomThumb name={recipe.strMeal} />
                    <div className="p-2">
                      <p className="text-xs font-medium text-gray-800 line-clamp-2 leading-snug">{recipe.strMeal}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* From Pantry results */}
            {!loadingDetail && !error && showPantry && !loadingResults && results.length > 0 && (
              <div>
                <p className="text-xs text-gray-400 mb-3">
                  Recipes using ingredients from your kitchen — sorted by best match
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {results.map(meal => (
                    <button key={meal.idMeal} onClick={() => handleMealTap(meal.idMeal)}
                      disabled={loadingDetail}
                      className="relative bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden text-left hover:shadow-md transition-shadow active:scale-95 disabled:opacity-50">
                      <img src={meal.strMealThumb} alt={meal.strMeal} className="w-full aspect-square object-cover" loading="lazy" />
                      {meal._pantryMatch && <MatchBadge match={meal._pantryMatch} />}
                      <div className="p-2"><p className="text-xs font-medium text-gray-800 line-clamp-2 leading-snug">{meal.strMeal}</p></div>
                    </button>
                  ))}
                </div>
              </div>
            )}
            {!loadingDetail && !error && showPantry && !loadingResults && results.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-gray-400 gap-2">
                <ChefHat size={32} className="text-gray-300" />
                <span className="text-sm text-center">No matching recipes found.<br />Try adding more items to your kitchen.</span>
              </div>
            )}

            {!loadingDetail && !error && !showPrompt && !showMyRecipes && !showPantry && loadingResults && (
              <div className="flex items-center justify-center py-8 gap-2 text-primary-600">
                <Loader2 size={20} className="animate-spin" /><span className="text-sm">Loading…</span>
              </div>
            )}
            {showPantry && loadingResults && (
              <div className="flex flex-col items-center justify-center py-12 gap-3 text-primary-600">
                <Loader2 size={24} className="animate-spin" />
                <span className="text-sm text-gray-500">Finding recipes that match your pantry…</span>
              </div>
            )}
            {!loadingDetail && !error && !showPrompt && !showMyRecipes && !showPantry && !loadingResults && results.length === 0 && (
              <div className="text-center py-8 text-gray-400 text-sm">No meals found</div>
            )}
            {!loadingDetail && !loadingResults && !showMyRecipes && !showPantry && results.length > 0 && (
              <div className="grid grid-cols-2 gap-3">
                {results.map(meal => (
                  <button key={meal.idMeal} onClick={() => handleMealTap(meal.idMeal)}
                    disabled={loadingDetail}
                    className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden text-left hover:shadow-md transition-shadow active:scale-95 disabled:opacity-50">
                    <img src={meal.strMealThumb} alt={meal.strMeal} className="w-full aspect-square object-cover" loading="lazy" />
                    <div className="p-2"><p className="text-xs font-medium text-gray-800 line-clamp-2 leading-snug">{meal.strMeal}</p></div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {showCreate && (
        <CreateRecipeModal
          onClose={() => { setShowCreate(false); setEditingRecipe(null); }}
          onSave={handleCreateSave}
          onDelete={editingRecipe ? handleDeleteRecipe : undefined}
          initial={editingRecipe}
        />
      )}
    </>
  );
}
