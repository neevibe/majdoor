import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, ScrollView, Pressable, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import {
  Tx, Card, Row, Input, Avatar, StatusBadge, ListRow, Divider, EmptyState,
} from '../src/ui';
import { useTheme } from '../src/theme/ThemeContext';
import { useAuth } from '../src/data/stores/auth';
import { WORKERS, DISTRICTS, JOBS } from '../src/data/mock';
import { formatIN } from '../src/lib/format';
import * as haptics from '../src/lib/haptics';

const ACTIONS: { label: string; hindi: string; route: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { label: 'Punch in', hindi: 'हाज़िरी', route: '/punch', icon: 'finger-print' },
  { label: 'Payroll run', hindi: 'वेतन', route: '/payroll-run', icon: 'cash-outline' },
  { label: 'Post demand', hindi: 'मांग', route: '/post-demand', icon: 'megaphone-outline' },
  { label: 'Settings', hindi: 'सेटिंग्स', route: '/settings', icon: 'settings-outline' },
];

const RECENT = ['PATNA', 'Electricians', 'Payroll'];

export default function Search() {
  const t = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const user = useAuth((s) => s.user);
  const [query, setQuery] = useState('');
  const [listening, setListening] = useState(false);
  const micTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (micTimer.current) clearTimeout(micTimer.current);
  }, []);

  const q = query.trim().toLowerCase();

  const results = useMemo(() => {
    if (!q) return null;
    const workers = WORKERS.filter((w) =>
      [w.name, w.id, w.skill, w.district].some((f) => f.toLowerCase().includes(q)),
    ).slice(0, 6);
    const districts = DISTRICTS.filter((d) => d.name.toLowerCase().includes(q)).slice(0, 6);
    const jobs = JOBS.filter((j) =>
      [j.title, j.site].some((f) => f.toLowerCase().includes(q)),
    ).slice(0, 6);
    const actions = ACTIONS.filter((a) => a.label.toLowerCase().includes(q));
    return { workers, districts, jobs, actions };
  }, [q]);

  const empty =
    results !== null &&
    results.workers.length + results.districts.length + results.jobs.length + results.actions.length === 0;

  const startMic = () => {
    if (listening) return;
    haptics.press();
    setListening(true);
    micTimer.current = setTimeout(() => {
      setListening(false);
      setQuery('electrician patna');
      haptics.tap();
    }, 1800);
  };

  const go = (route: string) => {
    haptics.tap();
    router.push(route as any);
  };

  const iconBox = (icon: keyof typeof Ionicons.glyphMap) => (
    <View style={{
      width: 38, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center',
      backgroundColor: t.colors.accentSoft,
    }}>
      <Ionicons name={icon} size={18} color={t.colors.accent} />
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: t.colors.bg }}>
      {/* Header / search bar */}
      <Row style={{
        paddingHorizontal: 20,
        paddingTop: Platform.OS === 'ios' ? 16 : insets.top + 10,
        paddingBottom: 12,
        gap: 10,
      }}>
        <View style={{ flex: 1 }}>
          <Input
            autoFocus
            placeholder="Search workers, districts, jobs… खोजें"
            value={query}
            onChangeText={setQuery}
            returnKeyType="search"
          />
        </View>
        <Pressable
          onPress={startMic}
          accessibilityLabel="Voice search"
          style={{
            width: 48, height: 48, borderRadius: t.radius.md,
            alignItems: 'center', justifyContent: 'center',
            borderWidth: 1, borderColor: listening ? t.colors.danger : t.colors.border,
            backgroundColor: listening ? t.colors.dangerSoft : t.colors.surface,
          }}
        >
          <Ionicons name="mic" size={20} color={listening ? t.colors.danger : t.colors.textSecondary} />
        </Pressable>
        <Pressable
          onPress={() => { haptics.tap(); router.back(); }}
          hitSlop={12}
          accessibilityLabel="Close"
          style={{
            width: 42, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center',
            backgroundColor: t.dark ? 'rgba(255,255,255,0.08)' : '#EDEDF0',
          }}
        >
          <Ionicons name="close" size={22} color={t.colors.text} />
        </Pressable>
      </Row>

      {listening ? (
        <Animated.View entering={FadeIn} style={{ paddingHorizontal: 20, paddingBottom: 8 }}>
          <Tx variant="sub" color={t.colors.danger}>● सुन रहा हूँ… Listening</Tx>
        </Animated.View>
      ) : null}

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: insets.bottom + 28 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {results === null ? (
          <>
            {/* Recent */}
            <Tx variant="kicker" style={{ marginTop: 8, marginBottom: 10 }}>RECENT · हाल की खोज</Tx>
            <Row gap={8} style={{ flexWrap: 'wrap' }}>
              {RECENT.map((r) => (
                <Pressable
                  key={r}
                  onPress={() => { haptics.tap(); setQuery(r); }}
                  style={({ pressed }) => ({
                    minHeight: 36,
                    borderRadius: t.radius.full,
                    borderWidth: 1,
                    borderColor: t.colors.border,
                    backgroundColor: pressed ? t.colors.hairline : t.colors.surface,
                    paddingHorizontal: 14,
                    justifyContent: 'center',
                  })}
                >
                  <Tx variant="subMedium" color={t.colors.textSecondary}>{r}</Tx>
                </Pressable>
              ))}
            </Row>

            {/* Role-aware quick links */}
            <Tx variant="kicker" style={{ marginTop: 24, marginBottom: 10 }}>QUICK LINKS · त्वरित</Tx>
            <Card style={{ padding: 0, overflow: 'hidden' }}>
              {(user?.role === 'worker'
                ? [
                    { label: 'Punch in', sub: 'हाज़िरी लगाएं · GPS + face', route: '/punch', icon: 'finger-print' as const },
                    { label: 'My QR gate pass', sub: 'गेट पास दिखाएं', route: '/qr', icon: 'qr-code-outline' as const },
                    { label: 'Settings', sub: 'भाषा · थीम · सूचनाएं', route: '/settings', icon: 'settings-outline' as const },
                  ]
                : [
                    { label: 'Payroll run', sub: 'July 2026 · pending approval', route: '/payroll-run', icon: 'cash-outline' as const },
                    { label: 'Post demand', sub: 'नई मांग डालें', route: '/post-demand', icon: 'megaphone-outline' as const },
                    { label: 'Scan worker QR', sub: 'गेट पर सत्यापन', route: '/qr', icon: 'qr-code-outline' as const },
                  ]
              ).map((l, i, arr) => (
                <View key={l.label}>
                  <ListRow title={l.label} subtitle={l.sub} left={iconBox(l.icon)} onPress={() => go(l.route)} />
                  {i < arr.length - 1 ? <Divider inset={66} /> : null}
                </View>
              ))}
            </Card>
          </>
        ) : empty ? (
          <EmptyState
            icon="search"
            title="No matches"
            body={`कुछ नहीं मिला · Nothing found for "${query.trim()}". Try a name, district, skill or job.`}
          />
        ) : (
          <Animated.View entering={FadeInDown.duration(220)}>
            {results.workers.length > 0 ? (
              <>
                <Tx variant="kicker" style={{ marginTop: 8, marginBottom: 8 }}>WORKERS · श्रमिक</Tx>
                <Card style={{ padding: 0, overflow: 'hidden' }}>
                  {results.workers.map((w, i, arr) => (
                    <View key={w.id}>
                      <ListRow
                        title={w.name}
                        subtitle={`${w.skill} · ${w.district}`}
                        left={<Avatar initials={w.initials} size={38} />}
                        right={<StatusBadge status={w.status} />}
                        onPress={() => go(`/worker/${w.id}`)}
                      />
                      {i < arr.length - 1 ? <Divider inset={66} /> : null}
                    </View>
                  ))}
                </Card>
              </>
            ) : null}

            {results.districts.length > 0 ? (
              <>
                <Tx variant="kicker" style={{ marginTop: 20, marginBottom: 8 }}>DISTRICTS · ज़िले</Tx>
                <Card style={{ padding: 0, overflow: 'hidden' }}>
                  {results.districts.map((d, i, arr) => (
                    <View key={d.name}>
                      <ListRow
                        title={d.name}
                        subtitle={`${formatIN(d.workers)} registered workers`}
                        left={iconBox('map-outline')}
                        onPress={() => go('/bihar-map')}
                      />
                      {i < arr.length - 1 ? <Divider inset={66} /> : null}
                    </View>
                  ))}
                </Card>
              </>
            ) : null}

            {results.jobs.length > 0 ? (
              <>
                <Tx variant="kicker" style={{ marginTop: 20, marginBottom: 8 }}>JOBS · काम</Tx>
                <Card style={{ padding: 0, overflow: 'hidden' }}>
                  {results.jobs.map((j, i, arr) => (
                    <View key={j.id}>
                      <ListRow
                        title={j.title}
                        subtitle={j.site}
                        left={iconBox('briefcase-outline')}
                        right={<Tx variant="h3" color={t.colors.primary}>₹{j.wage}/day</Tx>}
                        onPress={() => go(`/job/${j.id}`)}
                      />
                      {i < arr.length - 1 ? <Divider inset={66} /> : null}
                    </View>
                  ))}
                </Card>
              </>
            ) : null}

            {results.actions.length > 0 ? (
              <>
                <Tx variant="kicker" style={{ marginTop: 20, marginBottom: 8 }}>ACTIONS · कार्य</Tx>
                <Card style={{ padding: 0, overflow: 'hidden' }}>
                  {results.actions.map((a, i, arr) => (
                    <View key={a.route}>
                      <ListRow
                        title={a.label}
                        subtitle={a.hindi}
                        left={iconBox(a.icon)}
                        onPress={() => go(a.route)}
                      />
                      {i < arr.length - 1 ? <Divider inset={66} /> : null}
                    </View>
                  ))}
                </Card>
              </>
            ) : null}
          </Animated.View>
        )}
      </ScrollView>
    </View>
  );
}
