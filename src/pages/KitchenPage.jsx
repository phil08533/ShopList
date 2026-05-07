import { useState, useMemo } from 'react';
import { Plus, Search, SlidersHorizontal, X } from 'lucide-react';
import InventoryCard from '../components/InventoryCard';
import AddItemModal from '../components/AddItemModal';
import { CATEGORIES } from '../data/library';
import { stockStatus } from '../utils/prediction';

export default function KitchenPage({
  kitchen,
  onAdd,
  onUpdate,
  onRemove,
  onAddToShopping,
}) {
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [showFilters, setShowFilters] = useState(false);

  const filtered = useMemo(() => {
    let items = kitchen;
    if (search.trim()) {
      const q = search.toLowerCase();
      items = items.filter(i => i.name.toLowerCase().includes(q));
    }
    if (filterCat !== 'All') items = items.filter(i => i.category === filterCat);
    if (filterStatus === 'Low') items = items.filter(i => stockStatus(i) === 'low');
    if (filterStatus === 'Critical') items = items.filter(i => stockStatus(i) === 'critical');
    if (filterStatus === 'Good') items = items.filter(i => stockStatus(i) === 'good');
    return items;
  }, [kitchen, search, filterCat, filterStatus]);

  const usedCategories = useMemo(() => {
    const cats = [...new Set(kitchen.map(i => i.category))].sort();
    return ['All', ...cats];
  }, [kitchen]);

  const handleSave = (item) => {
    if (editItem) {
      onUpdate(editItem.id, item);
    } else {
      onAdd(item);
    }
    setEditItem(null);
  };

  const handleEdit = (item) => {
    setEditItem(item);
    setShowModal(true);
  };

  const handleAddToShopping = (item) => {
    onAddToShopping({
      kitchenId: item.id,
      name: item.name,
      quantity: item.quantity,
      unit: item.unit,
      category: item.category,
    });
  };

  const criticalCount = kitchen.filter(i => stockStatus(i) === 'critical').length;
  const lowCount = kitchen.filter(i => stockStatus(i) === 'low').length;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-4 pt-12 pb-3">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Kitchen</h1>
            <p className="text-sm text-gray-400">{kitchen.length} items tracked</p>
          </div>
          <button
            onClick={() => { setEditItem(null); setShowModal(true); }}
            className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-md hover:bg-emerald-700"
          >
            <Plus size={22} />
          </button>
        </div>

        {/* Status summary pills */}
        {(criticalCount > 0 || lowCount > 0) && (
          <div className="flex gap-2 mb-3">
            {criticalCount > 0 && (
              <button
                onClick={() => setFilterStatus(s => s === 'Critical' ? 'All' : 'Critical')}
                className={`text-xs px-3 py-1 rounded-full font-medium transition-colors ${filterStatus === 'Critical' ? 'bg-red-500 text-white' : 'bg-red-50 text-red-600'}`}
              >
                {criticalCount} critical
              </button>
            )}
            {lowCount > 0 && (
              <button
                onClick={() => setFilterStatus(s => s === 'Low' ? 'All' : 'Low')}
                className={`text-xs px-3 py-1 rounded-full font-medium transition-colors ${filterStatus === 'Low' ? 'bg-amber-500 text-white' : 'bg-amber-50 text-amber-700'}`}
              >
                {lowCount} running low
              </button>
            )}
          </div>
        )}

        {/* Search */}
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              className="w-full bg-gray-100 rounded-xl pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="Search items..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                <X size={14} />
              </button>
            )}
          </div>
          <button
            onClick={() => setShowFilters(f => !f)}
            className={`p-2 rounded-xl transition-colors ${showFilters ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}
          >
            <SlidersHorizontal size={18} />
          </button>
        </div>

        {/* Filter row */}
        {showFilters && (
          <div className="flex gap-2 mt-2 overflow-x-auto pb-1 scrollbar-hide">
            {usedCategories.map(cat => (
              <button
                key={cat}
                onClick={() => setFilterCat(cat)}
                className={`flex-shrink-0 text-xs px-3 py-1 rounded-full font-medium transition-colors ${
                  filterCat === cat
                    ? 'bg-emerald-600 text-white'
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Items grid */}
      <div className="flex-1 overflow-y-auto px-4 py-4 pb-24">
        {kitchen.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-2xl bg-emerald-50 flex items-center justify-center mb-4">
              <span className="text-3xl">🥦</span>
            </div>
            <h3 className="font-semibold text-gray-700 mb-1">Your kitchen is empty</h3>
            <p className="text-sm text-gray-400 max-w-xs">
              Tap the + button to add your first item, or search from the built-in library of 100+ common foods.
            </p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400 text-sm">
            No items match your search
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {filtered.map(item => (
              <InventoryCard
                key={item.id}
                item={item}
                onEdit={handleEdit}
                onRemove={onRemove}
                onAddToShopping={handleAddToShopping}
                onAdjustQty={(id, qty) => onUpdate(id, { quantity: qty })}
              />
            ))}
          </div>
        )}
      </div>

      {(showModal) && (
        <AddItemModal
          initial={editItem}
          onClose={() => { setShowModal(false); setEditItem(null); }}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
