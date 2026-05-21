import { Pencil, Trash2, ShoppingCart, Plus, Minus } from 'lucide-react';
import { stockStatus, daysRemaining, formatDaysRemaining, mealPlanWeeksRemaining, formatWeeksRemaining } from '../utils/prediction';

const STATUS_STYLES = {
  good:     { dot: 'bg-emerald-500', badge: 'bg-emerald-50 text-emerald-700',  bar: '' },
  low:      { dot: 'bg-amber-400',   badge: 'bg-amber-50 text-amber-700',      bar: 'bg-amber-400' },
  critical: { dot: 'bg-red-500',     badge: 'bg-red-50 text-red-600',          bar: 'bg-red-500' },
};

export default function InventoryCard({ item, onEdit, onRemove, onAddToShopping, onAdjustQty, mealUsage }) {
  const status = stockStatus(item, mealUsage);
  const styles = STATUS_STYLES[status];

  const weeksLeft = mealPlanWeeksRemaining(item, mealUsage);
  const badgeLabel = weeksLeft !== null
    ? formatWeeksRemaining(weeksLeft)
    : formatDaysRemaining(daysRemaining(item));
  const showBadge = badgeLabel && badgeLabel !== '—';

  const subText = mealUsage?.meals?.length > 0
    ? `In meals: ${mealUsage.meals.slice(0, 2).join(', ')}${mealUsage.meals.length > 2 ? ` +${mealUsage.meals.length - 2}` : ''}`
    : item.category;

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="flex">
        <div className={`w-1 flex-shrink-0 ${styles.bar}`} />
        <div className="flex-1 px-3 py-2.5 space-y-1.5">

          {/* Row 1: name + qty controls + badge */}
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm text-gray-900 flex-1 truncate">{item.name}</span>
            <div className="flex items-center gap-1 flex-shrink-0">
              <button
                onClick={() => onAdjustQty(item.id, Math.max(0, item.quantity - 1))}
                className="w-6 h-6 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 transition-colors"
              >
                <Minus size={11} />
              </button>
              <span className="text-xs font-semibold text-gray-800 min-w-[52px] text-center">
                {item.quantity} <span className="font-normal text-gray-400">{item.unit}</span>
              </span>
              <button
                onClick={() => onAdjustQty(item.id, item.quantity + 1)}
                className="w-6 h-6 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 transition-colors"
              >
                <Plus size={11} />
              </button>
            </div>
            {showBadge && (
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full flex-shrink-0 ${styles.badge}`}>
                {badgeLabel}
              </span>
            )}
          </div>

          {/* Row 2: info text + action icons */}
          <div className="flex items-center gap-1">
            <span className="text-xs text-gray-400 flex-1 truncate">{subText}</span>
            <button
              onClick={() => onAddToShopping(item)}
              className="p-1.5 rounded-lg text-primary-600 hover:bg-primary-50 transition-colors"
              title="Add to shopping list"
            >
              <ShoppingCart size={14} />
            </button>
            <button
              onClick={() => onEdit(item)}
              className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 transition-colors"
              title="Edit"
            >
              <Pencil size={14} />
            </button>
            <button
              onClick={() => onRemove(item.id)}
              className="p-1.5 rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors"
              title="Delete"
            >
              <Trash2 size={14} />
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
