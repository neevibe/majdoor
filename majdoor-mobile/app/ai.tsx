import React, { useEffect, useRef, useState } from 'react';
import {
  View, ScrollView, Pressable, Platform, KeyboardAvoidingView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Speech from 'expo-speech';
import Animated, {
  useSharedValue, useAnimatedStyle, withRepeat, withTiming, withDelay, withSequence,
  Easing, FadeInDown, FadeIn,
} from 'react-native-reanimated';
import { Tx, Row, Badge, Input } from '../src/ui';
import { useTheme } from '../src/theme/ThemeContext';
import { useAuth } from '../src/data/stores/auth';
import { AI_SUGGESTIONS } from '../src/data/mock';
import { api } from '../src/data/api';
import { ChatMessage } from '../src/data/types';
import { brand } from '../src/theme/tokens';
import * as haptics from '../src/lib/haptics';

function TypingDot({ delay }: { delay: number }) {
  const t = useTheme();
  const o = useSharedValue(0.25);
  useEffect(() => {
    o.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 320, easing: Easing.inOut(Easing.quad) }),
          withTiming(0.25, { duration: 320, easing: Easing.inOut(Easing.quad) }),
        ),
        -1,
      ),
    );
  }, [delay, o]);
  const a = useAnimatedStyle(() => ({ opacity: o.value }));
  return (
    <Animated.View style={[a, {
      width: 7, height: 7, borderRadius: 4, backgroundColor: t.colors.textMuted,
    }]} />
  );
}

function ListeningDot() {
  const t = useTheme();
  const o = useSharedValue(0.4);
  useEffect(() => {
    o.value = withRepeat(
      withSequence(withTiming(1, { duration: 380 }), withTiming(0.4, { duration: 380 })),
      -1,
    );
  }, [o]);
  const a = useAnimatedStyle(() => ({ opacity: o.value }));
  return <Animated.View style={[a, { width: 10, height: 10, borderRadius: 5, backgroundColor: t.colors.danger }]} />;
}

