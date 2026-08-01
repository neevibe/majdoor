import React, { useEffect, useState } from 'react';
import { View, Pressable, Platform, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import QRCode from 'react-native-qrcode-svg';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import { Tx, Card, Row, Badge, Button, StatusBadge, Segmented } from '../src/ui';
import { useTheme } from '../src/theme/ThemeContext';
import { useAuth } from '../src/data/stores/auth';
import { WORKERS } from '../src/data/mock';
import * as haptics from '../src/lib/haptics';

type Mode = 'MY QR' | 'SCAN';

const FALLBACK = { id: 'BR-2481-0937', name: 'Sunil Kumar Manjhi' };

export default function QrHub() {
  const t = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const user = useAuth((s) => s.user);
  const isWorker = user?.role === 'worker';

  const [mode, setMode] = useState<Mode>(isWorker ? 'MY QR' : 'SCAN');
  const [camPerm, requestCamPerm] = useCameraPermissions();
  const [scanned, setScanned] = useState<{ id: string } | null>(null);

  useEffect(() => {
    if (mode === 'SCAN' && Platform.OS !== 'web' && !camPerm?.granted) {
      requestCamPerm();
    }
  }, [mode, camPerm?.granted, requestCamPerm]);

  const myId = user?.workerId ?? FALLBACK.id;
  const myName = isWorker && user ? user.name : FALLBACK.name;
  const qrValue = JSON.stringify({ id: myId, name: myName });

  const handleScanData = (data: string) => {
    if (scanned) return;
    let id = data;
    try {
      const parsed = JSON.parse(data);
      if (parsed && typeof parsed === 'object' && parsed.id) id = String(parsed.id);
    } catch { /* treat raw string as ID */ }
    setScanned({ id });
    haptics.success();
  };

  const scannedWorker = scanned ? WORKERS.find((w) => w.id === scanned.id) ?? null : null;
  const canScanLive = Platform.OS !== 'web' && camPerm?.granted;

  return (
    <View style={{ flex: 1, backgroundColor: '#0B0D12', paddingTop: insets.top }}>
      {/* Header */}
      <Row style={{ justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 12 }}>
        <View>
          <Tx variant="kicker" color="rgba(255,255,255,0.5)">गेट पास · QR</Tx>
          <Tx variant="h2" color="#F5F6F8">
            {mode === 'MY QR' ? `${myName.toUpperCase()} · ${myId}` : 'SCAN WORKER QR'}
          </Tx>
        </View>
        <Pressable
          onPress={() => { haptics.tap(); router.back(); }}
          hitSlop={12}
          accessibilityLabel="Close"
          style={{
            width: 42, height: 42, borderRadius: 14, alignItems: 'center', justifyContent: 'center',
            backgroundColor: 'rgba(255,255,255,0.08)',
          }}
        >
          <Ionicons name="close" size={22} color="#fff" />
        </Pressable>
      </Row>

      <View style={{ paddingHorizontal: 20, paddingBottom: 12 }}>
        <Segmented
          options={['MY QR', 'SCAN'] as const}
          value={mode}
          onChange={(m) => { setMode(m); setScanned(null); }}
        />
      </View>

      {mode === 'MY QR' ? (
        <ScrollView contentContainerStyle={{ flexGrow: 1, alignItems: 'center', justifyContent: 'center', padding: 24, paddingBottom: insets.bottom + 28 }}>
          <Animated.View entering={FadeInDown.duration(320)} style={{ width: '100%', maxWidth: 340 }}>
            <View style={{
              backgroundColor: '#FFFFFF', borderRadius: 22, padding: 28,
              alignItems: 'center', gap: 14,
            }}>
              <QRCode value={qrValue} size={220} backgroundColor="#FFFFFF" color="#0B0D12" />
              <View style={{ alignItems: 'center', gap: 4 }}>
                <Tx variant="h2" color="#16181D">{myName.toUpperCase()}</Tx>
                <Tx variant="sub" color="#5D5D60">{myId}</Tx>
              </View>
              <Row gap={8}>
                <Badge label="AADHAAR ✓" tone="success" />
                <Badge label="POLICE ✓" tone="success" />
              </Row>
            </View>
            <Tx variant="caption" color="rgba(255,255,255,0.5)" style={{ textAlign: 'center', marginTop: 14 }}>
              गेट पर दिखाएं · Show this pass at the site gate for entry
            </Tx>
          </Animated.View>
        </ScrollView>
      ) : (
        <View style={{ flex: 1, paddingHorizontal: 20, paddingBottom: insets.bottom + 20, gap: 16 }}>
          {/* Scanner viewport */}
          <View style={{
            flex: 1, borderRadius: 22, overflow: 'hidden',
            borderWidth: 2, borderColor: scanned ? '#34D399' : t.colors.primary,
            backgroundColor: '#12151C',
          }}>
            {canScanLive && !scanned ? (
              <CameraView
                style={{ flex: 1 }}
                facing="back"
                barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
                onBarcodeScanned={(res) => handleScanData(res.data)}
              />
            ) : !scanned ? (
              <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 14, padding: 24 }}>
                <Ionicons name="qr-code-outline" size={72} color="rgba(255,255,255,0.25)" />
                <Tx variant="sub" color="rgba(255,255,255,0.6)" style={{ textAlign: 'center' }}>
                  {Platform.OS === 'web'
                    ? 'Camera scanning is unavailable on web.'
                    : 'Camera permission needed to scan QR gate passes.'}
                </Tx>
                <Button
                  title="Simulate scan"
                  variant="secondary"
                  icon="scan-outline"
                  onPress={() => handleScanData(JSON.stringify(FALLBACK))}
                />
              </View>
            ) : (
              <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                <Ionicons name="checkmark-circle" size={72} color="#34D399" />
              </View>
            )}

            {!scanned ? (
              <Animated.View entering={FadeIn} pointerEvents="none" style={{
                position: 'absolute', left: 0, right: 0, bottom: 16, alignItems: 'center',
              }}>
                <Badge label="POINT AT WORKER QR · क्यूआर दिखाएं" tone="outline" />
              </Animated.View>
            ) : null}
          </View>

          {/* Result card */}
          {scanned ? (
            <Animated.View entering={FadeInDown.duration(320)}>
              <Card style={{ gap: 12, backgroundColor: '#12151C', borderColor: '#232833' }}>
                <Row gap={12}>
                  <View style={{
                    width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center',
                    backgroundColor: scannedWorker ? 'rgba(52,211,153,0.14)' : 'rgba(248,113,113,0.14)',
                  }}>
                    <Ionicons
                      name={scannedWorker ? 'checkmark-circle' : 'alert-circle'}
                      size={24}
                      color={scannedWorker ? '#34D399' : '#F87171'}
                    />
                  </View>
                  <View style={{ flex: 1, gap: 3 }}>
                    <Tx variant="h3" color="#F2F3F6">
                      {scannedWorker ? `VERIFIED · ${scannedWorker.name.toUpperCase()}` : 'UNKNOWN ID'}
                    </Tx>
                    <Tx variant="sub" color="rgba(255,255,255,0.6)">
                      {scannedWorker ? `${scanned.id} · ${scannedWorker.skill} · ${scannedWorker.district}` : scanned.id}
                    </Tx>
                  </View>
                  {scannedWorker ? <StatusBadge status={scannedWorker.status} /> : <Badge label="NOT FOUND" tone="danger" />}
                </Row>
                <Row gap={10}>
                  {scannedWorker ? (
                    <Button
                      title="View profile →"
                      style={{ flex: 1 }}
                      onPress={() => router.push(`/worker/${scanned.id}` as any)}
                    />
                  ) : null}
                  <Button
                    title="Scan again"
                    variant="secondary"
                    style={{ flex: 1 }}
                    onPress={() => { haptics.tap(); setScanned(null); }}
                  />
                </Row>
              </Card>
            </Animated.View>
          ) : null}
        </View>
      )}
    </View>
  );
}
