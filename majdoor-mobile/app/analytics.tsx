import React, { useMemo, useState } from 'react';
import { View, ScrollView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Polyline, Polygon, Circle, Line } from 'react-native-svg';
import { Tx, Card, Row, Badge, SectionHeader, ProgressBar, Skeleton, Divider } from '../src/ui';
import { useTheme } from '../src/theme/ThemeContext';
import { ATTENDANCE_SERIES, ATTENDANCE_DATES, WATCHDOG } from '../src/data/mock';
import { formatIN } from '../src/lib/format';
import * as haptics from '../src/lib/haptics';

const INSIGHTS = [
  {
    id: 'i1',
    title: 'SEPTEMBER SHORTAGE FORECAST',
    body: 'Statewide shortage of ~4,800 workers predicted. Masons in Patna −22%, helpers in Begusarai −18%. Recommendation: pre-book 2,100 workers from the Purnia–Katihar corridor (est. mobilisation ₹18.4 L).',
  },
  {
    id: 'i2',
    title: 'MADHUBANI OUT-MIGRATION',
    body: '1,620 workers moved to NCR/Gujarat this quarter — highest in the state. Driver: post-monsoon farm slack plus a ₹120/day wage gap vs Surat. The ₹560 wage floor retains ~38%.',
  },
  {
    id: 'i3',
    title: 'GHOST PUNCHING — JSW BANKA',
    body: 'Gate 3 logged 11 manual overrides this week — pattern consistent with ghost punching. Fraud-review ticket #FR-2210 opened; supervisor device audit recommended.',
  },
];

const INDUSTRIES = [
  { name: 'Construction', workers: 82400 },
  { name: 'Agriculture', workers: 31600 },
  { name: 'Manufacturing', workers: 28700 },
  { name: 'Infrastructure', workers: 24080 },
  { name: 'Warehousing', workers: 22140 },
];
const IND_MAX = Math.max(...INDUSTRIES.map((i) => i.workers));

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
  const areaStr = pts.length ? `${lineStr} ${pts[pts.length - 1].x},${h - 2} ${pts[0].x},${h - 2}` : '';
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

export default function Analytics() {
  const t = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const sevColor = (s: 'critical' | 'warn' | 'ok') =>
    s === 'critical' ? t.colors.danger : s === 'warn' ? t.colors.warning : t.colors.success;

  return (
    <View style={{ flex: 1, backgroundColor: t.colors.bg }}>
      {/* Back row */}
      <View style={{ paddingTop: insets.top + 8, paddingHorizontal: 20, paddingBottom: 12 }}>
        <Row gap={12}>
          <Pressable
            onPress={() => { haptics.tap(); router.back(); }}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Back"
            style={({ pressed }) => ({
              width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center',
              backgroundColor: pressed ? t.colors.hairline : t.colors.surface,
              borderWidth: 1, borderColor: t.colors.border,
            })}
          >
            <Ionicons name="chevron-back" size={22} color={t.colors.text} />
          </Pressable>
          <View style={{ flex: 1, gap: 2 }}>
            <Tx variant="kicker">STATE INTELLIGENCE · विश्लेषण</Tx>
            <Tx variant="h1" numberOfLines={1}>ANALYTICS · AI INSIGHTS</Tx>
          </View>
        </Row>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: insets.bottom + 28 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Attendance chart */}
        <Card style={{ gap: 8 }}>
          <Row style={{ justifyContent: 'space-between' }}>
            <Tx variant="kicker">ATTENDANCE — LAST 14 DAYS</Tx>
            <Badge label="92.4% AVG" tone="accent" />
          </Row>
          <AttendanceChart />
        </Card>

        {/* AI insights */}
        <SectionHeader title="AI INSIGHTS" hindi="सुझाव" />
        <View style={{ gap: 10 }}>
          {INSIGHTS.map((ins) => (
            <Card key={ins.id} style={{ gap: 8, borderColor: t.colors.violet, borderWidth: 1 }}>
              <Row gap={8}>
                <Ionicons name="sparkles" size={16} color={t.colors.violet} />
                <Tx variant="kicker" color={t.colors.violet}>{ins.title}</Tx>
              </Row>
              <Tx variant="sub" color={t.colors.textSecondary}>{ins.body}</Tx>
              <Pressable
                onPress={() => { haptics.tap(); router.push('/ai' as any); }}
                hitSlop={10}
                accessibilityRole="button"
                style={{ minHeight: 32, justifyContent: 'center' }}
              >
                <Tx variant="subMedium" color={t.colors.violet}>Ask follow-up →</Tx>
              </Pressable>
            </Card>
          ))}
        </View>

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

        {/* Industries */}
        <SectionHeader title="INDUSTRIES" hindi="उद्योग" />
        <Card style={{ gap: 14 }}>
          {INDUSTRIES.map((ind) => (
            <View key={ind.name} style={{ gap: 6 }}>
              <Row style={{ justifyContent: 'space-between' }}>
                <Tx variant="subMedium">{ind.name}</Tx>
                <Tx variant="subMedium" color={t.colors.textSecondary}>{formatIN(ind.workers)}</Tx>
              </Row>
              <ProgressBar value={ind.workers / IND_MAX} />
            </View>
          ))}
        </Card>
      </ScrollView>
    </View>
  );
}
