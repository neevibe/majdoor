import React, { useCallback, useState } from 'react';
import { View, ScrollView, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppHeader } from '../../src/ui/AppHeader';
import { Tx, Card, Row, Badge, Button, SectionHeader, StatTile, Divider, Skeleton, KV } from '../../src/ui';
import { useTheme } from '../../src/theme/ThemeContext';
import { useAdvances, useInvoices } from '../../src/data/hooks';
import { useSession } from '../../src/data/stores/session';
import { rupees, rupeesCompact } from '../../src/lib/format';
import { Invoice } from '../../src/data/types';
import * as haptics from '../../src/lib/haptics';

const INVOICE_TONE: Record<Invoice['status'], 'success' | 'accent' | 'danger' | 'neutral'> = {
  PAID: 'success',
  SENT: 'accent',
  OVERDUE: 'danger',
  DRAFT: 'neutral',
};

export default function Finance() {
  const t = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const advances = useAdvances();
  const invoices = useInvoices();
  const advanceDecisions = useSession((s) => s.advanceDecisions);
  const decideAdvance = useSession((s) => s.decideAdvance);
  const payrollApproved = useSession((s) => s.payrollApproved);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([advances.refetch(), invoices.refetch()]);
    setRefreshing(false);
  }, [advances, invoices]);

  const pendingAdvances = (advances.data ?? []).filter((a) => a.status === 'PENDING');

  return (
    <View style={{ flex: 1, backgroundColor: t.colors.bg }}>
      <AppHeader kicker="जुलाई 2026 · 214 RUNS" title="FINANCE" />
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: insets.bottom + 28 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={t.colors.primary} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Top KPIs */}
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
          <StatTile label="PAYROLL PENDING" value="₹4.82 Cr" delta="214 runs await approval" tone="warn" />
          <StatTile label="REVENUE (JUL)" value="₹3.18 Cr" delta="↑ 11.4% MoM" tone="up" />
          <StatTile label="ADVANCE OUT" value="₹86.4 L" delta="rolling recovery" tone="flat" />
          <StatTile label="PF + ESIC" value="460" delta="filings due 15 Aug" tone="warn" />
        </View>

        {/* Payroll run */}
        <SectionHeader title="PAYROLL RUN" hindi="वेतन" />
        <Card style={{ gap: 10 }}>
          <Row style={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <View style={{ flex: 1, gap: 2 }}>
              <Tx variant="kicker">RUN #P-2214</Tx>
              <Tx variant="h3">JULY 2026 — MITHILA MANPOWER × L&T C-2</Tx>
            </View>
            <Badge
              label={payrollApproved ? 'COMPLETE' : 'PENDING APPROVAL'}
              tone={payrollApproved ? 'success' : 'warning'}
            />
          </Row>
          <Row style={{ justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <View>
              <Tx variant="caption" color={t.colors.textMuted}>NET PAYABLE · 38 WORKERS</Tx>
              <Tx variant="num">{rupees(641180)}</Tx>
            </View>
          </Row>
          <Button
            title={payrollApproved ? 'View run →' : 'Review & approve →'}
            variant={payrollApproved ? 'secondary' : 'primary'}
            onPress={() => router.push('/payroll-run' as any)}
          />
        </Card>

        {/* Advance requests */}
        <SectionHeader title="ADVANCE REQUESTS" hindi="एडवांस" />
        {advances.isLoading ? (
          <Skeleton height={140} radius={16} />
        ) : pendingAdvances.length === 0 ? (
          <Card>
            <Tx variant="sub" color={t.colors.textMuted}>No pending advance requests.</Tx>
          </Card>
        ) : (
          <View style={{ gap: 10 }}>
            {pendingAdvances.map((a) => {
              const decision = advanceDecisions[a.id];
              return (
                <Card key={a.id} style={{ gap: 10 }}>
                  <Row style={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <View style={{ flex: 1, gap: 2 }}>
                      <Tx variant="bodyMedium">{a.worker}</Tx>
                      <Tx variant="caption" color={t.colors.textMuted}>
                        {a.reason} · req {a.requestedOn} · deduct {rupees(a.monthlyDeduction)}/mo
                      </Tx>
                    </View>
                    <Tx variant="h3" color={t.colors.primary}>{rupees(a.amount)}</Tx>
                  </Row>
                  {decision ? (
                    <Badge label={decision} tone={decision === 'APPROVED' ? 'success' : 'danger'} />
                  ) : (
                    <Row gap={10}>
                      <Button
                        title="Approve"
                        variant="success"
                        small
                        style={{ flex: 1 }}
                        onPress={() => { haptics.success(); decideAdvance(a.id, 'APPROVED'); }}
                      />
                      <Button
                        title="Reject"
                        variant="secondary"
                        small
                        style={{ flex: 1 }}
                        onPress={() => { haptics.warn(); decideAdvance(a.id, 'REJECTED'); }}
                      />
                    </Row>
                  )}
                </Card>
              );
            })}
          </View>
        )}

        {/* Invoices */}
        <SectionHeader title="INVOICES" hindi="बिल" />
        {invoices.isLoading ? (
          <Skeleton height={200} radius={16} />
        ) : (
          <Card style={{ padding: 0, overflow: 'hidden' }}>
            {(invoices.data ?? []).map((inv, i, arr) => (
              <View key={inv.id}>
                <Row style={{ justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, minHeight: 48 }}>
                  <View style={{ flex: 1, gap: 2 }}>
                    <Tx variant="bodyMedium">{inv.id} · {inv.client}</Tx>
                    <Tx variant="caption" color={t.colors.textMuted}>{inv.month}</Tx>
                  </View>
                  <View style={{ alignItems: 'flex-end', gap: 4 }}>
                    <Tx variant="subMedium">{rupeesCompact(inv.amount)}</Tx>
                    <Badge label={inv.status} tone={INVOICE_TONE[inv.status]} />
                  </View>
                </Row>
                {i < arr.length - 1 ? <Divider inset={16} /> : null}
              </View>
            ))}
          </Card>
        )}

        {/* Payout channels */}
        <SectionHeader title="PAYOUT CHANNELS" hindi="भुगतान" />
        <Card>
          <KV k="Bank transfer (IMPS)" v="31 workers" dashed />
          <KV k="UPI" v="7 workers" dashed />
          <KV k="Salary slips (Hindi PDF)" v="auto via WhatsApp" />
        </Card>
      </ScrollView>
    </View>
  );
}
