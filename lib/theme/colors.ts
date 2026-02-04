export const colors = {
  // Backgrounds
  background: '#121212',
  surface: '#1A1A1A',
  surfaceHover: '#252525',

  // Primary (orange)
  primary: '#F59E0B',
  primaryHover: '#D97706',
  accentMuted: '#fb923c',

  // UI elements
  chipBg: '#2A2A2A',
  border: 'rgba(255, 255, 255, 0.06)',
  borderSubtle: '#2A2A2A',
  card: '#1E1E1E',
  cardElevated: '#2A2A2A',

  // Text
  textPrimary: '#ffffff',
  textMuted: '#9CA3AF',
  textDim: '#6B7280',

  // Status
  success: '#059669',
  successBg: '#064e3b',
  error: '#dc2626',
  errorBg: '#7f1d1d',

  // Neutrals (for convenience)
  white: '#ffffff',
  black: '#000000',
  neutral: {
    50: '#fafafa',
    100: '#f5f5f5',
    200: '#e5e5e5',
    300: '#d4d4d4',
    400: '#a3a3a3',
    500: '#737373',
    600: '#525252',
    700: '#404040',
    800: '#262626',
    900: '#171717',
    950: '#0a0a0a',
  },
} as const;

export type Colors = typeof colors;
export type ColorKey = keyof typeof colors;
