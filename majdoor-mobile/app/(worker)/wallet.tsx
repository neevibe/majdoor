import React, { useCallback, useState } from 'react';
import { View, ScrollView, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { AppHeader } from '../../src/ui/AppHeader';
import { Tx, Card, Row, Badge, Button, SectionHeader, ListRow, Divider, ProgressBar, Skeleton } from '../../src/ui';
import { useTheme } from '../../src/theme/ThemeContext';
import { useSalaryHistory } from '../../src/data/hooks';
import { rupees } from '../../src/lib/format';

export default function Wallet() {
  const t = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const salary = useSalaryHistory();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await salary.refetch();
    setRefreshing(false);
  }, [salary]);

  const july = salary.data?.[0];

  return (
    <View style={{ flex: 1, backgroundColor: t.colors.bg }}>
      <AppHeader kicker="मेरा पैसा" title="WALLET" />
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: insets.bottom + 28 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={t.colors.primary} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Aug so far */}
        <Animated.View entering={FadeInDown}>
          <Card tone="hero" style={{ gap: 6 }}>
            <Tx variant="kicker" color="rgba(255,255,255,0.6)">AUG SO FAR · अगस्त अब तक</Tx>
            <Tx variant="display" color={t.colors.heroText}>{rupees(1560)}</Tx>
            <Tx variant="sub" color="rgba(255,255,255,0.7)">2 days × {rupees(780)} · OT {rupees(0)}</Tx>
          </Card>
        </Animated.View>

        {/* July payslip */}
        <SectionHeader title="JULY PAYSLIP" hindi="जुलाई वेतन" />
        {salary.isLoading ? (
          <Skeleton height={120} radius={16} />
        ) : (
          <Animated.View entering={FadeInDown.delay(60)}>
            <Card style={{ gap: 10 }}>
              <Row style={{ justifyContent: 'space-between' }}>
                <View style={{ gap: 2 }}>
                  <Tx variant="caption" color={t.colors.textMuted}>NET · {july?.days ?? 26} DAYS</Tx>
                  <Tx variant="num">{rupees(july?.net ?? 18450)}</Tx>
                </View>
                <Badge label={july?.paid ? 'PAID ✓' : 'PENDING'} tone={july?.paid ? 'success' : 'warning'} />
              </Row>
              <Tx variant="caption" color={t.colors.textMuted}>
                gross {rupees(july?.gross ?? 21780)} · advance −{rupees(july?.advance ?? 1500)} · PF+ESIC −{rupees(july?.pfEsic ?? 1830)} · {july?.mode ?? 'IMPS (pending)'}
              </Tx>
              <Button
                title="Slip PDF ↓"
                variant="secondary"
                icon="document-text-outline"
                onPress={() => router.push('/salary-slip' as any)}
              />
            </Card>
          </Animated.View>
        )}

        {/* Advance */}
        <SectionHeader title="ADVANCE" hindi="एडवांस" />
        <Animated.View entering={FadeInDown.delay(120)}>
          <Card style={{ gap: 10 }}>
            <Row style={{ justifyContent: 'space-between' }}>
              <View style={{ gap: 2 }}>
                <Tx variant="caption" color={t.colors.textMuted}>OUTSTANDING · बकाया</Tx>
                <Tx variant="num" color={t.colors.warning}>{rupees(3500)}</Tx>
              </View>
              <Ionicons name="cash-outline" size={26} color={t.colors.warning} />
            </Row>
            <ProgressBar value={0.36} color={t.colors.warning} />
            <Tx variant="caption" color={t.colors.textMuted}>₹1,500/माह कट रहा है · clears Oct 2026</Tx>
            <Button
              title="Request advance · एडवांस मांगें"
              variant="secondary"
              icon="add-circle-outline"
              onPress={() => router.push('/advance-request' as any)}
            />
          </Card>
        </Animated.View>

        {/* Payment history */}
        <SectionHeader title="LAST PAYMENTS" hindi="पिछले भुगतान" />
        {salary.isLoading ? (
          <Skeleton height={220} radius={16} />
        ) : (
          <Animated.View entering={FadeInDown.delay(180)}>
            <Card style={{ padding: 0, overflow: 'hidden' }}>
              {(salary.data ?? []).map((m, i, arr) => (
                <View key={m.month}>
                  <ListRow
                    title={m.month}
                    subtitle={`${m.days} days · ${m.mode}`}
                    left={
                      <View style={{
                        width: 36, height: 36, borderRadius: 12, alignItems: 'center', justifyContent: 'center',
                        backgroundColor: m.paid ? t.colors.successSoft : t.colors.warningSoft,
                      }}>
                        <Ionicons
                          name={m.paid ? 'checkmark' : 'hourglass-outline'}
                          size={17}
                          color={m.paid ? t.colors.success : t.colors.warning}
                        />
                      </View>
                    }
                    right={
                      <Tx variant="h3" color={m.paid ? t.colors.text : t.colors.warning}>
                        {rupees(m.net)}{m.paid ? ' ✓' : ''}
                      </Tx>
                    }
                  />
                  {i < arr.length - 1 ? <Divider inset={16} /> : null}
                </View>
              ))}
            </Card>
          </Animated.View>
        )}
      </ScrollView>
    </View>
  );
}
