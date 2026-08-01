import React, { createContext, useContext, useMemo } from 'react';
import { useColorScheme } from 'react-native';
import { darkColors, lightColors, ThemeColors, spacing, radius, fonts, type as typeScale } from './tokens';
import { useSettings } from '../data/stores/settings';

export interface Theme {
  dark: boolean;
  colors: ThemeColors;
  spacing: typeof spacing;
  radius: typeof radius;
  fonts: typeof fonts;
  type: typeof typeScale;
}

const ThemeContext = createContext<Theme>({
  dark: false,
  colors: lightColors,
  spacing,
  radius,
  fonts,
  type: typeScale,
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const system = useColorScheme();
  const mode = useSettings((s) => s.themeMode);
  const dark = mode === 'system' ? system === 'dark' : mode === 'dark';
  const value = useMemo<Theme>(
    () => ({ dark, colors: dark ? darkColors : lightColors, spacing, radius, fonts, type: typeScale }),
    [dark],
  );
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  return useContext(ThemeContext);
}
