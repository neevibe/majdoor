import React, { useMemo, useState } from 'react';
import { View, ScrollView, Pressable, Text, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import { Tx, Card, Row, Button, Input, Segmented, ProgressBar } from '../src/ui';
import { useTheme } from '../src/theme/ThemeContext';
import { rupees } from '../src/lib/format';
import * as haptics from '../src/lib/haptics';

const REASONS = ['Medical', 'School fees', 'Festival', 'House repair', 'Other'] as const;
const DEDUCTIONS = ['₹500', '₹1,000', '₹1,500'] as const;
const DEDUCTION_VALUE: Record<(typeof DEDUCTIONS)[number], number> = {
  '₹500': 500, '₹1,000': 1000, '₹1,500': 1500,
};
const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const OUTSTANDING = 3500;

export default function AdvanceRequest() {
  const t = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState<(typeof REASONS)[number]>('Medical');
  const [deduction, setDeduction] = useState<(typeof DEDUCTIONS)[number]>('₹1,000');
  const [sent, setSent] = useState(false);

  const amountNum = Number(amount.replace(/[^0-9]/g, '')) || 0;

  const clearsBy = useMemo(() => {
    const per = DEDUCTION_VALUE[deduction];
    const total = OUTSTANDING + amountNum;
    const months = Math.max(1, Math.ceil(total / per));
    // Deductions start Sep 2026 (current month: Aug 2026)
    const d = new Date(2026, 8 + months - 1, 1);
    return `${MONTH_NAMES[d.getMonth()]} ${d.getFullYear()}`;
  }, [amountNum, deduction]);

  const submit = () => {
    haptics.success();
    setSent(true);
  };

  if (sent) {
    return (
      <View style={{ flex: 1, backgroundColor: t.colors.bg, alignItems: 'center', justifyContent: 'center', padding: 24, gap: 18 }}>
        <Animated.View entering={FadeIn} style={{ alignItems: 'center', gap: 16 }}>
          <View style={{
            width: 96, height: 96, borderRadius: 32, alignItems: 'center', justifyContent: 'center',
            backgroundColor: t.colors.successSoft,
          }}>
            <Ionicons name="checkmark" size={48} color={t.colors.success} />
          </View>
          <Tx variant="h1" style={{ textAlign: 'center' }}>भेज दिया ✓</Tx>
          <Tx variant="body" color={t.colors.textSecondary} style={{ textAlign: 'center' }}>
            {rupees(amountNum)} advance request sent to Mithila Manpower for approval.
          </Tx>
          <Tx variant="caption" color={t.colors.textMuted} style={{ textAlign: 'center' }}>
            {DEDUCTION_VALUE[deduction] === 500 ? '₹500' : deduction}/माह deduction · clears by {clearsBy}
          </Tx>
          <Button title="Done · हो गया" style={{ minWidth: 200 }} onPress={() => router.back()} />
        </Animated.View>
      </View>
    );
  }

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
          <Tx variant="kicker">एडवांस · SALARY ADVANCE</Tx>
          <Tx variant="h2">REQUEST ADVANCE</Tx>
        </View>
        <View style={{ width: 48 }} />
      </Row>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: insets.bottom + 28, gap: 16 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Current outstanding */}
          <Animated.View entering={FadeInDown}>
            <Card tone="soft" style={{ gap: 8 }}>
              <Row style={{ justifyContent: 'space-between' }}>
                <View style={{ gap: 2 }}>
                  <Tx variant="kicker">CURRENT OUTSTANDING · बकाया</Tx>
                  <Tx variant="num" color={t.colors.warning}>{rupees(OUTSTANDING)}</Tx>
                </View>
                <Ionicons name="cash-outline" size={26} color={t.colors.warning} />
              </Row>
              <ProgressBar value={0.36} color={t.colors.warning} />
              <Tx variant="caption" color={t.colors.textMuted}>₹1,500/माह कट रहा है · clears Oct 2026</Tx>
            </Card>
          </Animated.View>

          {/* Amount */}
          <Animated.View entering={FadeInDown.delay(60)}>
            <Input
              label="AMOUNT"
              hindi="रकम"
              placeholder="₹ 0"
              keyboardType="number-pad"
              value={amount}
              onChangeText={(v) => setAmount(v.replace(/[^0-9]/g, ''))}
              maxLength={6}
              style={{ fontFamily: t.fonts.heading, fontSize: 24 }}
              accessibilityLabel="Advance amount"
            />
          </Animated.View>

          {/* Reason */}
          <Animated.View entering={FadeInDown.delay(120)} style={{ gap: 8 }}>
            <Tx variant="kicker">REASON · कारण</Tx>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {REASONS.map((r) => {
                const active = r === reason;
                return (
                  <Pressable
                    key={r}
                    onPress={() => { haptics.tap(); setReason(r); }}
                    accessibilityRole="button"
                    accessibilityState={{ selected: active }}
                    style={{
                      minHeight: 48, paddingHorizontal: 16, borderRadius: t.radius.full,
                      alignItems: 'center', justifyContent: 'center',
                      backgroundColor: active ? t.colors.primary : t.colors.surface,
                      borderWidth: 1, borderColor: active ? t.colors.primary : t.colors.border,
                    }}
                  >
                    <Text style={{
                      fontFamily: t.fonts.bodySemiBold, fontSize: 12,
                      color: active ? t.colors.onPrimary : t.colors.textSecondary,
                    }}>
                      {r}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </Animated.View>

          {/* Deduction */}
          <Animated.View entering={FadeInDown.delay(180)} style={{ gap: 8 }}>
            <Tx variant="kicker">MONTHLY DEDUCTION · मासिक कटौती</Tx>
            <Segmented options={DEDUCTIONS} value={deduction} onChange={setDeduction} />
          </Animated.View>

          {/* Summary */}
          <Animated.View entering={FadeInDown.delay(240)}>
            <Card style={{ gap: 4 }}>
              <Tx variant="sub" color={t.colors.textSecondary}>
                {amountNum > 0
                  ? `${rupees(OUTSTANDING + amountNum)} total · ${deduction}/माह — clears by ${clearsBy}`
                  : `Enter amount to see recovery plan · रकम भरें`}
              </Tx>
            </Card>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(300)}>
            <Button
              title="Submit request · भेजें"
              icon="paper-plane-outline"
              disabled={amountNum <= 0}
              onPress={submit}
              style={{ minHeight: 56 }}
            />
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
