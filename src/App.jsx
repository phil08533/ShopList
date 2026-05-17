import { useState } from 'react';
import NavBar from './components/NavBar';
import KitchenPage from './pages/KitchenPage';
import ShoppingPage from './pages/ShoppingPage';
import AnalyticsPage from './pages/AnalyticsPage';
import SettingsPage from './pages/SettingsPage';
import RecipesPage from './pages/RecipesPage';
import { usePantry } from './hooks/usePantry';
import { useWeeklyPlan } from './hooks/useWeeklyPlan';

export default function App() {
  const [tab, setTab] = useState('kitchen');
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
    plan,
    people,
    setMeal,
    clearDay,
    clearAll,
    setPeople,
  } = useWeeklyPlan();

  const handleAddToShopping = (item) => {
    const alreadyOnList = state.shoppingList.some(s => s.kitchenId === item.kitchenId);
    if (!alreadyOnList) {
      addShoppingItem(item);
    }
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
          />
        )}
        {tab === 'meals' && (
          <RecipesPage
            kitchen={state.kitchen}
            addShoppingItem={addShoppingItem}
            shoppingList={state.shoppingList}
            people={people}
            plan={plan}
            setMeal={setMeal}
            clearAll={clearAll}
            setPeople={setPeople}
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
            onImport={importState}
            fullState={state}
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
