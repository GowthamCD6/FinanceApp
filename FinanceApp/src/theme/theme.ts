export const colors = {
  // Brand & Accents
  primary: '#0D9488', // Emerald/Teal - Cash Circulation & Stability
  primaryLight: '#14B8A6',
  primaryDark: '#0F766E',
  primaryBg: '#F0FDFA',
  
  secondary: '#3B82F6', // Royal Blue - Lending Principal & Portfolios
  secondaryLight: '#60A5FA',
  secondaryDark: '#1D4ED8',
  secondaryBg: '#EFF6FF',

  accent: '#8B5CF6', // Purple - Reports & Advanced Analytics
  accentLight: '#A78BFA',
  accentBg: '#F5F3FF',

  // Status & Financial Indicators
  success: '#10B981', // Recovered Principal / Paid
  successBg: '#ECFDF5',
  successText: '#065F46',

  warning: '#F59E0B', // Pending / Due Today
  warningBg: '#FFFBEB',
  warningText: '#92400E',

  danger: '#EF4444', // Overdue / Defaulted / Expense Outflow
  dangerBg: '#FEF2F2',
  dangerText: '#991B1B',

  info: '#0EA5E9',
  infoBg: '#F0F9FF',
  infoText: '#0369A1',

  // Dark Theme Palette
  dark: {
    bg: '#0F172A', // Slate 900
    card: '#1E293B', // Slate 800
    cardElevated: '#334155', // Slate 700
    border: '#334155',
    textPrimary: '#F8FAFC',
    textSecondary: '#94A3B8',
    textMuted: '#64748B',
    surface: '#1E293B',
    inputBg: '#0F172A',
    badgeBg: '#334155',
  },

  // Light Theme Palette
  light: {
    bg: '#F8FAFC',
    card: '#FFFFFF',
    cardElevated: '#FFFFFF',
    border: '#E2E8F0',
    textPrimary: '#0F172A',
    textSecondary: '#475569',
    textMuted: '#94A3B8',
    surface: '#FFFFFF',
    inputBg: '#F1F5F9',
    badgeBg: '#F1F5F9',
  },
};

export const typography = {
  fontFamily: 'System',
  sizes: {
    xs: 11,
    sm: 13,
    md: 15,
    lg: 17,
    xl: 20,
    xxl: 24,
    headline: 28,
  },
  weights: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
    heavy: '800' as const,
  },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const borderRadius = {
  sm: 6,
  md: 10,
  lg: 14,
  xl: 18,
  full: 9999,
};

export const formatCurrency = (amount: number): string => {
  return '₹' + Number(amount || 0).toLocaleString('en-IN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
};