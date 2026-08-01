import React, { useMemo, useState } from 'react';
import { View, ScrollView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Tx, Card, Row, Button, Segmented } from '../src/ui';
import { useTheme } from '../src/theme/ThemeContext';
import { DISTRICTS } from '../src/data/mock';
import { District } from '../src/data/types';
import { formatIN } from '../src/lib/format';
import * as haptics from '../src/lib/haptics';

type Mode = 'WORKERS' | 'DEMAND' | 'MIGRATION';

function hexToRgba(hex: string, alpha: number): string {
  const h = hex.replace('#', '');
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

function metricOf(d: District, mode: Mode): number {
  return mode === 'WORKERS' ? d.workers : mode === 'DEMAND' ? d.demand : d.migration;
}

function shortVal(n: number): string {
  return n >= 1000 ? `${(n / 1000).toFixed(1).replace(/\.0$/, '')}K` : formatIN(n);
}

const CELL_MAP = new Map(DISTRICTS.map((d) => [`${d.col}:${d.row}`, d]));

export default function BiharMap() {
  const t = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [mode, setMode] = useState<Mode>('WORKERS');
  const [selectedName, setSelectedName] = useState('PATNA');

  const maxMetric = useMemo(
    () => Math.max(...DISTRICTS.map((d) => metricOf(d, mode))),
    [mode],
  );
  const selected = DISTRICTS.find((d) => d.name === selectedName) ?? DISTRICTS[0];
  const onDuty = Math.round(selected.workers * 0.34);

  const narrative =
    selected.name === 'PATNA'
      ? 'Highest concentration in the state — metro rail, airport expansion and 14 active commercial sites.'
      : `${selected.demand > 500 ? 'High' : 'Moderate'} open demand against ${formatIN(selected.workers)} registered workers.` +
        (selected.migration > 900
          ? ` Out-migration is elevated at ${formatIN(selected.migration)} workers this quarter.`
          : '');

  const StatBox = ({ label, value }: { label: string; value: string }) => (
    <View style={{
      flex: 1, minWidth: '46%' as any, gap: 4, padding: 12,
      borderRadius: t.radius.md, backgroundColor: t.colors.accentSoft,
      borderWidth: 1, borderColor: t.colors.border,
    }}>
      <Tx variant="kicker">{label}</Tx>
      <Tx variant="num" style={{ fontSize: 22, lineHeight: 26 }}>{value}</Tx>
    </View>
  );

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
            <Tx variant="kicker">38 DISTRICTS</Tx>
            <Tx variant="h1" numberOfLines={1}>BIHAR MAP · नक्शा</Tx>
          </View>
        </Row>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: insets.bottom + 28 }}
        showsVerticalScrollIndicator={false}
      >
        <Segmented
          options={['WORKERS', 'DEMAND', 'MIGRATION'] as const}
          value={mode}
          onChange={(m) => setMode(m)}
        />

        {/* 5 × 8 grid */}
        <View style={{ marginTop: 14, gap: 6 }}>
          {[1, 2, 3, 4, 5].map((row) => (
            <View key={row} style={{ flexDirection: 'row', gap: 6 }}>
              {[1, 2, 3, 4, 5, 6, 7, 8].map((col) => {
                const d = CELL_MAP.get(`${col}:${row}`);
                if (!d) return <View key={col} style={{ flex: 1, aspectRatio: 1 }} />;
                const k = metricOf(d, mode) / maxMetric;
                const isSel = d.name === selectedName;
                const strong = k > 0.45;
                return (
                  <Pressable
                    key={col}
                    onPress={() => { haptics.tap(); setSelectedName(d.name); }}
                    accessibilityRole="button"
                    accessibilityLabel={`${d.name}: ${formatIN(metricOf(d, mode))}`}
                    style={{
                      flex: 1, aspectRatio: 1, borderRadius: 8,
                      alignItems: 'center', justifyContent: 'center', gap: 1,
                      backgroundColor: hexToRgba(t.colors.primary, 0.08 + 0.84 * k),
                      borderWidth: isSel ? 2 : 0,
                      borderColor: t.colors.text,
                    }}
                  >
                    <Tx
                      variant="caption"
                      color={strong ? '#FFFFFF' : t.colors.textSecondary}
                      style={{ fontSize: 8, lineHeight: 10, fontFamily: t.fonts.bodySemiBold, letterSpacing: 0.3 }}
                      numberOfLines={1}
                    >
                      {d.name.slice(0, 6)}
                    </Tx>
                    <Tx
                      variant="caption"
                      color={strong ? 'rgba(255,255,255,0.85)' : t.colors.textMuted}
                      style={{ fontSize: 9, lineHeight: 11 }}
                      numberOfLines={1}
                    >
                      {shortVal(metricOf(d, mode))}
                    </Tx>
                  </Pressable>
                );
              })}
            </View>
          ))}
        </View>

        {/* Dossier */}
        <Animated.View key={selected.name} entering={FadeInDown.duration(260)} style={{ marginTop: 18 }}>
          <Card style={{ gap: 12 }}>
            <Row style={{ justifyContent: 'space-between' }}>
              <Tx variant="h2">{selected.name}</Tx>
              <Tx variant="kicker">{mode}</Tx>
            </Row>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
              <StatBox label="WORKERS" value={formatIN(selected.workers)} />
              <StatBox label="OPEN DEMAND" value={formatIN(selected.demand)} />
              <StatBox label="ON DUTY" value={formatIN(onDuty)} />
              <StatBox label="MIGRATION OUT" value={formatIN(selected.migration)} />
            </View>
            <Tx variant="sub" color={t.colors.textSecondary}>{narrative}</Tx>
            <Row gap={10}>
              <Button
                title="View workers"
                variant="secondary"
                style={{ flex: 1 }}
                onPress={() => router.push('/(agency)/workers' as any)}
              />
              <Button
                title="Post demand"
                style={{ flex: 1 }}
                onPress={() => router.push('/post-demand' as any)}
              />
            </Row>
          </Card>
        </Animated.View>
      </ScrollView>
    </View>
  );
}
