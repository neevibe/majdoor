import React from 'react';
import { Platform, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Tx, Card, Row } from './index';
import { useTheme } from '../theme/ThemeContext';
import type { Site } from '../data/types';

/**
 * Platform-split map. On web we render a styled placeholder — react-native-maps
 * must never be imported at the top level of a file the web bundle evaluates,
 * so the native branch lazily require()s it inside the component.
 */
export function SiteMapView({ sites }: { sites: Site[] }) {
  const t = useTheme();

  if (Platform.OS === 'web') {
    return (
      <View style={{ flex: 1, backgroundColor: t.colors.bg, padding: 20, justifyContent: 'center' }}>
        <Card tone="soft" style={{ gap: 14, paddingVertical: 28 }}>
          <View style={{ alignItems: 'center', gap: 8 }}>
            <View style={{
              width: 64, height: 64, borderRadius: 20, alignItems: 'center', justifyContent: 'center',
              backgroundColor: t.colors.primarySoft,
            }}>
              <Ionicons name="map-outline" size={30} color={t.colors.primary} />
            </View>
            <Tx variant="h3">BIHAR SITE GRID</Tx>
            <Tx variant="caption" color={t.colors.textMuted}>Map available on device · नक्शा डिवाइस पर</Tx>
          </View>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
            {sites.map((s) => (
              <Row
                key={s.id}
                gap={6}
                style={{
                  paddingHorizontal: 12, paddingVertical: 8, borderRadius: t.radius.full,
                  backgroundColor: t.colors.surface, borderWidth: 1, borderColor: t.colors.border,
                }}
              >
                <Ionicons name="location" size={13} color={t.colors.primary} />
                <Tx variant="caption" color={t.colors.textSecondary}>{s.name}</Tx>
              </Row>
            ))}
          </View>
        </Card>
      </View>
    );
  }

  // Native: lazy-require so the web bundler never evaluates react-native-maps eagerly.
  const Maps = require('react-native-maps') as typeof import('react-native-maps');
  const MapView = Maps.default;
  const { Marker } = Maps;

  return (
    <MapView
      style={{ flex: 1 }}
      initialRegion={{ latitude: 25.5941, longitude: 85.1376, latitudeDelta: 2.5, longitudeDelta: 2.5 }}
    >
      {sites.map((s) => (
        <Marker
          key={s.id}
          coordinate={{ latitude: s.lat, longitude: s.lng }}
          title={s.name}
          description={`${s.onDuty} on duty · shift ${s.shift}`}
        />
      ))}
    </MapView>
  );
}
