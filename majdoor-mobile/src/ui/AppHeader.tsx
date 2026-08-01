import React from 'react';
import { View, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Tx, Row } from './index';
import { useTheme } from '../theme/ThemeContext';
import { brand } from '../theme/tokens';
import * as haptics from '../lib/haptics';

export function AppHeader({ kicker, title, showSearch = true }: {
  kicker?: string;
  title: string;
  showSearch?: boolean;
}) {
  const t = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const IconBtn = ({ name, onPress, badge }: { name: keyof typeof Ionicons.glyphMap; onPress: () => void; badge?: boolean }) => (
    <Pressable
      onPress={() => { haptics.tap(); onPress(); }}
      hitSlop={8}
      accessibilityRole="button"
      style={({ pressed }) => ({
        width: 42, height: 42, borderRadius: 14,
        alignItems: 'center', justifyContent: 'center',
        backgroundColor: pressed ? t.colors.hairline : t.colors.surface,
        borderWidth: 1, borderColor: t.colors.border,
      })}
    >
      <Ionicons name={name} size={20} color={t.colors.text} />
      {badge ? (
        <View style={{
          position: 'absolute', top: 9, right: 9, width: 8, height: 8, borderRadius: 4,
          backgroundColor: t.colors.danger,
        }} />
      ) : null}
    </Pressable>
  );

  return (
    <View style={{
      paddingTop: insets.top + 8, paddingHorizontal: 20, paddingBottom: 12,
      backgroundColor: t.colors.bg,
    }}>
      <Row style={{ justifyContent: 'space-between' }}>
        <View style={{ flex: 1, gap: 2 }}>
          {kicker ? <Tx variant="kicker">{kicker}</Tx> : null}
          <Tx variant="h1" numberOfLines={1}>{title}</Tx>
        </View>
        <Row gap={10}>
          {showSearch ? <IconBtn name="search" onPress={() => router.push('/search' as any)} /> : null}
          <IconBtn name="notifications-outline" onPress={() => router.push('/notifications' as any)} badge />
          {/* AI orb */}
          <Pressable
            onPress={() => { haptics.press(); router.push('/ai' as any); }}
            accessibilityRole="button"
            accessibilityLabel="Ask MAJDOOR AI"
          >
            <LinearGradient
              colors={[brand.blue, brand.violet, brand.amber]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{ width: 42, height: 42, borderRadius: 14, alignItems: 'center', justifyContent: 'center' }}
            >
              <Ionicons name="sparkles" size={19} color="#fff" />
            </LinearGradient>
          </Pressable>
        </Row>
      </Row>
    </View>
  );
}
