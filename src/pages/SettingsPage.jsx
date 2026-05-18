import { Download, Upload, ToggleLeft, ToggleRight } from 'lucide-react';

const FREQUENCIES = ['daily', 'twice-weekly', 'weekly', 'biweekly', 'monthly'];

export default function SettingsPage({
  household,
  settings,
  onUpdateHousehold,
  onUpdateSettings,
  onSave,
  onLoad,
  autoSave,
  onToggleAutoSave,
  hasFsa,
  saveStatus,
}) {
  const set = (field, val) => onUpdateHousehold({ [field]: val });

  const labelClass = 'block text-sm font-medium text-gray-700 mb-1';
  const selectClass = 'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white';

  return (
    <div className="flex flex-col h-full">
      <div className="bg-white border-b border-gray-100 px-4 pt-12 pb-4">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-sm text-gray-400">Household &amp; preferences</p>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 pb-24 space-y-5">

        {/* Household */}
        <section className="bg-white rounded-2xl border border-gray-100 p-4 space-y-4">
          <p className="font-semibold text-gray-800">Household</p>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Adults</label>
              <select className={selectClass} value={household.adults} onChange={(e) => set('adults', Number(e.target.value))}>
                {[1,2,3,4,5,6,7,8].map(n => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
            <div>
              <label className={labelClass}>Children</label>
              <select className={selectClass} value={household.children} onChange={(e) => set('children', Number(e.target.value))}>
                {[0,1,2,3,4,5,6].map(n => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className={labelClass}>Pets</label>
            <select className={selectClass} value={household.pets} onChange={(e) => set('pets', Number(e.target.value))}>
              {[0,1,2,3,4].map(n => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>

          <div>
            <label className={labelClass}>Shopping Frequency</label>
            <select className={selectClass} value={household.shoppingFrequency} onChange={(e) => set('shoppingFrequency', e.target.value)}>
              {FREQUENCIES.map(f => (
                <option key={f} value={f}>{f.charAt(0).toUpperCase() + f.slice(1)}</option>
              ))}
            </select>
          </div>
        </section>

        {/* Preferences */}
        <section className="bg-white rounded-2xl border border-gray-100 p-4 space-y-4">
          <p className="font-semibold text-gray-800">Preferences</p>

          <div>
            <p className="text-sm font-medium text-gray-700 mb-1">Unit system</p>
            <p className="text-xs text-gray-400 mb-2">Metric amounts (g, ml) on your shopping list will be shown in your preferred units</p>
            <div className="flex rounded-xl overflow-hidden border border-gray-200">
              <button
                onClick={() => onUpdateSettings({ unitSystem: 'us' })}
                className={`flex-1 py-2 text-sm font-medium transition-colors ${
                  (settings.unitSystem ?? 'us') === 'us'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                US (cups, oz, lb)
              </button>
              <button
                onClick={() => onUpdateSettings({ unitSystem: 'metric' })}
                className={`flex-1 py-2 text-sm font-medium transition-colors border-l border-gray-200 ${
                  settings.unitSystem === 'metric'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                Metric (g, ml, kg)
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <div>
              <p className="text-sm font-medium text-gray-700">Auto-add low items</p>
              <p className="text-xs text-gray-400">Automatically add low-stock items to shopping list</p>
            </div>
            <button
              onClick={() => onUpdateSettings({ autoAddThreshold: !settings.autoAddThreshold })}
              className={`transition-colors ${settings.autoAddThreshold ? 'text-emerald-600' : 'text-gray-300'}`}
            >
              {settings.autoAddThreshold ? <ToggleRight size={36} /> : <ToggleLeft size={36} />}
            </button>
          </div>
        </section>

        {/* Data */}
        <section className="bg-white rounded-2xl border border-gray-100 p-4 space-y-3">
          <p className="font-semibold text-gray-800">Data</p>
          <p className="text-xs text-gray-400">
            All data is stored locally on your device — no account or cloud needed.
            Save a backup to keep your pantry, meals, and recipes safe.
          </p>

          <div className="flex gap-2">
            <button
              onClick={onSave}
              className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-emerald-600 text-white rounded-xl text-sm font-semibold hover:bg-emerald-700 active:bg-emerald-800 transition-colors"
            >
              <Download size={16} />
              Save
            </button>
            <button
              onClick={onLoad}
              className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-gray-100 text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-200 active:bg-gray-300 transition-colors"
            >
              <Upload size={16} />
              Load
            </button>
          </div>

          {hasFsa && (
            <div className="flex items-center justify-between pt-1">
              <div>
                <p className="text-sm font-medium text-gray-700">Auto-save</p>
                <p className="text-xs text-gray-400">
                  {autoSave
                    ? 'Saving to file automatically whenever data changes'
                    : 'Toggle to pick a file and save automatically on every change'}
                </p>
              </div>
              <button
                onClick={onToggleAutoSave}
                className={`transition-colors flex-shrink-0 ${autoSave ? 'text-emerald-600' : 'text-gray-300'}`}
              >
                {autoSave ? <ToggleRight size={36} /> : <ToggleLeft size={36} />}
              </button>
            </div>
          )}

          {saveStatus === 'saved' && (
            <p className="text-xs text-emerald-600 font-medium">Saved successfully!</p>
          )}
          {saveStatus === 'imported' && (
            <p className="text-xs text-emerald-600 font-medium">Data imported successfully!</p>
          )}
          {saveStatus === 'error' && (
            <p className="text-xs text-red-500 font-medium">Could not read file — please try again.</p>
          )}
        </section>

        {/* About */}
        <section className="bg-white rounded-2xl border border-gray-100 p-4">
          <p className="font-semibold text-gray-800 mb-2">About</p>
          <p className="text-sm text-gray-500">Smart Pantry MVP</p>
          <p className="text-xs text-gray-400 mt-1">
            Tracks your kitchen inventory, predicts when items run low, and builds your shopping list automatically.
            100% free, no account, no ads, works offline.
          </p>
        </section>
      </div>
    </div>
  );
}
