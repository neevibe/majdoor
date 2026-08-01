import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, ScrollView, RefreshControl, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Polyline, Polygon, Circle, Line } from 'react-native-svg';
import Animated, {
  useSharedValue, useAnimatedStyle, withRepeat, withSequence, withTiming, Easing,
} from 'react-native-reanimated';
import { AppHeader } from '../../src/ui/AppHeader';
import { Tx, Card, Row, Badge, SectionHeader, StatTile, ProgressBar, Skeleton, Divider } from '../../src/ui';
import { useTheme } from '../../src/theme/ThemeContext';
import { useAuth } from '../../src/data/stores/auth';
import { useFeed } from '../../src/data/hooks';
import {
  DISTRICTS, DASH_KPIS_WORKFORCE, DASH_KPIS_MONEY, ATTENDANCE_SERIES, ATTENDANCE_DATES,
  COMPLIANCE_QUEUE, WATCHDOG,
} from '../../src/data/mock';
import { formatIN } from '../../src/lib/format';
import * as haptics from '../../src/lib/haptics';

const TOP_DISTRICTS = [...DISTRICTS].sort((a, b) => b.workers - a.workers).slice(0, 5);
const MAX_WORKERS = 28460;

function LivePill() {
  const t = useTheme();
  const pulse = useSharedValue(1);
  useEffect(() => {
    pulse.value = withRepeat(
      withSequence(
        withTiming(0.25, { duration: 700, easing: Easing.inOut(Easing.quad) }),
        withTiming(1, { duration: 700, easing: Easing.inOut(Easing.quad) }),
      ),
      -1,
    );
  }, [pulse]);
  const dot = useAnimatedStyle(() => ({ opacity: pulse.value }));
  return (
    <Row gap={8} style={{
      alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 7,
      borderRadius: t.radius.full, backgroundColor: t.colors.successSoft, marginBottom: 12,
    }}>
      <Animated.View style={[dot, { width: 8, height: 8, borderRadius: 4, backgroundColor: t.colors.success }]} />
      <Tx variant="caption" color={t.colors.success} style={{ fontFamily: t.fonts.bodySemiBold, letterSpacing: 0.8 }}>
        LIVE · 84,212 ON DUTY
      </Tx>
    </Row>
  );
}

function AttendanceChart() {
  const t = useTheme();
  const [w, setW] = useState(0);
  const [sel, setSel] = useState<number | null>(null);
  const h = 150;
  const padX = 6, padTop = 16, padBottom = 8;
  const min = 84, max = 95;
  const n = ATTENDANCE_SERIES.length;

  const pts = useMemo(() => {
    if (w <= 0) return [];
    return ATTENDANCE_SERIES.map((v, i) => ({
      x: padX + (i / (n - 1)) * (w - padX * 2),
      y: padTop + (1 - (v - min) / (max - min)) * (h - padTop - padBottom),
    }));
  }, [w, n]);

  const lineStr = pts.map((p) => `${p.x},${p.y}`).join(' ');
  const areaStr = pts.length
    ? `${lineStr} ${pts[pts.length - 1].x},${h - 2} ${pts[0].x},${h - 2}`
    : '';
  const last = pts[pts.length - 1];

  return (
    <View onLayout={(e) => setW(e.nativeEvent.layout.width)}>
      {sel !== null ? (
        <Tx variant="caption" color={t.colors.primary} style={{ marginBottom: 4, fontFamily: t.fonts.bodySemiBold }}>
          {ATTENDANCE_DATES[sel]} · {ATTENDANCE_SERIES[sel]}%
        </Tx>
      ) : (
        <Tx variant="caption" color={t.colors.textMuted} style={{ marginBottom: 4 }}>
          Tap the chart for daily detail
        </Tx>
      )}
      {w > 0 ? (
        <View>
          <Svg width={w} height={h}>
            {[0.25, 0.5, 0.75].map((f) => (
              <Line
                key={f}
                x1={padX} x2={w - padX}
                y1={padTop + f * (h - padTop - padBottom)}
                y2={padTop + f * (h - padTop - padBottom)}
                stroke={t.colors.border}
                strokeWidth={1}
                strokeDasharray="3 5"
              />
            ))}
            <Polygon points={areaStr} fill={t.colors.primary} fillOpacity={0.12} />
            <Polyline points={lineStr} fill="none" stroke={t.colors.primary} strokeWidth={2.5} strokeLinejoin="round" />
            {sel !== null && pts[sel] ? (
              <>
                <Line x1={pts[sel].x} x2={pts[sel].x} y1={padTop - 4} y2={h - 2} stroke={t.colors.textMuted} strokeWidth={1} strokeDasharray="2 4" />
                <Circle cx={pts[sel].x} cy={pts[sel].y} r={5} fill={t.colors.primary} stroke={t.colors.card} strokeWidth={2} />
              </>
            ) : null}
            {last ? <Circle cx={last.x} cy={last.y} r={4.5} fill={t.colors.primary} stroke={t.colors.card} strokeWidth={2} /> : null}
          </Svg>
          {/* Pressable columns for tooltips */}
          <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, flexDirection: 'row' }}>
            {ATTENDANCE_SERIES.map((_, i) => (
              <Pressable
                key={i}
                accessibilityLabel={`${ATTENDANCE_DATES[i]}: ${ATTENDANCE_SERIES[i]} percent`}
                onPress={() => { haptics.tap(); setSel((s) => (s === i ? null : i)); }}
                style={{ flex: 1 }}
              />
            ))}
          </View>
        </View>
      ) : (
        <Skeleton height={h} radius={12} />
      )}
      <Row style={{ justifyContent: 'space-between', marginTop: 6 }}>
        <Tx variant="caption" color={t.colors.textMuted}>{ATTENDANCE_DATES[0]}</Tx>
        <Tx variant="caption" color={t.colors.textMuted}>{ATTENDANCE_DATES[n - 1]}</Tx>
      </Row>
    </View>
  );
}

