import { useState, useMemo } from 'react';
import { Plus, ShoppingBag, CheckCircle2, X } from 'lucide-react';
import ShoppingItemRow from '../components/ShoppingItemRow';
import Modal from '../components/Modal';
import { CATEGORIES, UNITS } from '../data/library';
import { getStoreSection, SECTION_ORDER } from '../utils/storeCategories';

export default function ShoppingPage({
  shoppingList,
  onToggle,
  onRemove,
  onAdd,
  onMoveToKitchen,
  onClearChecked,
  unitSystem = 'us',
}) {
  const [shoppingMode, setShoppingMode] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newItem, setNewItem] = useState({ name: '', unit: 'item(s)', category: 'Other' });

  const unchecked = useMemo(() => shoppingList.filter(i => !i.checked), [shoppingList]);
  const checked = useMemo(() => shoppingList.filter(i => i.checked), [shoppingList]);
  const checkedCount = checked.length;

  const grouped = useMemo(() => {
    const groups = {};
    unchecked.forEach(item => {
      const section = getStoreSection(item.name);
      if (!groups[section]) groups[section] = [];
      groups[section].push(item);
    });
    return SECTION_ORDER
      .filter(s => groups[s])
      .map(s => [s, groups[s]]);
  }, [unchecked]);

  const handleMoveToKitchen = () => {
    onMoveToKitchen();
    setShoppingMode(false);
  };

  const handleAddItem = () => {
    if (!newItem.name.trim()) return;
    onAdd({ name: newItem.name.trim(), unit: newItem.unit, category: newItem.category });
    setNewItem({ name: '', unit: 'item(s)', category: 'Other' });
    setShowAddModal(false);
  };

  const inputClass = 'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500';

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-4 pt-12 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Shopping List</h1>
            <p className="text-sm text-gray-400">
              {shoppingList.length === 0
                ? 'All stocked up!'
                : `${unchecked.length} item${unchecked.length !== 1 ? 's' : ''} to buy`}
            </p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-md hover:bg-emerald-700"
          >
            <Plus size={22} />
          </button>
        </div>

        {/* Shopping mode toggle */}
        {shoppingList.length > 0 && (
          <div className="mt-3">
            {!shoppingMode ? (
              <button
                onClick={() => setShoppingMode(true)}
                className="w-full py-2.5 rounded-xl bg-emerald-600 text-white font-semibold text-sm flex items-center justify-center gap-2 hover:bg-emerald-700"
              >
                <ShoppingBag size={18} /> Start Shopping
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={() => setShoppingMode(false)}
                  className="flex-1 py-2.5 rounded-xl border border-gray-300 text-gray-600 font-medium text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={handleMoveToKitchen}
                  disabled={checkedCount === 0}
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 text-white font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-40 hover:bg-emerald-700 disabled:hover:bg-emerald-600"
                >
                  <CheckCircle2 size={16} />
                  Move to Kitchen {checkedCount > 0 && `(${checkedCount})`}
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto pb-24">
        {shoppingList.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center px-6">
            <div className="w-16 h-16 rounded-2xl bg-emerald-50 flex items-center justify-center mb-4">
              <span className="text-3xl">🛒</span>
            </div>
            <h3 className="font-semibold text-gray-700 mb-1">Nothing to buy</h3>
            <p className="text-sm text-gray-400">
              Items will appear here automatically when your kitchen stock runs low, or you can add them manually.
            </p>
          </div>
        ) : (
          <div className="px-4 py-4 space-y-4">
            {/* Unchecked items, grouped by category */}
            {grouped.map(([cat, items]) => (
              <div key={cat}>
                {grouped.length > 1 && (
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 ml-1">{cat}</p>
                )}
                <div className="space-y-2">
                  {items.map(item => (
                    <ShoppingItemRow
                      key={item.id}
                      item={item}
                      onToggle={onToggle}
                      onRemove={onRemove}
                      shoppingMode={shoppingMode}
                      unitSystem={unitSystem}
                    />
                  ))}
                </div>
              </div>
            ))}

            {/* Checked items */}
            {shoppingMode && checked.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-2 ml-1">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    In Cart ({checkedCount})
                  </p>
                </div>
                <div className="space-y-2">
                  {checked.map(item => (
                    <ShoppingItemRow
                      key={item.id}
                      item={item}
                      onToggle={onToggle}
                      onRemove={onRemove}
                      shoppingMode={shoppingMode}
                      unitSystem={unitSystem}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Add item modal */}
      {showAddModal && (
        <Modal
          title="Add to Shopping List"
          onClose={() => setShowAddModal(false)}
          footer={
            <>
              <button onClick={() => setShowAddModal(false)} className="flex-1 py-2.5 rounded-xl border border-gray-300 text-sm font-medium text-gray-600">
                Cancel
              </button>
              <button onClick={handleAddItem} className="flex-1 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700">
                Add Item
              </button>
            </>
          }
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Item Name</label>
              <input
                autoFocus
                className={inputClass}
                placeholder="e.g. Milk"
                value={newItem.name}
                onChange={(e) => setNewItem(f => ({ ...f, name: e.target.value }))}
                onKeyDown={(e) => e.key === 'Enter' && handleAddItem()}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
                <select className={inputClass} value={newItem.unit} onChange={(e) => setNewItem(f => ({ ...f, unit: e.target.value }))}>
                  {UNITS.map(u => <option key={u}>{u}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select className={inputClass} value={newItem.category} onChange={(e) => setNewItem(f => ({ ...f, category: e.target.value }))}>
                  {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
