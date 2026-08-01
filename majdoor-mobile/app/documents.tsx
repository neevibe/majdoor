import React, { useRef, useState } from 'react';
import { View, ScrollView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import { Tx, Card, Row, Button, SectionHeader, ListRow, Divider, SkeletonList, EmptyState } from '../src/ui';
import { useTheme } from '../src/theme/ThemeContext';
import { useDocuments } from '../src/data/hooks';
import { DocType, WorkerDocument } from '../src/data/types';
import * as haptics from '../src/lib/haptics';

const WORKER_ID = 'BR-2481-0937';

const GROUPS: { type: DocType; title: string; hindi: string }[] = [
  { type: 'IDENTITY', title: 'IDENTITY', hindi: 'पहचान' },
  { type: 'VERIFICATION', title: 'VERIFICATION', hindi: 'सत्यापन' },
  { type: 'SKILL', title: 'SKILL', hindi: 'हुनर' },
  { type: 'BANK', title: 'BANK', hindi: 'बैंक' },
  { type: 'MEDICAL', title: 'MEDICAL', hindi: 'स्वास्थ्य' },
];

export default function Documents() {
  const t = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const docs = useDocuments(WORKER_ID);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = (msg: string) => {
    haptics.tap();
    setToast(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2200);
  };

  const grouped = GROUPS
    .map((g) => ({ ...g, items: (docs.data ?? []).filter((d) => d.type === g.type) }))
    .filter((g) => g.items.length > 0);

  const DocRow = ({ d, last }: { d: WorkerDocument; last: boolean }) => (
    <View>
      <ListRow
        title={d.name}
        subtitle={`${d.format} · ${d.meta}`}
        left={
          <View style={{
            width: 36, height: 36, borderRadius: 12, alignItems: 'center', justifyContent: 'center',
            backgroundColor: d.format === 'PDF' ? t.colors.primarySoft : t.colors.violetSoft,
          }}>
            <Ionicons
              name={d.format === 'PDF' ? 'document-text' : 'image'}
              size={17}
              color={d.format === 'PDF' ? t.colors.primary : t.colors.violet}
            />
          </View>
        }
        right={
          <Pressable
            onPress={() => showToast(`Share link ready · ${d.name}`)}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel={`Share ${d.name}`}
            style={({ pressed }) => ({
              width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center',
              backgroundColor: pressed ? t.colors.hairline : 'transparent',
            })}
          >
            <Ionicons name="share-social-outline" size={18} color={t.colors.textMuted} />
          </Pressable>
        }
      />
      {!last ? <Divider inset={16} /> : null}
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: t.colors.bg }}>
      {/* Top bar */}
      <Row style={{ paddingTop: insets.top + 8, paddingHorizontal: 20, paddingBottom: 12, justifyContent: 'space-between' }}>
        <Pressable
          onPress={() => { haptics.tap(); router.back(); }}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Back"
          style={({ pressed }) => ({
            width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center',
            backgroundColor: pressed ? t.colors.hairline : t.colors.surface,
            borderWidth: 1, borderColor: t.colors.border,
          })}
        >
          <Ionicons name="chevron-back" size={22} color={t.colors.text} />
        </Pressable>
        <View style={{ alignItems: 'center' }}>
          <Tx variant="kicker">दस्तावेज़ · {WORKER_ID}</Tx>
          <Tx variant="h2">DOCUMENT WALLET</Tx>
        </View>
        <View style={{ width: 48 }} />
      </Row>

      {docs.isLoading ? (
        <SkeletonList rows={6} />
      ) : (docs.data ?? []).length === 0 ? (
        <EmptyState icon="folder-open-outline" title="No documents yet" body="अपना पहला दस्तावेज़ अपलोड करें।" />
      ) : (
        <ScrollView
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: insets.bottom + 28 }}
          showsVerticalScrollIndicator={false}
        >
          {grouped.map((g, gi) => (
            <Animated.View key={g.type} entering={FadeInDown.delay(gi * 60)}>
              <SectionHeader title={g.title} hindi={g.hindi} />
              <Card style={{ padding: 0, overflow: 'hidden' }}>
                {g.items.map((d, i) => <DocRow key={d.id} d={d} last={i === g.items.length - 1} />)}
              </Card>
            </Animated.View>
          ))}
          <Button
            title="+ Upload document · अपलोड"
            variant="secondary"
            icon="cloud-upload-outline"
            style={{ marginTop: 20 }}
            onPress={() => showToast('Upload coming soon · जल्द आ रहा है')}
          />
        </ScrollView>
      )}

      {/* Toast */}
      {toast ? (
        <Animated.View
          entering={FadeIn}
          style={{
            position: 'absolute', left: 20, right: 20, bottom: insets.bottom + 20,
            backgroundColor: t.colors.heroBg, borderRadius: t.radius.md,
            paddingVertical: 12, paddingHorizontal: 16, alignItems: 'center',
          }}
        >
          <Tx variant="subMedium" color={t.colors.heroText}>{toast}</Tx>
        </Animated.View>
      ) : null}
    </View>
  );
}
