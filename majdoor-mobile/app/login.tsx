import React, { useEffect, useRef, useState } from 'react';
import { View, Image, KeyboardAvoidingView, Platform, ScrollView, Pressable, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as LocalAuthentication from 'expo-local-authentication';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import { Tx, Button, Input, Segmented, Row, Badge } from '../src/ui';
import { useTheme } from '../src/theme/ThemeContext';
import { brand } from '../src/theme/tokens';
import { useAuth, homeGroupFor, Role, ROLE_LABELS } from '../src/data/stores/auth';
import * as haptics from '../src/lib/haptics';

const logoMark = require('../assets/splash-icon.png');

type Mode = 'OTP' | 'PASSWORD';

const ROLES: Role[] = ['worker', 'supervisor', 'agency', 'contractor', 'client', 'government', 'admin'];

export default function Login() {
  const t = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const signIn = useAuth((s) => s.signIn);

  const [mode, setMode] = useState<Mode>('OTP');
  const [phone, setPhone] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [sending, setSending] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [role, setRole] = useState<Role>('worker');
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => () => { if (timer.current) clearInterval(timer.current); }, []);

  const startCountdown = () => {
    setCountdown(30);
    timer.current = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1 && timer.current) clearInterval(timer.current);
        return c - 1;
      });
    }, 1000);
  };

  const sendOtp = () => {
    if (phone.trim().length < 10) return;
    setSending(true);
    setTimeout(() => {
      setSending(false);
      setOtpSent(true);
      startCountdown();
      haptics.success();
    }, 800);
  };

  const complete = () => {
    haptics.success();
    signIn(role);
    router.replace(homeGroupFor(role) as any);
  };

  const biometric = async () => {
    if (Platform.OS === 'web') { complete(); return; }
    const ok = await LocalAuthentication.hasHardwareAsync();
    if (!ok) { complete(); return; }
    const res = await LocalAuthentication.authenticateAsync({ promptMessage: 'Sign in to MAJDOOR' });
    if (res.success) complete();
  };

  const canSubmit =
    mode === 'OTP' ? (otpSent ? otp.length >= 4 : phone.trim().length >= 10) : email.length > 3 && password.length >= 4;

  return (
    <View style={{ flex: 1, backgroundColor: t.colors.bg }}>
      {/* Brand hero */}
      <LinearGradient
        colors={[brand.ink, '#131826']}
        style={{ paddingTop: insets.top + 36, paddingBottom: 36, alignItems: 'center', gap: 14 }}
      >
        <Animated.View entering={FadeIn.duration(600)}>
          <Image source={logoMark} style={{ width: 84, height: 84, resizeMode: 'contain' }} />
        </Animated.View>
        <Animated.View entering={FadeInDown.delay(120).duration(500)} style={{ alignItems: 'center', gap: 6 }}>
          <Text style={{ fontFamily: t.fonts.heading, fontSize: 30, letterSpacing: 6, color: '#F5F6F8' }}>
            MAJDOOR
          </Text>
          <Row gap={4}>
            <Text style={{ fontFamily: t.fonts.bodySemiBold, fontSize: 10, letterSpacing: 2.6, color: '#AEB4BF' }}>ONE WORKFORCE.</Text>
            <Text style={{ fontFamily: t.fonts.bodySemiBold, fontSize: 10, letterSpacing: 2.6, color: brand.blue }}>LIMITLESS</Text>
            <Text style={{ fontFamily: t.fonts.bodySemiBold, fontSize: 10, letterSpacing: 2.6, color: brand.amber }}>POSSIBILITIES.</Text>
          </Row>
        </Animated.View>
      </LinearGradient>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 24, gap: 16 }}
          keyboardShouldPersistTaps="handled"
        >
          <Animated.View entering={FadeInDown.delay(200).duration(500)} style={{ gap: 16 }}>
            <View style={{ gap: 4 }}>
              <Tx variant="h1">SIGN IN · साइन इन</Tx>
              <Tx variant="sub" color={t.colors.textMuted}>Welcome back to the workforce grid.</Tx>
            </View>

            <Segmented options={['OTP', 'PASSWORD'] as const} value={mode} onChange={(m) => { setMode(m); setOtpSent(false); }} labels={{ OTP: 'MOBILE OTP', PASSWORD: 'PASSWORD' }} />

            {mode === 'OTP' ? (
              <View style={{ gap: 14 }}>
                <Row gap={10}>
                  <View style={{
                    minHeight: 48, paddingHorizontal: 14, borderRadius: t.radius.md, borderWidth: 1,
                    borderColor: t.colors.border, backgroundColor: t.colors.inputBg, alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Tx variant="bodyMedium">+91</Tx>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Input
                      placeholder="98XXX XXXXX"
                      keyboardType="phone-pad"
                      value={phone}
                      onChangeText={setPhone}
                      maxLength={11}
                      accessibilityLabel="Mobile number"
                    />
                  </View>
                </Row>
                {otpSent ? (
                  <View style={{ gap: 8 }}>
                    <Input
                      label="6-DIGIT OTP"
                      placeholder="••••••"
                      keyboardType="number-pad"
                      value={otp}
                      onChangeText={setOtp}
                      maxLength={6}
                      style={{ letterSpacing: 12, fontFamily: t.fonts.heading, fontSize: 22, textAlign: 'center' }}
                    />
                    <Row style={{ justifyContent: 'space-between' }}>
                      <Tx variant="caption" color={t.colors.textMuted}>Sent to +91 {phone}</Tx>
                      <Pressable disabled={countdown > 0} onPress={sendOtp} hitSlop={10}>
                        <Tx variant="caption" color={countdown > 0 ? t.colors.textMuted : t.colors.primary}>
                          {countdown > 0 ? `Resend in ${countdown}s` : 'Resend OTP'}
                        </Tx>
                      </Pressable>
                    </Row>
                  </View>
                ) : null}
              </View>
            ) : (
              <View style={{ gap: 14 }}>
                <Input label="EMAIL / WORKER ID" placeholder="name@agency.in or BR-XXXX" autoCapitalize="none" value={email} onChangeText={setEmail} />
                <Input label="PASSWORD" placeholder="••••••••" secureTextEntry value={password} onChangeText={setPassword} />
              </View>
            )}

            {/* Role selector — demo accounts for each persona */}
            <View style={{ gap: 8 }}>
              <Tx variant="kicker">SIGN IN AS · भूमिका</Tx>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                {ROLES.map((r) => {
                  const active = r === role;
                  return (
                    <Pressable
                      key={r}
                      onPress={() => { haptics.tap(); setRole(r); }}
                      style={{
                        paddingHorizontal: 14, minHeight: 40, borderRadius: t.radius.full,
                        alignItems: 'center', justifyContent: 'center',
                        backgroundColor: active ? t.colors.primary : 'transparent',
                        borderWidth: 1, borderColor: active ? t.colors.primary : t.colors.border,
                      }}
                    >
                      <Text style={{
                        fontFamily: t.fonts.bodySemiBold, fontSize: 12,
                        color: active ? t.colors.onPrimary : t.colors.textSecondary,
                      }}>
                        {ROLE_LABELS[r].en} · {ROLE_LABELS[r].hi}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            <Button
              title={
                mode === 'PASSWORD' ? 'Sign in'
                : sending ? 'Sending OTP…'
                : otpSent ? 'Verify & sign in' : 'Send OTP →'
              }
              loading={sending}
              disabled={!canSubmit}
              onPress={mode === 'OTP' && !otpSent ? sendOtp : complete}
            />

            <Row gap={12} style={{ marginVertical: 4 }}>
              <View style={{ flex: 1, height: 1, backgroundColor: t.colors.border }} />
              <Tx variant="caption" color={t.colors.textMuted}>OR CONTINUE WITH</Tx>
              <View style={{ flex: 1, height: 1, backgroundColor: t.colors.border }} />
            </Row>

            <Row gap={12}>
              <Button title="Google" variant="secondary" icon="logo-google" style={{ flex: 1 }} onPress={complete} />
              <Button title="Biometric" variant="secondary" icon="finger-print" style={{ flex: 1 }} onPress={biometric} />
            </Row>

            <Row gap={6} style={{ justifyContent: 'center', marginTop: 8 }}>
              <Tx variant="sub" color={t.colors.textMuted}>New here?</Tx>
              <Tx variant="subMedium" color={t.colors.primary}>Register as worker or agency</Tx>
            </Row>

            <Row gap={8} style={{ justifyContent: 'center', marginTop: 4 }}>
              <Badge label="2,48,312 VERIFIED WORKERS" tone="outline" />
              <Badge label="38 DISTRICTS" tone="outline" />
            </Row>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
