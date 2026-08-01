import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type PunchPhase = 'idle' | 'gps' | 'selfie' | 'done';

interface SessionState {
  // Worker punch state
  punchPhase: PunchPhase;
  punchedInAt: string | null;
  setPunchPhase: (p: PunchPhase) => void;
  setPunchedInAt: (t: string | null) => void;

  // Jobs the worker applied to
  appliedJobs: Record<string, boolean>;
  applyJob: (id: string) => void;

  // Supervisor / agency approval decisions (advance + leave + payroll)
  advanceDecisions: Record<string, 'APPROVED' | 'REJECTED'>;
  decideAdvance: (id: string, d: 'APPROVED' | 'REJECTED') => void;
  leaveDecisions: Record<string, 'APPROVED' | 'REJECTED'>;
  decideLeave: (id: string, d: 'APPROVED' | 'REJECTED') => void;
  payrollApproved: boolean;
  setPayrollApproved: (v: boolean) => void;

  // Notifications read state
  readNotifications: Record<string, boolean>;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: (ids: string[]) => void;

  reset: () => void;
}

const initial = {
  punchPhase: 'idle' as PunchPhase,
  punchedInAt: null as string | null,
  appliedJobs: {},
  advanceDecisions: {},
  leaveDecisions: {},
  payrollApproved: false,
  readNotifications: {},
};

export const useSession = create<SessionState>()(
  persist(
    (set) => ({
      ...initial,
      setPunchPhase: (punchPhase) => set({ punchPhase }),
      setPunchedInAt: (punchedInAt) => set({ punchedInAt }),
      applyJob: (id) => set((s) => ({ appliedJobs: { ...s.appliedJobs, [id]: true } })),
      decideAdvance: (id, d) => set((s) => ({ advanceDecisions: { ...s.advanceDecisions, [id]: d } })),
      decideLeave: (id, d) => set((s) => ({ leaveDecisions: { ...s.leaveDecisions, [id]: d } })),
      setPayrollApproved: (payrollApproved) => set({ payrollApproved }),
      markNotificationRead: (id) => set((s) => ({ readNotifications: { ...s.readNotifications, [id]: true } })),
      markAllNotificationsRead: (ids) =>
        set((s) => ({
          readNotifications: { ...s.readNotifications, ...Object.fromEntries(ids.map((i) => [i, true])) },
        })),
      reset: () => set(initial),
    }),
    { name: 'majdoor-session', storage: createJSONStorage(() => AsyncStorage) },
  ),
);
