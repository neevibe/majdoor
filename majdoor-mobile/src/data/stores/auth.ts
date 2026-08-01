import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type Role =
  | 'worker'
  | 'supervisor'
  | 'agency'
  | 'contractor'
  | 'client'
  | 'government'
  | 'admin';

export interface SessionUser {
  id: string;
  name: string;
  nameHi?: string;
  role: Role;
  phone: string;
  initials: string;
  orgName?: string;
  workerId?: string;
}

export const ROLE_USERS: Record<Role, SessionUser> = {
  worker: {
    id: 'u-worker',
    name: 'Sunil Kumar Manjhi',
    nameHi: 'सुनील कुमार मांझी',
    role: 'worker',
    phone: '+91 98352 41067',
    initials: 'SM',
    workerId: 'BR-2481-0937',
  },
  supervisor: {
    id: 'u-supervisor',
    name: 'Rakesh Verma',
    nameHi: 'राकेश वर्मा',
    role: 'supervisor',
    phone: '+91 94310 22815',
    initials: 'RV',
    orgName: 'L&T — Patna Metro C-2',
  },
  agency: {
    id: 'u-agency',
    name: 'Farzana Khatoon',
    nameHi: 'फ़रज़ाना ख़ातून',
    role: 'agency',
    phone: '+91 99340 71128',
    initials: 'FK',
    orgName: 'Mithila Manpower Services',
  },
  contractor: {
    id: 'u-contractor',
    name: 'Rajiv Menon',
    role: 'contractor',
    phone: '+91 98200 44551',
    initials: 'RM',
    orgName: 'L&T Construction',
  },
  client: {
    id: 'u-client',
    name: 'Priya Nair',
    role: 'client',
    phone: '+91 98450 88213',
    initials: 'PN',
    orgName: 'Adani Infra',
  },
  government: {
    id: 'u-govt',
    name: 'S. K. Choudhary',
    role: 'government',
    phone: '+91 94700 11209',
    initials: 'SC',
    orgName: 'Bihar Labour Department',
  },
  admin: {
    id: 'u-admin',
    name: 'Anand Sinha',
    role: 'admin',
    phone: '+91 98110 33420',
    initials: 'AS',
    orgName: 'Majdoor Labs',
  },
};

export const ROLE_LABELS: Record<Role, { en: string; hi: string }> = {
  worker: { en: 'Worker', hi: 'श्रमिक' },
  supervisor: { en: 'Supervisor', hi: 'पर्यवेक्षक' },
  agency: { en: 'Agency', hi: 'ठेकेदार' },
  contractor: { en: 'Contractor', hi: 'निर्माण' },
  client: { en: 'Client', hi: 'ग्राहक' },
  government: { en: 'Govt Officer', hi: 'सरकारी अधिकारी' },
  admin: { en: 'Super Admin', hi: 'एडमिन' },
};

interface AuthState {
  user: SessionUser | null;
  signIn: (role: Role) => void;
  signOut: () => void;
}

export const useAuth = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      signIn: (role) => set({ user: ROLE_USERS[role] }),
      signOut: () => set({ user: null }),
    }),
    { name: 'majdoor-auth', storage: createJSONStorage(() => AsyncStorage) },
  ),
);

/** Which tab group a role lands in. */
export function homeGroupFor(role: Role): '/(worker)' | '/(supervisor)' | '/(agency)' {
  switch (role) {
    case 'worker':
      return '/(worker)';
    case 'supervisor':
      return '/(supervisor)';
    default:
      return '/(agency)';
  }
}
