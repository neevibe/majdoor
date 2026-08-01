import React, { useMemo, useState } from 'react';
import { View, ScrollView, Pressable, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Tx, Card, Row, Button, Input, Segmented, Avatar, Divider } from '../src/ui';
import { useTheme } from '../src/theme/ThemeContext';
import { WORKERS } from '../src/data/mock';
import * as haptics from '../src/lib/haptics';

const TRADES = ['Mason', 'Bar bender', 'Helper', 'Electrician', 'Scaffolder', 'Painter', 'Welder', 'Plumber'];
const DISTRICT_CHIPS = ['PATNA', 'GAYA', 'MUZAFFARPUR', 'BHAGALPUR', 'PURNIA', 'DARBHANGA'];
type Duration = '1 WEEK' | '1 MONTH' | '3 MONTHS+';

function Chip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  const t = useTheme();
  return (
    <Pressable
      onPress={() => { haptics.tap(); onPress(); }}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      style={{
        minHeight: 48, paddingHorizontal: 16, borderRadius: t.radius.full,
        alignItems: 'center', justifyContent: 'center',
        backgroundColor: active ? t.colors.primarySoft : t.colors.surface,
        borderWidth: 1, borderColor: active ? t.colors.primary : t.colors.border,
      }}
    >
      <Text style={{
        fontFamily: t.fonts.bodySemiBold, fontSize: 13,
        color: active ? t.colors.primary : t.colors.textSecondary,
      }}>
        {label}
      </Text>
    </Pressable>
  );
}

const titleCase = (s: string) => (s ? s.charAt(0) + s.slice(1).toLowerCase() : s);

