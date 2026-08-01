import React, { useRef, useState } from 'react';
import { View, ScrollView, Pressable, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Linking from 'expo-linking';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import { Tx, Card, Row, Badge, Button, KV, Divider } from '../src/ui';
import { useTheme } from '../src/theme/ThemeContext';
import { rupees } from '../src/lib/format';
import * as haptics from '../src/lib/haptics';

const SLIP = {
  month: 'July 2026',
  worker: 'Sunil Kumar Manjhi',
  workerId: 'BR-2481-0937',
  site: 'L&T — Patna Metro C-2',
  days: 26,
  gross: 21780,
  ot: 1170,
  advance: 1500,
  pfEsic: 1830,
  net: 18450,
  mode: 'IMPS',
};

const slipHtml = `
<html>
  <head><meta charset="utf-8" /></head>
  <body style="font-family: -apple-system, Helvetica, Arial, sans-serif; padding: 32px; color: #16181D;">
    <h1 style="letter-spacing: 4px; margin-bottom: 2px;">MAJDOOR</h1>
    <p style="margin-top: 0; color: #5D5D60;">वेतन पर्ची · Salary Slip — ${SLIP.month}</p>
    <hr />
    <p><b>${SLIP.worker}</b> (${SLIP.workerId})<br/>${SLIP.site} · Mason (Skilled)</p>
    <table style="width: 100%; border-collapse: collapse;">
      <tr><td style="padding: 6px 0;">Days worked · कार्य दिवस</td><td align="right">${SLIP.days}</td></tr>
      <tr><td style="padding: 6px 0;">Gross · कुल</td><td align="right">₹21,780</td></tr>
      <tr><td style="padding: 6px 0;">Overtime · ओवरटाइम</td><td align="right">₹1,170</td></tr>
      <tr><td style="padding: 6px 0;">Advance recovery · एडवांस कटौती</td><td align="right">−₹1,500</td></tr>
      <tr><td style="padding: 6px 0;">PF + ESIC</td><td align="right">−₹1,830</td></tr>
      <tr><td style="padding: 10px 0; border-top: 2px solid #16181D;"><b>NET PAY · कुल वेतन</b></td>
          <td align="right" style="border-top: 2px solid #16181D;"><b>₹18,450</b></td></tr>
    </table>
    <p style="color: #5D5D60;">Mode: IMPS · SBI ···9081 · Mithila Manpower Services</p>
  </body>
</html>`;

export default function SalarySlip() {
  const t = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [note, setNote] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const noteTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showNote = (msg: string) => {
    setNote(msg);
    if (noteTimer.current) clearTimeout(noteTimer.current);
    noteTimer.current = setTimeout(() => setNote(null), 2600);
  };

  const downloadPdf = async () => {
    haptics.press();
    if (Platform.OS === 'web') {
      showNote('PDF export available on device · डिवाइस पर उपलब्ध');
      return;
    }
    setBusy(true);
    try {
      const { uri } = await Print.printToFileAsync({ html: slipHtml });
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, { mimeType: 'application/pdf', dialogTitle: 'Salary slip — July 2026' });
      } else {
        showNote('Saved · sharing unavailable on this device');
      }
      haptics.success();
    } catch {
      showNote('Could not generate PDF — try again');
    } finally {
      setBusy(false);
    }
  };

  const sendWhatsApp = async () => {
    const text = encodeURIComponent(
      `MAJDOOR salary slip · ${SLIP.month}\n${SLIP.worker} (${SLIP.workerId})\nDays ${SLIP.days} · Gross ${rupees(SLIP.gross)} · Net ${rupees(SLIP.net)} via ${SLIP.mode}`,
    );
    try {
      await Linking.openURL(`whatsapp://send?text=${text}`);
    } catch {
      Linking.openURL(`https://wa.me/?text=${text}`).catch(() => {});
    }
  };

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
          <Tx variant="kicker">वेतन पर्ची · {SLIP.month.toUpperCase()}</Tx>
          <Tx variant="h2">SALARY SLIP</Tx>
        </View>
        <View style={{ width: 48 }} />
      </Row>

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: insets.bottom + 28, gap: 16 }}
        showsVerticalScrollIndicator={false}
      >
        {/* The slip */}
        <Animated.View entering={FadeInDown}>
          <Card style={{ gap: 12 }}>
            <View style={{ alignItems: 'center', gap: 2, paddingVertical: 6 }}>
              <Tx variant="h1" style={{ letterSpacing: 5 }}>MAJDOOR</Tx>
              <Tx variant="kicker">वेतन पर्ची · {SLIP.month.toUpperCase()}</Tx>
            </View>
            <Divider />
            <Row style={{ justifyContent: 'space-between' }}>
              <View style={{ gap: 2 }}>
                <Tx variant="bodyMedium">{SLIP.worker}</Tx>
                <Tx variant="caption" color={t.colors.textMuted}>{SLIP.workerId} · Mason (Skilled)</Tx>
                <Tx variant="caption" color={t.colors.textMuted}>{SLIP.site}</Tx>
              </View>
              <Badge label={SLIP.mode} tone="accent" />
            </Row>
            <Divider />
            <View>
              <KV k="Days worked · कार्य दिवस" v={`${SLIP.days}`} dashed />
              <KV k="Gross · कुल" v={rupees(SLIP.gross)} dashed />
              <KV k="Overtime · ओवरटाइम" v={rupees(SLIP.ot)} dashed />
              <KV k="Advance recovery · एडवांस" v={`−${rupees(SLIP.advance)}`} dashed />
              <KV k="PF + ESIC" v={`−${rupees(SLIP.pfEsic)}`} />
            </View>
            <View style={{
              borderTopWidth: 2, borderTopColor: t.colors.text, paddingTop: 12,
              flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
            }}>
              <Tx variant="h3">NET PAY · कुल वेतन</Tx>
              <Tx variant="num" color={t.colors.primary}>{rupees(SLIP.net)}</Tx>
            </View>
            <Tx variant="caption" color={t.colors.textMuted}>
              Paid via {SLIP.mode} · SBI ···9081 · Mithila Manpower Services
            </Tx>
          </Card>
        </Animated.View>

        {/* Actions */}
        <Animated.View entering={FadeInDown.delay(80)} style={{ gap: 10 }}>
          <Button
            title="Download PDF · डाउनलोड"
            icon="download-outline"
            loading={busy}
            onPress={downloadPdf}
            style={{ minHeight: 56 }}
          />
          <Button title="Send via WhatsApp" variant="secondary" icon="logo-whatsapp" onPress={sendWhatsApp} />
          {note ? (
            <Animated.View entering={FadeIn}>
              <Tx variant="caption" color={t.colors.textMuted} style={{ textAlign: 'center' }}>{note}</Tx>
            </Animated.View>
          ) : null}
        </Animated.View>
      </ScrollView>
    </View>
  );
}