export default function AiAssistant() {
  const t = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const user = useAuth((s) => s.user);
  const scrollRef = useRef<ScrollView>(null);

  const firstName = (user?.name ?? 'साथी').split(' ')[0];
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'greet',
      role: 'assistant',
      text: `Namaste ${firstName}. I have live access to the registry, attendance, payroll and demand data. Ask me anything about Bihar's workforce.`,
    },
  ]);
  const [input, setInput] = useState('');
  const [waiting, setWaiting] = useState(false);
  const [listening, setListening] = useState(false);
  const micTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (micTimer.current) clearTimeout(micTimer.current);
    try { Speech.stop(); } catch { /* noop */ }
  }, []);

  const send = (raw?: string) => {
    const q = (raw ?? input).trim();
    if (!q || waiting) return;
    haptics.tap();
    setInput('');
    setMessages((m) => [...m, { id: `u-${Date.now()}`, role: 'user', text: q }]);
    setWaiting(true);
    api.ai(q).then((answer) => {
      setMessages((m) => [...m, { id: `a-${Date.now()}`, role: 'assistant', text: answer }]);
      setWaiting(false);
      haptics.success();
    });
  };

  const startMic = () => {
    if (listening) return;
    haptics.press();
    setListening(true);
    micTimer.current = setTimeout(() => {
      setListening(false);
      setInput('Show attendance for this week');
      haptics.tap();
    }, 1800);
  };

  const speak = (text: string) => {
    haptics.tap();
    try {
      Speech.stop();
      Speech.speak(text, { language: 'en-IN' });
    } catch { /* speech unavailable */ }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{ flex: 1, backgroundColor: t.colors.bg }}
    >
      {/* Header */}
      <Row style={{
        paddingHorizontal: 20,
        paddingTop: Platform.OS === 'ios' ? 16 : insets.top + 10,
        paddingBottom: 12,
        gap: 12,
        borderBottomWidth: 1,
        borderBottomColor: t.colors.hairline,
      }}>
        <LinearGradient
          colors={brand.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ width: 36, height: 36, borderRadius: 12, alignItems: 'center', justifyContent: 'center' }}
        >
          <Ionicons name="sparkles" size={18} color="#fff" />
        </LinearGradient>
        <View style={{ flex: 1, gap: 3 }}>
          <Tx variant="h3">SAHAYAK · सहायक</Tx>
          <Badge label="CLAUDE-POWERED" tone="violet" />
        </View>
        <Pressable
          onPress={() => { haptics.tap(); router.back(); }}
          hitSlop={12}
          accessibilityLabel="Close"
          style={{
            width: 42, height: 42, borderRadius: 14, alignItems: 'center', justifyContent: 'center',
            backgroundColor: t.dark ? 'rgba(255,255,255,0.08)' : '#EDEDF0',
          }}
        >
          <Ionicons name="close" size={22} color={t.colors.text} />
        </Pressable>
      </Row>

      {/* Chat */}
      <ScrollView
        ref={scrollRef}
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 20, paddingVertical: 16, gap: 10 }}
        onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {messages.map((m) => {
          const mine = m.role === 'user';
          return (
            <Animated.View
              key={m.id}
              entering={FadeInDown.duration(260)}
              style={{
                alignSelf: mine ? 'flex-end' : 'flex-start',
                maxWidth: '80%',
                backgroundColor: mine ? t.colors.primary : t.colors.surface,
                borderWidth: mine ? 0 : 1,
                borderColor: t.colors.border,
                borderRadius: t.radius.lg,
                borderBottomRightRadius: mine ? 6 : t.radius.lg,
                borderBottomLeftRadius: mine ? t.radius.lg : 6,
                paddingHorizontal: 14,
                paddingVertical: 10,
                gap: 6,
              }}
            >
              <Tx variant="body" color={mine ? '#fff' : t.colors.text}>{m.text}</Tx>
              {!mine && Platform.OS !== 'web' ? (
                <Pressable
                  onPress={() => speak(m.text)}
                  hitSlop={10}
                  accessibilityLabel="Read aloud"
                  style={{ alignSelf: 'flex-start', paddingVertical: 2 }}
                >
                  <Ionicons name="volume-medium-outline" size={17} color={t.colors.textMuted} />
                </Pressable>
              ) : null}
            </Animated.View>
          );
        })}

        {waiting ? (
          <Animated.View
            entering={FadeIn}
            style={{
              alignSelf: 'flex-start', flexDirection: 'row', gap: 5,
              backgroundColor: t.colors.surface, borderWidth: 1, borderColor: t.colors.border,
              borderRadius: t.radius.lg, borderBottomLeftRadius: 6,
              paddingHorizontal: 16, paddingVertical: 14, alignItems: 'center',
            }}
          >
            <TypingDot delay={0} />
            <TypingDot delay={160} />
            <TypingDot delay={320} />
          </Animated.View>
        ) : null}
      </ScrollView>

      {/* Suggestions */}
      <View style={{ paddingBottom: 8, gap: 6 }}>
        <Tx variant="kicker" style={{ paddingHorizontal: 20 }}>TRY ASKING</Tx>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20, gap: 8 }}
          keyboardShouldPersistTaps="handled"
        >
          {AI_SUGGESTIONS.map((s) => (
            <Pressable
              key={s}
              onPress={() => send(s)}
              accessibilityRole="button"
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
              <Tx variant="subMedium" color={t.colors.textSecondary}>{s}</Tx>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      {/* Listening banner */}
      {listening ? (
        <Animated.View entering={FadeIn} style={{ paddingHorizontal: 20, paddingBottom: 6 }}>
          <Row gap={8}>
            <ListeningDot />
            <Tx variant="sub" color={t.colors.danger}>सुन रहा हूँ… Listening</Tx>
            <Tx variant="caption" color={t.colors.textMuted}>(device STT needs a dev build — demo)</Tx>
          </Row>
        </Animated.View>
      ) : null}

      {/* Composer */}
      <Row
        gap={10}
        style={{
          paddingHorizontal: 20,
          paddingTop: 8,
          paddingBottom: Math.max(insets.bottom, 12),
          borderTopWidth: 1,
          borderTopColor: t.colors.hairline,
          alignItems: 'flex-end',
        }}
      >
        <View style={{ flex: 1 }}>
          <Input
            placeholder="पूछें… Ask about workers, payroll…"
            value={input}
            onChangeText={setInput}
            onSubmitEditing={() => send()}
            returnKeyType="send"
          />
        </View>
        <Pressable
          onPress={startMic}
          accessibilityLabel="Voice input"
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
          onPress={() => send()}
          disabled={!input.trim() || waiting}
          accessibilityLabel="Send"
          style={{
            width: 48, height: 48, borderRadius: 24,
            alignItems: 'center', justifyContent: 'center',
            backgroundColor: t.colors.primary,
            opacity: !input.trim() || waiting ? 0.45 : 1,
          }}
        >
          <Ionicons name="arrow-up" size={22} color="#fff" />
        </Pressable>
      </Row>
    </KeyboardAvoidingView>
  );
}
