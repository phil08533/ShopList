import { useMemo } from 'react';
import { stockStatus, daysRemaining } from '../utils/prediction';
import { CATEGORIES } from '../data/library';

export default function AnalyticsPage({ kitchen, shoppingList }) {
  const stats = useMemo(() => {
    const total = kitchen.length;
    const critical = kitchen.filter(i => stockStatus(i) === 'critical').length;
    const low = kitchen.filter(i => stockStatus(i) === 'low').length;
    const good = kitchen.filter(i => stockStatus(i) === 'good').length;

    const byCategory = {};
    for (const item of kitchen) {
      if (!byCategory[item.category]) byCategory[item.category] = { total: 0, critical: 0, low: 0, good: 0 };
      byCategory[item.category].total++;
      byCategory[item.category][stockStatus(item)]++;
    }

    const soonestDepletion = kitchen
      .map(i => ({ ...i, days: daysRemaining(i) }))
      .filter(i => i.days !== null)
      .sort((a, b) => a.days - b.days)
      .slice(0, 5);

    return { total, critical, low, good, byCategory, soonestDepletion };
  }, [kitchen]);

  const StatCard = ({ label, value, color }) => (
    <div className={`rounded-2xl p-4 ${color}`}>
      <p className="text-3xl font-bold">{value}</p>
      <p className="text-sm opacity-80 mt-0.5">{label}</p>
    </div>
  );

  return (
    <div className="flex flex-col h-full">
      <div className="bg-white border-b border-gray-100 px-4 pt-12 pb-4">
        <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
        <p className="text-sm text-gray-400">Kitchen snapshot</p>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 pb-24 space-y-6">
        {/* Summary cards */}
        <div className="grid grid-cols-2 gap-3">
          <StatCard label="Total Items" value={stats.total} color="bg-gray-50 text-gray-700" />
          <StatCard label="Well Stocked" value={stats.good} color="bg-emerald-50 text-emerald-700" />
          <StatCard label="Running Low" value={stats.low} color="bg-amber-50 text-amber-700" />
          <StatCard label="Need Restock" value={stats.critical} color="bg-red-50 text-red-600" />
        </div>

        {/* Shopping list */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4">
          <p className="font-semibold text-gray-800 mb-1">Shopping List</p>
          <p className="text-3xl font-bold text-emerald-600">{shoppingList.length}</p>
          <p className="text-sm text-gray-400 mt-0.5">
            {shoppingList.filter(i => i.autoAdded).length} auto-added
          </p>
        </div>

        {/* Soonest depletion */}
        {stats.soonestDepletion.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 p-4">
            <p className="font-semibold text-gray-800 mb-3">Depleting Soon</p>
            <div className="space-y-3">
              {stats.soonestDepletion.map(item => {
                const status = stockStatus(item);
                const barColor = status === 'critical' ? 'bg-red-400' : status === 'low' ? 'bg-amber-400' : 'bg-emerald-400';
                const pct = Math.max(0, Math.min(100, (item.days / item.usageDays) * 100));
                return (
                  <div key={item.id}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="font-medium text-gray-800">{item.name}</span>
                      <span className={`text-xs font-medium ${status === 'critical' ? 'text-red-500' : status === 'low' ? 'text-amber-600' : 'text-emerald-600'}`}>
                        {item.days < 0 ? 'Overdue' : item.days === 0 ? 'Today' : `${item.days}d`}
                      </span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${barColor}`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* By category */}
        {Object.keys(stats.byCategory).length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 p-4">
            <p className="font-semibold text-gray-800 mb-3">By Category</p>
            <div className="space-y-2">
              {Object.entries(stats.byCategory)
                .sort(([, a], [, b]) => b.total - a.total)
                .map(([cat, s]) => (
                  <div key={cat} className="flex items-center gap-3">
                    <span className="text-sm text-gray-600 w-32 truncate">{cat}</span>
                    <div className="flex-1 flex gap-0.5 h-3 rounded overflow-hidden">
                      {s.good > 0 && <div className="bg-emerald-400" style={{ flex: s.good }} />}
                      {s.low > 0 && <div className="bg-amber-400" style={{ flex: s.low }} />}
                      {s.critical > 0 && <div className="bg-red-400" style={{ flex: s.critical }} />}
                    </div>
                    <span className="text-xs text-gray-400 w-8 text-right">{s.total}</span>
                  </div>
                ))}
            </div>
          </div>
        )}

        {kitchen.length === 0 && (
          <div className="text-center py-16 text-gray-400">
            <p className="text-5xl mb-4">📊</p>
            <p className="font-medium">Add items to your kitchen to see analytics</p>
          </div>
        )}
      </div>
    </div>
  );
}
