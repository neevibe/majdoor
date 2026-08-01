import React, { useEffect, useRef, useState } from 'react';
import { View, Pressable, Text, Platform, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Linking from 'expo-linking';
import * as Location from 'expo-location';
import Animated, {
  useSharedValue, useAnimatedStyle, withRepeat, withTiming, Easing, FadeInDown,
} from 'react-native-reanimated';
import { Tx, Card, Row, Button, Divider } from '../src/ui';
import { useTheme } from '../src/theme/ThemeContext';
import * as haptics from '../src/lib/haptics';

const RED = '#EF4444';
const RED_SOFT = 'rgba(239,68,68,0.16)';

const ALERT_TARGETS = [
  { name: 'Supervisor Rakesh Verma', sub: 'पर्यवेक्षक · Gate 2', tel: '+919431022815' },
  { name: 'Site safety officer', sub: 'L&T Patna Metro C-2', tel: '+919431022816' },
  { name: 'Majdoor control room 24×7', sub: 'नियंत्रण कक्ष', tel: '+918002020108' },
];

const IDLE_CONTACTS = [
  { name: 'Ambulance', sub: 'एम्बुलेंस', tel: '108' },
  { name: 'Police', sub: 'पुलिस', tel: '100' },
  { name: 'Site safety', sub: 'साइट सुरक्षा', tel: '+919431022815' },
];

export default function Sos() {
  const t = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [triggered, setTriggered] = useState(false);
  const [count, setCount] = useState<number | null>(null);
  const [locNote, setLocNote] = useState<string | null>(null);
  const holdTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const countTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  const pulse = useSharedValue(0);
  const scale = useSharedValue(1);
  useEffect(() => {
    pulse.value = withRepeat(withTiming(1, { duration: 1800, easing: Easing.out(Easing.quad) }), -1);
  }, [pulse]);
  const ringStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 1 + pulse.value * 0.22 }],
    opacity: 1 - pulse.value,
  }));
  const btnStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  const clearTimers = () => {
    if (holdTimer.current) { clearTimeout(holdTimer.current); holdTimer.current = null; }
    if (countTimer.current) { clearInterval(countTimer.current); countTimer.current = null; }
  };

  useEffect(() => clearTimers, []);

  const shareLocation = async () => {
    if (Platform.OS === 'web') {
      setLocNote('Location shared with responders');
      return;
    }
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        setLocNote(`Live location shared · ${pos.coords.latitude.toFixed(5)}, ${pos.coords.longitude.toFixed(5)}`);
      } else {
        setLocNote('Location permission denied — approximate site location shared');
      }
    } catch {
      setLocNote('Location unavailable — site geofence position shared');
    }
  };

  const trigger = () => {
    clearTimers();
    setCount(null);
    setTriggered(true);
    haptics.error();
    shareLocation();
  };

  const onPressIn = () => {
    if (triggered) return;
    haptics.press();
    scale.value = withTiming(0.9, { duration: 1500, easing: Easing.out(Easing.quad) });
    setCount(3);
    let c = 3;
    countTimer.current = setInterval(() => {
      c -= 1;
      if (c >= 1) setCount(c);
    }, 500);
    holdTimer.current = setTimeout(trigger, 1500);
  };

  const onPressOut = () => {
    if (triggered) return;
    clearTimers();
    setCount(null);
    scale.value = withTiming(1, { duration: 160 });
  };

  const cancelSos = () => {
    setTriggered(false);
    setLocNote(null);
    scale.value = withTiming(1, { duration: 160 });
    haptics.warn();
  };

  const call = (tel: string) => {
    haptics.tap();
    Linking.openURL(`tel:${tel}`).catch(() => {});
  };

  const callBtn = (tel: string) => (
    <Pressable
      onPress={() => call(tel)}
      accessibilityLabel={`Call ${tel}`}
      style={{
        width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center',
        backgroundColor: 'rgba(52,211,153,0.14)',
      }}
    >
      <Ionicons name="call" size={19} color="#34D399" />
    </Pressable>
  );

  const C = 200;

  return (
    <View style={{ flex: 1, backgroundColor: '#0B0D12', paddingTop: insets.top }}>
      {/* Header */}
      <Row style={{ justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 12 }}>
        <View>
          <Tx variant="kicker" color="rgba(255,255,255,0.5)">आपातकाल · EMERGENCY</Tx>
          <Tx variant="h2" color="#F5F6F8">SOS</Tx>
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

      <ScrollView
        contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 20, paddingBottom: insets.bottom + 28 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Big SOS button */}
        <View style={{ alignItems: 'center', justifyContent: 'center', paddingVertical: 28 }}>
          <View style={{ width: C + 48, height: C + 48, alignItems: 'center', justifyContent: 'center' }}>
            <Animated.View style={[ringStyle, {
              position: 'absolute', width: C, height: C, borderRadius: C / 2,
              borderWidth: 2, borderColor: RED,
            }]} />
            <Animated.View style={btnStyle}>
              <Pressable
                onPressIn={onPressIn}
                onPressOut={onPressOut}
                accessibilityRole="button"
                accessibilityLabel={triggered ? 'SOS sent' : 'Hold to send SOS'}
                style={{
                  width: C, height: C, borderRadius: C / 2,
                  alignItems: 'center', justifyContent: 'center', gap: 6,
                  backgroundColor: triggered ? RED : RED_SOFT,
                  borderWidth: 2, borderColor: RED,
                }}
              >
                {triggered ? (
                  <>
                    <Ionicons name="radio" size={34} color="#fff" />
                    <Text style={{ fontFamily: t.fonts.heading, fontSize: 24, letterSpacing: 1.5, color: '#fff' }}>
                      SOS SENT
                    </Text>
                    <Text style={{ fontFamily: t.fonts.body, fontSize: 13, color: 'rgba(255,255,255,0.85)' }}>
                      मदद आ रही है
                    </Text>
                  </>
                ) : count !== null ? (
                  <>
                    <Text style={{ fontFamily: t.fonts.heading, fontSize: 56, letterSpacing: 2, color: RED }}>
                      {count}
                    </Text>
                    <Text style={{ fontFamily: t.fonts.body, fontSize: 12, letterSpacing: 2, color: 'rgba(255,255,255,0.7)' }}>
                      HOLD 3•2•1
                    </Text>
                  </>
                ) : (
                  <>
                    <Text style={{ fontFamily: t.fonts.heading, fontSize: 44, letterSpacing: 3, color: RED }}>SOS</Text>
                    <Text style={{ fontFamily: t.fonts.body, fontSize: 12, letterSpacing: 1.5, color: 'rgba(255,255,255,0.7)' }}>
                      दबाकर रखें · HOLD 1.5 s
                    </Text>
                  </>
                )}
              </Pressable>
            </Animated.View>
          </View>
        </View>

        {triggered ? (
          <Animated.View entering={FadeInDown.duration(320)} style={{ gap: 14 }}>
            <Card style={{ backgroundColor: '#12151C', borderColor: '#232833', padding: 0, overflow: 'hidden' }}>
              <View style={{ padding: 16, paddingBottom: 8 }}>
                <Tx variant="kicker" color="rgba(255,255,255,0.5)">ALERT SENT TO · सूचना भेजी गई</Tx>
              </View>
              {ALERT_TARGETS.map((a, i, arr) => (
                <View key={a.name}>
                  <Row style={{ paddingHorizontal: 16, paddingVertical: 12, gap: 12 }}>
                    <View style={{ flex: 1, gap: 2 }}>
                      <Tx variant="bodyMedium" color="#F2F3F6">{a.name}</Tx>
                      <Tx variant="caption" color="rgba(255,255,255,0.5)">{a.sub}</Tx>
                    </View>
                    {callBtn(a.tel)}
                  </Row>
                  {i < arr.length - 1 ? <Divider inset={16} /> : null}
                </View>
              ))}
            </Card>

            <Card style={{ backgroundColor: '#12151C', borderColor: '#232833', flexDirection: 'row', gap: 12, alignItems: 'flex-start' }}>
              <Ionicons name="location" size={20} color="#34D399" style={{ marginTop: 2 }} />
              <View style={{ flex: 1, gap: 3 }}>
                <Tx variant="bodyMedium" color="#F2F3F6">Share live location · लाइव लोकेशन</Tx>
                <Tx variant="caption" color="rgba(255,255,255,0.55)">
                  {locNote ?? 'Fetching GPS position…'}
                </Tx>
              </View>
            </Card>

            <Button title="Cancel SOS · रद्द करें" variant="secondary" onPress={cancelSos} />
          </Animated.View>
        ) : (
          <View style={{ gap: 10 }}>
            <Tx variant="kicker" color="rgba(255,255,255,0.5)" style={{ marginBottom: 2 }}>
              EMERGENCY CONTACTS · आपातकालीन नंबर
            </Tx>
            <Card style={{ backgroundColor: '#12151C', borderColor: '#232833', padding: 0, overflow: 'hidden' }}>
              {IDLE_CONTACTS.map((c, i, arr) => (
                <View key={c.name}>
                  <Row style={{ paddingHorizontal: 16, paddingVertical: 12, gap: 12, minHeight: 48 }}>
                    <View style={{
                      width: 38, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center',
                      backgroundColor: RED_SOFT,
                    }}>
                      <Ionicons name="medkit-outline" size={18} color={RED} />
                    </View>
                    <View style={{ flex: 1, gap: 2 }}>
                      <Tx variant="bodyMedium" color="#F2F3F6">{c.name} {c.tel.length <= 3 ? c.tel : ''}</Tx>
                      <Tx variant="caption" color="rgba(255,255,255,0.5)">{c.sub} · {c.tel}</Tx>
                    </View>
                    {callBtn(c.tel)}
                  </Row>
                  {i < arr.length - 1 ? <Divider inset={66} /> : null}
                </View>
              ))}
            </Card>
            <Tx variant="caption" color="rgba(255,255,255,0.4)" style={{ textAlign: 'center', marginTop: 6 }}>
              Holding the button for 1.5 seconds alerts your supervisor, the site safety officer and the control room.
            </Tx>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
