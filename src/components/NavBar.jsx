import { ShoppingCart, Package2, BarChart2, Settings, UtensilsCrossed } from 'lucide-react';

const tabs = [
  { id: 'kitchen', label: 'Pantry', Icon: Package2 },
  { id: 'meals',   label: 'Meals',   Icon: UtensilsCrossed },
  { id: 'shopping', label: 'Shopping', Icon: ShoppingCart },
  { id: 'analytics', label: 'Analytics', Icon: BarChart2 },
  { id: 'settings', label: 'Settings', Icon: Settings },
];

export default function NavBar({ active, onChange, shoppingCount }) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 flex">
      {tabs.map(({ id, label, Icon }) => {
        const isActive = active === id;
        return (
          <button
            key={id}
            onClick={() => onChange(id)}
            className={`flex-1 flex flex-col items-center py-2 gap-0.5 text-xs font-medium transition-colors ${
              isActive ? 'text-emerald-600' : 'text-gray-400'
            }`}
          >
            <div className="relative">
              <Icon size={22} strokeWidth={isActive ? 2.5 : 1.8} />
              {id === 'shopping' && shoppingCount > 0 && (
                <span className="absolute -top-1.5 -right-2 bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[16px] h-4 flex items-center justify-center px-1">
                  {shoppingCount > 99 ? '99+' : shoppingCount}
                </span>
              )}
            </div>
            <span>{label}</span>
          </button>
        );
      })}
    </nav>
  );
}
