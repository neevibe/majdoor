import React, { useCallback, useMemo, useState } from 'react';
import { View, ScrollView, RefreshControl, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Linking from 'expo-linking';
import { Tx, Card, Row, Badge, Segmented, ProgressBar, Skeleton } from '../src/ui';
import { useTheme } from '../src/theme/ThemeContext';
import { useAgencies } from '../src/data/hooks';
import { formatIN } from '../src/lib/format';
import * as haptics from '../src/lib/haptics';

type Sort = 'SCORE' | 'WORKERS';

export default function Agencies() {
  const t = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const agencies = useAgencies();
  const [sort, setSort] = useState<Sort>('SCORE');
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await agencies.refetch();
    setRefreshing(false);
  }, [agencies]);

  const sorted = useMemo(() => {
    const list = [...(agencies.data ?? [])];
    return list.sort((a, b) =>
      sort === 'SCORE' ? b.complianceScore - a.complianceScore : b.workers - a.workers,
    );
  }, [agencies.data, sort]);

  const scoreColor = (s: number) =>
    s >= 90 ? t.colors.success : s >= 80 ? t.colors.warning : t.colors.danger;
  const scoreTone = (s: number): 'success' | 'warning' | 'danger' =>
    s >= 90 ? 'success' : s >= 80 ? 'warning' : 'danger';

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
            <Tx variant="kicker">1,240 REGISTERED · एजेंसी</Tx>
            <Tx variant="h1" numberOfLines={1}>AGENCIES</Tx>
          </View>
        </Row>
      </View>

      <View style={{ paddingHorizontal: 20, paddingBottom: 10 }}>
        <Segmented options={['SCORE', 'WORKERS'] as const} value={sort} onChange={setSort} />
      </View>

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: insets.bottom + 28, gap: 10 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={t.colors.primary} />}
        showsVerticalScrollIndicator={false}
      >
        {agencies.isLoading ? (
          <>
            <Skeleton height={120} radius={16} />
            <Skeleton height={120} radius={16} />
            <Skeleton height={120} radius={16} />
          </>
        ) : (
          sorted.map((a) => (
            <Card key={a.id} style={{ gap: 10 }}>
              <Row style={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <View style={{ flex: 1, gap: 2 }}>
                  <Tx variant="h3" numberOfLines={1}>{a.name}</Tx>
                  <Tx variant="caption" color={t.colors.textMuted}>
                    {a.owner} · {a.district} · {formatIN(a.workers)} workers
                  </Tx>
                </View>
                <Pressable
                  onPress={() => { haptics.tap(); Linking.openURL(`tel:${a.phone.replace(/\s/g, '')}`); }}
                  accessibilityRole="button"
                  accessibilityLabel={`Call ${a.name}`}
                  hitSlop={8}
                  style={({ pressed }) => ({
                    width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center',
                    backgroundColor: pressed ? t.colors.hairline : t.colors.accentSoft,
                    borderWidth: 1, borderColor: t.colors.border,
                  })}
                >
                  <Ionicons name="call-outline" size={19} color={t.colors.accent} />
                </Pressable>
              </Row>
              <Row gap={12}>
                <View style={{ flex: 1 }}>
                  <ProgressBar value={a.complianceScore / 100} color={scoreColor(a.complianceScore)} />
                </View>
                <Badge label={`${a.complianceScore} / 100`} tone={scoreTone(a.complianceScore)} />
              </Row>
            </Card>
          ))
        )}
      </ScrollView>
    </View>
  );
}
