import React from 'react';
import { View, ScrollView, Pressable } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Linking from 'expo-linking';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Tx, Card, Row, Badge, Button, KV, Skeleton, EmptyState } from '../../src/ui';
import { useTheme } from '../../src/theme/ThemeContext';
import { useJobs } from '../../src/data/hooks';
import { useSession } from '../../src/data/stores/session';
import { Job } from '../../src/data/types';
import { rupees } from '../../src/lib/format';
import * as haptics from '../../src/lib/haptics';

function badgesFor(job: Job): { label: string; tone: 'accent' | 'success' | 'warning' | 'violet' | 'neutral' }[] {
  const out: { label: string; tone: 'accent' | 'success' | 'warning' | 'violet' | 'neutral' }[] = [];
  const need = job.need.toLowerCase();
  const note = job.startNote.toLowerCase();
  if (need.includes('pf')) out.push({ label: 'PF ✓', tone: 'success' });
  if (need.includes('esic')) out.push({ label: 'ESIC ✓', tone: 'success' });
  if (need.includes('iti')) out.push({ label: 'ITI PREFERRED', tone: 'accent' });
  if (need.includes('no experience')) out.push({ label: 'NO EXPERIENCE OK', tone: 'accent' });
  if (need.includes('semi-skilled')) out.push({ label: 'SEMI-SKILLED', tone: 'violet' });
  else if (need.includes('skilled')) out.push({ label: 'SKILLED', tone: 'violet' });
  if (note.includes('night')) out.push({ label: 'NIGHT SHIFT', tone: 'warning' });
  if (note.includes('bus')) out.push({ label: 'BUS PROVIDED', tone: 'neutral' });
  if (note.includes('camp')) out.push({ label: 'CAMP STAY', tone: 'neutral' });
  return out;
}

