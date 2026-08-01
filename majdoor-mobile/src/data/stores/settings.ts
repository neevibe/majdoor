import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type ThemeMode = 'system' | 'light' | 'dark';
export type Language = 'en' | 'hi';

interface SettingsState {
  themeMode: ThemeMode;
  language: Language;
  biometricLock: boolean;
  notifications: {
    attendance: boolean;
    payroll: boolean;
    jobs: boolean;
    emergency: boolean;
    shiftReminders: boolean;
  };
  setThemeMode: (m: ThemeMode) => void;
  setLanguage: (l: Language) => void;
  setBiometricLock: (v: boolean) => void;
  setNotification: (k: keyof SettingsState['notifications'], v: boolean) => void;
}

export const useSettings = create<SettingsState>()(
  persist(
    (set) => ({
      themeMode: 'system',
      language: 'en',
      biometricLock: false,
      notifications: { attendance: true, payroll: true, jobs: true, emergency: true, shiftReminders: true },
      setThemeMode: (themeMode) => set({ themeMode }),
      setLanguage: (language) => set({ language }),
      setBiometricLock: (biometricLock) => set({ biometricLock }),
      setNotification: (k, v) => set((s) => ({ notifications: { ...s.notifications, [k]: v } })),
    }),
    { name: 'majdoor-settings', storage: createJSONStorage(() => AsyncStorage) },
  ),
);
