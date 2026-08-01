import React, { useCallback, useState } from 'react';
import { View, ScrollView, RefreshControl, Pressable, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Linking from 'expo-linking';
import { AppHeader } from '../../src/ui/AppHeader';
import { Tx, Card, Row, Badge, Button, SectionHeader, ListRow, Divider, Skeleton } from '../../src/ui';
import { useTheme } from '../../src/theme/ThemeContext';
import { useAuth } from '../../src/data/stores/auth';
import { useSession } from '../../src/data/stores/session';
import { useJobs, useSalaryHistory, useNotifications } from '../../src/data/hooks';
import { rupees } from '../../src/lib/format';
import * as haptics from '../../src/lib/haptics';

function QuickAction({ icon, label, onPress, tone }: {
  icon: keyof typeof Ionicons.glyphMap; label: string; onPress: () => void; tone?: 'danger';
}) {
  const t = useTheme();
  return (
    <Pressable
      onPress={() => { haptics.tap(); onPress(); }}
      accessibilityRole="button"
      style={({ pressed }) => ({
        flex: 1, minHeight: 76, borderRadius: t.radius.lg, gap: 6,
        alignItems: 'center', justifyContent: 'center',
        backgroundColor: pressed ? t.colors.hairline : t.colors.surface,
        borderWidth: 1, borderColor: t.colors.border,
      })}
    >
      <Ionicons name={icon} size={22} color={tone === 'danger' ? t.colors.danger : t.colors.primary} />
      <Text style={{ fontFamily: t.fonts.bodyMedium, fontSize: 11, color: t.colors.textSecondary, textAlign: 'center' }}>
        {label}
      </Text>
    </Pressable>
  );
}

export default function WorkerHome() {
  const t = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const user = useAuth((s) => s.user);
  const { punchPhase, punchedInAt } = useSession();
  const jobs = useJobs();
  const salary = useSalaryHistory();
  const notifications = useNotifications();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([jobs.refetch(), salary.refetch(), notifications.refetch()]);
    setRefreshing(false);
  }, [jobs, salary, notifications]);

  const punched = punchPhase === 'done';
  const july = salary.data?.[0];

  return (
    <View style={{ flex: 1, backgroundColor: t.colors.bg }}>
      <AppHeader kicker={`नमस्ते · ${user?.workerId ?? ''}`} title={(user?.name ?? 'WORKER').toUpperCase()} />
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: insets.bottom + 28 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={t.colors.primary} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Today's site + shift */}
        <Card tone="hero" style={{ gap: 10 }}>
          <Row style={{ justifyContent: 'space-between' }}>
            <Tx variant="kicker" color="rgba(255,255,255,0.65)">आज की साइट · TODAY'S SITE</Tx>
            <Badge label="SHIFT 08:00–17:00" tone="outline" />
          </Row>
          <Tx variant="h2" color={t.colors.heroText}>L&T — PATNA METRO C-2</Tx>
          <Tx variant="sub" color="rgba(255,255,255,0.7)">₹780/day · Gate 2 · Geofence 150 m</Tx>

          {/* One-tap attendance */}
          <Pressable
            onPress={() => { haptics.press(); router.push('/punch' as any); }}
            accessibilityRole="button"
            accessibilityLabel={punched ? 'Attendance marked' : 'Punch in now'}
            style={({ pressed }) => ({
              marginTop: 6, minHeight: 62, borderRadius: t.radius.md,
              alignItems: 'center', justifyContent: 'center', gap: 2,
              backgroundColor: punched ? 'rgba(52,211,153,0.15)' : t.colors.primary,
              borderWidth: punched ? 1 : 0, borderColor: 'rgba(52,211,153,0.4)',
              opacity: pressed ? 0.9 : 1,
            })}
          >
            <Text style={{ fontFamily: t.fonts.heading, fontSize: 20, letterSpacing: 1.5, color: punched ? '#34D399' : '#fff' }}>
              {punched ? `हाज़िर ✓  IN ${punchedInAt ?? ''}` : 'हाज़िरी लगाएं · PUNCH IN'}
            </Text>
            <Text style={{ fontFamily: t.fonts.body, fontSize: 11, color: punched ? 'rgba(52,211,153,0.8)' : 'rgba(255,255,255,0.75)' }}>
              {punched ? 'GPS ✓ · FACE ✓' : 'GPS + face verification'}
            </Text>
          </Pressable>
        </Card>

        {/* Salary status */}
        <SectionHeader title="SALARY STATUS" hindi="वेतन" action="Wallet →" onAction={() => router.push('/(worker)/wallet' as any)} />
        {salary.isLoading ? (
          <Skeleton height={84} radius={16} />
        ) : (
          <Card style={{ gap: 4 }}>
            <Row style={{ justifyContent: 'space-between' }}>
              <View style={{ gap: 2 }}>
                <Tx variant="caption" color={t.colors.textMuted}>{july?.month.toUpperCase()} NET</Tx>
                <Tx variant="num">{july ? rupees(july.net) : '—'}</Tx>
              </View>
              <Badge label={july?.paid ? 'PAID ✓' : 'PENDING'} tone={july?.paid ? 'success' : 'warning'} />
            </Row>
            <Tx variant="caption" color={t.colors.textMuted}>
              {july ? `${july.days} days · advance −${rupees(july.advance)} · PF+ESIC −${rupees(july.pfEsic)} · ${july.mode}` : ''}
            </Tx>
          </Card>
        )}

        {/* Quick actions */}
        <SectionHeader title="QUICK ACTIONS" hindi="त्वरित" />
        <View style={{ gap: 10 }}>
          <Row gap={10}>
            <QuickAction icon="cash-outline" label="Advance" onPress={() => router.push('/advance-request' as any)} />
            <QuickAction icon="calendar-outline" label="Leave" onPress={() => router.push('/leave-request' as any)} />
            <QuickAction icon="qr-code-outline" label="My QR" onPress={() => router.push('/qr' as any)} />
            <QuickAction icon="document-text-outline" label="Slips" onPress={() => router.push('/(worker)/wallet' as any)} />
          </Row>
          <Row gap={10}>
            <QuickAction icon="school-outline" label="Training" onPress={() => router.push('/(worker)/profile' as any)} />
            <QuickAction icon="map-outline" label="Site map" onPress={() => router.push('/site-map' as any)} />
            <QuickAction icon="call-outline" label="Supervisor" onPress={() => Linking.openURL('tel:+919431022815')} />
            <QuickAction icon="alert-circle" label="SOS" tone="danger" onPress={() => router.push('/sos' as any)} />
          </Row>
        </View>

        {/* Nearby jobs */}
        <SectionHeader title="NEARBY JOBS" hindi="पास का काम" action="All jobs →" onAction={() => router.push('/(worker)/jobs' as any)} />
        {jobs.isLoading ? (
          <Skeleton height={140} radius={16} />
        ) : (
          <Card style={{ padding: 0, overflow: 'hidden' }}>
            {(jobs.data ?? []).slice(0, 3).map((j, i, arr) => (
              <View key={j.id}>
                <ListRow
                  title={j.title}
                  subtitle={`${j.site} · ${j.distanceKm} km · ${j.startNote}`}
                  right={<Tx variant="h3" color={t.colors.primary}>₹{j.wage}/day</Tx>}
                  onPress={() => router.push(`/job/${j.id}` as any)}
                />
                {i < arr.length - 1 ? <Divider inset={16} /> : null}
              </View>
            ))}
          </Card>
        )}

        {/* Recent activity */}
        <SectionHeader title="RECENT ACTIVITY" hindi="गतिविधि" action="All →" onAction={() => router.push('/notifications' as any)} />
        <Card style={{ padding: 0, overflow: 'hidden' }}>
          {(notifications.data ?? []).slice(0, 3).map((n, i, arr) => (
            <View key={n.id}>
              <ListRow
                title={n.title}
                subtitle={n.body}
                left={
                  <View style={{
                    width: 36, height: 36, borderRadius: 12, alignItems: 'center', justifyContent: 'center',
                    backgroundColor: t.colors.accentSoft,
                  }}>
                    <Ionicons
                      name={n.kind === 'payroll' ? 'cash-outline' : n.kind === 'job' ? 'briefcase-outline' : n.kind === 'shift' ? 'time-outline' : 'finger-print'}
                      size={17}
                      color={t.colors.accent}
                    />
                  </View>
                }
                right={<Tx variant="caption" color={t.colors.textMuted}>{n.time}</Tx>}
              />
              {i < arr.length - 1 ? <Divider inset={16} /> : null}
            </View>
          ))}
        </Card>

        {/* AI assistant strip */}
        <Pressable onPress={() => { haptics.press(); router.push('/ai' as any); }} style={{ marginTop: 20 }}>
          <Card tone="soft" style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <Ionicons name="sparkles" size={20} color={t.colors.violet} />
            <View style={{ flex: 1 }}>
              <Tx variant="bodyMedium">Ask MAJDOOR AI · सहायक</Tx>
              <Tx variant="caption" color={t.colors.textMuted}>"मेरी जुलाई की तनख्वाह कितनी है?"</Tx>
            </View>
            <Ionicons name="mic-outline" size={20} color={t.colors.textMuted} />
          </Card>
        </Pressable>
      </ScrollView>
    </View>
  );
}
