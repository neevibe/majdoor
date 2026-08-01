import React from 'react';
import { View, ScrollView, Pressable, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Tx, Card, Row, Badge, ListRow, Divider, Avatar, SectionHeader } from '../src/ui';
import { useTheme } from '../src/theme/ThemeContext';
import * as haptics from '../src/lib/haptics';

// Site: L&T — Patna Metro C-2
const SITE = { lat: 25.5941, lng: 85.1376 };

const GANG_POINTS = [
  { id: 'BR-2481-0937', name: 'Sunil K. Manjhi', initials: 'SM', skill: 'Mason', dLat: 0.0004, dLng: 0.0006, where: 'AT GATE 2 · 42 m', live: true },
  { id: 'BR-1130-4482', name: 'Ramesh Paswan', initials: 'RP', skill: 'Bar bender', dLat: -0.0006, dLng: 0.0003, where: 'BLOCK B · 88 m', live: true },
  { id: 'BR-0912-7754', name: 'Mohammad Irfan', initials: 'MI', skill: 'Electrician', dLat: 0.0008, dLng: -0.0004, where: 'PANEL ROOM · 120 m', live: true },
  { id: 'BR-2209-8871', name: 'Anita Kumari', initials: 'AK', skill: 'Painter', dLat: -0.0003, dLng: -0.0007, where: 'BLOCK A · 65 m', live: true },
  { id: 'BR-6684-0093', name: 'Dinesh Sahni', initials: 'DS', skill: 'Plumber', dLat: 0.0011, dLng: 0.0009, where: 'NEAR GEOFENCE EDGE · 138 m', live: false },
  { id: 'BR-5561-0348', name: 'Santosh Yadav', initials: 'SY', skill: 'Scaffolder', dLat: -0.0012, dLng: 0.0011, where: 'LAST SEEN 09:40 · OFF SITE', live: false },
];

function NativeMap() {
  const t = useTheme();
  // require() keeps react-native-maps out of the web bundle
  const Maps = require('react-native-maps');
  const MapView = Maps.default;
  const Marker = Maps.Marker;
  const Circle = Maps.Circle;
  return (
    <MapView
      style={{ flex: 1 }}
      initialRegion={{
        latitude: SITE.lat,
        longitude: SITE.lng,
        latitudeDelta: 0.006,
        longitudeDelta: 0.006,
      }}
    >
      <Circle
        center={{ latitude: SITE.lat, longitude: SITE.lng }}
        radius={150}
        strokeColor={t.colors.primary}
        fillColor="rgba(47,124,246,0.12)"
      />
      <Marker
        coordinate={{ latitude: SITE.lat, longitude: SITE.lng }}
        title="L&T — Patna Metro C-2"
        description="Gate 2 · geofence 150 m"
        pinColor={t.colors.primary}
      />
      {GANG_POINTS.map((p) => (
        <Marker
          key={p.id}
          coordinate={{ latitude: SITE.lat + p.dLat, longitude: SITE.lng + p.dLng }}
          title={p.name}
          description={p.where}
          pinColor={p.live ? '#16A34A' : '#D97706'}
        />
      ))}
    </MapView>
  );
}

export default function Track() {
  const t = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const onSite = GANG_POINTS.filter((p) => p.live).length;

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
            <Tx variant="kicker">गैंग ट्रैकिंग · LIVE</Tx>
            <Tx variant="h2">TRACK GANG</Tx>
          </View>
        </Row>
        <Row gap={6}>
          <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: t.colors.success }} />
          <Tx variant="caption" color={t.colors.textMuted}>{onSite}/6 ON SITE</Tx>
        </Row>
      </Row>

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: insets.bottom + 28 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Map */}
        <View style={{
          height: 300, borderRadius: t.radius.xl, overflow: 'hidden',
          borderWidth: 1, borderColor: t.colors.border,
        }}>
          {Platform.OS !== 'web' ? (
            <NativeMap />
          ) : (
            <Card tone="hero" style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10, borderRadius: 0 }}>
              <Ionicons name="map-outline" size={52} color="rgba(255,255,255,0.35)" />
              <Tx variant="sub" color="rgba(255,255,255,0.65)">Live site map · Patna Metro C-2</Tx>
              <Tx variant="caption" color="rgba(255,255,255,0.45)">Map preview available on device</Tx>
              <Row gap={8}>
                <Badge label="GEOFENCE 150 M" tone="outline" />
                <Badge label="6 TRACKED" tone="outline" />
              </Row>
            </Card>
          )}
        </View>

        <Row gap={8} style={{ marginTop: 12, flexWrap: 'wrap' }}>
          <Badge label="GEOFENCE 150 M" tone="outline" />
          <Badge label="QR GATE 2 ACTIVE" tone="outline" />
          <Badge label="UPDATED 10:41" tone="outline" />
        </Row>

        {/* Gang list */}
        <SectionHeader title="GANG POSITIONS" hindi="स्थिति" />
        <Card style={{ padding: 0, overflow: 'hidden' }}>
          {GANG_POINTS.map((p, i) => (
            <Animated.View key={p.id} entering={FadeInDown.delay(i * 40)}>
              <ListRow
                title={p.name}
                subtitle={`${p.skill} · ${p.where}`}
                left={<Avatar initials={p.initials} size={40} />}
                right={
                  <View style={{
                    width: 10, height: 10, borderRadius: 5,
                    backgroundColor: p.live ? t.colors.success : t.colors.warning,
                  }} />
                }
                onPress={() => router.push(`/worker/${p.id}` as any)}
              />
              {i < GANG_POINTS.length - 1 ? <Divider inset={68} /> : null}
            </Animated.View>
          ))}
        </Card>

        <Card tone="soft" style={{ marginTop: 16, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <Ionicons name="shield-checkmark-outline" size={20} color={t.colors.accent} />
          <Tx variant="caption" color={t.colors.textSecondary} style={{ flex: 1 }}>
            Location is shared only during shift hours (08:00–17:00) with worker consent.
          </Tx>
        </Card>
      </ScrollView>
    </View>
  );
}
