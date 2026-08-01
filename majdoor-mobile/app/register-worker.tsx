import React, { useState } from 'react';
import { View, ScrollView, Pressable, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Tx, Card, Row, Button, Input, Segmented, KV } from '../src/ui';
import { useTheme } from '../src/theme/ThemeContext';
import { SkillCategory } from '../src/data/types';
import * as haptics from '../src/lib/haptics';

const DISTRICT_CHIPS = ['PATNA', 'GAYA', 'MUZAFFARPUR', 'BHAGALPUR', 'PURNIA', 'DARBHANGA'];
const SKILL_CHIPS = ['Mason', 'Bar bender', 'Helper', 'Electrician', 'Scaffolder', 'Painter', 'Welder', 'Plumber'];

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

function genWorkerId(): string {
  const r4 = () => String(Math.floor(1000 + Math.random() * 9000));
  return `BR-${r4()}-${r4()}`;
}

export default function RegisterWorker() {
  const t = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [step, setStep] = useState(1);
  const [done, setDone] = useState(false);
  const [workerId, setWorkerId] = useState('');

  // Step 1 — identity
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [aadhaar4, setAadhaar4] = useState('');
  const [district, setDistrict] = useState('');

  // Step 2 — skill
  const [skill, setSkill] = useState('');
  const [category, setCategory] = useState<SkillCategory>('Skilled');
  const [wage, setWage] = useState('');

  const valid1 = name.trim().length > 1 && phone.trim().length >= 10 && /^\d{4}$/.test(aadhaar4) && !!district;
  const valid2 = !!skill && Number(wage) > 0;

  const next = () => {
    haptics.press();
    setStep((s) => Math.min(3, s + 1));
  };
  const back = () => {
    haptics.tap();
    setStep((s) => Math.max(1, s - 1));
  };
  const register = () => {
    setWorkerId(genWorkerId());
    setDone(true);
    haptics.success();
  };

  if (done) {
    return (
      <View style={{ flex: 1, backgroundColor: t.colors.bg, paddingHorizontal: 20 }}>
        <Animated.View entering={FadeInDown.duration(300)} style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 14 }}>
          <View style={{
            width: 88, height: 88, borderRadius: 44, alignItems: 'center', justifyContent: 'center',
            backgroundColor: t.colors.successSoft,
          }}>
            <Ionicons name="checkmark" size={44} color={t.colors.success} />
          </View>
          <Tx variant="h2" style={{ textAlign: 'center' }}>WORKER REGISTERED</Tx>
          <Tx variant="num" color={t.colors.primary}>{workerId}</Tx>
          <Tx variant="sub" color={t.colors.textMuted} style={{ textAlign: 'center' }}>
            {name} · {skill} · {district}{'\n'}Pending Aadhaar verification · आधार सत्यापन बाकी
          </Tx>
          <Button title="Done" style={{ alignSelf: 'stretch', marginTop: 12 }} onPress={() => router.back()} />
        </Animated.View>
        <View style={{ height: insets.bottom + 20 }} />
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
            <Tx variant="kicker">STEP {step} OF 3 · पंजीकरण</Tx>
            <Tx variant="h1" numberOfLines={1}>REGISTER WORKER</Tx>
          </View>
        </Row>
        {/* Step indicator */}
        <Row gap={6} style={{ marginTop: 12 }}>
          {[1, 2, 3].map((s) => (
            <View key={s} style={{
              flex: 1, height: 4, borderRadius: 2,
              backgroundColor: s <= step ? t.colors.primary : t.colors.border,
            }} />
          ))}
        </Row>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: insets.bottom + 28, gap: 16 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {step === 1 ? (
          <Animated.View key="s1" entering={FadeInDown.duration(240)} style={{ gap: 16 }}>
            <Card style={{ gap: 14 }}>
              <Tx variant="kicker">IDENTITY · पहचान</Tx>
              <Input label="Full name" hindi="नाम" placeholder="e.g. Sunil Kumar Manjhi" value={name} onChangeText={setName} />
              <Input label="Phone" hindi="फ़ोन" placeholder="+91 …" keyboardType="phone-pad" value={phone} onChangeText={setPhone} />
              <Input
                label="Aadhaar (last 4 digits)"
                hindi="आधार"
                placeholder="XXXX"
                keyboardType="number-pad"
                maxLength={4}
                value={aadhaar4}
                onChangeText={setAadhaar4}
              />
              <View style={{ gap: 8 }}>
                <Tx variant="kicker">HOME DISTRICT · ज़िला</Tx>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                  {DISTRICT_CHIPS.map((d) => (
                    <Chip key={d} label={d} active={district === d} onPress={() => setDistrict(d)} />
                  ))}
                </View>
              </View>
            </Card>
            <Button title="Next — Skill" disabled={!valid1} onPress={next} icon="arrow-forward" />
          </Animated.View>
        ) : step === 2 ? (
          <Animated.View key="s2" entering={FadeInDown.duration(240)} style={{ gap: 16 }}>
            <Card style={{ gap: 14 }}>
              <Tx variant="kicker">TRADE · हुनर</Tx>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                {SKILL_CHIPS.map((s) => (
                  <Chip key={s} label={s} active={skill === s} onPress={() => setSkill(s)} />
                ))}
              </View>
              <View style={{ gap: 8 }}>
                <Tx variant="kicker">CATEGORY · श्रेणी</Tx>
                <Segmented
                  options={['Skilled', 'Semi-skilled', 'Unskilled'] as const}
                  value={category}
                  onChange={setCategory}
                />
              </View>
              <Input
                label="Daily wage"
                hindi="दिहाड़ी ₹"
                placeholder="e.g. 650"
                keyboardType="number-pad"
                value={wage}
                onChangeText={setWage}
              />
            </Card>
            <Row gap={10}>
              <Button title="Back" variant="secondary" onPress={back} style={{ flex: 1 }} />
              <Button title="Next — Review" disabled={!valid2} onPress={next} style={{ flex: 2 }} icon="arrow-forward" />
            </Row>
          </Animated.View>
        ) : (
          <Animated.View key="s3" entering={FadeInDown.duration(240)} style={{ gap: 16 }}>
            <Card>
              <Tx variant="kicker" style={{ marginBottom: 4 }}>REVIEW · जाँच</Tx>
              <KV k="Name" v={name} dashed />
              <KV k="Phone" v={phone} dashed />
              <KV k="Aadhaar" v={`XXXX-XXXX-${aadhaar4}`} dashed />
              <KV k="District" v={district} dashed />
              <KV k="Trade" v={skill} dashed />
              <KV k="Category" v={category} dashed />
              <KV k="Daily wage" v={`₹${wage}/day`} />
            </Card>
            <Row gap={10}>
              <Button title="Back" variant="secondary" onPress={back} style={{ flex: 1 }} />
              <Button title="Register worker" variant="success" icon="checkmark" onPress={register} style={{ flex: 2 }} />
            </Row>
          </Animated.View>
        )}
      </ScrollView>
    </View>
  );
}
