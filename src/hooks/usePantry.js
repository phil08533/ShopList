import { useState, useEffect, useCallback } from 'react';
import { loadState, saveState } from '../utils/storage';
import { needsPurchase } from '../utils/prediction';

export function usePantry() {
  const [state, setState] = useState(() => loadState());

  // Persist to localStorage whenever state changes
  useEffect(() => {
    saveState(state);
  }, [state]);

  // Auto-sync: move low items to shopping list
  useEffect(() => {
    setState(prev => {
      if (!prev.settings.autoAddThreshold) return prev;
      let changed = false;
      let shoppingList = [...prev.shoppingList];

      for (const item of prev.kitchen) {
        const alreadyOnList = shoppingList.some(s => s.kitchenId === item.id);
        if (needsPurchase(item) && !alreadyOnList) {
          shoppingList = [...shoppingList, {
            id: prev.nextId,
            kitchenId: item.id,
            name: item.name,
            quantity: item.quantity,
            unit: item.unit,
            category: item.category,
            checked: false,
            autoAdded: true,
          }];
          changed = true;
        }
      }
      if (!changed) return prev;
      return { ...prev, shoppingList, nextId: prev.nextId + (shoppingList.length - prev.shoppingList.length) };
    });
  }, [state.kitchen, state.settings.autoAddThreshold]);

  const nextId = useCallback(() => {
    let id;
    setState(prev => {
      id = prev.nextId;
      return { ...prev, nextId: prev.nextId + 1 };
    });
    // Return a stable ref via closure
    return state.nextId;
  }, [state.nextId]);

  // Kitchen actions
  const addKitchenItem = useCallback((item) => {
    setState(prev => ({
      ...prev,
      kitchen: [...prev.kitchen, { ...item, id: prev.nextId }],
      nextId: prev.nextId + 1,
    }));
  }, []);

  const updateKitchenItem = useCallback((id, updates) => {
    setState(prev => ({
      ...prev,
      kitchen: prev.kitchen.map(i => i.id === id ? { ...i, ...updates } : i),
    }));
  }, []);

  const removeKitchenItem = useCallback((id) => {
    setState(prev => ({
      ...prev,
      kitchen: prev.kitchen.filter(i => i.id !== id),
      shoppingList: prev.shoppingList.filter(s => s.kitchenId !== id),
    }));
  }, []);

  // Shopping list actions
  const addShoppingItem = useCallback((item) => {
    setState(prev => ({
      ...prev,
      shoppingList: [...prev.shoppingList, { ...item, id: prev.nextId, checked: false }],
      nextId: prev.nextId + 1,
    }));
  }, []);

  const toggleShoppingItem = useCallback((id) => {
    setState(prev => ({
      ...prev,
      shoppingList: prev.shoppingList.map(i => i.id === id ? { ...i, checked: !i.checked } : i),
    }));
  }, []);

  const removeShoppingItem = useCallback((id) => {
    setState(prev => ({
      ...prev,
      shoppingList: prev.shoppingList.filter(i => i.id !== id),
    }));
  }, []);

  const clearCheckedFromShopping = useCallback(() => {
    setState(prev => ({
      ...prev,
      shoppingList: prev.shoppingList.filter(i => !i.checked),
    }));
  }, []);

  /**
   * "Move to Kitchen" — takes all checked shopping items:
   * - If they have a kitchenId, update the kitchen item quantity + lastPurchased
   * - Otherwise add a new kitchen item
   * - Remove the checked shopping items
   */
  const moveCheckedToKitchen = useCallback(() => {
    setState(prev => {
      const checked = prev.shoppingList.filter(i => i.checked);
      const unchecked = prev.shoppingList.filter(i => !i.checked);
      let kitchen = [...prev.kitchen];
      let nextId = prev.nextId;
      const today = new Date().toISOString().split('T')[0];

      for (const shopItem of checked) {
        if (shopItem.kitchenId) {
          kitchen = kitchen.map(k =>
            k.id === shopItem.kitchenId
              ? { ...k, lastPurchased: today, quantity: shopItem.restockQty ?? k.quantity }
              : k
          );
        } else {
          kitchen = [...kitchen, {
            id: nextId++,
            name: shopItem.name,
            quantity: shopItem.restockQty ?? 1,
            unit: shopItem.unit ?? 'item(s)',
            category: shopItem.category ?? 'Other',
            usageDays: shopItem.usageDays ?? 7,
            threshold: 0,
            lastPurchased: today,
          }];
        }
      }
      return { ...prev, kitchen, shoppingList: unchecked, nextId };
    });
  }, []);

  const updateShoppingItem = useCallback((id, updates) => {
    setState(prev => ({
      ...prev,
      shoppingList: prev.shoppingList.map(i => i.id === id ? { ...i, ...updates } : i),
    }));
  }, []);

  const updateHousehold = useCallback((updates) => {
    setState(prev => ({ ...prev, household: { ...prev.household, ...updates } }));
  }, []);

  const updateSettings = useCallback((updates) => {
    setState(prev => ({ ...prev, settings: { ...prev.settings, ...updates } }));
  }, []);

  const importState = useCallback((newState) => {
    setState({ ...loadState(), ...newState });
  }, []);

  return {
    state,
    addKitchenItem,
    updateKitchenItem,
    removeKitchenItem,
    addShoppingItem,
    toggleShoppingItem,
    removeShoppingItem,
    clearCheckedFromShopping,
    moveCheckedToKitchen,
    updateShoppingItem,
    updateHousehold,
    updateSettings,
    importState,
  };
}
