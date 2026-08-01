import React, { useCallback, useState } from 'react';
import { View, ScrollView, RefreshControl, Pressable, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { AppHeader } from '../../src/ui/AppHeader';
import { Tx, Card, Row, Badge, StatTile, Skeleton, SectionHeader } from '../../src/ui';
import { useTheme } from '../../src/theme/ThemeContext';
import { useGangSheet } from '../../src/data/hooks';
import { DayMark } from '../../src/data/types';
import * as haptics from '../../src/lib/haptics';

const DAYS = ['MO', 'TU', 'WE', 'TH', 'FR', 'SA'] as const;
const TODAY_INDEX = 5; // Saturday — last column of the Mon–Sat strip

function DaySquare({ mark, emphasized }: { mark: DayMark; emphasized?: boolean }) {
  const t = useTheme();
  const bg = mark === 'P' ? t.colors.primary : mark === 'A' ? t.colors.dangerSoft : t.colors.amberSoft;
  const fg = mark === 'P' ? t.colors.onPrimary : mark === 'A' ? t.colors.danger : t.colors.warning;
  return (
    <View style={{
      flex: 1, aspectRatio: 1, maxWidth: 40, borderRadius: 8,
      alignItems: 'center', justifyContent: 'center', backgroundColor: bg,
      borderWidth: emphasized ? 2 : 0, borderColor: t.colors.text,
    }}>
      {mark !== 'P' ? (
        <Text style={{ fontFamily: t.fonts.bodySemiBold, fontSize: 13, color: fg }}>{mark}</Text>
      ) : null}
    </View>
  );
}

function MarkButton({ mark, active, onPress }: { mark: DayMark; active: boolean; onPress: () => void }) {
  const t = useTheme();
  const color = mark === 'P' ? t.colors.primary : mark === 'A' ? t.colors.danger : t.colors.warning;
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Mark ${mark === 'P' ? 'present' : mark === 'A' ? 'absent' : 'half day'}`}
      style={({ pressed }) => ({
        flex: 1, minHeight: 48, borderRadius: t.radius.md,
        alignItems: 'center', justifyContent: 'center',
        backgroundColor: active ? color : pressed ? t.colors.hairline : 'transparent',
        borderWidth: active ? 0 : 1, borderColor: t.colors.border,
      })}
    >
      <Text style={{
        fontFamily: t.fonts.bodySemiBold, fontSize: 15, letterSpacing: 1,
        color: active ? t.colors.onPrimary : color,
      }}>
        {mark}
      </Text>
    </Pressable>
  );
}

export default function SupervisorAttendance() {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const gang = useGangSheet();
  const [refreshing, setRefreshing] = useState(false);
  const [overrides, setOverrides] = useState<Record<string, DayMark>>({});

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await gang.refetch();
    setRefreshing(false);
  }, [gang]);

  const setMark = (workerId: string, mark: DayMark) => {
    haptics.success();
    setOverrides((o) => ({ ...o, [workerId]: mark }));
  };

  const overrideCount = Object.keys(overrides).length;

  return (
    <View style={{ flex: 1, backgroundColor: t.colors.bg }}>
      <AppHeader kicker="GANG SHEET · THIS WEEK" title="ATTENDANCE" />
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: insets.bottom + 28 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={t.colors.primary} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Today's stats */}
        <View style={{ gap: 10 }}>
          <Row gap={10}>
            <StatTile label="MARKED TODAY" value="5/6" delta="gang sheet" tone="up" />
            <StatTile label="GPS VERIFIED" value="5" delta="within geofence" />
          </Row>
          <Row gap={10}>
            <StatTile label="FACE" value="4" delta="selfie verified" />
            <StatTile label="OT" value="4.5h" delta="3 workers" tone="warn" />
          </Row>
        </View>

        <SectionHeader title="GANG SHEET" hindi="हाज़िरी पत्रक" />
        {gang.isLoading ? (
          <View style={{ gap: 10 }}>
            <Skeleton height={150} radius={16} />
            <Skeleton height={150} radius={16} />
            <Skeleton height={150} radius={16} />
          </View>
        ) : (
          <View style={{ gap: 10 }}>
            {(gang.data ?? []).map((g, i) => {
              const todayMark = overrides[g.workerId] ?? g.week[TODAY_INDEX];
              const week = g.week.map((m, idx) => (idx === TODAY_INDEX ? todayMark : m));
              return (
                <Animated.View key={g.workerId} entering={FadeInDown.delay(i * 50)}>
                  <Card style={{ gap: 12 }}>
                    <Row style={{ justifyContent: 'space-between' }}>
                      <View style={{ flex: 1, gap: 2 }}>
                        <Tx variant="bodyMedium" numberOfLines={1}>{g.name}</Tx>
                        <Tx variant="caption" color={t.colors.textMuted}>{g.skill}</Tx>
                      </View>
                      <Row gap={8}>
                        {g.punchIn ? <Badge label={`IN ${g.punchIn}`} tone="success" /> : <Badge label="NO PUNCH" tone="neutral" />}
                        {g.otToday ? <Badge label={`OT ${g.otToday}`} tone="warning" /> : null}
                      </Row>
                    </Row>

                    {/* Week strip Mon–Sat */}
                    <View style={{ gap: 4 }}>
                      <Row gap={6}>
                        {week.map((m, idx) => (
                          <DaySquare key={idx} mark={m} emphasized={idx === TODAY_INDEX} />
                        ))}
                      </Row>
                      <Row gap={6}>
                        {DAYS.map((d, idx) => (
                          <View key={d} style={{ flex: 1, maxWidth: 40, alignItems: 'center' }}>
                            <Text style={{
                              fontFamily: idx === TODAY_INDEX ? t.fonts.bodySemiBold : t.fonts.body,
                              fontSize: 10, letterSpacing: 0.8,
                              color: idx === TODAY_INDEX ? t.colors.text : t.colors.textMuted,
                            }}>
                              {d}
                            </Text>
                          </View>
                        ))}
                      </Row>
                    </View>

                    {/* Mark today */}
                    <Row gap={8}>
                      <Tx variant="caption" color={t.colors.textMuted} style={{ width: 40 }}>Mark</Tx>
                      <MarkButton mark="P" active={todayMark === 'P'} onPress={() => setMark(g.workerId, 'P')} />
                      <MarkButton mark="A" active={todayMark === 'A'} onPress={() => setMark(g.workerId, 'A')} />
                      <MarkButton mark="H" active={todayMark === 'H'} onPress={() => setMark(g.workerId, 'H')} />
                    </Row>
                  </Card>
                </Animated.View>
              );
            })}
          </View>
        )}

        {/* Legend + gate badges */}
        <Card style={{ marginTop: 16, gap: 12 }}>
          <Row gap={14} style={{ flexWrap: 'wrap' }}>
            <Row gap={6}>
              <View style={{ width: 14, height: 14, borderRadius: 4, backgroundColor: t.colors.primary }} />
              <Tx variant="caption" color={t.colors.textMuted}>P — Present</Tx>
            </Row>
            <Row gap={6}>
              <View style={{ width: 14, height: 14, borderRadius: 4, backgroundColor: t.colors.dangerSoft }} />
              <Tx variant="caption" color={t.colors.textMuted}>A — Absent</Tx>
            </Row>
            <Row gap={6}>
              <View style={{ width: 14, height: 14, borderRadius: 4, backgroundColor: t.colors.amberSoft }} />
              <Tx variant="caption" color={t.colors.textMuted}>H — Half day</Tx>
            </Row>
          </Row>
          <Row gap={8} style={{ flexWrap: 'wrap' }}>
            <Badge label="QR GATE 2 ACTIVE" tone="outline" />
            <Badge label="GEOFENCE 150 M" tone="outline" />
          </Row>
          <Tx variant="caption" color={overrideCount ? t.colors.warning : t.colors.textMuted}>
            Manual overrides today: {overrideCount} · logged against your supervisor ID
          </Tx>
        </Card>
      </ScrollView>
    </View>
  );
}
