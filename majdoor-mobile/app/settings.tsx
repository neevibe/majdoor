import React from 'react';
import { View, ScrollView, Pressable, Platform, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as LocalAuthentication from 'expo-local-authentication';
import { Tx, Card, Row, Avatar, Button, Segmented, Divider, KV } from '../src/ui';
import { useTheme } from '../src/theme/ThemeContext';
import { useAuth, ROLE_LABELS } from '../src/data/stores/auth';
import { useSession } from '../src/data/stores/session';
import { useSettings, ThemeMode, Language } from '../src/data/stores/settings';
import * as haptics from '../src/lib/haptics';

const NOTIF_ROWS: { key: 'attendance' | 'payroll' | 'jobs' | 'emergency' | 'shiftReminders'; label: string; hindi: string }[] = [
  { key: 'attendance', label: 'Attendance alerts', hindi: 'हाज़िरी' },
  { key: 'payroll', label: 'Payroll', hindi: 'वेतन' },
  { key: 'jobs', label: 'Job offers', hindi: 'काम' },
  { key: 'emergency', label: 'Emergency', hindi: 'आपातकाल' },
  { key: 'shiftReminders', label: 'Shift reminders', hindi: 'शिफ़्ट' },
];

export default function Settings() {
  const t = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const user = useAuth((s) => s.user);
  const signOut = useAuth((s) => s.signOut);
  const resetSession = useSession((s) => s.reset);
  const {
    themeMode, setThemeMode, language, setLanguage,
    biometricLock, setBiometricLock, notifications, setNotification,
  } = useSettings();

  const roleLabel = user ? `${ROLE_LABELS[user.role].en} · ${ROLE_LABELS[user.role].hi}` : '';

  const onBiometricToggle = async (v: boolean) => {
    haptics.tap();
    if (!v) {
      setBiometricLock(false);
      return;
    }
    if (Platform.OS === 'web') {
      setBiometricLock(true);
      return;
    }
    try {
      const res = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Enable Majdoor app lock',
      });
      if (res.success) {
        setBiometricLock(true);
        haptics.success();
      } else {
        setBiometricLock(false);
        haptics.warn();
      }
    } catch {
      setBiometricLock(false);
      haptics.warn();
    }
  };

  const onClearCache = () => {
    resetSession();
    haptics.warn();
  };

  const onSignOut = () => {
    signOut();
    (router as any).dismissAll?.();
    router.replace('/login' as any);
  };

  const switchRow = (label: string, hindi: string, value: boolean, onValueChange: (v: boolean) => void) => (
    <Row style={{ paddingVertical: 10, minHeight: 48, justifyContent: 'space-between' }}>
      <View style={{ flex: 1, gap: 2 }}>
        <Tx variant="bodyMedium">{label}</Tx>
        <Tx variant="caption" color={t.colors.textMuted}>{hindi}</Tx>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ true: t.colors.primary, false: t.dark ? '#2A3140' : '#D4D4D7' }}
        thumbColor="#FFFFFF"
      />
    </Row>
  );

  return (
    <View style={{ flex: 1, backgroundColor: t.colors.bg }}>
      {/* Header */}
      <Row style={{
        paddingHorizontal: 20,
        paddingTop: Platform.OS === 'ios' ? 16 : insets.top + 10,
        paddingBottom: 12,
        justifyContent: 'space-between',
      }}>
        <Tx variant="h2">SETTINGS · सेटिंग्स</Tx>
        <Pressable
          onPress={() => { haptics.tap(); router.back(); }}
          hitSlop={12}
          accessibilityLabel="Close"
          style={{
            width: 42, height: 42, borderRadius: 14, alignItems: 'center', justifyContent: 'center',
            backgroundColor: t.dark ? 'rgba(255,255,255,0.08)' : '#EDEDF0',
          }}
        >
          <Ionicons name="close" size={22} color={t.colors.text} />
        </Pressable>
      </Row>

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: insets.bottom + 28 }}
        showsVerticalScrollIndicator={false}
      >
        {/* User card */}
        <Card style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
          <Avatar initials={user?.initials ?? '—'} size={52} />
          <View style={{ flex: 1, gap: 2 }}>
            <Tx variant="h3">{(user?.name ?? 'Guest').toUpperCase()}</Tx>
            <Tx variant="sub" color={t.colors.textSecondary}>{roleLabel}</Tx>
            <Tx variant="caption" color={t.colors.textMuted}>{user?.phone ?? ''}</Tx>
          </View>
        </Card>

        {/* Appearance */}
        <Tx variant="kicker" style={{ marginTop: 24, marginBottom: 10 }}>APPEARANCE · दिखावट</Tx>
        <Card style={{ gap: 14 }}>
          <View style={{ gap: 8 }}>
            <Tx variant="caption" color={t.colors.textMuted}>THEME</Tx>
            <Segmented
              options={['system', 'light', 'dark'] as const}
              value={themeMode as ThemeMode}
              onChange={(m) => setThemeMode(m)}
              labels={{ system: 'SYSTEM', light: 'LIGHT', dark: 'DARK' }}
            />
          </View>
          <View style={{ gap: 8 }}>
            <Tx variant="caption" color={t.colors.textMuted}>LANGUAGE · भाषा</Tx>
            <Segmented
              options={['en', 'hi'] as const}
              value={language as Language}
              onChange={(l) => setLanguage(l)}
              labels={{ en: 'EN', hi: 'हिंदी' }}
            />
          </View>
        </Card>

        {/* Security */}
        <Tx variant="kicker" style={{ marginTop: 24, marginBottom: 10 }}>SECURITY · सुरक्षा</Tx>
        <Card>
          {switchRow('Biometric app lock', 'फ़िंगरप्रिंट / फेस लॉक', biometricLock, onBiometricToggle)}
        </Card>

        {/* Notifications */}
        <Tx variant="kicker" style={{ marginTop: 24, marginBottom: 10 }}>NOTIFICATIONS · सूचनाएं</Tx>
        <Card>
          {NOTIF_ROWS.map((r, i) => (
            <View key={r.key}>
              {switchRow(r.label, r.hindi, notifications[r.key], (v) => { haptics.tap(); setNotification(r.key, v); })}
              {i < NOTIF_ROWS.length - 1 ? <Divider /> : null}
            </View>
          ))}
        </Card>

        {/* Data */}
        <Tx variant="kicker" style={{ marginTop: 24, marginBottom: 10 }}>DATA · डेटा</Tx>
        <Card style={{ gap: 12 }}>
          <Row gap={10}>
            <Ionicons name="checkmark-circle" size={20} color={t.colors.success} />
            <View style={{ flex: 1, gap: 2 }}>
              <Tx variant="bodyMedium">Offline mode</Tx>
              <Tx variant="caption" color={t.colors.textMuted}>Registry & attendance cached for offline use</Tx>
            </View>
          </Row>
          <Button title="Clear cached data" variant="secondary" icon="trash-outline" onPress={onClearCache} />
        </Card>

        {/* About */}
        <Tx variant="kicker" style={{ marginTop: 24, marginBottom: 10 }}>ABOUT · जानकारी</Tx>
        <Card>
          <KV k="Version" v="1.0.0" dashed />
          <KV k="Made for" v="Bihar's workforce ecosystem" dashed />
          <Pressable
            onPress={() => haptics.tap()}
            accessibilityRole="button"
            style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, minHeight: 48 }}
          >
            <Tx variant="sub" color={t.colors.textMuted}>Brand guidelines</Tx>
            <Ionicons name="chevron-forward" size={16} color={t.colors.textMuted} />
          </Pressable>
        </Card>

        <Button
          title="Sign out · साइन आउट"
          variant="danger"
          icon="log-out-outline"
          onPress={onSignOut}
          style={{ marginTop: 24 }}
        />
      </ScrollView>
    </View>
  );
}
