import React, { useCallback, useMemo, useState } from 'react';
import { View, ScrollView, RefreshControl, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Linking from 'expo-linking';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { AppHeader } from '../../src/ui/AppHeader';
import {
  Tx, Card, Row, Button, StatusBadge, Avatar, Divider, Input, Segmented, EmptyState, SkeletonList,
} from '../../src/ui';
import { useTheme } from '../../src/theme/ThemeContext';
import { useWorkers } from '../../src/data/hooks';
import { rupees } from '../../src/lib/format';
import * as haptics from '../../src/lib/haptics';

const FILTERS = ['ALL', 'ON_DUTY', 'AVAILABLE', 'INACTIVE'] as const;
type Filter = (typeof FILTERS)[number];

export default function SupervisorWorkers() {
  const t = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const workers = useWorkers();

  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Filter>('ALL');
  const [refreshing, setRefreshing] = useState(false);
  const [selectMode, setSelectMode] = useState(false);
  const [selected, setSelected] = useState<Record<string, boolean>>({});

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await workers.refetch();
    setRefreshing(false);
  }, [workers]);

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (workers.data ?? []).filter((w) => {
      if (filter !== 'ALL' && w.status !== filter) return false;
      if (q && !`${w.name} ${w.skill} ${w.district} ${w.id}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [workers.data, query, filter]);

  const selectedCount = Object.values(selected).filter(Boolean).length;

  const toggleSelect = (id: string) => {
    haptics.tap();
    setSelected((s) => ({ ...s, [id]: !s[id] }));
  };

  const confirmAssign = () => {
    haptics.success();
    setSelected({});
    setSelectMode(false);
  };

  const clearFilters = () => {
    setQuery('');
    setFilter('ALL');
  };

  const IconBtn = ({ name, onPress, label }: {
    name: keyof typeof Ionicons.glyphMap; onPress: () => void; label: string;
  }) => (
    <Pressable
      onPress={() => { haptics.tap(); onPress(); }}
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={4}
      style={({ pressed }) => ({
        width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center',
        backgroundColor: pressed ? t.colors.hairline : t.colors.accentSoft,
      })}
    >
      <Ionicons name={name} size={19} color={t.colors.accent} />
    </Pressable>
  );

  return (
    <View style={{ flex: 1, backgroundColor: t.colors.bg }}>
      <AppHeader kicker="GANG · 6 ACTIVE" title="WORKERS" />
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: insets.bottom + 110 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={t.colors.primary} />}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={{ gap: 12 }}>
          <Input
            placeholder="Search name, skill, district… · खोजें"
            value={query}
            onChangeText={setQuery}
            returnKeyType="search"
          />
          <Segmented
            options={FILTERS}
            value={filter}
            onChange={setFilter}
            labels={{ ALL: 'ALL', ON_DUTY: 'ON DUTY', AVAILABLE: 'AVAILABLE', INACTIVE: 'INACTIVE' }}
          />
        </View>

        {selectMode ? (
          <Card tone="accent" style={{ marginTop: 12, paddingVertical: 10 }}>
            <Row style={{ justifyContent: 'space-between' }}>
              <Tx variant="subMedium" color={t.colors.primary}>
                Select workers to assign · {selectedCount} selected
              </Tx>
              <Pressable onPress={() => { haptics.tap(); setSelectMode(false); setSelected({}); }} hitSlop={12}>
                <Tx variant="subMedium" color={t.colors.textMuted}>Cancel</Tx>
              </Pressable>
            </Row>
          </Card>
        ) : null}

        <View style={{ marginTop: 12 }}>
          {workers.isLoading ? (
            <Card style={{ padding: 0 }}><SkeletonList rows={6} /></Card>
          ) : list.length === 0 ? (
            <Card>
              <EmptyState
                icon="people-outline"
                title="No workers found"
                body="Try a different name or clear the status filter."
                actionTitle="Clear filters"
                onAction={clearFilters}
              />
            </Card>
          ) : (
            <Card style={{ padding: 0, overflow: 'hidden' }}>
              {list.map((w, i) => {
                const isSelected = !!selected[w.id];
                return (
                  <Animated.View key={w.id} entering={FadeInDown.delay(i * 40)}>
                    <Pressable
                      onPress={() => {
                        if (selectMode) toggleSelect(w.id);
                        else { haptics.tap(); router.push(`/worker/${w.id}` as any); }
                      }}
                      accessibilityRole="button"
                      style={({ pressed }) => ({
                        flexDirection: 'row', alignItems: 'center', gap: 12,
                        paddingVertical: 12, paddingHorizontal: 16, minHeight: 72,
                        backgroundColor: pressed
                          ? t.colors.hairline
                          : isSelected ? t.colors.primarySoft : 'transparent',
                      })}
                    >
                      <Avatar initials={w.initials} />
                      <View style={{ flex: 1, gap: 3 }}>
                        <Tx variant="bodyMedium" numberOfLines={1}>{w.name}</Tx>
                        <Tx variant="caption" color={t.colors.textMuted} numberOfLines={1}>
                          {w.skill} · {w.district} · {rupees(w.dailyWage)}/day
                        </Tx>
                        <Row gap={8}>
                          <StatusBadge status={w.status} />
                          <Tx variant="caption" color={t.colors.amber}>★ {w.rating.toFixed(1)}</Tx>
                        </Row>
                      </View>
                      {selectMode ? (
                        <Ionicons
                          name={isSelected ? 'checkmark-circle' : 'ellipse-outline'}
                          size={26}
                          color={isSelected ? t.colors.primary : t.colors.textMuted}
                        />
                      ) : (
                        <Row gap={6}>
                          <IconBtn
                            name="call-outline"
                            label={`Call ${w.name}`}
                            onPress={() => Linking.openURL(`tel:${w.phone.replace(/\s/g, '')}`)}
                          />
                          <IconBtn
                            name="logo-whatsapp"
                            label={`WhatsApp ${w.name}`}
                            onPress={() => Linking.openURL(`https://wa.me/${w.phone.replace(/\D/g, '')}`)}
                          />
                        </Row>
                      )}
                    </Pressable>
                    {i < list.length - 1 ? <Divider inset={16} /> : null}
                  </Animated.View>
                );
              })}
            </Card>
          )}
        </View>
      </ScrollView>

      {/* Pinned assign action */}
      <View style={{
        position: 'absolute', left: 20, right: 20, bottom: insets.bottom + 16,
      }}>
        {selectMode ? (
          <Button
            title={selectedCount > 0 ? `Assign ${selectedCount} to site` : 'Select workers to assign'}
            variant="success"
            icon="checkmark-done-outline"
            disabled={selectedCount === 0}
            onPress={confirmAssign}
          />
        ) : (
          <Button
            title="＋ Assign workers"
            onPress={() => { haptics.press(); setSelectMode(true); }}
          />
        )}
      </View>
    </View>
  );
}
