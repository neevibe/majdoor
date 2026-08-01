import React, { useCallback, useState } from 'react';
import { View, ScrollView, RefreshControl, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { AppHeader } from '../../src/ui/AppHeader';
import { Tx, Card, Row, Badge, Button, SectionHeader, StatTile, Skeleton } from '../../src/ui';
import { useTheme } from '../../src/theme/ThemeContext';
import { useSession } from '../../src/data/stores/session';
import { useWorkerMonth } from '../../src/data/hooks';
import { AttendanceDay } from '../../src/data/types';
import * as haptics from '../../src/lib/haptics';

function DayCell({ day }: { day: AttendanceDay }) {
  const t = useTheme();
  const dayNum = Number(day.date.slice(-2));
  const bg = day.mark === 'P' ? t.colors.primary : day.mark === 'A' ? t.colors.dangerSoft : t.colors.amberSoft;
  const fg = day.mark === 'P' ? t.colors.onPrimary : day.mark === 'A' ? t.colors.danger : t.colors.warning;
  return (
    <View style={{ width: `${100 / 7}%`, aspectRatio: 1, padding: 3 }}>
      <View style={{
        flex: 1, borderRadius: t.radius.sm, alignItems: 'center', justifyContent: 'center',
        backgroundColor: bg,
      }}>
        <Text style={{ fontFamily: t.fonts.bodySemiBold, fontSize: 13, color: fg }}>{dayNum}</Text>
        {day.mark !== 'P' ? (
          <Text style={{ fontFamily: t.fonts.bodyBold, fontSize: 9, letterSpacing: 1, color: fg }}>{day.mark}</Text>
        ) : null}
      </View>
    </View>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  const t = useTheme();
  return (
    <Row gap={6}>
      <View style={{ width: 10, height: 10, borderRadius: 3, backgroundColor: color }} />
      <Tx variant="caption" color={t.colors.textMuted}>{label}</Tx>
    </Row>
  );
}

export default function Attendance() {
  const t = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { punchPhase, punchedInAt } = useSession();
  const month = useWorkerMonth();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await month.refetch();
    setRefreshing(false);
  }, [month]);

  const punched = punchPhase === 'done';

  return (
    <View style={{ flex: 1, backgroundColor: t.colors.bg }}>
      <AppHeader kicker="हाज़िरी · GPS · FACE" title="ATTENDANCE" />
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: insets.bottom + 28 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={t.colors.primary} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Today */}
        <Animated.View entering={FadeInDown}>
          <Card tone="hero" style={{ gap: 10 }}>
            <Row style={{ justifyContent: 'space-between' }}>
              <Tx variant="kicker" color="rgba(255,255,255,0.6)">आज · TODAY · SAT 2 AUG</Tx>
              <Badge label="SHIFT 08:00–17:00" tone="outline" />
            </Row>
            <Row gap={12}>
              <View style={{
                width: 52, height: 52, borderRadius: 16, alignItems: 'center', justifyContent: 'center',
                backgroundColor: punched ? 'rgba(52,211,153,0.15)' : 'rgba(255,255,255,0.08)',
              }}>
                <Ionicons
                  name={punched ? 'checkmark-circle' : 'finger-print'}
                  size={26}
                  color={punched ? '#34D399' : 'rgba(255,255,255,0.8)'}
                />
              </View>
              <View style={{ flex: 1, gap: 2 }}>
                <Tx variant="h3" color={t.colors.heroText}>
                  {punched ? `हाज़िर ✓ · IN ${punchedInAt ?? ''}` : 'NOT PUNCHED IN YET'}
                </Tx>
                <Tx variant="caption" color="rgba(255,255,255,0.6)">
                  {punched ? 'GPS ✓ · FACE ✓ · Gate 2' : 'GPS + face verification at Gate 2'}
                </Tx>
              </View>
            </Row>
            {!punched ? (
              <Button
                title="हाज़िरी लगाएं · PUNCH IN"
                icon="finger-print"
                onPress={() => { haptics.press(); router.push('/punch' as any); }}
                style={{ marginTop: 4 }}
              />
            ) : null}
          </Card>
        </Animated.View>

        {/* July calendar */}
        <SectionHeader title="JULY 2026" hindi="जुलाई" />
        {month.isLoading ? (
          <Skeleton height={260} radius={16} />
        ) : (
          <Animated.View entering={FadeInDown.delay(60)}>
            <Card style={{ gap: 12 }}>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                {(month.data ?? []).map((d) => <DayCell key={d.date} day={d} />)}
              </View>
              <Row gap={16} style={{ flexWrap: 'wrap' }}>
                <LegendDot color={t.colors.primary} label="Present 26" />
                <LegendDot color={t.colors.danger} label="Absent 1" />
                <LegendDot color={t.colors.warning} label="Half+OT on 14, 21" />
              </Row>
            </Card>
          </Animated.View>
        )}

        {/* This week */}
        <SectionHeader title="THIS WEEK" hindi="इस हफ़्ते" />
        <Animated.View entering={FadeInDown.delay(120)}>
          <Card style={{ gap: 8 }}>
            <Row style={{ justifyContent: 'space-between' }}>
              <View style={{ gap: 2 }}>
                <Tx variant="num">6/6 days</Tx>
                <Tx variant="caption" color={t.colors.textMuted}>Mon–Sat · all GPS + face verified</Tx>
              </View>
              <View style={{ alignItems: 'flex-end', gap: 2 }}>
                <Tx variant="h3" color={t.colors.warning}>4.5h OT</Tx>
                <Tx variant="caption" color={t.colors.textMuted}>overtime · ओवरटाइम</Tx>
              </View>
            </Row>
          </Card>
        </Animated.View>

        {/* Monthly stats */}
        <SectionHeader title="JULY SUMMARY" hindi="महीना" />
        <Animated.View entering={FadeInDown.delay(180)}>
          <Row gap={10}>
            <StatTile label="DAYS" value="26/27" style={{ minWidth: 0 }} />
            <StatTile label="OT HOURS" value="12" style={{ minWidth: 0 }} />
            <StatTile label="STREAK" value="6 days" delta="lagatar · लगातार" tone="up" style={{ minWidth: 0 }} />
          </Row>
        </Animated.View>
      </ScrollView>
    </View>
  );
}
