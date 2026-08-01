// MAJDOOR design tokens — ported from the web design system ("Industry")
// and the brand guidelines (Brand v1.1).

export const brand = {
  ink: '#0B0D12',
  blue: '#2F7CF6',
  violet: '#8B5CF6',
  amber: '#F59E0B',
  gradient: ['#2F7CF6', '#8B5CF6', '#F59E0B'] as const,
} as const;

// Steel-blue accent ramp from the web DS
export const steel = {
  100: '#EEF6FF',
  200: '#D6EBFF',
  300: '#B5D9FD',
  400: '#94BCE3',
  500: '#749DC4',
  600: '#597EA3',
  700: '#416180',
  800: '#2C455D',
  900: '#1D2D3D',
} as const;

export const neutral = {
  100: '#F5F5F8',
  200: '#E7E7EA',
  300: '#D4D4D7',
  400: '#B7B7BA',
  500: '#98989B',
  600: '#7A7A7D',
  700: '#5D5D60',
  800: '#424244',
  900: '#2B2B2D',
} as const;

export const semantic = {
  success: '#16A34A',
  successSoft: '#DCFCE7',
  warning: '#D97706',
  warningSoft: '#FEF3C7',
  danger: '#DC2626',
  dangerSoft: '#FEE2E2',
  info: brand.blue,
  infoSoft: '#DBEAFE',
} as const;

export interface ThemeColors {
  bg: string;
  surface: string;
  surfaceRaised: string;
  card: string;
  border: string;
  hairline: string;
  text: string;
  textSecondary: string;
  textMuted: string;
  accent: string;
  accentSoft: string;
  accentText: string;
  primary: string;
  primarySoft: string;
  onPrimary: string;
  amber: string;
  amberSoft: string;
  violet: string;
  violetSoft: string;
  success: string;
  successSoft: string;
  warning: string;
  warningSoft: string;
  danger: string;
  dangerSoft: string;
  tabBar: string;
  tabActive: string;
  tabInactive: string;
  heroBg: string;
  heroText: string;
  inputBg: string;
  overlay: string;
}

export const lightColors: ThemeColors = {
  bg: '#F2F2F3',
  surface: '#FFFFFF',
  surfaceRaised: '#FFFFFF',
  card: '#FFFFFF',
  border: '#E2E3E7',
  hairline: '#EBECEF',
  text: '#16181D',
  textSecondary: '#5D5D60',
  textMuted: '#8A8A8E',
  accent: steel[600],
  accentSoft: steel[100],
  accentText: steel[700],
  primary: brand.blue,
  primarySoft: '#E8F0FE',
  onPrimary: '#FFFFFF',
  amber: brand.amber,
  amberSoft: semantic.warningSoft,
  violet: brand.violet,
  violetSoft: '#F3EEFF',
  success: semantic.success,
  successSoft: semantic.successSoft,
  warning: semantic.warning,
  warningSoft: semantic.warningSoft,
  danger: semantic.danger,
  dangerSoft: semantic.dangerSoft,
  tabBar: '#FFFFFF',
  tabActive: brand.ink,
  tabInactive: '#9A9AA0',
  heroBg: brand.ink,
  heroText: '#F5F6F8',
  inputBg: '#FFFFFF',
  overlay: 'rgba(11,13,18,0.55)',
};

export const darkColors: ThemeColors = {
  bg: brand.ink,
  surface: '#12151C',
  surfaceRaised: '#171B24',
  card: '#12151C',
  border: '#232833',
  hairline: '#1B202A',
  text: '#F2F3F6',
  textSecondary: '#A9ADB8',
  textMuted: '#6E7382',
  accent: steel[400],
  accentSoft: '#141C26',
  accentText: steel[300],
  primary: '#4C90F7',
  primarySoft: '#12203A',
  onPrimary: '#FFFFFF',
  amber: '#FBBF24',
  amberSoft: '#2A2110',
  violet: '#A78BFA',
  violetSoft: '#221A38',
  success: '#34D399',
  successSoft: '#0E2A1E',
  warning: '#FBBF24',
  warningSoft: '#2A2110',
  danger: '#F87171',
  dangerSoft: '#331416',
  tabBar: '#0E1117',
  tabActive: '#F2F3F6',
  tabInactive: '#5C6170',
  heroBg: '#101420',
  heroText: '#F5F6F8',
  inputBg: '#171B24',
  overlay: 'rgba(0,0,0,0.6)',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 28,
  xxxl: 40,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 22,
  full: 999,
} as const;

export const fonts = {
  heading: 'BarlowCondensed_600SemiBold',
  headingRegular: 'BarlowCondensed_400Regular',
  body: 'Barlow_400Regular',
  bodyMedium: 'Barlow_500Medium',
  bodySemiBold: 'Barlow_600SemiBold',
  bodyBold: 'Barlow_700Bold',
} as const;

export const type = {
  display: { fontFamily: fonts.heading, fontSize: 34, lineHeight: 38, letterSpacing: 0.3 },
  h1: { fontFamily: fonts.heading, fontSize: 28, lineHeight: 32, letterSpacing: 0.3 },
  h2: { fontFamily: fonts.heading, fontSize: 22, lineHeight: 26, letterSpacing: 0.4 },
  h3: { fontFamily: fonts.heading, fontSize: 18, lineHeight: 22, letterSpacing: 0.4 },
  kicker: { fontFamily: fonts.bodySemiBold, fontSize: 11, lineHeight: 14, letterSpacing: 1.4, textTransform: 'uppercase' as const },
  body: { fontFamily: fonts.body, fontSize: 15, lineHeight: 21 },
  bodyMedium: { fontFamily: fonts.bodyMedium, fontSize: 15, lineHeight: 21 },
  sub: { fontFamily: fonts.body, fontSize: 13, lineHeight: 18 },
  subMedium: { fontFamily: fonts.bodyMedium, fontSize: 13, lineHeight: 18 },
  caption: { fontFamily: fonts.body, fontSize: 12, lineHeight: 16 },
  num: { fontFamily: fonts.heading, fontSize: 26, lineHeight: 30, letterSpacing: 0.3 },
} as const;

export const touch = { min: 48 } as const;