export default function JobDetail() {
  const t = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const jobs = useJobs();
  const { appliedJobs, applyJob } = useSession();

  const job = (jobs.data ?? []).find((j) => j.id === id);
  const applied = !!(job && appliedJobs[job.id]);

  const callSite = () => {
    Linking.openURL('tel:+916122500100').catch(() => {});
  };

  const shareWhatsApp = async () => {
    if (!job) return;
    const text = encodeURIComponent(
      `MAJDOOR job · ${job.title} @ ${job.site} — ${rupees(job.wage)}/day · ${job.startNote}. ${job.need}. Apply on MAJDOOR app.`,
    );
    try {
      await Linking.openURL(`whatsapp://send?text=${text}`);
    } catch {
      Linking.openURL(`https://wa.me/?text=${text}`).catch(() => {});
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: t.colors.bg }}>
      {/* Top bar with back button */}
      <Row style={{ paddingTop: insets.top + 8, paddingHorizontal: 20, paddingBottom: 12, justifyContent: 'space-between' }}>
        <Pressable
          onPress={() => { haptics.tap(); router.back(); }}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Back"
          style={({ pressed }) => ({
            width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center',
            backgroundColor: pressed ? t.colors.hairline : t.colors.surface,
            borderWidth: 1, borderColor: t.colors.border,
          })}
        >
          <Ionicons name="chevron-back" size={22} color={t.colors.text} />
        </Pressable>
        <Tx variant="kicker">काम का ब्योरा · JOB DETAIL</Tx>
        <View style={{ width: 48 }} />
      </Row>

      {jobs.isLoading ? (
        <View style={{ paddingHorizontal: 20, gap: 12 }}>
          <Skeleton height={150} radius={16} />
          <Skeleton height={220} radius={16} />
        </View>
      ) : !job ? (
        <EmptyState
          icon="briefcase-outline"
          title="Job not found"
          body="यह काम अब उपलब्ध नहीं है।"
          actionTitle="Back to jobs"
          onAction={() => router.back()}
        />
      ) : (
        <>
          <ScrollView
            contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: insets.bottom + 130 }}
            showsVerticalScrollIndicator={false}
          >
            {/* Hero */}
            <Animated.View entering={FadeInDown}>
              <Card tone="hero" style={{ gap: 10 }}>
                <Tx variant="kicker" color="rgba(255,255,255,0.6)">{job.district.toUpperCase()} · {job.distanceKm} KM</Tx>
                <Tx variant="h1" color={t.colors.heroText}>{job.title}</Tx>
                <Row style={{ justifyContent: 'space-between' }}>
                  <Tx variant="sub" color="rgba(255,255,255,0.7)" style={{ flex: 1 }} numberOfLines={2}>{job.site}</Tx>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Tx variant="num" color={t.colors.heroText}>{rupees(job.wage)}</Tx>
                    <Tx variant="caption" color="rgba(255,255,255,0.6)">per day · रोज़ाना</Tx>
                  </View>
                </Row>
              </Card>
            </Animated.View>

            {/* Badges */}
            <Animated.View entering={FadeInDown.delay(60)} style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 14 }}>
              {badgesFor(job).map((b) => <Badge key={b.label} label={b.label} tone={b.tone} />)}
            </Animated.View>

            {/* Details */}
            <Animated.View entering={FadeInDown.delay(120)}>
              <Card style={{ marginTop: 14 }}>
                <KV k="Site · साइट" v={job.site} dashed />
                <KV k="Distance · दूरी" v={`${job.distanceKm} km from Gaya`} dashed />
                <KV k="Start · शुरुआत" v={job.startNote} dashed />
                <KV k="Requirement" v={job.need} dashed />
                <KV k="Headcount" v={`${job.count} workers needed`} dashed />
                <KV k="District · ज़िला" v={job.district} />
              </Card>
            </Animated.View>

            {/* Map placeholder */}
            <Animated.View entering={FadeInDown.delay(180)}>
              <Card tone="soft" style={{ marginTop: 14, alignItems: 'center', gap: 8, paddingVertical: 28 }}>
                <View style={{
                  width: 56, height: 56, borderRadius: 18, alignItems: 'center', justifyContent: 'center',
                  backgroundColor: t.colors.primarySoft,
                }}>
                  <Ionicons name="location" size={26} color={t.colors.primary} />
                </View>
                <Tx variant="h3">{job.district.toUpperCase()} DISTRICT</Tx>
                <Tx variant="caption" color={t.colors.textMuted}>{job.site} · {job.distanceKm} km · नक्शा डिवाइस पर खुलेगा</Tx>
              </Card>
            </Animated.View>

            {/* Secondary actions */}
            <Animated.View entering={FadeInDown.delay(240)} style={{ marginTop: 14, gap: 10 }}>
              <Row gap={10}>
                <Button title="Call site office" variant="secondary" icon="call-outline" style={{ flex: 1 }} onPress={callSite} />
                <Button title="WhatsApp" variant="secondary" icon="logo-whatsapp" style={{ flex: 1 }} onPress={shareWhatsApp} />
              </Row>
            </Animated.View>
          </ScrollView>

          {/* Sticky apply */}
          <View style={{
            position: 'absolute', left: 0, right: 0, bottom: 0,
            paddingHorizontal: 20, paddingTop: 12, paddingBottom: insets.bottom + 12,
            backgroundColor: t.colors.bg, borderTopWidth: 1, borderTopColor: t.colors.hairline,
          }}>
            {applied ? (
              <Button title="भेजा ✓ APPLIED" variant="success" icon="checkmark-circle" onPress={() => haptics.tap()} style={{ minHeight: 56 }} />
            ) : (
              <Button
                title="आवेदन करें · APPLY NOW"
                icon="paper-plane-outline"
                style={{ minHeight: 56 }}
                onPress={() => { haptics.success(); applyJob(job.id); }}
              />
            )}
          </View>
        </>
      )}
    </View>
  );
}
