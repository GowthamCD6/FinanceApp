export const colors = {
  primary: '#0D9488',
  primaryLight: '#14B8A6',
  primaryDark: '#0F766E',
  primaryBg: '#F0FDFA',
  
  secondary: '#3B82F6',
  secondaryLight: '#60A5FA',
  secondaryDark: '#1D4ED8',
  secondaryBg: '#EFF6FF',

  accent: '#8B5CF6',
  accentLight: '#A78BFA',
  accentBg: '#F5F3FF',

  success: '#10B981',
  successBg: '#ECFDF5',
  successText: '#065F46',

  warning: '#F59E0B',
  warningBg: '#FFFBEB',
  warningText: '#92400E',

  danger: '#EF4444',
  dangerBg: '#FEF2F2',
  dangerText: '#991B1B',

  info: '#0EA5E9',
  infoBg: '#F0F9FF',
  infoText: '#0369A1',
};

/**
 * Format number to Indian Rupee (INR) currency representation
 */
export function formatINR(amount) {
  if (isNaN(amount) || amount === null || amount === undefined) return '₹0';
  return '₹' + Math.round(amount).toLocaleString('en-IN');
}

/**
 * Format currency with decimals for precision accounting
 */
export function formatINRPrecision(amount) {
  if (isNaN(amount) || amount === null || amount === undefined) return '₹0.00';
  return '₹' + Number(amount).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/**
 * Format ISO date string into readable local format (e.g., "10 Sep 2026")
 */
export function formatDate(dateString) {
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
export function formatRelativeDate(dateString) {
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
export function isToday(dateString) {
  if (!dateString) return false;
  const today = new Date().toISOString().slice(0, 10);
  return dateString.slice(0, 10) === today;
}

/**
 * Check if a date is in the past (overdue)
 */
export function isPastDate(dateString) {
  if (!dateString) return false;
  const today = new Date().toISOString().slice(0, 10);
  return dateString.slice(0, 10) < today;
}
