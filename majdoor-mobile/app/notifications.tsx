import React, { useMemo, useState } from 'react';
import { View, ScrollView, Pressable, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Tx, Card, Row, Segmented, Divider, EmptyState, SkeletonList } from '../src/ui';
import { useTheme } from '../src/theme/ThemeContext';
import { useNotifications } from '../src/data/hooks';
import { useSession } from '../src/data/stores/session';
import { AppNotification } from '../src/data/types';
import * as haptics from '../src/lib/haptics';

type Tab = 'ALL' | 'UNREAD';

const KIND_ICON: Record<AppNotification['kind'], keyof typeof Ionicons.glyphMap> = {
  attendance: 'finger-print',
  payroll: 'cash-outline',
  job: 'briefcase-outline',
  shift: 'time-outline',
  emergency: 'warning',
  system: 'information-circle-outline',
};

export default function Notifications() {
  const t = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const notifications = useNotifications();
  const { readNotifications, markNotificationRead, markAllNotificationsRead } = useSession();
  const [tab, setTab] = useState<Tab>('ALL');

  const items = useMemo(() => {
    const all = (notifications.data ?? []).map((n) => ({
      ...n,
      isRead: readNotifications[n.id] ?? n.read,
    }));
    return tab === 'UNREAD' ? all.filter((n) => !n.isRead) : all;
  }, [notifications.data, readNotifications, tab]);

  const allIds = (notifications.data ?? []).map((n) => n.id);

  return (
    <View style={{ flex: 1, backgroundColor: t.colors.bg }}>
      {/* Header */}
      <Row style={{
        paddingHorizontal: 20,
        paddingTop: Platform.OS === 'ios' ? 16 : insets.top + 10,
        paddingBottom: 12,
        gap: 12,
        justifyContent: 'space-between',
      }}>
        <View style={{ flex: 1 }}>
          <Tx variant="h2">NOTIFICATIONS · सूचनाएं</Tx>
        </View>
        <Pressable
          onPress={() => { haptics.tap(); markAllNotificationsRead(allIds); }}
          hitSlop={10}
          accessibilityRole="button"
          style={{ minHeight: 42, justifyContent: 'center' }}
        >
          <Tx variant="subMedium" color={t.colors.primary}>Mark all read</Tx>
        </Pressable>
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

      <View style={{ paddingHorizontal: 20, paddingBottom: 12 }}>
        <Segmented options={['ALL', 'UNREAD'] as const} value={tab} onChange={setTab} />
      </View>

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: insets.bottom + 28 }}
        showsVerticalScrollIndicator={false}
      >
        {notifications.isLoading ? (
          <SkeletonList rows={5} />
        ) : items.length === 0 ? (
          <EmptyState
            icon="notifications-off-outline"
            title="All caught up"
            body="कोई नई सूचना नहीं · No unread notifications right now."
          />
        ) : (
          <Card style={{ padding: 0, overflow: 'hidden' }}>
            {items.map((n, i, arr) => (
              <Animated.View key={n.id} entering={FadeInDown.delay(i * 40).duration(240)}>
                <Pressable
                  onPress={() => { haptics.tap(); markNotificationRead(n.id); }}
                  android_ripple={{ color: t.colors.hairline }}
                  accessibilityRole="button"
                  style={({ pressed }) => ({
                    flexDirection: 'row',
                    gap: 12,
                    paddingVertical: 14,
                    paddingHorizontal: 16,
                    minHeight: 48,
                    backgroundColor: pressed ? t.colors.hairline : 'transparent',
                  })}
                >
                  <View style={{
                    width: 38, height: 38, borderRadius: 12,
                    alignItems: 'center', justifyContent: 'center',
                    backgroundColor: n.kind === 'emergency' ? t.colors.dangerSoft : t.colors.accentSoft,
                  }}>
                    <Ionicons
                      name={KIND_ICON[n.kind]}
                      size={18}
                      color={n.kind === 'emergency' ? t.colors.danger : t.colors.accent}
                    />
                  </View>
                  <View style={{ flex: 1, gap: 3 }}>
                    <Row gap={6}>
                      <Tx
                        variant="bodyMedium"
                        style={!n.isRead ? { fontFamily: t.fonts.bodyBold } : undefined}
                        numberOfLines={1}
                      >
                        {n.title}
                      </Tx>
                      {!n.isRead ? (
                        <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: t.colors.primary }} />
                      ) : null}
                    </Row>
                    <Tx variant="sub" color={t.colors.textSecondary} numberOfLines={2}>{n.body}</Tx>
                  </View>
                  <Tx variant="caption" color={t.colors.textMuted}>{n.time}</Tx>
                </Pressable>
                {i < arr.length - 1 ? <Divider inset={66} /> : null}
              </Animated.View>
            ))}
          </Card>
        )}

        {/* Footer note */}
        <Card tone="soft" style={{ marginTop: 16, flexDirection: 'row', gap: 10, alignItems: 'flex-start' }}>
          <Ionicons name="notifications-outline" size={18} color={t.colors.accent} style={{ marginTop: 2 }} />
          <Tx variant="sub" color={t.colors.textSecondary} style={{ flex: 1 }}>
            Push notifications: attendance alerts, payroll, shift reminders, job offers, emergency — configure in Settings.
          </Tx>
        </Card>
      </ScrollView>
    </View>
  );
}
