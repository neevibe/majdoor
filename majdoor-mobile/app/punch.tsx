import React, { useEffect, useRef, useState } from 'react';
import { View, Pressable, Text, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { CameraView, useCameraPermissions } from 'expo-camera';
import Animated, {
  useSharedValue, useAnimatedStyle, withRepeat, withTiming, Easing, FadeIn,
} from 'react-native-reanimated';
import { Tx, Row, Badge, Button } from '../src/ui';
import { useTheme } from '../src/theme/ThemeContext';
import { useSession } from '../src/data/stores/session';
import * as haptics from '../src/lib/haptics';

type Step = 'idle' | 'gps' | 'selfie' | 'done';

export default function Punch() {
  const t = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { punchPhase, setPunchPhase, setPunchedInAt, punchedInAt } = useSession();
  const [step, setStep] = useState<Step>(punchPhase === 'done' ? 'done' : 'idle');
  const [gpsNote, setGpsNote] = useState('Inside geofence check pending');
  const [camPerm, requestCamPerm] = useCameraPermissions();
  const camRef = useRef<CameraView>(null);

  const pulse = useSharedValue(0);
  useEffect(() => {
    pulse.value = withRepeat(withTiming(1, { duration: 2200, easing: Easing.out(Easing.quad) }), -1);
  }, [pulse]);
  const ringStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 1 + pulse.value * 0.18 }],
    opacity: 1 - pulse.value,
  }));

  const startGps = async () => {
    haptics.press();
    setStep('gps');
    try {
      if (Platform.OS !== 'web') {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        }
      }
      setGpsNote('गेट के अंदर ✓ · 42 m from Gate 2');
    } catch {
      setGpsNote('GPS unavailable — supervisor override allowed');
    }
    setTimeout(async () => {
      if (Platform.OS !== 'web' && !camPerm?.granted) await requestCamPerm();
      setStep('selfie');
    }, 900);
  };

  const captureSelfie = async () => {
    haptics.press();
    try {
      if (Platform.OS !== 'web' && camRef.current) {
        await camRef.current.takePictureAsync({ quality: 0.5, skipProcessing: true });
      }
    } catch { /* simulated verification continues */ }
    const now = new Date();
    const hh = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    setPunchedInAt(hh);
    setPunchPhase('done');
    setStep('done');
    haptics.success();
  };

  const resetPunch = () => {
    setPunchPhase('idle');
    setPunchedInAt(null);
    setStep('idle');
    haptics.warn();
  };

  const C = 230;

  return (
    <View style={{ flex: 1, backgroundColor: '#0B0D12', paddingTop: insets.top }}>
      {/* Header */}
      <Row style={{ justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 12 }}>
        <View>
          <Tx variant="kicker" color="rgba(255,255,255,0.5)">हाज़िरी · ATTENDANCE</Tx>
          <Tx variant="h2" color="#F5F6F8">L&T — PATNA METRO C-2</Tx>
        </View>
        <Pressable onPress={() => router.back()} hitSlop={12} accessibilityLabel="Close"
          style={{ width: 42, height: 42, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.08)' }}>
          <Ionicons name="close" size={22} color="#fff" />
        </Pressable>
      </Row>

      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 28, padding: 24 }}>
        {step === 'selfie' ? (
          <Animated.View entering={FadeIn} style={{ alignItems: 'center', gap: 18 }}>
            <View style={{ width: 280, height: 340, borderRadius: 24, overflow: 'hidden', borderWidth: 2, borderColor: t.colors.primary }}>
              {Platform.OS !== 'web' && camPerm?.granted ? (
                <CameraView ref={camRef} facing="front" style={{ flex: 1 }} />
              ) : (
                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#12151C' }}>
                  <Ionicons name="person-circle-outline" size={120} color="rgba(255,255,255,0.25)" />
                  <Tx variant="caption" color="rgba(255,255,255,0.5)">Camera preview</Tx>
                </View>
              )}
            </View>
            <Tx variant="sub" color="rgba(255,255,255,0.7)">Hold phone at eye level · आँखों की सीध में रखें</Tx>
            <Button title="सेल्फी लें · CAPTURE" onPress={captureSelfie} style={{ minWidth: 220 }} />
          </Animated.View>
        ) : (
          <>
            <View style={{ width: C + 40, height: C + 40, alignItems: 'center', justifyContent: 'center' }}>
              {step !== 'done' ? (
                <Animated.View style={[ringStyle, {
                  position: 'absolute', width: C, height: C, borderRadius: C / 2,
                  borderWidth: 2, borderColor: t.colors.primary,
                }]} />
              ) : null}
              <Pressable
                onPress={step === 'idle' ? startGps : step === 'done' ? resetPunch : undefined}
                accessibilityRole="button"
                style={{
                  width: C, height: C, borderRadius: C / 2,
                  alignItems: 'center', justifyContent: 'center', gap: 6,
                  backgroundColor:
                    step === 'done' ? '#123524'
                    : step === 'gps' ? '#12203A'
                    : t.colors.primary,
                  borderWidth: 2,
                  borderColor: step === 'done' ? '#34D399' : step === 'gps' ? t.colors.primary : 'transparent',
                }}
              >
                {step === 'gps' ? (
                  <>
                    <Ionicons name="locate" size={34} color="#7EB1FF" />
                    <Text style={{ fontFamily: t.fonts.heading, fontSize: 24, letterSpacing: 2, color: '#DCE8FF' }}>GPS…</Text>
                    <Text style={{ fontFamily: t.fonts.body, fontSize: 12, color: 'rgba(220,232,255,0.7)' }}>LOCATING · गेट जांच</Text>
                  </>
                ) : step === 'done' ? (
                  <>
                    <Ionicons name="checkmark-circle" size={40} color="#34D399" />
                    <Text style={{ fontFamily: t.fonts.heading, fontSize: 26, letterSpacing: 2, color: '#B8F5DC' }}>हाज़िर ✓</Text>
                    <Text style={{ fontFamily: t.fonts.body, fontSize: 12, color: 'rgba(184,245,220,0.8)' }}>IN {punchedInAt} · GPS ✓ · FACE ✓</Text>
                  </>
                ) : (
                  <>
                    <Text style={{ fontFamily: t.fonts.heading, fontSize: 27, letterSpacing: 1.5, color: '#fff' }}>हाज़िरी लगाएं</Text>
                    <Text style={{ fontFamily: t.fonts.body, fontSize: 12, letterSpacing: 2, color: 'rgba(255,255,255,0.8)' }}>TAP TO PUNCH IN</Text>
                  </>
                )}
              </Pressable>
            </View>

            <View style={{ alignItems: 'center', gap: 8 }}>
              <Row gap={8}>
                <Ionicons name="location" size={14} color={step === 'idle' ? 'rgba(255,255,255,0.4)' : '#34D399'} />
                <Tx variant="sub" color="rgba(255,255,255,0.7)">{gpsNote}</Tx>
              </Row>
              <Row gap={8}>
                <Badge label="GEOFENCE 150 M" tone="outline" />
                <Badge label="QR GATE 2 ACTIVE" tone="outline" />
                <Badge label="SHIFT 08:00–17:00" tone="outline" />
              </Row>
              {step === 'done' ? (
                <Tx variant="caption" color="rgba(255,255,255,0.45)">Tap the circle to reset (demo) · Punch-out at shift end</Tx>
              ) : (
                <Tx variant="caption" color="rgba(255,255,255,0.45)">Selfie required after GPS check · सेल्फी ज़रूरी है</Tx>
              )}
            </View>
          </>
        )}
      </View>
    </View>
  );
}
