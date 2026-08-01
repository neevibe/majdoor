import React, { useCallback, useMemo, useState } from 'react';
import { View, FlatList, RefreshControl, Pressable, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { AppHeader } from '../../src/ui/AppHeader';
import { Tx, Card, Row, Badge, Button, Input, SkeletonList, EmptyState } from '../../src/ui';
import { useTheme } from '../../src/theme/ThemeContext';
import { useJobs } from '../../src/data/hooks';
import { useSession } from '../../src/data/stores/session';
import { Job } from '../../src/data/types';
import { rupees } from '../../src/lib/format';
import * as haptics from '../../src/lib/haptics';

type DistFilter = 'ALL' | '10' | '50';

const FILTERS: { key: DistFilter; label: string }[] = [
  { key: 'ALL', label: 'ALL' },
  { key: '10', label: '< 10 KM' },
  { key: '50', label: '< 50 KM' },
];

function FilterChip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  const t = useTheme();
  return (
    <Pressable
      onPress={() => { haptics.tap(); onPress(); }}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      style={{
        minHeight: 48, paddingHorizontal: 18, borderRadius: t.radius.full,
        alignItems: 'center', justifyContent: 'center',
        backgroundColor: active ? t.colors.primary : t.colors.surface,
        borderWidth: 1, borderColor: active ? t.colors.primary : t.colors.border,
      }}
    >
      <Text style={{
        fontFamily: t.fonts.bodySemiBold, fontSize: 12, letterSpacing: 0.8,
        color: active ? t.colors.onPrimary : t.colors.textSecondary,
      }}>
        {label}
      </Text>
    </Pressable>
  );
}

function JobCard({ job, index, applied, onApply, onOpen }: {
  job: Job; index: number; applied: boolean; onApply: () => void; onOpen: () => void;
}) {
  const t = useTheme();
  return (
    <Animated.View entering={FadeInDown.delay(index * 40)}>
      <Pressable onPress={() => { haptics.tap(); onOpen(); }} accessibilityRole="button" accessibilityLabel={job.title}>
        <Card style={{ gap: 8 }}>
          <Row style={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <View style={{ flex: 1, gap: 2 }}>
              <Tx variant="h3">{job.title}</Tx>
              <Tx variant="caption" color={t.colors.textMuted}>
                {job.site} · {job.distanceKm} km · {job.startNote}
              </Tx>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Tx variant="h3" color={t.colors.primary}>{rupees(job.wage)}</Tx>
              <Tx variant="caption" color={t.colors.textMuted}>per day</Tx>
            </View>
          </Row>
          <Row style={{ justifyContent: 'space-between' }}>
            <Tx variant="sub" color={t.colors.textSecondary} style={{ flex: 1 }} numberOfLines={1}>
              {job.need}
            </Tx>
            {applied ? (
              <Badge label="भेजा ✓ APPLIED" tone="success" />
            ) : (
              <Button title="Apply · आवेदन" small onPress={onApply} />
            )}
          </Row>
        </Card>
      </Pressable>
    </Animated.View>
  );
}

export default function Jobs() {
  const t = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const jobs = useJobs();
  const { appliedJobs, applyJob } = useSession();
  const [query, setQuery] = useState('');
  const [dist, setDist] = useState<DistFilter>('ALL');
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await jobs.refetch();
    setRefreshing(false);
  }, [jobs]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (jobs.data ?? []).filter((j) => {
      if (dist !== 'ALL' && j.distanceKm >= Number(dist)) return false;
      if (!q) return true;
      return `${j.title} ${j.site} ${j.district} ${j.need}`.toLowerCase().includes(q);
    });
  }, [jobs.data, query, dist]);

  return (
    <View style={{ flex: 1, backgroundColor: t.colors.bg }}>
      <AppHeader kicker="पास का काम · GAYA + 50 KM" title="JOBS" />
      <View style={{ paddingHorizontal: 20, gap: 12, paddingBottom: 12 }}>
        <Input
          placeholder="Search skill, site… · खोजें"
          value={query}
          onChangeText={setQuery}
          returnKeyType="search"
          accessibilityLabel="Search jobs"
        />
        <Row gap={8}>
          {FILTERS.map((f) => (
            <FilterChip key={f.key} label={f.label} active={dist === f.key} onPress={() => setDist(f.key)} />
          ))}
        </Row>
      </View>

      {jobs.isLoading ? (
        <SkeletonList rows={5} />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(j) => j.id}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: insets.bottom + 28, gap: 12 }}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={t.colors.primary} />}
          renderItem={({ item, index }) => (
            <JobCard
              job={item}
              index={index}
              applied={!!appliedJobs[item.id]}
              onApply={() => { haptics.success(); applyJob(item.id); }}
              onOpen={() => router.push(`/job/${item.id}` as any)}
            />
          )}
          ListEmptyComponent={
            <EmptyState
              icon="briefcase-outline"
              title="No jobs match"
              body="कोई काम नहीं मिला — try a wider distance or clear the search."
              actionTitle="Clear filters"
              onAction={() => { setQuery(''); setDist('ALL'); }}
            />
          }
        />
      )}
    </View>
  );
}
