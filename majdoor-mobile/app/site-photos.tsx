import React, { useRef, useState } from 'react';
import { View, ScrollView, Pressable, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Tx, Card, Row, Badge, Button, SectionHeader } from '../src/ui';
import { useTheme } from '../src/theme/ThemeContext';
import * as haptics from '../src/lib/haptics';

interface Capture {
  id: string;
  caption: string;
}

const SEED: Capture[] = [
  { id: 'C-1', caption: 'Block B — 08:15' },
  { id: 'C-2', caption: 'Gate 2 muster — 08:40' },
  { id: 'C-3', caption: 'Rebar cage L-4 — 10:05' },
  { id: 'C-4', caption: 'Scaffold check — 10:32' },
];

export default function SitePhotos() {
  const t = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [camPerm, requestCamPerm] = useCameraPermissions();
  const camRef = useRef<CameraView>(null);
  const [captures, setCaptures] = useState<Capture[]>(SEED);

  const canUseCamera = Platform.OS !== 'web' && !!camPerm?.granted;

  const capture = async () => {
    haptics.press();
    try {
      if (canUseCamera && camRef.current) {
        await camRef.current.takePictureAsync({ quality: 0.5, skipProcessing: true });
      }
    } catch { /* simulated capture continues */ }
    const now = new Date();
    const hh = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    setCaptures((c) => [{ id: `C-${Date.now()}`, caption: `Block B — ${hh}` }, ...c]);
    haptics.success();
  };

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
            <Tx variant="kicker">साइट फोटो · L&T C-2</Tx>
            <Tx variant="h2">SITE PHOTOS</Tx>
          </View>
        </Row>
        <Badge label={`${captures.length} TODAY`} tone="accent" />
      </Row>

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: insets.bottom + 28 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Camera viewport */}
        <View style={{ borderRadius: t.radius.xl, overflow: 'hidden', height: 320, backgroundColor: '#12151C' }}>
          {canUseCamera ? (
            <CameraView ref={camRef} facing="back" style={{ flex: 1 }} />
          ) : (
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10 }}>
              <Ionicons name="camera-outline" size={56} color="rgba(255,255,255,0.3)" />
              <Tx variant="sub" color="rgba(255,255,255,0.55)">
                {Platform.OS === 'web' ? 'Camera preview (device only)' : 'Camera permission needed'}
              </Tx>
              {Platform.OS !== 'web' && !camPerm?.granted ? (
                <Button title="Enable camera" small variant="secondary" onPress={() => requestCamPerm()} />
              ) : null}
            </View>
          )}
          {/* Capture button overlay */}
          <View style={{ position: 'absolute', bottom: 16, left: 0, right: 0, alignItems: 'center' }}>
            <Pressable
              onPress={capture}
              accessibilityRole="button"
              accessibilityLabel="Capture photo"
              style={({ pressed }) => ({
                width: 64, height: 64, borderRadius: 32,
                alignItems: 'center', justifyContent: 'center',
                backgroundColor: pressed ? 'rgba(255,255,255,0.7)' : '#FFFFFF',
                borderWidth: 4, borderColor: 'rgba(255,255,255,0.35)',
              })}
            >
              <View style={{ width: 46, height: 46, borderRadius: 23, backgroundColor: t.colors.danger }} />
            </Pressable>
          </View>
        </View>

        <Row gap={8} style={{ marginTop: 12, flexWrap: 'wrap' }}>
          <Badge label="GPS TAGGED" tone="outline" />
          <Badge label="TIMESTAMPED" tone="outline" />
          <Badge label="SYNCS TO CLIENT LOG" tone="outline" />
        </Row>

        {/* Today's captures */}
        <SectionHeader title="TODAY'S CAPTURES" hindi="आज की तस्वीरें" />
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
          {captures.map((c, i) => (
            <Animated.View key={c.id} entering={FadeInDown.delay(i * 40)} style={{ width: '48%' as any, flexGrow: 1 }}>
              <Card style={{ alignItems: 'center', gap: 8, paddingVertical: 24 }}>
                <View style={{
                  width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center',
                  backgroundColor: t.colors.accentSoft,
                }}>
                  <Ionicons name="image-outline" size={22} color={t.colors.accent} />
                </View>
                <Tx variant="caption" color={t.colors.textSecondary}>{c.caption}</Tx>
              </Card>
            </Animated.View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
