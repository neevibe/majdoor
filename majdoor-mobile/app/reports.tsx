import React, { useState } from 'react';
import { View, ScrollView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Tx, Card, Row, Badge, Button, StatTile, SectionHeader } from '../src/ui';
import { useTheme } from '../src/theme/ThemeContext';
import { ATT_KPIS } from '../src/data/mock';
import * as haptics from '../src/lib/haptics';

interface ReportType {
  id: string;
  title: string;
  hindi: string;
  sub: string;
  icon: keyof typeof Ionicons.glyphMap;
}

const REPORTS: ReportType[] = [
  { id: 'weekly-attendance', title: 'Weekly attendance', hindi: 'साप्ताहिक हाज़िरी', sub: 'Gang sheet 27 Jul – 2 Aug · 6 workers', icon: 'finger-print' },
  { id: 'ot-summary', title: 'OT summary', hindi: 'ओवरटाइम', sub: 'Overtime hours by worker · this week', icon: 'time-outline' },
  { id: 'ppe-log', title: 'PPE issue log', hindi: 'सुरक्षा किट', sub: 'Helmets, vests, shoes issued this month', icon: 'shield-checkmark-outline' },
  { id: 'payroll-draft', title: 'Payroll draft', hindi: 'वेतन ड्राफ्ट', sub: 'July gang wages for agency approval', icon: 'cash-outline' },
];

type ReportState = 'idle' | 'generating' | 'done';

export default function Reports() {
  const t = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [states, setStates] = useState<Record<string, ReportState>>({});

  const generate = (id: string) => {
    haptics.press();
    setStates((s) => ({ ...s, [id]: 'generating' }));
    setTimeout(() => {
      haptics.success();
      setStates((s) => ({ ...s, [id]: 'done' }));
    }, 1100);
  };

  // From mock ATT_KPIS: [0].delta carries "92.4% of deployed", [3].value = "6,118 hrs"
  const attendancePct = ATT_KPIS[0].delta?.split(' ')[0] ?? '92.4%';
  const otHours = ATT_KPIS[3].value;

  return (
    <View style={{ flex: 1, backgroundColor: t.colors.bg, paddingTop: insets.top }}>
      {/* Back header */}
      <Row style={{ justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 12 }}>
        <Row gap={12}>
          <Pressable
            onPress={() => { haptics.tap(); router.back(); }}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Go back"
            style={{
              width: 42, height: 42, borderRadius: 14, alignItems: 'center', justifyContent: 'center',
              backgroundColor: t.colors.surface, borderWidth: 1, borderColor: t.colors.border,
            }}
          >
            <Ionicons name="arrow-back" size={20} color={t.colors.text} />
          </Pressable>
          <View>
            <Tx variant="kicker">रिपोर्ट · L&T C-2</Tx>
            <Tx variant="h2">REPORTS</Tx>
          </View>
        </Row>
        <Badge label="THIS WEEK" tone="outline" />
      </Row>

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: insets.bottom + 28 }}
        showsVerticalScrollIndicator={false}
      >
        {/* KPI tiles */}
        <Row gap={10}>
          <StatTile label="ATTENDANCE" value={attendancePct} delta={ATT_KPIS[0].delta} tone="up" />
          <StatTile label="OT" value={otHours} delta={ATT_KPIS[3].delta} tone="warn" />
        </Row>

        <SectionHeader title="GENERATE REPORT" hindi="रिपोर्ट बनाएं" />
        <View style={{ gap: 10 }}>
          {REPORTS.map((r, i) => {
            const state = states[r.id] ?? 'idle';
            return (
              <Animated.View key={r.id} entering={FadeInDown.delay(i * 60)}>
                <Card style={{ gap: 12 }}>
                  <Row gap={12}>
                    <View style={{
                      width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center',
                      backgroundColor: state === 'done' ? t.colors.successSoft : t.colors.accentSoft,
                    }}>
                      <Ionicons
                        name={state === 'done' ? 'document-text' : r.icon}
                        size={20}
                        color={state === 'done' ? t.colors.success : t.colors.accent}
                      />
                    </View>
                    <View style={{ flex: 1, gap: 2 }}>
                      <Tx variant="bodyMedium">{r.title} · {r.hindi}</Tx>
                      <Tx variant="caption" color={t.colors.textMuted}>{r.sub}</Tx>
                    </View>
                  </Row>
                  {state === 'done' ? (
                    <Row style={{ justifyContent: 'space-between' }}>
                      <Row gap={8}>
                        <Ionicons name="logo-whatsapp" size={16} color={t.colors.success} />
                        <Tx variant="subMedium" color={t.colors.success}>Ready · sent to WhatsApp</Tx>
                      </Row>
                      <Badge label="PDF ✓" tone="success" />
                    </Row>
                  ) : (
                    <Button
                      title={state === 'generating' ? 'Generating…' : 'Generate'}
                      variant="secondary"
                      small
                      loading={state === 'generating'}
                      onPress={() => generate(r.id)}
                    />
                  )}
                </Card>
              </Animated.View>
            );
          })}
        </View>

        <Card tone="soft" style={{ marginTop: 16, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <Ionicons name="sparkles" size={18} color={t.colors.violet} />
          <Tx variant="caption" color={t.colors.textSecondary} style={{ flex: 1 }}>
            Reports are auto-shared with your agency and the L&T site office on WhatsApp.
          </Tx>
        </Card>
      </ScrollView>
    </View>
  );
}
