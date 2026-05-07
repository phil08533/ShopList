const STORAGE_KEY = 'smart_pantry_v1';

const DEFAULT_STATE = {
  kitchen: [],
  shoppingList: [],
  household: {
    adults: 2,
    children: 0,
    pets: 0,
    shoppingFrequency: 'weekly',
  },
  settings: {
    autoAddThreshold: true,
  },
  nextId: 1,
};

export function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return structuredClone(DEFAULT_STATE);
    return { ...structuredClone(DEFAULT_STATE), ...JSON.parse(raw) };
  } catch {
    return structuredClone(DEFAULT_STATE);
  }
}

export function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // storage quota exceeded — silently fail
  }
}

export function exportJSON(state) {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'smart-pantry-backup.json';
  a.click();
  URL.revokeObjectURL(url);
}

export function importJSON(file, onSuccess, onError) {
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const data = JSON.parse(e.target.result);
      onSuccess(data);
    } catch {
      onError('Invalid JSON file');
    }
  };
  reader.readAsText(file);
}
