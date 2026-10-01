/**
 * Central Theme & Color Reference
 * Specification:
 * 1. Primary Brand Color: #6B46C1 (Purple)
 *    Used for main brand elements, tab headers, pay buttons, progress bars, active states, loading screen.
 * 2. Background Color:
 *    - Default Page / Screen Background: #FFFFFF (White)
 *    - Neutral Container Background: #F3F4F6 (Light Gray)
 */

export const Colors = {
  // 1. Primary Brand (Purple)
  primary: '#6B46C1',
  primaryDeep: '#1A0C38',
  primaryDark: '#2E1065',
  primaryHeader: '#411E73',
  primaryHero: '#4C1D95',
  primaryVivid: '#7C3AED',
  primaryLightVivid: '#8B5CF6',
  primaryDisabled: '#C4B5FD',

  // 2. Purple Tints & Accents
  purpleTintLightest: '#F5F3FF',
  purpleTintLight: '#F3E8FF',
  purpleTint: '#EDE9FE',
  purpleBorderLight: '#E9D5FF',
  purpleBorderCard: '#F3E8FF',
  purpleShadow: 'rgba(107, 70, 193, 0.15)',

  // 3. App Background Colors
  background: '#FFFFFF',          // Default Page / Screen Background: #FFFFFF (White)
  backgroundContainer: '#F3F4F6', // Neutral Container Background: #F3F4F6 (Light Gray)
  white: '#FFFFFF',
  offWhite: '#FAFAFA',
  lightGray50: '#F9FAFB',
  lightGray100: '#F5F5F5',
  lightGray200: '#F3F4F6',         // Container background alias
  lightGray400: '#E5E7EB',
  separator: '#d7dce4ff',
  separatorGray: '#d7dce4ff',

  // 4. Secondary / Accent (Blue)
  secondaryBlue: '#2842C4',

  // 5. Neutrals & Typography
  black: '#000000',
  textPrimary: '#1F2937',          // Main readable text (Gray 750)
  textSecondary: '#6B7280',        // Subtitle / Muted text (Gray 200)
  textDark: '#111827',             // Headings (Gray 900)
  gray900: '#111827',
  gray800: '#1E293B',
  gray750: '#1F2937',
  gray700: '#212121',
  gray600: '#2D3748',
  gray500: '#374151',
  gray400: '#4A5E6D',
  gray350: '#4B5563',
  gray250: '#64748B',
  gray200: '#6B7280',
  gray100: '#9CA3AF',

  // 6. Accent & Highlight Colors
  gold: '#FFD54F',
  goldLight: '#FDE68A',
  amberDark: '#92400E',
  amberBg: '#FEF3C7',

  // 7. Status & Feedback
  statusActive: '#10B981',
  statusCompleted: '#6B46C1',
  statusPending: '#F59E0B',
  statusOverdue: '#EF4444',
  statusPaid: '#10B981',
  statusDefault: '#6B7280',

  success: '#059669',
  successOnline: '#10B981',
  successBg: '#ECFDF5',
  error: '#EF4444',
  errorDanger: '#EF4444',
  errorIcon: '#DC2626',
  errorBg: '#FEE2E2',
  warning: '#F59E0B',
};

export default Colors;