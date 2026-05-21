import { useState } from 'react';
import { X, ChevronRight, ChevronLeft } from 'lucide-react';

const STEPS = [
  {
    icon: '🥦',
    title: 'Welcome to Smart Pantry',
    desc: 'Track what you have at home, plan your meals for the week, and let the app build your shopping list automatically.',
  },
  {
    icon: '📦',
    title: 'Add items to your Pantry',
    desc: 'Go to the Pantry tab and tap + to add items. The app tracks quantities and alerts you when you\'re running low.',
  },
  {
    icon: '🍽',
    title: 'Plan your Meals',
    desc: 'In the Meals tab, schedule recipes for each day. Ingredients scale to your household size and check against your pantry.',
  },
  {
    icon: '🛒',
    title: 'Build your Shopping List',
    desc: 'Tap "Week\'s List" in Meals to see what you need. The app subtracts what you already have and adds items to your list.',
  },
  {
    icon: '✅',
    title: 'You\'re all set!',
    desc: 'Tap the ? button at the top anytime to see this guide again. Check Settings to choose a theme or adjust your household.',
  },
];

export default function Guide({ onClose }) {
  const [step, setStep] = useState(0);
  const isLast = step === STEPS.length - 1;
  const current = STEPS[step];

  return (
    <div className="fixed inset-0 z-[300] flex items-end sm:items-center justify-center bg-black/50">
      <div className="w-full max-w-sm bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl mx-4 mb-0 sm:mb-4 overflow-hidden">
        {/* Close */}
        <div className="flex justify-end px-4 pt-4">
          <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="px-8 pb-4 text-center">
          <div className="text-6xl mb-5">{current.icon}</div>
          <h2 className="text-xl font-bold text-gray-900 mb-3">{current.title}</h2>
          <p className="text-sm text-gray-500 leading-relaxed">{current.desc}</p>
        </div>

        {/* Progress dots */}
        <div className="flex justify-center gap-1.5 py-3">
          {STEPS.map((_, i) => (
            <button
              key={i}
              onClick={() => setStep(i)}
              className={`rounded-full transition-all ${
                i === step
                  ? 'w-5 h-2 bg-primary-600'
                  : 'w-2 h-2 bg-gray-200 hover:bg-gray-300'
              }`}
            />
          ))}
        </div>

        {/* Navigation */}
        <div className="flex gap-3 px-6 pb-8 pt-2">
          {step > 0 ? (
            <button
              onClick={() => setStep(s => s - 1)}
              className="flex-1 py-3 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 flex items-center justify-center gap-1 hover:bg-gray-50 transition-colors"
            >
              <ChevronLeft size={16} /> Back
            </button>
          ) : (
            <div className="flex-1" />
          )}
          <button
            onClick={isLast ? onClose : () => setStep(s => s + 1)}
            className="flex-1 py-3 rounded-xl bg-primary-600 text-white text-sm font-semibold flex items-center justify-center gap-1 hover:bg-primary-700 transition-colors"
          >
            {isLast ? 'Get Started' : <>Next <ChevronRight size={16} /></>}
          </button>
        </div>
      </div>
    </div>
  );
}
