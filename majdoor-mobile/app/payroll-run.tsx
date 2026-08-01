import React, { useEffect, useRef, useState } from 'react';
import { View, ScrollView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Tx, Card, Row, Badge, Button, SectionHeader, Skeleton, KV, Divider } from '../src/ui';
import { useTheme } from '../src/theme/ThemeContext';
import { usePayrollRun } from '../src/data/hooks';
import { useSession } from '../src/data/stores/session';
import { rupees } from '../src/lib/format';
import { PayLineStatus } from '../src/data/types';
import * as haptics from '../src/lib/haptics';

type RunState = 'PENDING' | 'RUNNING' | 'COMPLETE';

const LINE_TONE: Record<PayLineStatus, 'neutral' | 'accent' | 'warning' | 'success'> = {
  PENDING: 'neutral',
  QUEUED: 'accent',
  PAYING: 'warning',
  PAID: 'success',
};

export default function PayrollRunScreen() {
  const t = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const run = usePayrollRun();
  const payrollApproved = useSession((s) => s.payrollApproved);
  const setPayrollApproved = useSession((s) => s.setPayrollApproved);

  const [runState, setRunState] = useState<RunState>(payrollApproved ? 'COMPLETE' : 'PENDING');
  const [statuses, setStatuses] = useState<Record<string, PayLineStatus>>({});
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
  }, []);

  const lineStatus = (workerId: string, base: PayLineStatus): PayLineStatus => {
    if (runState === 'COMPLETE') return 'PAID';
    return statuses[workerId] ?? base;
  };

  const approve = () => {
    const data = run.data;
    if (!data || runState !== 'PENDING') return;
    haptics.press();
    setRunState('RUNNING');
    setStatuses(Object.fromEntries(data.lines.map((l) => [l.workerId, 'QUEUED' as PayLineStatus])));
    let i = 0;
    intervalRef.current = setInterval(() => {
      haptics.tap();
      const idx = i;
      setStatuses(() =>
        Object.fromEntries(
          data.lines.map((l, j) => [
            l.workerId,
            (j < idx ? 'PAID' : j === idx ? 'PAYING' : 'QUEUED') as PayLineStatus,
          ]),
        ),
      );
      i += 1;
      if (i > data.lines.length) {
        if (intervalRef.current) clearInterval(intervalRef.current);
        intervalRef.current = null;
        setStatuses(Object.fromEntries(data.lines.map((l) => [l.workerId, 'PAID' as PayLineStatus])));
        setRunState('COMPLETE');
        setPayrollApproved(true);
        haptics.success();
      }
    }, 380);
  };

  const note =
    runState === 'PENDING' ? 'Two-step approval · Accounts → Super Admin'
    : runState === 'RUNNING' ? 'IMPS batch running — do not close.'
    : 'Payout complete · Slips sent via WhatsApp.';

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
            <Tx variant="kicker">MITHILA MANPOWER × L&T C-2 · #P-2214</Tx>
            <Tx variant="h1" numberOfLines={1}>JULY 2026 RUN</Tx>
          </View>
          <Badge
            label={runState === 'PENDING' ? 'PENDING APPROVAL' : runState}
            tone={runState === 'PENDING' ? 'warning' : runState === 'RUNNING' ? 'accent' : 'success'}
          />
        </Row>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: insets.bottom + 28 }}
        showsVerticalScrollIndicator={false}
      >
        {run.isLoading ? (
          <View style={{ gap: 12 }}>
            <Skeleton height={200} radius={16} />
            <Skeleton height={320} radius={16} />
          </View>
        ) : run.data ? (
          <>
            {/* Run summary */}
            <Card tone="soft" style={{ gap: 4 }}>
              <Tx variant="kicker">RUN SUMMARY · {run.data.workerCount} WORKERS</Tx>
              <Tx variant="num" style={{ fontSize: 32, lineHeight: 36 }}>{rupees(run.data.net)}</Tx>
              <Tx variant="caption" color={t.colors.textMuted} style={{ marginBottom: 6 }}>NET PAYABLE</Tx>
              <KV k="Gross" v={rupees(run.data.gross)} dashed />
              <KV k="Overtime" v={`+${rupees(run.data.overtime)}`} dashed />
              <KV k="Advance recovery" v={`−${rupees(run.data.advanceRecovery)}`} dashed />
              <KV k="PF 12% + ESIC 0.75%" v={`−${rupees(run.data.pfEsic)}`} />
            </Card>

            {/* Worker lines */}
            <SectionHeader title="WORKER LINES" hindi="मज़दूरी" />
            <Card style={{ padding: 0, overflow: 'hidden' }}>
              {run.data.lines.map((l, i, arr) => {
                const st = lineStatus(l.workerId, l.status);
                return (
                  <View key={l.workerId}>
                    <View style={{ paddingHorizontal: 16, paddingVertical: 12, gap: 6, minHeight: 48 }}>
                      <Row style={{ justifyContent: 'space-between' }}>
                        <Tx variant="bodyMedium" style={{ flex: 1 }} numberOfLines={1}>{l.worker}</Tx>
                        <Tx variant="h3">{rupees(l.net)}</Tx>
                      </Row>
                      <Row style={{ justifyContent: 'space-between' }}>
                        <Tx variant="caption" color={t.colors.textMuted}>
                          {l.days} d × ₹{l.wagePerDay}
                          {l.ot > 0 ? `  ·  OT +${rupees(l.ot)}` : ''}
                          {l.advanceRecovery > 0 ? '  ·  ' : ''}
                          {l.advanceRecovery > 0 ? (
                            <Tx variant="caption" color={t.colors.warning}>adv −{rupees(l.advanceRecovery)}</Tx>
                          ) : null}
                        </Tx>
                        <Badge label={st} tone={LINE_TONE[st]} />
                      </Row>
                    </View>
                    {i < arr.length - 1 ? <Divider inset={16} /> : null}
                  </View>
                );
              })}
            </Card>

            {/* Approve */}
            <View style={{ marginTop: 20, gap: 8 }}>
              {runState === 'COMPLETE' ? (
                <Button title="✓ Run complete — 38 paid" variant="success" disabled onPress={() => {}} />
              ) : (
                <Button
                  title={runState === 'RUNNING' ? 'Paying workers…' : 'Approve & pay 38 workers'}
                  loading={runState === 'RUNNING'}
                  disabled={runState === 'RUNNING'}
                  icon="shield-checkmark-outline"
                  onPress={approve}
                />
              )}
              <Tx variant="caption" color={runState === 'RUNNING' ? t.colors.warning : t.colors.textMuted} style={{ textAlign: 'center' }}>
                {note}
              </Tx>
            </View>
          </>
        ) : null}
      </ScrollView>
    </View>
  );
}
