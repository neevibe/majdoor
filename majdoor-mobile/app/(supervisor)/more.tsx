import React from 'react';
import { View, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { AppHeader } from '../../src/ui/AppHeader';
import { Tx, Card, Row, Badge, Button, Avatar, ListRow, Divider, SectionHeader } from '../../src/ui';
import { useTheme } from '../../src/theme/ThemeContext';
import { useAuth, ROLE_LABELS } from '../../src/data/stores/auth';

export default function SupervisorMore() {
  const t = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const user = useAuth((s) => s.user);
  const signOut = useAuth((s) => s.signOut);

  const MenuIcon = ({ name }: { name: keyof typeof Ionicons.glyphMap }) => (
    <View style={{
      width: 36, height: 36, borderRadius: 12, alignItems: 'center', justifyContent: 'center',
      backgroundColor: t.colors.accentSoft,
    }}>
      <Ionicons name={name} size={17} color={t.colors.accent} />
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: t.colors.bg }}>
      <AppHeader kicker="और" title="MORE" />
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: insets.bottom + 28 }}
        showsVerticalScrollIndicator={false}
      >
        {/* User card */}
        <Card style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
          <Avatar initials={user?.initials ?? 'SV'} size={54} />
          <View style={{ flex: 1, gap: 3 }}>
            <Tx variant="h3">{user?.name ?? 'Supervisor'}</Tx>
            <Tx variant="caption" color={t.colors.textMuted}>
              {user ? `${ROLE_LABELS[user.role].en} · ${ROLE_LABELS[user.role].hi}` : 'Supervisor'}
            </Tx>
            <Tx variant="caption" color={t.colors.textMuted}>{user?.orgName ?? 'L&T — Patna Metro C-2'}</Tx>
          </View>
          <Badge label="ON SITE" tone="success" />
        </Card>

        <SectionHeader title="SITE TOOLS" hindi="साइट" />
        <Card style={{ padding: 0, overflow: 'hidden' }}>
          <ListRow
            title="Site photos"
            subtitle="Capture and log progress photos"
            left={<MenuIcon name="camera-outline" />}
            onPress={() => router.push('/site-photos' as any)}
          />
          <Divider inset={64} />
          <ListRow
            title="Track workers"
            subtitle="Live gang location on site map"
            left={<MenuIcon name="navigate-outline" />}
            onPress={() => router.push('/track' as any)}
          />
          <Divider inset={64} />
          <ListRow
            title="Reports"
            subtitle="Attendance, OT, PPE, payroll draft"
            left={<MenuIcon name="stats-chart-outline" />}
            onPress={() => router.push('/reports' as any)}
          />
          <Divider inset={64} />
          <ListRow
            title="Chat with workers"
            subtitle="Message your gang directly"
            left={<MenuIcon name="chatbubbles-outline" />}
            onPress={() => router.push('/chat/BR-2481-0937' as any)}
          />
          <Divider inset={64} />
          <ListRow
            title="Scan QR"
            subtitle="Gate punch-in for workers"
            left={<MenuIcon name="qr-code-outline" />}
            onPress={() => router.push('/qr' as any)}
          />
        </Card>

        <SectionHeader title="ACCOUNT" hindi="खाता" />
        <Card style={{ padding: 0, overflow: 'hidden' }}>
          <ListRow
            title="Notifications"
            subtitle="Alerts, approvals, attendance"
            left={<MenuIcon name="notifications-outline" />}
            onPress={() => router.push('/notifications' as any)}
          />
          <Divider inset={64} />
          <ListRow
            title="Settings"
            subtitle="Theme, language, privacy"
            left={<MenuIcon name="settings-outline" />}
            onPress={() => router.push('/settings' as any)}
          />
        </Card>

        <Button
          title="Sign out · साइन आउट"
          variant="danger"
          icon="log-out-outline"
          style={{ marginTop: 24 }}
          onPress={() => {
            signOut();
            router.replace('/login' as any);
          }}
        />

        <Row style={{ justifyContent: 'center', marginTop: 16 }}>
          <Tx variant="caption" color={t.colors.textMuted}>MAJDOOR · v1.0.0 · Bihar</Tx>
        </Row>
      </ScrollView>
    </View>
  );
}
