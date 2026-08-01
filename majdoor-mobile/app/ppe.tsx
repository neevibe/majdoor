import React, { useCallback, useState } from 'react';
import { View, ScrollView, RefreshControl, Pressable, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Tx, Card, Row, Badge, Button, SectionHeader, StatTile, Divider, Skeleton } from '../src/ui';
import { useTheme } from '../src/theme/ThemeContext';
import { usePPE } from '../src/data/hooks';
import { WORKERS } from '../src/data/mock';
import { PPEItem } from '../src/data/types';
import * as haptics from '../src/lib/haptics';

const ITEM_CHIPS = ['Helmet', 'Vest', 'Shoes', 'Gloves'];
const WORKER_CHIPS = WORKERS.slice(0, 4);

const CONDITION_TONE: Record<PPEItem['condition'], 'success' | 'accent' | 'danger'> = {
  Good: 'success',
  Assigned: 'accent',
  Replace: 'danger',
};

function Chip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  const t = useTheme();
  return (
    <Pressable
      onPress={() => { haptics.tap(); onPress(); }}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      style={{
        minHeight: 48, paddingHorizontal: 14, borderRadius: t.radius.full,
        alignItems: 'center', justifyContent: 'center',
        backgroundColor: active ? t.colors.primarySoft : t.colors.surface,
        borderWidth: 1, borderColor: active ? t.colors.primary : t.colors.border,
      }}
    >
      <Text style={{
        fontFamily: t.fonts.bodySemiBold, fontSize: 12,
        color: active ? t.colors.primary : t.colors.textSecondary,
      }}>
        {label}
      </Text>
    </Pressable>
  );
}

export default function PPERegistry() {
  const t = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const ppe = usePPE();
  const [refreshing, setRefreshing] = useState(false);
  const [issued, setIssued] = useState<PPEItem[]>([]);
  const [formOpen, setFormOpen] = useState(false);
  const [formWorker, setFormWorker] = useState('');
  const [formItem, setFormItem] = useState('');

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await ppe.refetch();
    setRefreshing(false);
  }, [ppe]);

  const all = [...issued, ...(ppe.data ?? [])];
  const replaceDue = all.filter((p) => p.condition === 'Replace').length;

  const confirmIssue = () => {
    haptics.success();
    setIssued((prev) => [
      {
        id: `PPE-NEW-${prev.length + 1}`,
        workerId: formWorker,
        item: formItem,
        issued: '02 Aug 2026',
        condition: 'Assigned',
      },
      ...prev,
    ]);
    setFormOpen(false);
    setFormWorker('');
    setFormItem('');
  };

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
            <Tx variant="kicker">SAFETY GEAR · सुरक्षा</Tx>
            <Tx variant="h1" numberOfLines={1}>PPE REGISTRY</Tx>
          </View>
        </Row>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: insets.bottom + 28 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={t.colors.primary} />}
        showsVerticalScrollIndicator={false}
      >
        <Row gap={10}>
          <StatTile label="ISSUED" value={String(all.length || 5)} delta="active items" tone="flat" />
          <StatTile label="REPLACE DUE" value={String(ppe.isLoading ? 1 : replaceDue)} delta="flagged this week" tone="warn" />
        </Row>

        {formOpen ? (
          <Animated.View entering={FadeInDown.duration(240)} style={{ marginTop: 16 }}>
            <Card style={{ gap: 12 }}>
              <Tx variant="kicker">ISSUE PPE · जारी करें</Tx>
              <View style={{ gap: 8 }}>
                <Tx variant="caption" color={t.colors.textMuted}>Worker</Tx>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                  {WORKER_CHIPS.map((w) => (
                    <Chip key={w.id} label={w.name.split(' ')[0]} active={formWorker === w.id} onPress={() => setFormWorker(w.id)} />
                  ))}
                </View>
              </View>
              <View style={{ gap: 8 }}>
                <Tx variant="caption" color={t.colors.textMuted}>Item</Tx>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                  {ITEM_CHIPS.map((it) => (
                    <Chip key={it} label={it} active={formItem === it} onPress={() => setFormItem(it)} />
                  ))}
                </View>
              </View>
              <Row gap={10}>
                <Button title="Cancel" variant="secondary" small style={{ flex: 1 }} onPress={() => setFormOpen(false)} />
                <Button title="Issue" variant="success" small style={{ flex: 1 }} disabled={!formWorker || !formItem} onPress={confirmIssue} />
              </Row>
            </Card>
          </Animated.View>
        ) : (
          <Button title="Issue PPE" icon="add" style={{ marginTop: 16 }} onPress={() => { haptics.tap(); setFormOpen(true); }} />
        )}

        <SectionHeader title="REGISTRY" hindi="सूची" />
        {ppe.isLoading ? (
          <Skeleton height={260} radius={16} />
        ) : (
          <Card style={{ padding: 0, overflow: 'hidden' }}>
            {all.map((p, i, arr) => (
              <View key={p.id}>
                <Row style={{ justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, minHeight: 48 }}>
                  <View style={{ flex: 1, gap: 2 }}>
                    <Tx variant="bodyMedium">{p.item}</Tx>
                    <Tx variant="caption" color={t.colors.textMuted}>{p.workerId} · issued {p.issued}</Tx>
                  </View>
                  <Badge label={p.condition.toUpperCase()} tone={CONDITION_TONE[p.condition]} />
                </Row>
                {i < arr.length - 1 ? <Divider inset={16} /> : null}
              </View>
            ))}
          </Card>
        )}
      </ScrollView>
    </View>
  );
}
