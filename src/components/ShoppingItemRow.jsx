import { Trash2 } from 'lucide-react';

export default function ShoppingItemRow({ item, onToggle, onRemove, shoppingMode }) {
  return (
    <div
      className={`flex items-center gap-3 bg-white rounded-xl px-4 py-3 border transition-colors ${
        item.checked ? 'border-emerald-200 bg-emerald-50' : 'border-gray-200'
      }`}
    >
      {shoppingMode ? (
        <button
          onClick={() => onToggle(item.id)}
          className={`w-6 h-6 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-colors ${
            item.checked
              ? 'bg-emerald-500 border-emerald-500 text-white'
              : 'border-gray-300'
          }`}
        >
          {item.checked && (
            <svg viewBox="0 0 10 8" fill="none" className="w-3 h-3">
              <path d="M1 4l3 3 5-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </button>
      ) : (
        <div className="w-6 h-6 rounded-full border-2 border-gray-200 flex-shrink-0" />
      )}

      <div className="flex-1 min-w-0">
        <p className={`font-medium text-sm ${item.checked ? 'line-through text-gray-400' : 'text-gray-900'}`}>
          {item.name}
        </p>
        {item.category && (
          <p className="text-xs text-gray-400">{item.category}</p>
        )}
      </div>

      {item.autoAdded && (
        <span className="text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full font-medium flex-shrink-0">
          Auto
        </span>
      )}

      {!shoppingMode && (
        <button onClick={() => onRemove(item.id)} className="p-1.5 text-gray-300 hover:text-red-400">
          <Trash2 size={15} />
        </button>
      )}
    </div>
  );
}
