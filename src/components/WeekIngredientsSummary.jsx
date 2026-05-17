import { X, CheckCircle, XCircle, ShoppingCart } from 'lucide-react';
import { scaleMeasure } from '../utils/mealdb';

const SLOTS = ['breakfast', 'lunch', 'dinner'];

function gatherIngredients(plan, people) {
  const factor = people / 2;
  const list = [];
  plan.forEach((day, dayIndex) => {
    SLOTS.forEach(slot => {
      const meal = day[slot];
      if (!meal) return;
      (meal.ingredients ?? []).forEach(({ name, measure }) => {
        list.push({
          name,
          measure: scaleMeasure(measure, factor),
          mealName: meal.mealName,
          dayIndex,
          slot,
        });
      });
    });
  });
  return list;
}

function isInKitchen(name, kitchen) {
  const lower = name.toLowerCase();
  return kitchen.some(item => {
    const kitchenName = (item.name ?? '').toLowerCase();
    return kitchenName.includes(lower) || lower.includes(kitchenName);
  });
}

export default function WeekIngredientsSummary({ plan, people, kitchen, onAddToShoppingList, onClose }) {
  const allIngredients = gatherIngredients(plan, people);

  const haveItems = allIngredients.filter(item => isInKitchen(item.name, kitchen));
  const needItems = allIngredients.filter(item => !isInKitchen(item.name, kitchen));

  const handleAddMissing = () => {
    needItems.forEach(item => {
      onAddToShoppingList({
        name: item.name,
        quantity: 1,
        unit: item.measure || 'as needed',
        category: 'Other',
        note: `For ${item.mealName}`,
      });
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40">
      <div className="w-full max-w-lg bg-white rounded-t-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-4 pt-4 pb-3 flex-shrink-0 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-bold text-gray-800">Week's Shopping</h2>
            <p className="text-xs text-gray-500 mt-0.5">Ingredients for {people} {people === 1 ? 'person' : 'people'}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-gray-400 hover:bg-gray-100 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-4 py-3">
          {allIngredients.length === 0 ? (
            <div className="text-center py-12 text-gray-400 text-sm">
              No meals planned yet. Add some meals to see your shopping list.
            </div>
          ) : (
            <>
              {/* Need items */}
              {needItems.length > 0 && (
                <div className="mb-4">
                  <h3 className="text-sm font-semibold text-gray-600 mb-2">
                    Need to buy ({needItems.length})
                  </h3>
                  <ul className="space-y-1.5">
                    {needItems.map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <XCircle size={16} className="text-red-400 flex-shrink-0 mt-0.5" />
                        <div className="min-w-0">
                          <span className="font-medium text-gray-800">{item.name}</span>
                          {item.measure && (
                            <span className="text-gray-500 ml-1">— {item.measure}</span>
                          )}
                          <span className="text-gray-400 text-xs ml-1">({item.mealName})</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Have items */}
              {haveItems.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-600 mb-2">
                    Already in kitchen ({haveItems.length})
                  </h3>
                  <ul className="space-y-1.5">
                    {haveItems.map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <CheckCircle size={16} className="text-emerald-500 flex-shrink-0 mt-0.5" />
                        <div className="min-w-0">
                          <span className="font-medium text-gray-700">{item.name}</span>
                          {item.measure && (
                            <span className="text-gray-400 ml-1">— {item.measure}</span>
                          )}
                          <span className="text-gray-400 text-xs ml-1">({item.mealName})</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          )}
        </div>

        {/* Sticky footer */}
        {needItems.length > 0 && (
          <div className="flex-shrink-0 px-4 py-3 border-t border-gray-100 bg-white">
            <button
              onClick={handleAddMissing}
              className="w-full flex items-center justify-center gap-2 bg-emerald-600 text-white py-3 rounded-xl font-semibold text-sm hover:bg-emerald-700 transition-colors"
            >
              <ShoppingCart size={18} />
              Add {needItems.length} missing ingredient{needItems.length !== 1 ? 's' : ''} to shopping list
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
