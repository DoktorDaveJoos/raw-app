export { colors } from './colors';
export type { Colors, ColorKey } from './colors';

export { typography } from './typography';
export type { Typography } from './typography';

export { spacing, borderRadius, shadow } from './spacing';
export type { Spacing, BorderRadius, Shadow } from './spacing';

// Unified theme object
export const theme = {
  colors: require('./colors').colors,
  typography: require('./typography').typography,
  spacing: require('./spacing').spacing,
  borderRadius: require('./spacing').borderRadius,
  shadow: require('./spacing').shadow,
} as const;

export type Theme = typeof theme;

// Default export for convenience
export default theme;
