import React, { useEffect, useRef, useState } from 'react';
import { View, ScrollView, Pressable, Platform, KeyboardAvoidingView, TextInput } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Linking from 'expo-linking';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Tx, Row, Avatar } from '../../src/ui';
import { useTheme } from '../../src/theme/ThemeContext';
import { WORKERS } from '../../src/data/mock';
import * as haptics from '../../src/lib/haptics';

interface Bubble {
  id: string;
  from: 'me' | 'them';
  text: string;
  time: string;
}

const SEED: Bubble[] = [
  { id: 'm1', from: 'them', text: 'सर, जुलाई की सैलरी कब आएगी?', time: '10:02' },
  { id: 'm2', from: 'me', text: 'Payroll approve ho gaya hai. Kal tak IMPS se aa jayegi. Slip WhatsApp par milegi.', time: '10:05' },
  { id: 'm3', from: 'them', text: '👍', time: '10:06' },
];

function nowHHMM() {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

export default function ChatScreen() {
  const t = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const worker = WORKERS.find((w) => w.id === id);
  const name = worker?.name ?? 'Worker';
  const phone = worker?.phone ?? '+91 98352 41067';

  const [messages, setMessages] = useState<Bubble[]>(SEED);
  const [draft, setDraft] = useState('');
  const scrollRef = useRef<ScrollView>(null);
  const replyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (replyTimer.current) clearTimeout(replyTimer.current);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 80);
    return () => clearTimeout(timer);
  }, [messages.length]);

  const send = () => {
    const text = draft.trim();
    if (!text) return;
    haptics.tap();
    setMessages((m) => [...m, { id: `m-${Date.now()}`, from: 'me', text, time: nowHHMM() }]);
    setDraft('');
    replyTimer.current = setTimeout(() => {
      setMessages((m) => [...m, { id: `r-${Date.now()}`, from: 'them', text: 'ठीक है सर ✓', time: nowHHMM() }]);
      haptics.tap();
    }, 1200);
  };

  const HeaderIconBtn = ({ name: icon, label, onPress }: {
    name: keyof typeof Ionicons.glyphMap; label: string; onPress: () => void;
  }) => (
    <Pressable
      onPress={() => { haptics.tap(); onPress(); }}
      hitSlop={4}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => ({
        width: 42, height: 42, borderRadius: 14, alignItems: 'center', justifyContent: 'center',
        backgroundColor: pressed ? t.colors.hairline : t.colors.surface,
        borderWidth: 1, borderColor: t.colors.border,
      })}
    >
      <Ionicons name={icon} size={19} color={t.colors.text} />
    </Pressable>
  );

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: t.colors.bg }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Header */}
      <View style={{
        paddingTop: insets.top + 8, paddingHorizontal: 20, paddingBottom: 12,
        backgroundColor: t.colors.bg, borderBottomWidth: 1, borderBottomColor: t.colors.hairline,
      }}>
        <Row style={{ justifyContent: 'space-between' }}>
          <Row gap={12} style={{ flex: 1 }}>
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
            <Avatar initials={worker?.initials ?? 'W'} size={42} />
            <View style={{ flex: 1, gap: 1 }}>
              <Tx variant="h3" numberOfLines={1}>{name}</Tx>
              <Row gap={5}>
                <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: t.colors.success }} />
                <Tx variant="caption" color={t.colors.textMuted}>{worker?.skill ?? 'Gang'} · on site</Tx>
              </Row>
            </View>
          </Row>
          <Row gap={8}>
            <HeaderIconBtn name="call-outline" label={`Call ${name}`} onPress={() => Linking.openURL(`tel:${phone.replace(/\s/g, '')}`)} />
            <HeaderIconBtn name="logo-whatsapp" label={`WhatsApp ${name}`} onPress={() => Linking.openURL(`https://wa.me/${phone.replace(/\D/g, '')}`)} />
          </Row>
        </Row>
      </View>

      {/* Messages */}
      <ScrollView
        ref={scrollRef}
        contentContainerStyle={{ paddingHorizontal: 20, paddingVertical: 16, gap: 10 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {messages.map((m) => (
          <Animated.View
            key={m.id}
            entering={FadeInDown}
            style={{
              maxWidth: '78%',
              alignSelf: m.from === 'me' ? 'flex-end' : 'flex-start',
              backgroundColor: m.from === 'me' ? t.colors.primary : t.colors.surface,
              borderWidth: m.from === 'me' ? 0 : 1,
              borderColor: t.colors.border,
              borderRadius: t.radius.lg,
              borderBottomRightRadius: m.from === 'me' ? 6 : t.radius.lg,
              borderBottomLeftRadius: m.from === 'them' ? 6 : t.radius.lg,
              paddingHorizontal: 14, paddingVertical: 10, gap: 3,
            }}
          >
            <Tx variant="body" color={m.from === 'me' ? t.colors.onPrimary : t.colors.text}>
              {m.text}
            </Tx>
            <Tx
              variant="caption"
              color={m.from === 'me' ? 'rgba(255,255,255,0.65)' : t.colors.textMuted}
              style={{ alignSelf: 'flex-end', fontSize: 10 }}
            >
              {m.time}
            </Tx>
          </Animated.View>
        ))}
      </ScrollView>

      {/* Composer */}
      <View style={{
        flexDirection: 'row', alignItems: 'center', gap: 10,
        paddingHorizontal: 20, paddingTop: 10, paddingBottom: insets.bottom + 10,
        borderTopWidth: 1, borderTopColor: t.colors.hairline, backgroundColor: t.colors.bg,
      }}>
        <TextInput
          value={draft}
          onChangeText={setDraft}
          placeholder="Message… · संदेश लिखें"
          placeholderTextColor={t.colors.textMuted}
          multiline
          style={{
            flex: 1, minHeight: 48, maxHeight: 110,
            borderRadius: t.radius.lg, borderWidth: 1, borderColor: t.colors.border,
            backgroundColor: t.colors.inputBg, paddingHorizontal: 14, paddingVertical: 12,
            color: t.colors.text, fontFamily: t.fonts.body, fontSize: 15,
          }}
        />
        <Pressable
          onPress={send}
          disabled={!draft.trim()}
          accessibilityRole="button"
          accessibilityLabel="Send message"
          style={({ pressed }) => ({
            width: 48, height: 48, borderRadius: 24,
            alignItems: 'center', justifyContent: 'center',
            backgroundColor: t.colors.primary,
            opacity: !draft.trim() ? 0.4 : pressed ? 0.85 : 1,
          })}
        >
          <Ionicons name="send" size={19} color={t.colors.onPrimary} />
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}
