import { useState, useEffect, useRef, useCallback } from 'react';
import NavBar from './components/NavBar';
import KitchenPage from './pages/KitchenPage';
import ShoppingPage from './pages/ShoppingPage';
import AnalyticsPage from './pages/AnalyticsPage';
import SettingsPage from './pages/SettingsPage';
import RecipesPage from './pages/RecipesPage';
import { usePantry } from './hooks/usePantry';
import { useWeeklyPlan } from './hooks/useWeeklyPlan';
import { useFavorites } from './hooks/useFavorites';
import { useCustomRecipes } from './hooks/useCustomRecipes';

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
  const [tab, setTab] = useState('kitchen');
  const [saveStatus, setSaveStatus] = useState(''); // 'saved' | 'imported' | 'error' | ''
  const [autoSave, setAutoSave] = useState(() => {
    try { return JSON.parse(localStorage.getItem('smart_pantry_autosave') ?? 'false'); } catch { return false; }
  });
  const fileHandleRef = useRef(null);

  const {
    state,
    addKitchenItem,
    updateKitchenItem,
    removeKitchenItem,
    addShoppingItem,
    toggleShoppingItem,
    removeShoppingItem,
    clearCheckedFromShopping,
    moveCheckedToKitchen,
    updateHousehold,
    updateSettings,
    importState,
  } = usePantry();

  const {
    getWeekPlan,
    setMeal,
    clearWeek,
    people,
    setPeople,
    plans,
    importPlans,
  } = useWeeklyPlan();

  const { favorites, toggleFavorite, isFavorite, importFavorites } = useFavorites();

  const {
    recipes: customRecipes,
    addRecipe: addCustomRecipe,
    updateRecipe: updateCustomRecipe,
    deleteRecipe: deleteCustomRecipe,
    importRecipes,
  } = useCustomRecipes();

  const buildSnapshot = useCallback(() => ({
    version: 2,
    pantry: state,
    meals: { plans, people },
    favorites,
    customRecipes,
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
        try {
          handleImportAll(JSON.parse(ev.target.result));
        } catch {
          setSaveStatus('error');
          setTimeout(() => setSaveStatus(''), 3000);
        }
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
        } catch (e) {
          // User cancelled picker — don't enable auto-save
        }
      }
    } else {
      setAutoSave(false);
      fileHandleRef.current = null;
      localStorage.setItem('smart_pantry_autosave', 'false');
    }
  }, [autoSave, buildSnapshot]);

  // Debounced auto-save
  useEffect(() => {
    if (!autoSave || !fileHandleRef.current) return;
    const snapshot = {
      version: 2,
      pantry: state,
      meals: { plans, people },
      favorites,
      customRecipes,
    };
    const json = JSON.stringify(snapshot, null, 2);
    const timer = setTimeout(async () => {
      try {
        await writeToHandle(fileHandleRef.current, json);
      } catch {
        // Handle may have been revoked; clear it so next save re-picks
        fileHandleRef.current = null;
        setAutoSave(false);
        localStorage.setItem('smart_pantry_autosave', 'false');
      }
    }, 1500);
    return () => clearTimeout(timer);
  }, [state, plans, people, favorites, customRecipes, autoSave]);

  const handleAddToShopping = (item) => {
    const alreadyOnList = state.shoppingList.some(s => s.kitchenId === item.kitchenId);
    if (!alreadyOnList) addShoppingItem(item);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-lg mx-auto min-h-screen flex flex-col">
        {tab === 'kitchen' && (
          <KitchenPage
            kitchen={state.kitchen}
            onAdd={addKitchenItem}
            onUpdate={updateKitchenItem}
            onRemove={removeKitchenItem}
            onAddToShopping={handleAddToShopping}
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
            favorites={favorites}
            toggleFavorite={toggleFavorite}
            isFavorite={isFavorite}
            customRecipes={customRecipes}
            addCustomRecipe={addCustomRecipe}
            updateCustomRecipe={updateCustomRecipe}
            deleteCustomRecipe={deleteCustomRecipe}
          />
        )}
        {tab === 'analytics' && (
          <AnalyticsPage
            kitchen={state.kitchen}
            shoppingList={state.shoppingList}
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

      <NavBar
        active={tab}
        onChange={setTab}
        shoppingCount={state.shoppingList.length}
      />
    </div>
  );
}
