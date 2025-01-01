// FCSPLANNER Theme - Minimalist Design System

export const Colors = {
  // Backgrounds
  background: '#FFFFFF',
  backgroundSecondary: '#F9F9F9',
  backgroundCard: '#FFFFFF',

  // Text
  textPrimary: '#1A1A1A',
  textSecondary: '#6B7280',
  textDisabled: '#C0C0C0',

  // Accent / Interaction
  accent: '#007AFF',
  accentLight: '#E5F1FF',

  // Status
  warning: '#FF9500',
  warningLight: '#FFF4E5',
  success: '#34C759',
  successLight: '#E8F9EE',
  error: '#FF3B30',
  errorLight: '#FFE5E3',

  // Borders & Dividers
  border: '#E5E7EB',
  divider: '#F3F4F6',

  // Priority colors (left-edge bars on cards)
  priorityCritical: '#FF3B30',
  priorityHigh: '#FF9500',
  priorityMedium: '#007AFF',
  priorityLow: '#34C759',
};

export const Typography = {
  h1: { fontSize: 28, fontWeight: '600' as const, lineHeight: 34 },
  h2: { fontSize: 22, fontWeight: '500' as const, lineHeight: 28 },
  bodyPrimary: { fontSize: 17, fontWeight: '400' as const, lineHeight: 22 },
  bodySecondary: { fontSize: 15, fontWeight: '400' as const, lineHeight: 20 },
  caption: { fontSize: 13, fontWeight: '400' as const, lineHeight: 18 },
  button: { fontSize: 17, fontWeight: '600' as const, lineHeight: 22 },
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const BorderRadius = {
  sm: 6,
  md: 10,
  lg: 14,
  xl: 20,
  full: 999,
};

export const Shadow = {
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
};