export default function AgencyDashboard() {
  const t = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const user = useAuth((s) => s.user);
  const feed = useFeed();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await feed.refetch();
    setRefreshing(false);
  }, [feed]);

  const kicker =
    user?.role === 'admin' ? 'SUPER ADMIN · STATE OVERVIEW'
    : user?.role === 'government' ? 'BIHAR LABOUR DEPT'
    : user?.role === 'agency' ? 'ठेकेदार · MITHILA MANPOWER'
    : (user?.orgName ?? 'MAJDOOR').toUpperCase();

  const sevColor = (s: 'critical' | 'warn' | 'ok') =>
    s === 'critical' ? t.colors.danger : s === 'warn' ? t.colors.warning : t.colors.success;

  return (
    <View style={{ flex: 1, backgroundColor: t.colors.bg }}>
      <AppHeader kicker={kicker} title="DASHBOARD" />
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: insets.bottom + 28 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={t.colors.primary} />}
        showsVerticalScrollIndicator={false}
      >
        <LivePill />

        {/* Workforce KPIs */}
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
          {DASH_KPIS_WORKFORCE.map((k) => (
            <StatTile key={k.label} label={k.label} value={k.value} delta={k.delta} tone={k.tone} />
          ))}
        </View>

        {/* Money & compliance KPIs */}
        <SectionHeader title="MONEY & COMPLIANCE" hindi="पैसा" />
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
          {DASH_KPIS_MONEY.map((k) => (
            <StatTile key={k.label} label={k.label} value={k.value} delta={k.delta} tone={k.tone} />
          ))}
        </View>

        {/* Attendance chart */}
        <SectionHeader title="ATTENDANCE — LAST 14 DAYS" hindi="हाज़िरी" />
        <Card style={{ gap: 8 }}>
          <Row style={{ justifyContent: 'space-between' }}>
            <Tx variant="kicker">STATEWIDE %</Tx>
            <Badge label="92.4% AVG" tone="accent" />
          </Row>
          <AttendanceChart />
        </Card>

        {/* Top districts */}
        <SectionHeader title="TOP DISTRICTS" hindi="ज़िले" action="View full map →" onAction={() => router.push('/bihar-map' as any)} />
        <Card style={{ gap: 14 }}>
          {TOP_DISTRICTS.map((d) => (
            <View key={d.name} style={{ gap: 6 }}>
              <Row style={{ justifyContent: 'space-between' }}>
                <Tx variant="subMedium">{d.name}</Tx>
                <Tx variant="subMedium" color={t.colors.textSecondary}>{formatIN(d.workers)}</Tx>
              </Row>
              <ProgressBar value={d.workers / MAX_WORKERS} />
            </View>
          ))}
        </Card>

        {/* Compliance queue */}
        <SectionHeader title="COMPLIANCE QUEUE" hindi="अनुपालन" />
        <Card style={{ padding: 0, overflow: 'hidden' }}>
          {COMPLIANCE_QUEUE.map((c, i, arr) => (
            <View key={c.item}>
              <Row style={{ justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 13, minHeight: 48 }}>
                <View style={{ flex: 1, gap: 2 }}>
                  <Tx variant="bodyMedium">{c.item}</Tx>
                  <Tx variant="caption" color={t.colors.textMuted}>{c.pending} pending</Tx>
                </View>
                <Badge
                  label={`DUE ${c.due.toUpperCase()}`}
                  tone={c.due === 'rolling' ? 'neutral' : 'warning'}
                />
              </Row>
              {i < arr.length - 1 ? <Divider inset={16} /> : null}
            </View>
          ))}
        </Card>

        {/* Live feed */}
        <SectionHeader title="LIVE FEED" hindi="गतिविधि" />
        {feed.isLoading ? (
          <Skeleton height={180} radius={16} />
        ) : (
          <Card style={{ padding: 0, overflow: 'hidden' }}>
            {(feed.data ?? []).map((f, i, arr) => (
              <View key={f.id}>
                <Row gap={12} style={{ paddingHorizontal: 16, paddingVertical: 12, alignItems: 'flex-start', minHeight: 48 }}>
                  <Tx variant="caption" color={t.colors.textMuted} style={{ width: 38, marginTop: 2 }}>{f.time}</Tx>
                  <Tx variant="sub" style={{ flex: 1 }}>{f.message}</Tx>
                </Row>
                {i < arr.length - 1 ? <Divider inset={16} /> : null}
              </View>
            ))}
          </Card>
        )}

        {/* Watchdog */}
        <SectionHeader title="WATCHDOG" hindi="निगरानी" />
        <Card style={{ padding: 0, overflow: 'hidden' }}>
          {WATCHDOG.map((wd, i, arr) => (
            <View key={wd.label}>
              <Row style={{ justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 13, minHeight: 48 }}>
                <Row gap={8} style={{ flex: 1 }}>
                  <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: sevColor(wd.severity) }} />
                  <Tx variant="sub">{wd.label}</Tx>
                </Row>
                <Tx variant="subMedium" color={sevColor(wd.severity)}>{wd.value}</Tx>
              </Row>
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
              <Tx variant="caption" color={t.colors.textMuted}>"Predict manpower shortage for September."</Tx>
            </View>
            <Ionicons name="mic-outline" size={20} color={t.colors.textMuted} />
          </Card>
        </Pressable>
      </ScrollView>
    </View>
  );
}
