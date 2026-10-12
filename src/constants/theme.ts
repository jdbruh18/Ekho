import { Platform } from 'react-native';

export const Palette = {
  primary: '#0D9488', // Medical Teal
  primaryDark: '#0F766E',
  primaryLight: '#F0FDFA',
  primaryMuted: '#CCFBF1',
  secondary: '#0284C7', // Calming Sky
  secondaryLight: '#F0F9FF',
  accent: '#F59E0B', // Warm Amber
  accentLight: '#FEF3C7',
  success: '#10B981',
  successLight: '#ECFDF5',
  warning: '#F59E0B',
  warningLight: '#FFFBEB',
  danger: '#EF4444',
  dangerLight: '#FEF2F2',
  purple: '#8B5CF6',
  purpleLight: '#F5F3FF',
  slate50: '#F8FAFC',
  slate100: '#F1F5F9',
  slate200: '#E2E8F0',
  slate300: '#CBD5E1',
  slate400: '#94A3B8',
  slate500: '#64748B',
  slate600: '#475569',
  slate700: '#334155',
  slate800: '#1E293B',
  slate900: '#0F172A',
  white: '#FFFFFF',
};

export const Colors = {
  light: {
    primary: Palette.primary,
    primaryDark: Palette.primaryDark,
    primaryLight: Palette.primaryLight,
    accent: Palette.accent,
    text: Palette.slate900,
    textSecondary: Palette.slate500,
    textMuted: Palette.slate400,
    background: Palette.slate50,
    card: Palette.white,
    border: Palette.slate200,
    backgroundElement: Palette.slate100,
    backgroundSelected: Palette.slate200,
  },
  dark: {
    primary: '#14B8A6',
    primaryDark: '#0D9488',
    primaryLight: '#134E4A',
    accent: '#FBBF24',
    text: '#F8FAFC',
    textSecondary: '#94A3B8',
    textMuted: '#64748B',
    background: '#0F172A',
    card: '#1E293B',
    border: '#334155',
    backgroundElement: '#1E293B',
    backgroundSelected: '#334155',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light;

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 48,
  seven: 64,
} as const;

export const BorderRadius = {
  sm: 6,
  md: 10,
  lg: 16,
  xl: 24,
  full: 9999,
};

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
