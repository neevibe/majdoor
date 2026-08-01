import React, { useEffect } from 'react';
import {
  View, Text, Pressable, StyleSheet, ViewStyle, TextStyle, StyleProp,
  ActivityIndicator, TextInput, TextInputProps,
} from 'react-native';
import Animated, {
  useSharedValue, useAnimatedStyle, withTiming, withRepeat, withSequence, Easing,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';
import { touch } from '../theme/tokens';
import * as haptics from '../lib/haptics';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

// ---------- Typography ----------

type TxVariant = 'display' | 'h1' | 'h2' | 'h3' | 'kicker' | 'body' | 'bodyMedium' | 'sub' | 'subMedium' | 'caption' | 'num';

export function Tx({
  variant = 'body', color, children, style, ...rest
}: { variant?: TxVariant; color?: string; children: React.ReactNode; style?: StyleProp<TextStyle> } & React.ComponentProps<typeof Text>) {
  const t = useTheme();
  const muted = variant === 'kicker' || variant === 'caption';
  return (
    <Text
      {...rest}
      style={[t.type[variant], { color: color ?? (muted ? t.colors.textMuted : t.colors.text) }, style]}
    >
      {children}
    </Text>
  );
}

// ---------- Screen scaffolding ----------

export function Card({ children, style, tone = 'default' }: {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  tone?: 'default' | 'accent' | 'hero' | 'soft';
}) {
  const t = useTheme();
  const bg =
    tone === 'hero' ? t.colors.heroBg
    : tone === 'accent' ? t.colors.primarySoft
    : tone === 'soft' ? t.colors.accentSoft
    : t.colors.card;
  return (
    <View
      style={[
        {
          backgroundColor: bg,
          borderRadius: t.radius.lg,
          borderWidth: tone === 'hero' ? 0 : StyleSheet.hairlineWidth,
          borderColor: t.colors.border,
          padding: t.spacing.lg,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

export function Row({ children, style, gap = 8 }: { children: React.ReactNode; style?: StyleProp<ViewStyle>; gap?: number }) {
  return <View style={[{ flexDirection: 'row', alignItems: 'center', gap }, style]}>{children}</View>;
}

export function SectionHeader({ title, hindi, action, onAction }: {
  title: string; hindi?: string; action?: string; onAction?: () => void;
}) {
  const t = useTheme();
  return (
    <Row style={{ justifyContent: 'space-between', marginBottom: t.spacing.md, marginTop: t.spacing.xl }}>
      <Row gap={8}>
        <Tx variant="kicker">{title}</Tx>
        {hindi ? <Tx variant="kicker" color={t.colors.textMuted}>· {hindi}</Tx> : null}
      </Row>
      {action ? (
        <Pressable onPress={() => { haptics.tap(); onAction?.(); }} hitSlop={12}>
          <Tx variant="subMedium" color={t.colors.primary}>{action}</Tx>
        </Pressable>
      ) : null}
    </Row>
  );
}

// ---------- Buttons ----------

export function Button({
  title, onPress, variant = 'primary', icon, disabled, loading, style, small,
}: {
  title: string;
  onPress?: () => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'success';
  icon?: keyof typeof Ionicons.glyphMap;
  disabled?: boolean;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
  small?: boolean;
}) {
  const t = useTheme();
  const scale = useSharedValue(1);
  const a = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  const bg =
    variant === 'primary' ? t.colors.primary
    : variant === 'danger' ? t.colors.danger
    : variant === 'success' ? t.colors.success
    : 'transparent';
  const fg =
    variant === 'primary' || variant === 'danger' || variant === 'success'
      ? t.colors.onPrimary
      : variant === 'ghost' ? t.colors.primary : t.colors.text;

  return (
    <AnimatedPressable
      accessibilityRole="button"
      accessibilityLabel={title}
      disabled={disabled || loading}
      onPressIn={() => { scale.value = withTiming(0.97, { duration: 80 }); }}
      onPressOut={() => { scale.value = withTiming(1, { duration: 120 }); }}
      onPress={() => { haptics.tap(); onPress?.(); }}
      style={[
        a,
        {
          minHeight: small ? 40 : touch.min,
          borderRadius: t.radius.md,
          backgroundColor: bg,
          borderWidth: variant === 'secondary' ? 1 : 0,
          borderColor: t.colors.border,
          paddingHorizontal: small ? 14 : 18,
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'row',
          gap: 8,
          opacity: disabled ? 0.45 : 1,
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={fg} size="small" />
      ) : (
        <>
          {icon ? <Ionicons name={icon} size={small ? 16 : 18} color={fg} /> : null}
          <Text style={[t.type.bodyMedium, { color: fg, fontFamily: t.fonts.bodySemiBold }]}>{title}</Text>
        </>
      )}
    </AnimatedPressable>
  );
}

// ---------- Badges / tags ----------

export function Badge({ label, tone = 'neutral' }: {
  label: string;
  tone?: 'neutral' | 'accent' | 'success' | 'warning' | 'danger' | 'outline' | 'violet';
}) {
  const t = useTheme();
  const map = {
    neutral: { bg: t.dark ? '#1B202A' : '#F0F0F3', fg: t.colors.textSecondary, border: 'transparent' },
    accent: { bg: t.colors.primarySoft, fg: t.colors.primary, border: 'transparent' },
    success: { bg: t.colors.successSoft, fg: t.colors.success, border: 'transparent' },
    warning: { bg: t.colors.warningSoft, fg: t.colors.warning, border: 'transparent' },
    danger: { bg: t.colors.dangerSoft, fg: t.colors.danger, border: 'transparent' },
    violet: { bg: t.colors.violetSoft, fg: t.colors.violet, border: 'transparent' },
    outline: { bg: 'transparent', fg: t.colors.textSecondary, border: t.colors.border },
  }[tone];
  return (
    <View style={{
      backgroundColor: map.bg, borderColor: map.border, borderWidth: tone === 'outline' ? 1 : 0,
      borderRadius: t.radius.full, paddingHorizontal: 10, paddingVertical: 4, alignSelf: 'flex-start',
    }}>
      <Text style={{ fontFamily: t.fonts.bodySemiBold, fontSize: 11, letterSpacing: 0.6, color: map.fg }}>
        {label}
      </Text>
    </View>
  );
}

export function StatusBadge({ status }: { status: 'ON_DUTY' | 'AVAILABLE' | 'INACTIVE' | string }) {
  const tone = status === 'ON_DUTY' ? 'accent' : status === 'AVAILABLE' ? 'success' : 'neutral';
  const label = status.replace('_', ' ');
  return <Badge label={label} tone={tone as any} />;
}

// ---------- Avatar ----------

export function Avatar({ initials, size = 44, tone = 'accent' }: { initials: string; size?: number; tone?: 'accent' | 'hero' }) {
  const t = useTheme();
  return (
    <View style={{
      width: size, height: size, borderRadius: size / 3,
      backgroundColor: tone === 'hero' ? 'rgba(255,255,255,0.12)' : t.colors.primarySoft,
      borderWidth: 1, borderColor: tone === 'hero' ? 'rgba(255,255,255,0.25)' : t.colors.border,
      alignItems: 'center', justifyContent: 'center',
    }}>
      <Text style={{
        fontFamily: t.fonts.heading, fontSize: size * 0.42, letterSpacing: 1,
        color: tone === 'hero' ? '#fff' : t.colors.primary,
      }}>
        {initials}
      </Text>
    </View>
  );
}

// ---------- Stat tile ----------

export function StatTile({ label, value, delta, tone = 'flat', style }: {
  label: string; value: string; delta?: string; tone?: 'up' | 'down' | 'flat' | 'warn'; style?: StyleProp<ViewStyle>;
}) {
  const t = useTheme();
  const deltaColor =
    tone === 'up' ? t.colors.success : tone === 'down' ? t.colors.success
    : tone === 'warn' ? t.colors.warning : t.colors.textMuted;
  return (
    <Card style={[{ flex: 1, minWidth: '46%' as any, gap: 6 }, style]}>
      <Tx variant="kicker">{label}</Tx>
      <Tx variant="num">{value}</Tx>
      {delta ? <Tx variant="caption" color={deltaColor}>{delta}</Tx> : null}
    </Card>
  );
}

// ---------- List row ----------

export function ListRow({ title, subtitle, left, right, onPress, style }: {
  title: string; subtitle?: string;
  left?: React.ReactNode; right?: React.ReactNode;
  onPress?: () => void; style?: StyleProp<ViewStyle>;
}) {
  const t = useTheme();
  return (
    <Pressable
      onPress={onPress ? () => { haptics.tap(); onPress(); } : undefined}
      android_ripple={onPress ? { color: t.colors.hairline } : undefined}
      style={({ pressed }) => [
        {
          flexDirection: 'row', alignItems: 'center', gap: 12,
          paddingVertical: 12, paddingHorizontal: t.spacing.lg,
          minHeight: touch.min,
          backgroundColor: pressed && onPress ? t.colors.hairline : 'transparent',
        },
        style,
      ]}
    >
      {left}
      <View style={{ flex: 1, gap: 2 }}>
        <Tx variant="bodyMedium" numberOfLines={1}>{title}</Tx>
        {subtitle ? <Tx variant="caption" color={t.colors.textMuted} numberOfLines={1}>{subtitle}</Tx> : null}
      </View>
      {right}
      {onPress && !right ? <Ionicons name="chevron-forward" size={18} color={t.colors.textMuted} /> : null}
    </Pressable>
  );
}

export function Divider({ inset = 0 }: { inset?: number }) {
  const t = useTheme();
  return <View style={{ height: StyleSheet.hairlineWidth, backgroundColor: t.colors.border, marginLeft: inset }} />;
}

// ---------- Skeleton ----------

export function Skeleton({ height = 16, width = '100%', radius: r = 8, style }: {
  height?: number; width?: number | `${number}%`; radius?: number; style?: StyleProp<ViewStyle>;
}) {
  const t = useTheme();
  const opacity = useSharedValue(0.5);
  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(withTiming(1, { duration: 600, easing: Easing.inOut(Easing.quad) }), withTiming(0.5, { duration: 600 })),
      -1,
    );
  }, [opacity]);
  const a = useAnimatedStyle(() => ({ opacity: opacity.value }));
  return (
    <Animated.View
      style={[a, { height, width, borderRadius: r, backgroundColor: t.dark ? '#1B202A' : '#E7E7EA' }, style]}
    />
  );
}

export function SkeletonList({ rows = 4 }: { rows?: number }) {
  return (
    <View style={{ gap: 12, padding: 16 }}>
      {Array.from({ length: rows }).map((_, i) => (
        <View key={i} style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
          <Skeleton height={44} width={44} radius={14} />
          <View style={{ flex: 1, gap: 6 }}>
            <Skeleton height={14} width="62%" />
            <Skeleton height={10} width="40%" />
          </View>
        </View>
      ))}
    </View>
  );
}

// ---------- Inputs ----------

export function Input(props: TextInputProps & { label?: string; hindi?: string }) {
  const t = useTheme();
  const { label, hindi, style, ...rest } = props;
  return (
    <View style={{ gap: 6 }}>
      {label ? (
        <Tx variant="kicker">
          {label}{hindi ? ` · ${hindi}` : ''}
        </Tx>
      ) : null}
      <TextInput
        placeholderTextColor={t.colors.textMuted}
        {...rest}
        style={[
          {
            minHeight: touch.min,
            borderRadius: t.radius.md,
            borderWidth: 1,
            borderColor: t.colors.border,
            backgroundColor: t.colors.inputBg,
            paddingHorizontal: 14,
            color: t.colors.text,
            fontFamily: t.fonts.body,
            fontSize: 15,
          },
          style,
        ]}
      />
    </View>
  );
}

// ---------- Segmented control ----------

export function Segmented<T extends string>({ options, value, onChange, labels }: {
  options: readonly T[]; value: T; onChange: (v: T) => void; labels?: Partial<Record<T, string>>;
}) {
  const t = useTheme();
  return (
    <View style={{
      flexDirection: 'row', backgroundColor: t.dark ? '#151923' : '#E9E9EC',
      borderRadius: t.radius.md, padding: 3,
    }}>
      {options.map((o) => {
        const active = o === value;
        return (
          <Pressable
            key={o}
            onPress={() => { haptics.tap(); onChange(o); }}
            style={{
              flex: 1, minHeight: 38, borderRadius: t.radius.md - 3,
              alignItems: 'center', justifyContent: 'center',
              backgroundColor: active ? (t.dark ? '#2A3140' : '#FFFFFF') : 'transparent',
            }}
          >
            <Text style={{
              fontFamily: t.fonts.bodySemiBold, fontSize: 12, letterSpacing: 0.8,
              color: active ? t.colors.text : t.colors.textMuted,
            }}>
              {labels?.[o] ?? o}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

// ---------- Empty state ----------

export function EmptyState({ icon = 'search', title, body, actionTitle, onAction }: {
  icon?: keyof typeof Ionicons.glyphMap; title: string; body?: string;
  actionTitle?: string; onAction?: () => void;
}) {
  const t = useTheme();
  return (
    <View style={{ alignItems: 'center', padding: 40, gap: 10 }}>
      <View style={{
        width: 64, height: 64, borderRadius: 20, alignItems: 'center', justifyContent: 'center',
        backgroundColor: t.colors.accentSoft,
      }}>
        <Ionicons name={icon} size={28} color={t.colors.accent} />
      </View>
      <Tx variant="h3" style={{ textAlign: 'center' }}>{title}</Tx>
      {body ? <Tx variant="sub" color={t.colors.textMuted} style={{ textAlign: 'center' }}>{body}</Tx> : null}
      {actionTitle ? <Button title={actionTitle} variant="secondary" onPress={onAction} style={{ marginTop: 8 }} /> : null}
    </View>
  );
}

// ---------- Progress bar ----------

export function ProgressBar({ value, color }: { value: number; color?: string }) {
  const t = useTheme();
  return (
    <View style={{ height: 8, borderRadius: 4, backgroundColor: t.dark ? '#1B202A' : '#E7E7EA', overflow: 'hidden' }}>
      <View style={{
        width: `${Math.round(Math.min(1, Math.max(0, value)) * 100)}%`,
        height: '100%', borderRadius: 4, backgroundColor: color ?? t.colors.primary,
      }} />
    </View>
  );
}

// ---------- KeyValue ----------

export function KV({ k, v, dashed }: { k: string; v: string; dashed?: boolean }) {
  const t = useTheme();
  return (
    <View style={{
      flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, gap: 16,
      borderBottomWidth: dashed ? StyleSheet.hairlineWidth : 0,
      borderBottomColor: t.colors.border, borderStyle: dashed ? 'dashed' : 'solid',
    }}>
      <Tx variant="sub" color={t.colors.textMuted}>{k}</Tx>
      <Tx variant="subMedium" style={{ flexShrink: 1, textAlign: 'right' }}>{v}</Tx>
    </View>
  );
}
