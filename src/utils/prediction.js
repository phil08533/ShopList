/**
 * Returns days remaining until an item is depleted.
 * Negative = already past predicted depletion date.
 */
export function daysRemaining(item) {
  if (!item.lastPurchased || !item.usageDays) return null;
  const last = new Date(item.lastPurchased);
  const depletionDate = new Date(last.getTime() + item.usageDays * 24 * 60 * 60 * 1000);
  const now = new Date();
  return Math.ceil((depletionDate - now) / (24 * 60 * 60 * 1000));
}

/**
 * Returns true if the item should be on the shopping list.
 * Triggers when quantity <= threshold OR predicted depletion is within 1 day.
 */
export function needsPurchase(item) {
  if (item.quantity <= item.threshold) return true;
  const days = daysRemaining(item);
  if (days !== null && days <= 1) return true;
  return false;
}

/**
 * Returns a status string: 'good' | 'low' | 'critical'
 */
export function stockStatus(item) {
  const days = daysRemaining(item);
  if (item.quantity <= item.threshold) return 'critical';
  if (days !== null && days <= 2) return 'low';
  if (days !== null && days <= 5) return 'low';
  return 'good';
}

export function formatDaysRemaining(days) {
  if (days === null) return '—';
  if (days < 0) return 'Overdue';
  if (days === 0) return 'Today';
  if (days === 1) return 'Tomorrow';
  return `${days}d left`;
}
