import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import NavBar from './components/NavBar';
import Guide from './components/Guide';
import HomePage from './pages/HomePage';
import KitchenPage from './pages/KitchenPage';
import ShoppingPage from './pages/ShoppingPage';
import SettingsPage from './pages/SettingsPage';
import RecipesPage from './pages/RecipesPage';
import { usePantry } from './hooks/usePantry';
import { useWeeklyPlan } from './hooks/useWeeklyPlan';
import { useFavorites } from './hooks/useFavorites';
import { useCustomRecipes } from './hooks/useCustomRecipes';
import { computeWeeklyUsage } from './utils/mealUsage';

const FSA_SUPPORTED = typeof window !== 'undefined' && 'showSaveFilePicker' in window;

async function writeToHandle(handle, json) {
  const writable = await handle.createWritable();
  await writable.write(json);
  await writable.close();
}

function triggerDownload(json) {
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `smart-pantry-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function App() {
  const [tab, setTab] = useState('home');
  const [saveStatus, setSaveStatus] = useState('');
  const [autoSave, setAutoSave] = useState(() => {
    try { return JSON.parse(localStorage.getItem('smart_pantry_autosave') ?? 'false'); } catch { return false; }
  });
  const [showGuide, setShowGuide] = useState(() => {
    try { return !JSON.parse(localStorage.getItem('smart_pantry_guide_seen') ?? 'false'); } catch { return true; }
  });
  const fileHandleRef = useRef(null);

  const {
    state,
    addKitchenItem, updateKitchenItem, removeKitchenItem,
    addShoppingItem, toggleShoppingItem, removeShoppingItem,
    clearCheckedFromShopping, moveCheckedToKitchen,
    updateHousehold, updateSettings, importState,
  } = usePantry();

  const { getWeekPlan, setMeal, clearWeek, people, setPeople, plans, importPlans } = useWeeklyPlan();
  const { favorites, toggleFavorite, isFavorite, importFavorites } = useFavorites();
  const {
    recipes: customRecipes,
    addRecipe: addCustomRecipe,
    updateRecipe: updateCustomRecipe,
    deleteRecipe: deleteCustomRecipe,
    importRecipes,
  } = useCustomRecipes();

  // Apply theme to <html> element
  const theme = state.settings.theme ?? 'emerald';
  useEffect(() => {
    if (theme === 'emerald') {
      document.documentElement.removeAttribute('data-theme');
    } else {
      document.documentElement.setAttribute('data-theme', theme);
    }
  }, [theme]);

  const buildSnapshot = useCallback(() => ({
    version: 2, pantry: state, meals: { plans, people }, favorites, customRecipes,
  }), [state, plans, people, favorites, customRecipes]);

  const handleSave = useCallback(async () => {
    const json = JSON.stringify(buildSnapshot(), null, 2);
    if (FSA_SUPPORTED) {
      try {
        if (!fileHandleRef.current) {
          fileHandleRef.current = await window.showSaveFilePicker({
            suggestedName: 'smart-pantry.json',
            types: [{ description: 'JSON', accept: { 'application/json': ['.json'] } }],
          });
        }
        await writeToHandle(fileHandleRef.current, json);
        setSaveStatus('saved');
        setTimeout(() => setSaveStatus(''), 2500);
      } catch (e) {
        if (e.name === 'AbortError') return;
        fileHandleRef.current = null;
        triggerDownload(json);
      }
    } else {
      triggerDownload(json);
    }
  }, [buildSnapshot]);

  const handleImportAll = useCallback((snapshot) => {
    if (snapshot?.version === 2) {
      if (snapshot.pantry) importState(snapshot.pantry);
      if (snapshot.meals) importPlans(snapshot.meals);
      if (snapshot.favorites) importFavorites(snapshot.favorites);
      if (snapshot.customRecipes) importRecipes(snapshot.customRecipes);
    } else {
      importState(snapshot);
    }
    setSaveStatus('imported');
    setTimeout(() => setSaveStatus(''), 3000);
  }, [importState, importPlans, importFavorites, importRecipes]);

  const handleLoad = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        try { handleImportAll(JSON.parse(ev.target.result)); }
        catch { setSaveStatus('error'); setTimeout(() => setSaveStatus(''), 3000); }
      };
      reader.readAsText(file);
    };
    input.click();
  }, [handleImportAll]);

  const handleToggleAutoSave = useCallback(async () => {
    if (!autoSave) {
      if (FSA_SUPPORTED) {
        try {
          fileHandleRef.current = await window.showSaveFilePicker({
            suggestedName: 'smart-pantry.json',
            types: [{ description: 'JSON', accept: { 'application/json': ['.json'] } }],
          });
          const json = JSON.stringify(buildSnapshot(), null, 2);
          await writeToHandle(fileHandleRef.current, json);
          setAutoSave(true);
          localStorage.setItem('smart_pantry_autosave', 'true');
          setSaveStatus('saved');
          setTimeout(() => setSaveStatus(''), 2500);
        } catch {}
      }
    } else {
      setAutoSave(false);
      fileHandleRef.current = null;
      localStorage.setItem('smart_pantry_autosave', 'false');
    }
  }, [autoSave, buildSnapshot]);

  useEffect(() => {
    if (!autoSave || !fileHandleRef.current) return;
    const json = JSON.stringify({ version: 2, pantry: state, meals: { plans, people }, favorites, customRecipes }, null, 2);
    const timer = setTimeout(async () => {
      try { await writeToHandle(fileHandleRef.current, json); }
      catch { fileHandleRef.current = null; setAutoSave(false); localStorage.setItem('smart_pantry_autosave', 'false'); }
    }, 1500);
    return () => clearTimeout(timer);
  }, [state, plans, people, favorites, customRecipes, autoSave]);

  const weeklyUsage = useMemo(() => computeWeeklyUsage(plans, people), [plans, people]);

  const handleAddToShopping = (item) => {
    if (!state.shoppingList.some(s => s.kitchenId === item.kitchenId)) addShoppingItem(item);
  };

  const handleGuideClose = () => {
    setShowGuide(false);
    localStorage.setItem('smart_pantry_guide_seen', 'true');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Fixed top app bar */}
      <div
        className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-100"
        style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}
      >
        <div className="max-w-lg mx-auto h-14 px-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">🥦</span>
            <span className="text-base font-bold text-gray-900">Smart Pantry</span>
          </div>
          <button
            onClick={() => setShowGuide(true)}
            className="w-8 h-8 rounded-full bg-primary-50 text-primary-600 font-bold text-sm flex items-center justify-center hover:bg-primary-100 transition-colors"
            aria-label="Open guide"
          >
            ?
          </button>
        </div>
      </div>

      {/* Main content — offset by app bar height */}
      <main
        className="max-w-lg mx-auto min-h-screen flex flex-col"
        style={{ paddingTop: 'var(--app-bar-height)' }}
      >
        {tab === 'home' && (
          <HomePage
            kitchen={state.kitchen}
            shoppingList={state.shoppingList}
            getWeekPlan={getWeekPlan}
            people={people}
            weeklyUsage={weeklyUsage}
            onNavigate={setTab}
          />
        )}
        {tab === 'kitchen' && (
          <KitchenPage
            kitchen={state.kitchen}
            onAdd={addKitchenItem}
            onUpdate={updateKitchenItem}
            onRemove={removeKitchenItem}
            onAddToShopping={handleAddToShopping}
            weeklyUsage={weeklyUsage}
          />
        )}
        {tab === 'shopping' && (
          <ShoppingPage
            shoppingList={state.shoppingList}
            onToggle={toggleShoppingItem}
            onRemove={removeShoppingItem}
            onAdd={(item) => addShoppingItem(item)}
            onMoveToKitchen={moveCheckedToKitchen}
            onClearChecked={clearCheckedFromShopping}
            unitSystem={state.settings.unitSystem ?? 'us'}
          />
        )}
        {tab === 'meals' && (
          <RecipesPage
            kitchen={state.kitchen}
            addShoppingItem={addShoppingItem}
            shoppingList={state.shoppingList}
            people={people}
            getWeekPlan={getWeekPlan}
            setMeal={setMeal}
            clearWeek={clearWeek}
            setPeople={setPeople}
            unitSystem={state.settings.unitSystem ?? 'us'}
            excludeWater={state.settings.excludeWater ?? false}
            favorites={favorites}
            toggleFavorite={toggleFavorite}
            isFavorite={isFavorite}
            customRecipes={customRecipes}
            addCustomRecipe={addCustomRecipe}
            updateCustomRecipe={updateCustomRecipe}
            deleteCustomRecipe={deleteCustomRecipe}
          />
        )}
        {tab === 'settings' && (
          <SettingsPage
            household={state.household}
            settings={state.settings}
            onUpdateHousehold={updateHousehold}
            onUpdateSettings={updateSettings}
            onSave={handleSave}
            onLoad={handleLoad}
            autoSave={autoSave}
            onToggleAutoSave={handleToggleAutoSave}
            hasFsa={FSA_SUPPORTED}
            saveStatus={saveStatus}
          />
        )}
      </main>

      <NavBar active={tab} onChange={setTab} shoppingCount={state.shoppingList.filter(i => !i.checked).length} />

      {showGuide && <Guide onClose={handleGuideClose} />}
    </div>
  );
}
