/**
 * Format number to Indian Rupee (INR) currency representation
 */
export function formatINR(amount: number): string {
  if (isNaN(amount) || amount === null || amount === undefined) return '₹0';
  return '₹' + Math.round(amount).toLocaleString('en-IN');
}

/**
 * Format currency with decimals for precision accounting
 */
export function formatINRPrecision(amount: number): string {
  if (isNaN(amount) || amount === null || amount === undefined) return '₹0.00';
  return '₹' + Number(amount).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/**
 * Format ISO date string into readable local format (e.g., "10 Sep 2026")
 */
export function formatDate(dateString?: string): string {
  if (!dateString) return '-';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return d.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return dateString;
  }
}

/**
 * Format relative date (Today, Yesterday, In 2 days, etc.)
 */
export function formatRelativeDate(dateString?: string): string {
  if (!dateString) return '-';
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const target = new Date(dateString);
  target.setHours(0, 0, 0, 0);

  const diffTime = target.getTime() - today.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Tomorrow';
  if (diffDays === -1) return 'Yesterday';
  if (diffDays < -1) return `${Math.abs(diffDays)}d overdue`;
  return `in ${diffDays} days`;
}

/**
 * Check if a date is strictly today
 */
export function isToday(dateString?: string): boolean {
  if (!dateString) return false;
  const today = new Date().toISOString().slice(0, 10);
  return dateString.slice(0, 10) === today;
}

/**
 * Check if a date is in the past (overdue)
 */
export function isPastDate(dateString?: string): boolean {
  if (!dateString) return false;
  const today = new Date().toISOString().slice(0, 10);
  return dateString.slice(0, 10) < today;
}
