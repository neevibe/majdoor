import React, { useState } from 'react';
import { View, ScrollView, Pressable, Text, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import { Tx, Card, Row, Button, Input } from '../src/ui';
import { useTheme } from '../src/theme/ThemeContext';
import * as haptics from '../src/lib/haptics';

type Range = 'TOMORROW' | 'TWO_DAYS' | 'CUSTOM';

const RANGES: { key: Range; label: string }[] = [
  { key: 'TOMORROW', label: 'Tomorrow · कल' },
  { key: 'TWO_DAYS', label: '+2 days' },
  { key: 'CUSTOM', label: 'Custom' },
];

export default function LeaveRequest() {
  const t = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [range, setRange] = useState<Range>('TOMORROW');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [reason, setReason] = useState('');
  const [sent, setSent] = useState(false);

  const rangeText =
    range === 'TOMORROW' ? '03 Aug 2026'
    : range === 'TWO_DAYS' ? '03–04 Aug 2026'
    : from && to ? `${from} – ${to}` : from || 'Custom dates';

  const canSubmit = reason.trim().length > 2 && (range !== 'CUSTOM' || (from.trim().length > 3 && to.trim().length > 3));

  const submit = () => {
    haptics.success();
    setSent(true);
  };

  if (sent) {
    return (
      <View style={{ flex: 1, backgroundColor: t.colors.bg, alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <Animated.View entering={FadeIn} style={{ alignItems: 'center', gap: 16 }}>
          <View style={{
            width: 96, height: 96, borderRadius: 32, alignItems: 'center', justifyContent: 'center',
            backgroundColor: t.colors.successSoft,
          }}>
            <Ionicons name="checkmark" size={48} color={t.colors.success} />
          </View>
          <Tx variant="h1" style={{ textAlign: 'center' }}>छुट्टी भेजी ✓</Tx>
          <Tx variant="body" color={t.colors.textSecondary} style={{ textAlign: 'center' }}>
            Leave request for {rangeText} sent to your supervisor for approval.
          </Tx>
          <Tx variant="caption" color={t.colors.textMuted} style={{ textAlign: 'center' }}>
            Reason: {reason.trim()}
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
          <Tx variant="kicker">छुट्टी · LEAVE</Tx>
          <Tx variant="h2">REQUEST LEAVE</Tx>
        </View>
        <View style={{ width: 48 }} />
      </Row>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: insets.bottom + 28, gap: 16 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Dates */}
          <Animated.View entering={FadeInDown} style={{ gap: 8 }}>
            <Tx variant="kicker">WHEN · कब</Tx>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {RANGES.map((r) => {
                const active = r.key === range;
                return (
                  <Pressable
                    key={r.key}
                    onPress={() => { haptics.tap(); setRange(r.key); }}
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
                      {r.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
            {range === 'CUSTOM' ? (
              <Row gap={10} style={{ alignItems: 'flex-start', marginTop: 4 }}>
                <View style={{ flex: 1 }}>
                  <Input label="FROM" hindi="से" placeholder="05 Aug 2026" value={from} onChangeText={setFrom} />
                </View>
                <View style={{ flex: 1 }}>
                  <Input label="TO" hindi="तक" placeholder="06 Aug 2026" value={to} onChangeText={setTo} />
                </View>
              </Row>
            ) : (
              <Card tone="soft" style={{ paddingVertical: 12 }}>
                <Tx variant="subMedium">{rangeText}</Tx>
              </Card>
            )}
          </Animated.View>

          {/* Reason */}
          <Animated.View entering={FadeInDown.delay(80)}>
            <Input
              label="REASON"
              hindi="कारण"
              placeholder="Family function, medical…"
              value={reason}
              onChangeText={setReason}
              multiline
              style={{ minHeight: 88, paddingTop: 12, textAlignVertical: 'top' }}
              accessibilityLabel="Leave reason"
            />
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(160)}>
            <Card style={{ gap: 4 }}>
              <Tx variant="sub" color={t.colors.textSecondary}>
                Goes to Rakesh Verma (supervisor) · wage is not paid for approved leave days.
              </Tx>
            </Card>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(220)}>
            <Button
              title="Submit request · भेजें"
              icon="paper-plane-outline"
              disabled={!canSubmit}
              onPress={submit}
              style={{ minHeight: 56 }}
            />
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
