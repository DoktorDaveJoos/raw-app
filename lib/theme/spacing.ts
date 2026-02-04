// Base spacing unit: 4px
const BASE = 4;

export const spacing = {
  0: 0,
  0.5: BASE * 0.5,   // 2
  1: BASE,            // 4
  1.5: BASE * 1.5,   // 6
  2: BASE * 2,        // 8
  2.5: BASE * 2.5,   // 10
  3: BASE * 3,        // 12
  3.5: BASE * 3.5,   // 14
  4: BASE * 4,        // 16
  5: BASE * 5,        // 20
  6: BASE * 6,        // 24
  7: BASE * 7,        // 28
  8: BASE * 8,        // 32
  9: BASE * 9,        // 36
  10: BASE * 10,      // 40
  11: BASE * 11,      // 44
  12: BASE * 12,      // 48
  14: BASE * 14,      // 56
  16: BASE * 16,      // 64
  20: BASE * 20,      // 80
  24: BASE * 24,      // 96
  28: BASE * 28,      // 112
  32: BASE * 32,      // 128
  36: BASE * 36,      // 144
  40: BASE * 40,      // 160
  44: BASE * 44,      // 176
  48: BASE * 48,      // 192
  52: BASE * 52,      // 208
  56: BASE * 56,      // 224
  60: BASE * 60,      // 240
  64: BASE * 64,      // 256
  72: BASE * 72,      // 288
  80: BASE * 80,      // 320
  96: BASE * 96,      // 384
} as const;

export const borderRadius = {
  none: 0,
  sm: 2,
  DEFAULT: 4,
  md: 6,
  lg: 8,
  xl: 12,
  '2xl': 16,
  '3xl': 24,
  full: 9999,
} as const;

export const shadow = {
  none: 'none',
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  DEFAULT: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
  glow: '0 0 20px -5px rgba(245, 158, 11, 0.3)',
  glowLg: '0 0 30px -5px rgba(245, 158, 11, 0.4)',
} as const;

export type Spacing = typeof spacing;
export type BorderRadius = typeof borderRadius;
export type Shadow = typeof shadow;
