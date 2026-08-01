import React from 'react';
import { View, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { AppHeader } from '../../src/ui/AppHeader';
import { Tx, Card, Row, Button, ListRow, Divider, Avatar } from '../../src/ui';
import { useTheme } from '../../src/theme/ThemeContext';
import { useAuth, ROLE_LABELS } from '../../src/data/stores/auth';

const MENU: { icon: keyof typeof Ionicons.glyphMap; label: string; hindi?: string; route: string }[] = [
  { icon: 'map-outline', label: 'Bihar map', hindi: 'नक्शा', route: '/bihar-map' },
  { icon: 'business-outline', label: 'Agencies', hindi: 'एजेंसी', route: '/agencies' },
  { icon: 'sparkles-outline', label: 'Analytics & AI insights', route: '/analytics' },
  { icon: 'shield-checkmark-outline', label: 'Compliance & watchdog', route: '/analytics' },
  { icon: 'document-text-outline', label: 'Reports', route: '/reports' },
  { icon: 'construct-outline', label: 'PPE registry', route: '/ppe' },
  { icon: 'folder-open-outline', label: 'Documents', route: '/documents' },
  { icon: 'qr-code-outline', label: 'Verify worker QR', route: '/qr' },
  { icon: 'notifications-outline', label: 'Notifications', route: '/notifications' },
  { icon: 'settings-outline', label: 'Settings', route: '/settings' },
];

export default function More() {
  const t = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const user = useAuth((s) => s.user);
  const signOut = useAuth((s) => s.signOut);

  return (
    <View style={{ flex: 1, backgroundColor: t.colors.bg }}>
      <AppHeader title="MORE" kicker="मेनू" showSearch={false} />
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: insets.bottom + 28 }}
        showsVerticalScrollIndicator={false}
      >
        {/* User card */}
        <Card style={{ marginBottom: 16 }}>
          <Row gap={14}>
            <Avatar initials={user?.initials ?? '?'} size={52} />
            <View style={{ flex: 1, gap: 2 }}>
              <Tx variant="h3">{user?.name ?? '—'}</Tx>
              <Tx variant="caption" color={t.colors.textMuted}>
                {user ? ROLE_LABELS[user.role].en : ''}{user?.orgName ? ` · ${user.orgName}` : ''}
              </Tx>
            </View>
          </Row>
        </Card>

        {/* Menu */}
        <Card style={{ padding: 0, overflow: 'hidden' }}>
          {MENU.map((m, i) => (
            <View key={`${m.label}-${i}`}>
              <ListRow
                title={m.label}
                subtitle={m.hindi}
                left={
                  <View style={{
                    width: 38, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center',
                    backgroundColor: t.colors.accentSoft,
                  }}>
                    <Ionicons name={m.icon} size={18} color={t.colors.accent} />
                  </View>
                }
                onPress={() => router.push(m.route as any)}
              />
              {i < MENU.length - 1 ? <Divider inset={16} /> : null}
            </View>
          ))}
        </Card>

        <Button
          title="Sign out"
          variant="danger"
          icon="log-out-outline"
          style={{ marginTop: 20 }}
          onPress={() => { signOut(); router.replace('/login' as any); }}
        />
      </ScrollView>
    </View>
  );
}
