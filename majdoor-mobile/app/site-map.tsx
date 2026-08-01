import React from 'react';
import { View, Pressable, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Tx, Card, Row, Badge, ListRow, Divider, Skeleton } from '../src/ui';
import { SiteMapView } from '../src/ui/SiteMapView';
import { useTheme } from '../src/theme/ThemeContext';
import { useSites } from '../src/data/hooks';
import { formatIN } from '../src/lib/format';
import * as haptics from '../src/lib/haptics';

export default function SiteMap() {
  const t = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const sites = useSites();

  return (
    <View style={{ flex: 1, backgroundColor: t.colors.bg }}>
      {/* Map full-bleed */}
      <SiteMapView sites={sites.data ?? []} />

      {/* Floating back button */}
      <Pressable
        onPress={() => { haptics.tap(); router.back(); }}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel="Back"
        style={({ pressed }) => ({
          position: 'absolute', top: insets.top + 8, left: 20,
          width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center',
          backgroundColor: pressed ? t.colors.hairline : t.colors.surface,
          borderWidth: 1, borderColor: t.colors.border,
        })}
      >
        <Ionicons name="chevron-back" size={22} color={t.colors.text} />
      </Pressable>

      {/* Title chip */}
      <View style={{
        position: 'absolute', top: insets.top + 12, alignSelf: 'center',
        paddingHorizontal: 16, paddingVertical: 8, borderRadius: t.radius.full,
        backgroundColor: t.colors.surface, borderWidth: 1, borderColor: t.colors.border,
      }}>
        <Tx variant="kicker" color={t.colors.text}>साइट का नक्शा · SITE MAP</Tx>
      </View>

      {/* Bottom sheet-style overlay */}
      <Animated.View
        entering={FadeInDown}
        style={{ position: 'absolute', left: 0, right: 0, bottom: 0, maxHeight: 320 }}
      >
        <Card style={{
          borderTopLeftRadius: t.radius.xl, borderTopRightRadius: t.radius.xl,
          borderBottomLeftRadius: 0, borderBottomRightRadius: 0,
          padding: 0, paddingBottom: insets.bottom + 8, overflow: 'hidden',
        }}>
          <View style={{ alignItems: 'center', paddingTop: 10 }}>
            <View style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: t.colors.border }} />
          </View>
          <Row style={{ justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12 }}>
            <Tx variant="kicker">ACTIVE SITES · {sites.data?.length ?? 0}</Tx>
            <Badge label={`${formatIN((sites.data ?? []).reduce((n, s) => n + s.onDuty, 0))} ON DUTY`} tone="accent" />
          </Row>
          {sites.isLoading ? (
            <View style={{ padding: 16, gap: 10 }}>
              <Skeleton height={44} radius={12} />
              <Skeleton height={44} radius={12} />
            </View>
          ) : (
            <ScrollView showsVerticalScrollIndicator={false}>
              {(sites.data ?? []).map((s, i, arr) => (
                <View key={s.id}>
                  <ListRow
                    title={s.name}
                    subtitle={`${s.district} · shift ${s.shift} · geofence ${s.geofenceMeters} m`}
                    left={
                      <View style={{
                        width: 36, height: 36, borderRadius: 12, alignItems: 'center', justifyContent: 'center',
                        backgroundColor: t.colors.primarySoft,
                      }}>
                        <Ionicons name="business-outline" size={17} color={t.colors.primary} />
                      </View>
                    }
                    right={<Tx variant="h3" color={t.colors.primary}>{s.onDuty}</Tx>}
                    onPress={() => haptics.tap()}
                  />
                  {i < arr.length - 1 ? <Divider inset={16} /> : null}
                </View>
              ))}
            </ScrollView>
          )}
        </Card>
      </Animated.View>
    </View>
  );
}