export default function PostDemand() {
  const t = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [trade, setTrade] = useState('');
  const [headcount, setHeadcount] = useState('');
  const [wage, setWage] = useState('');
  const [district, setDistrict] = useState('');
  const [duration, setDuration] = useState<Duration>('1 MONTH');
  const [siteName, setSiteName] = useState('');
  const [posted, setPosted] = useState(false);

  const valid = !!trade && Number(headcount) > 0 && Number(wage) > 0 && !!district;

  const summary = `${trade ? trade.toUpperCase() : 'TRADE'} × ${Number(headcount) > 0 ? headcount : '—'} · ₹${Number(wage) > 0 ? wage : '—'}/day · ${district ? titleCase(district) : '—'}`;

  const matches = useMemo(() => {
    const bySkill = WORKERS.filter((w) => w.skill.toLowerCase() === trade.toLowerCase());
    const pool = bySkill.length > 0 ? bySkill : WORKERS.filter((w) => w.status === 'AVAILABLE');
    return [...pool].sort((a, b) => b.rating - a.rating).slice(0, 3);
  }, [trade]);

  const submit = () => {
    haptics.success();
    setPosted(true);
  };

  if (posted) {
    return (
      <View style={{ flex: 1, backgroundColor: t.colors.bg }}>
        <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingTop: insets.top + 40, paddingBottom: insets.bottom + 28, gap: 14 }}>
          <Animated.View entering={FadeInDown.duration(300)} style={{ alignItems: 'center', gap: 12 }}>
            <View style={{
              width: 88, height: 88, borderRadius: 44, alignItems: 'center', justifyContent: 'center',
              backgroundColor: t.colors.successSoft,
            }}>
              <Ionicons name="megaphone" size={40} color={t.colors.success} />
            </View>
            <Tx variant="h2" style={{ textAlign: 'center' }}>DEMAND POSTED</Tx>
            <Tx variant="sub" color={t.colors.textSecondary} style={{ textAlign: 'center' }}>
              {summary} · {duration}{'\n'}Matching 61,480 available workers…
            </Tx>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(150).duration(300)}>
            <Tx variant="kicker" style={{ marginBottom: 10, marginTop: 8 }}>TOP MATCHES · सुझाव</Tx>
            <Card style={{ padding: 0, overflow: 'hidden' }}>
              {matches.map((w, i, arr) => (
                <View key={w.id}>
                  <Row gap={12} style={{ paddingHorizontal: 16, paddingVertical: 12, minHeight: 48 }}>
                    <Avatar initials={w.initials} size={40} />
                    <View style={{ flex: 1, gap: 2 }}>
                      <Tx variant="bodyMedium">{w.name}</Tx>
                      <Tx variant="caption" color={t.colors.textMuted}>
                        {w.skill} · {w.district} · ★ {w.rating.toFixed(1)}
                      </Tx>
                    </View>
                    <Tx variant="subMedium" color={t.colors.primary}>₹{w.dailyWage}/day</Tx>
                  </Row>
                  {i < arr.length - 1 ? <Divider inset={16} /> : null}
                </View>
              ))}
            </Card>
          </Animated.View>

          <Button title="Done" style={{ marginTop: 8 }} onPress={() => router.back()} />
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: t.colors.bg }}>
      {/* Back row */}
      <View style={{ paddingTop: insets.top + 8, paddingHorizontal: 20, paddingBottom: 12 }}>
        <Row gap={12}>
          <Pressable
            onPress={() => { haptics.tap(); router.back(); }}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Back"
            style={({ pressed }) => ({
              width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center',
              backgroundColor: pressed ? t.colors.hairline : t.colors.surface,
              borderWidth: 1, borderColor: t.colors.border,
            })}
          >
            <Ionicons name="chevron-back" size={22} color={t.colors.text} />
          </Pressable>
          <View style={{ flex: 1, gap: 2 }}>
            <Tx variant="kicker">LABOUR DEMAND · मांग</Tx>
            <Tx variant="h1" numberOfLines={1}>POST DEMAND</Tx>
          </View>
        </Row>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: insets.bottom + 28, gap: 16 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Card style={{ gap: 14 }}>
          <View style={{ gap: 8 }}>
            <Tx variant="kicker">TRADE · हुनर</Tx>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {TRADES.map((tr) => (
                <Chip key={tr} label={tr} active={trade === tr} onPress={() => setTrade(tr)} />
              ))}
            </View>
          </View>
          <Row gap={10} style={{ alignItems: 'flex-start' }}>
            <View style={{ flex: 1 }}>
              <Input label="Headcount" hindi="संख्या" placeholder="e.g. 40" keyboardType="number-pad" value={headcount} onChangeText={setHeadcount} />
            </View>
            <View style={{ flex: 1 }}>
              <Input label="Wage / day" hindi="₹" placeholder="e.g. 480" keyboardType="number-pad" value={wage} onChangeText={setWage} />
            </View>
          </Row>
          <View style={{ gap: 8 }}>
            <Tx variant="kicker">DISTRICT · ज़िला</Tx>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {DISTRICT_CHIPS.map((d) => (
                <Chip key={d} label={d} active={district === d} onPress={() => setDistrict(d)} />
              ))}
            </View>
          </View>
          <View style={{ gap: 8 }}>
            <Tx variant="kicker">DURATION · अवधि</Tx>
            <Segmented
              options={['1 WEEK', '1 MONTH', '3 MONTHS+'] as const}
              value={duration}
              onChange={setDuration}
            />
          </View>
          <Input label="Site name" hindi="साइट" placeholder="e.g. NHAI Purnia bypass" value={siteName} onChangeText={setSiteName} />
        </Card>

        {/* Live summary */}
        <Card tone="soft" style={{ gap: 4 }}>
          <Tx variant="kicker">SUMMARY · सारांश</Tx>
          <Tx variant="h3">{summary}</Tx>
          <Tx variant="caption" color={t.colors.textMuted}>
            {duration}{siteName ? ` · ${siteName}` : ''}
          </Tx>
        </Card>

        <Button title="Post demand" icon="megaphone-outline" disabled={!valid} onPress={submit} />
      </ScrollView>
    </View>
  );
}
