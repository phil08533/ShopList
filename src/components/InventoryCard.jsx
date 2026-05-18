import { Pencil, Trash2, ShoppingCart, Plus, Minus } from 'lucide-react';
import { stockStatus, daysRemaining, formatDaysRemaining, mealPlanWeeksRemaining, formatWeeksRemaining } from '../utils/prediction';

const STATUS_STYLES = {
  good:     { dot: 'bg-emerald-500', badge: 'bg-emerald-50 text-emerald-700', border: 'border-emerald-100' },
  low:      { dot: 'bg-amber-400',   badge: 'bg-amber-50 text-amber-700',     border: 'border-amber-200' },
  critical: { dot: 'bg-red-500',     badge: 'bg-red-50 text-red-600',         border: 'border-red-200' },
};

export default function InventoryCard({ item, onEdit, onRemove, onAddToShopping, onAdjustQty, mealUsage }) {
  const status = stockStatus(item, mealUsage);
  const styles = STATUS_STYLES[status];

  const weeksLeft = mealPlanWeeksRemaining(item, mealUsage);
  const badgeLabel = weeksLeft !== null
    ? formatWeeksRemaining(weeksLeft)
    : formatDaysRemaining(daysRemaining(item));

  return (
    <div className={`bg-white rounded-2xl border ${styles.border} p-4 shadow-sm flex flex-col gap-3`}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${styles.dot}`} />
          <div className="min-w-0">
            <p className="font-semibold text-gray-900 truncate">{item.name}</p>
            <p className="text-xs text-gray-400">{item.category}</p>
          </div>
        </div>
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full flex-shrink-0 ${styles.badge}`}>
          {badgeLabel}
        </span>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => onAdjustQty(item.id, Math.max(0, item.quantity - 1))}
          className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600"
        >
          <Minus size={13} />
        </button>
        <span className="flex-1 text-center text-sm font-semibold text-gray-800">
          {item.quantity} <span className="font-normal text-gray-400">{item.unit}</span>
        </span>
        <button
          onClick={() => onAdjustQty(item.id, item.quantity + 1)}
          className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600"
        >
          <Plus size={13} />
        </button>
      </div>

      <div className="text-xs text-gray-400 truncate min-h-[16px]">
        {mealUsage?.meals?.length > 0
          ? `In meals: ${mealUsage.meals.join(', ')}`
          : `Alert ≤ ${item.threshold} ${item.unit}`
        }
      </div>

      <div className="flex gap-2 pt-1 border-t border-gray-50">
        <button
          onClick={() => onAddToShopping(item)}
          className="flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-medium rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
        >
          <ShoppingCart size={13} /> Add to List
        </button>
        <button onClick={() => onEdit(item)} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100">
          <Pencil size={15} />
        </button>
        <button onClick={() => onRemove(item.id)} className="p-1.5 rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-500">
          <Trash2 size={15} />
        </button>
      </div>
    </div>
  );
}
