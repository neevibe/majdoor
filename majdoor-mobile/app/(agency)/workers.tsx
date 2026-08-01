import React, { useCallback, useMemo, useState } from 'react';
import { View, FlatList, RefreshControl, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { AppHeader } from '../../src/ui/AppHeader';
import { Tx, Card, Row, Avatar, StatusBadge, Input, Segmented, EmptyState, SkeletonList } from '../../src/ui';
import { useTheme } from '../../src/theme/ThemeContext';
import { useWorkers } from '../../src/data/hooks';
import { Worker } from '../../src/data/types';
import * as haptics from '../../src/lib/haptics';

type Filter = 'ALL' | 'ON DUTY' | 'AVAILABLE' | 'INACTIVE';

const STATUS_MAP: Record<Exclude<Filter, 'ALL'>, Worker['status']> = {
  'ON DUTY': 'ON_DUTY',
  AVAILABLE: 'AVAILABLE',
  INACTIVE: 'INACTIVE',
};

export default function WorkersRegistry() {
  const t = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const workers = useWorkers();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Filter>('ALL');
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await workers.refetch();
    setRefreshing(false);
  }, [workers]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (workers.data ?? []).filter((w) => {
      if (filter !== 'ALL' && w.status !== STATUS_MAP[filter]) return false;
      if (!q) return true;
      return (
        w.name.toLowerCase().includes(q) ||
        w.id.toLowerCase().includes(q) ||
        w.skill.toLowerCase().includes(q) ||
        w.district.toLowerCase().includes(q)
      );
    });
  }, [workers.data, query, filter]);

  const renderItem = ({ item: w }: { item: Worker }) => (
    <Pressable onPress={() => { haptics.tap(); router.push(`/worker/${w.id}` as any); }}>
      {({ pressed }) => (
        <Card style={{ opacity: pressed ? 0.85 : 1 }}>
          <Row gap={12}>
            <Avatar initials={w.initials} />
            <View style={{ flex: 1, gap: 2 }}>
              <Tx variant="bodyMedium" numberOfLines={1}>{w.name}</Tx>
              <Tx variant="caption" color={t.colors.textMuted}>{w.id}</Tx>
              <Tx variant="caption" color={t.colors.textSecondary}>
                {w.skill} ({w.category}) · {w.district}
              </Tx>
            </View>
            <View style={{ alignItems: 'flex-end', gap: 4 }}>
              <Tx variant="h3" color={t.colors.primary}>₹{w.dailyWage}/day</Tx>
              <Tx variant="caption" color={t.colors.textSecondary}>★ {w.rating.toFixed(1)}</Tx>
              <StatusBadge status={w.status} />
            </View>
          </Row>
        </Card>
      )}
    </Pressable>
  );

  return (
    <View style={{ flex: 1, backgroundColor: t.colors.bg }}>
      <AppHeader kicker="REGISTRY · 2,48,312 PROFILES" title="WORKERS" />
      <View style={{ paddingHorizontal: 20, gap: 10, paddingBottom: 10 }}>
        <Input
          placeholder="Search name, ID, skill, district…"
          value={query}
          onChangeText={setQuery}
          autoCorrect={false}
          returnKeyType="search"
        />
        <Segmented
          options={['ALL', 'ON DUTY', 'AVAILABLE', 'INACTIVE'] as const}
          value={filter}
          onChange={setFilter}
        />
      </View>

      {workers.isLoading ? (
        <SkeletonList rows={6} />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(w) => w.id}
          renderItem={renderItem}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: insets.bottom + 110, gap: 10 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={t.colors.primary} />}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <EmptyState
              icon="people-outline"
              title="NO WORKERS MATCH"
              body="Try a different name, skill or district."
              actionTitle="Clear filters"
              onAction={() => { setQuery(''); setFilter('ALL'); }}
            />
          }
        />
      )}

      {/* Register worker FAB */}
      <Pressable
        onPress={() => { haptics.press(); router.push('/register-worker' as any); }}
        accessibilityRole="button"
        accessibilityLabel="Register worker"
        style={({ pressed }) => ({
          position: 'absolute', right: 20, bottom: insets.bottom + 20,
          width: 56, height: 56, borderRadius: 28,
          alignItems: 'center', justifyContent: 'center',
          backgroundColor: t.colors.primary,
          shadowColor: '#000', shadowOpacity: 0.25, shadowRadius: 8, shadowOffset: { width: 0, height: 4 },
          elevation: 6,
          transform: [{ scale: pressed ? 0.94 : 1 }],
        })}
      >
        <Ionicons name="add" size={30} color={t.colors.onPrimary} />
      </Pressable>
    </View>
  );
}
