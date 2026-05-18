export function daysRemaining(item) {
  if (!item.lastPurchased || !item.usageDays) return null;
  const last = new Date(item.lastPurchased);
  const depletionDate = new Date(last.getTime() + item.usageDays * 24 * 60 * 60 * 1000);
  return Math.ceil((depletionDate - new Date()) / (24 * 60 * 60 * 1000));
}

export function mealPlanWeeksRemaining(item, mealUsage) {
  if (!mealUsage || mealUsage.qtyPerWeek <= 0) return null;
  if (item.quantity == null) return null;
  return Number(item.quantity) / mealUsage.qtyPerWeek;
}

export function needsPurchase(item) {
  if (item.quantity <= item.threshold) return true;
  const days = daysRemaining(item);
  if (days !== null && days <= 1) return true;
  return false;
}

export function stockStatus(item, mealUsage) {
  if (item.quantity <= item.threshold) return 'critical';
  if (mealUsage) {
    const weeks = mealPlanWeeksRemaining(item, mealUsage);
    if (weeks !== null) {
      if (weeks < 1) return 'low';
      if (weeks < 2) return 'low';
      return 'good';
    }
  }
  const days = daysRemaining(item);
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

export function formatWeeksRemaining(weeks) {
  if (weeks === null) return null;
  if (weeks <= 0) return 'Out soon';
  if (weeks < 0.5) return '< 3 days';
  if (weeks < 1) return '< 1 wk';
  if (weeks < 2) return '~1 wk';
  return `~${Math.round(weeks)} wks`;
}
