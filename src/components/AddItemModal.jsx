import { useState, useEffect, useRef } from 'react';
import Modal from './Modal';
import { CATEGORIES, UNITS, searchLibrary } from '../data/library';

const today = () => new Date().toISOString().split('T')[0];

const EMPTY = {
  name: '',
  quantity: 1,
  unit: 'item(s)',
  category: 'Other',
  usageDays: 7,
  threshold: 1,
  lastPurchased: today(),
};

export default function AddItemModal({ onClose, onSave, initial }) {
  const [form, setForm] = useState(initial ? { ...initial } : { ...EMPTY });
  const [query, setQuery] = useState(initial?.name ?? '');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const nameRef = useRef(null);

  useEffect(() => {
    nameRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!initial) {
      const results = searchLibrary(query);
      setSuggestions(results);
      setShowSuggestions(results.length > 0 && query.length > 0);
    }
  }, [query, initial]);

  const set = (field, value) => setForm(f => ({ ...f, [field]: value }));

  const applyLibraryItem = (lib) => {
    setForm(f => ({
      ...f,
      name: lib.name,
      category: lib.category,
      unit: lib.unit,
      usageDays: lib.usageDays,
      threshold: lib.threshold,
    }));
    setQuery(lib.name);
    setShowSuggestions(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    onSave({ ...form, name: form.name.trim(), quantity: Number(form.quantity), usageDays: Number(form.usageDays), threshold: Number(form.threshold) });
    onClose();
  };

  const labelClass = 'block text-sm font-medium text-gray-700 mb-1';
  const inputClass = 'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500';

  return (
    <Modal
      title={initial ? 'Edit Item' : 'Add Item'}
      onClose={onClose}
      footer={
        <>
          <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-gray-300 text-sm font-medium text-gray-600">
            Cancel
          </button>
          <button type="submit" form="add-item-form" className="flex-1 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700">
            {initial ? 'Save Changes' : 'Add to Pantry'}
          </button>
        </>
      }
    >
      <form id="add-item-form" onSubmit={handleSubmit} className="space-y-4">
        {/* Name with search */}
        <div className="relative">
          <label className={labelClass}>Item Name</label>
          <input
            ref={nameRef}
            className={inputClass}
            placeholder="Search or type item name..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              set('name', e.target.value);
            }}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
            autoComplete="off"
            required
          />
          {showSuggestions && (
            <ul className="absolute z-10 w-full bg-white border border-gray-200 rounded-xl mt-1 shadow-lg max-h-44 overflow-y-auto">
              {suggestions.map((s) => (
                <li key={s.name}>
                  <button
                    type="button"
                    onMouseDown={() => applyLibraryItem(s)}
                    className="w-full text-left px-4 py-2.5 hover:bg-emerald-50 text-sm flex items-center justify-between"
                  >
                    <span className="font-medium">{s.name}</span>
                    <span className="text-xs text-gray-400">{s.category}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Quantity + Unit */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>Quantity</label>
            <input
              type="number" min="0" step="0.5"
              className={inputClass}
              value={form.quantity}
              onChange={(e) => set('quantity', e.target.value)}
              required
            />
          </div>
          <div>
            <label className={labelClass}>Unit</label>
            <select className={inputClass} value={form.unit} onChange={(e) => set('unit', e.target.value)}>
              {UNITS.map(u => <option key={u}>{u}</option>)}
            </select>
          </div>
        </div>

        {/* Category */}
        <div>
          <label className={labelClass}>Category</label>
          <select className={inputClass} value={form.category} onChange={(e) => set('category', e.target.value)}>
            {CATEGORIES.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>

        {/* Usage + Threshold */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>Usage Rate (days)</label>
            <input
              type="number" min="1"
              className={inputClass}
              value={form.usageDays}
              onChange={(e) => set('usageDays', e.target.value)}
            />
            <p className="text-xs text-gray-400 mt-1">How long one unit lasts</p>
          </div>
          <div>
            <label className={labelClass}>Low-Stock Alert</label>
            <input
              type="number" min="0" step="0.5"
              className={inputClass}
              value={form.threshold}
              onChange={(e) => set('threshold', e.target.value)}
            />
            <p className="text-xs text-gray-400 mt-1">Alert when qty ≤ this</p>
          </div>
        </div>

        {/* Last Purchased */}
        <div>
          <label className={labelClass}>Last Purchased</label>
          <input
            type="date"
            className={inputClass}
            value={form.lastPurchased ?? ''}
            onChange={(e) => set('lastPurchased', e.target.value)}
          />
        </div>
      </form>
    </Modal>
  );
}
