import React, { useCallback, useState } from 'react';
import { View, ScrollView, RefreshControl, Pressable, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { AppHeader } from '../../src/ui/AppHeader';
import { Tx, Card, Row, Badge, Button, SectionHeader, ListRow, Divider, Skeleton, EmptyState } from '../../src/ui';
import { useTheme } from '../../src/theme/ThemeContext';
import { useAuth } from '../../src/data/stores/auth';
import { useSession } from '../../src/data/stores/session';
import { useLeaves, useAdvances, useFeed } from '../../src/data/hooks';
import { rupees } from '../../src/lib/format';
import * as haptics from '../../src/lib/haptics';

function QuickAction({ icon, label, onPress }: {
  icon: keyof typeof Ionicons.glyphMap; label: string; onPress: () => void;
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
      <Ionicons name={icon} size={22} color={t.colors.primary} />
      <Text style={{ fontFamily: t.fonts.bodyMedium, fontSize: 11, color: t.colors.textSecondary, textAlign: 'center' }}>
        {label}
      </Text>
    </Pressable>
  );
}

function DecisionButtons({ decision, onApprove, onReject }: {
  decision?: 'APPROVED' | 'REJECTED';
  onApprove: () => void;
  onReject: () => void;
}) {
  if (decision) {
    return (
      <Badge
        label={decision === 'APPROVED' ? 'APPROVED ✓' : 'REJECTED'}
        tone={decision === 'APPROVED' ? 'success' : 'danger'}
      />
    );
  }
  return (
    <Row gap={8}>
      <Button title="Approve" variant="success" small onPress={onApprove} style={{ flex: 1 }} />
      <Button title="Reject" variant="secondary" small onPress={onReject} style={{ flex: 1 }} />
    </Row>
  );
}

export default function SupervisorHome() {
  const t = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const user = useAuth((s) => s.user);
  const { leaveDecisions, advanceDecisions, decideLeave, decideAdvance } = useSession();
  const leaves = useLeaves();
  const advances = useAdvances();
  const feed = useFeed();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([leaves.refetch(), advances.refetch(), feed.refetch()]);
    setRefreshing(false);
  }, [leaves, advances, feed]);

  const pendingLeaves = (leaves.data ?? []).filter((l) => l.status === 'PENDING');
  const pendingAdvances = (advances.data ?? []).filter((a) => a.status === 'PENDING');
  const approvalsLoading = leaves.isLoading || advances.isLoading;
  const openCount =
    pendingLeaves.filter((l) => !leaveDecisions[l.id]).length +
    pendingAdvances.filter((a) => !advanceDecisions[a.id]).length;

  return (
    <View style={{ flex: 1, backgroundColor: t.colors.bg }}>
      <AppHeader kicker="पर्यवेक्षक · L&T PATNA METRO C-2" title={(user?.name ?? 'SUPERVISOR').toUpperCase()} />
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: insets.bottom + 28 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={t.colors.primary} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero — gang on duty */}
        <Card tone="hero" style={{ gap: 8 }}>
          <Row style={{ justifyContent: 'space-between' }}>
            <Tx variant="kicker" color="rgba(255,255,255,0.65)">ON DUTY NOW · अभी हाज़िर</Tx>
            <Row gap={6}>
              <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#34D399' }} />
              <Tx variant="caption" color="rgba(255,255,255,0.7)">LIVE</Tx>
            </Row>
          </Row>
          <Row gap={10} style={{ alignItems: 'flex-end' }}>
            <Text style={{ fontFamily: t.fonts.heading, fontSize: 56, lineHeight: 58, letterSpacing: 0.5, color: t.colors.heroText }}>
              214
            </Text>
            <Tx variant="sub" color="rgba(255,255,255,0.7)" style={{ paddingBottom: 8 }}>
              of 231 deployed · 92.4% attendance
            </Tx>
          </Row>
          <Row gap={8}>
            <Badge label="SHIFT 08:00–17:00" tone="outline" />
            <Badge label="3 GATES" tone="outline" />
          </Row>
        </Card>

        {/* Approvals */}
        <SectionHeader title="APPROVALS" hindi="मंज़ूरी" action={openCount ? `${openCount} pending` : undefined} />
        {approvalsLoading ? (
          <View style={{ gap: 10 }}>
            <Skeleton height={96} radius={16} />
            <Skeleton height={96} radius={16} />
          </View>
        ) : pendingLeaves.length + pendingAdvances.length === 0 ? (
          <Card>
            <EmptyState icon="checkmark-done" title="All caught up" body="No pending leave or advance requests." />
          </Card>
        ) : (
          <View style={{ gap: 10 }}>
            {pendingLeaves.map((l, i) => (
              <Animated.View key={l.id} entering={FadeInDown.delay(i * 60)}>
                <Card style={{ gap: 10 }}>
                  <Row style={{ justifyContent: 'space-between' }}>
                    <Tx variant="bodyMedium">{l.worker}</Tx>
                    <Badge label="LEAVE" tone="accent" />
                  </Row>
                  <Tx variant="sub" color={t.colors.textSecondary}>
                    {l.from} → {l.to} · {l.reason}
                  </Tx>
                  <DecisionButtons
                    decision={leaveDecisions[l.id]}
                    onApprove={() => { haptics.success(); decideLeave(l.id, 'APPROVED'); }}
                    onReject={() => { haptics.warn(); decideLeave(l.id, 'REJECTED'); }}
                  />
                </Card>
              </Animated.View>
            ))}
            {pendingAdvances.map((a, i) => (
              <Animated.View key={a.id} entering={FadeInDown.delay((pendingLeaves.length + i) * 60)}>
                <Card style={{ gap: 10 }}>
                  <Row style={{ justifyContent: 'space-between' }}>
                    <Tx variant="bodyMedium">{a.worker}</Tx>
                    <Badge label="ADVANCE" tone="violet" />
                  </Row>
                  <Tx variant="sub" color={t.colors.textSecondary}>
                    {rupees(a.amount)} · {a.reason} · deduct {rupees(a.monthlyDeduction)}/mo
                  </Tx>
                  <DecisionButtons
                    decision={advanceDecisions[a.id]}
                    onApprove={() => { haptics.success(); decideAdvance(a.id, 'APPROVED'); }}
                    onReject={() => { haptics.warn(); decideAdvance(a.id, 'REJECTED'); }}
                  />
                </Card>
              </Animated.View>
            ))}
          </View>
        )}

        {/* Quick actions */}
        <SectionHeader title="QUICK ACTIONS" hindi="त्वरित" />
        <Row gap={10}>
          <QuickAction icon="qr-code-outline" label="Scan QR" onPress={() => router.push('/qr' as any)} />
          <QuickAction icon="camera-outline" label="Site photos" onPress={() => router.push('/site-photos' as any)} />
          <QuickAction icon="navigate-outline" label="Track gang" onPress={() => router.push('/track' as any)} />
          <QuickAction icon="stats-chart-outline" label="Reports" onPress={() => router.push('/reports' as any)} />
        </Row>

        {/* Live feed */}
        <SectionHeader title="LIVE FEED" hindi="गतिविधि" />
        {feed.isLoading ? (
          <Skeleton height={200} radius={16} />
        ) : (
          <Card style={{ padding: 0, overflow: 'hidden' }}>
            {(feed.data ?? []).map((f, i, arr) => (
              <View key={f.id}>
                <ListRow
                  title={f.message}
                  left={
                    <View style={{
                      minWidth: 46, paddingVertical: 4, borderRadius: 8, alignItems: 'center',
                      backgroundColor: t.colors.accentSoft,
                    }}>
                      <Tx variant="caption" color={t.colors.accentText}>{f.time}</Tx>
                    </View>
                  }
                />
                {i < arr.length - 1 ? <Divider inset={16} /> : null}
              </View>
            ))}
          </Card>
        )}

        {/* AI assistant strip */}
        <Pressable onPress={() => { haptics.press(); router.push('/ai' as any); }} style={{ marginTop: 20 }}>
          <Card tone="soft" style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <Ionicons name="sparkles" size={20} color={t.colors.violet} />
            <View style={{ flex: 1 }}>
              <Tx variant="bodyMedium">Ask MAJDOOR AI · सहायक</Tx>
              <Tx variant="caption" color={t.colors.textMuted}>"इस हफ़्ते की हाज़िरी रिपोर्ट बनाओ"</Tx>
            </View>
            <Ionicons name="mic-outline" size={20} color={t.colors.textMuted} />
          </Card>
        </Pressable>
      </ScrollView>
    </View>
  );
}
