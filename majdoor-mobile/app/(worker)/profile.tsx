import React, { useCallback, useState } from 'react';
import { View, ScrollView, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { AppHeader } from '../../src/ui/AppHeader';
import {
  Tx, Card, Row, Badge, Button, SectionHeader, ListRow, Divider, Avatar, ProgressBar, KV, Skeleton,
} from '../../src/ui';
import { useTheme } from '../../src/theme/ThemeContext';
import { useAuth } from '../../src/data/stores/auth';
import { useCertificates, useTraining, usePPE } from '../../src/data/hooks';
import { WORKERS } from '../../src/data/mock';
import * as haptics from '../../src/lib/haptics';

const WORKER_ID = 'BR-2481-0937';

export default function Profile() {
  const t = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const signOut = useAuth((s) => s.signOut);
  const certificates = useCertificates();
  const training = useTraining();
  const ppe = usePPE();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([certificates.refetch(), training.refetch(), ppe.refetch()]);
    setRefreshing(false);
  }, [certificates, training, ppe]);

  const w = WORKERS[0];
  const myPPE = (ppe.data ?? []).filter((p) => p.workerId === WORKER_ID);

  const handleSignOut = () => {
    haptics.warn();
    signOut();
    router.replace('/login' as any);
  };

  return (
    <View style={{ flex: 1, backgroundColor: t.colors.bg }}>
      <AppHeader kicker={WORKER_ID} title="PROFILE" />
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: insets.bottom + 28 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={t.colors.primary} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Identity */}
        <Animated.View entering={FadeInDown}>
          <Card style={{ gap: 12 }}>
            <Row gap={14}>
              <Avatar initials={w.initials} size={64} />
              <View style={{ flex: 1, gap: 2 }}>
                <Tx variant="h2">{w.name}</Tx>
                <Tx variant="sub" color={t.colors.textSecondary}>{w.skill} ({w.category}) · {w.district}</Tx>
              </View>
            </Row>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              <Badge label="ON DUTY" tone="accent" />
              <Badge label="AADHAAR ✓" tone="success" />
              <Badge label="POLICE ✓" tone="success" />
              <Badge label={`★ ${w.rating}`} tone="warning" />
            </View>
          </Card>
        </Animated.View>

        {/* Documents */}
        <SectionHeader title="DOCUMENTS" hindi="दस्तावेज़" />
        <Animated.View entering={FadeInDown.delay(40)}>
          <Card style={{ padding: 0, overflow: 'hidden' }}>
            <ListRow
              title="Document wallet"
              subtitle="Aadhaar, PAN, police verification, bank…"
              left={
                <View style={{
                  width: 36, height: 36, borderRadius: 12, alignItems: 'center', justifyContent: 'center',
                  backgroundColor: t.colors.primarySoft,
                }}>
                  <Ionicons name="folder-open-outline" size={17} color={t.colors.primary} />
                </View>
              }
              onPress={() => router.push('/documents' as any)}
            />
          </Card>
        </Animated.View>

        {/* Certificates */}
        <SectionHeader title="CERTIFICATES" hindi="प्रमाणपत्र" />
        {certificates.isLoading ? (
          <Skeleton height={150} radius={16} />
        ) : (
          <Animated.View entering={FadeInDown.delay(80)}>
            <Card style={{ padding: 0, overflow: 'hidden' }}>
              {(certificates.data ?? []).map((c, i, arr) => (
                <View key={c.id}>
                  <ListRow
                    title={c.name}
                    subtitle={`${c.issuer} · ${c.year}`}
                    left={
                      <View style={{
                        width: 36, height: 36, borderRadius: 12, alignItems: 'center', justifyContent: 'center',
                        backgroundColor: t.colors.violetSoft,
                      }}>
                        <Ionicons name="ribbon-outline" size={17} color={t.colors.violet} />
                      </View>
                    }
                    right={<Ionicons name="checkmark-circle" size={18} color={t.colors.success} />}
                  />
                  {i < arr.length - 1 ? <Divider inset={16} /> : null}
                </View>
              ))}
            </Card>
          </Animated.View>
        )}

        {/* Training */}
        <SectionHeader title="TRAINING" hindi="प्रशिक्षण" />
        {training.isLoading ? (
          <Skeleton height={180} radius={16} />
        ) : (
          <Animated.View entering={FadeInDown.delay(120)}>
            <Card style={{ gap: 14 }}>
              {(training.data ?? []).map((m) => (
                <View key={m.id} style={{ gap: 6 }}>
                  <Row style={{ justifyContent: 'space-between' }}>
                    <Tx variant="bodyMedium" style={{ flex: 1 }} numberOfLines={1}>{m.name}</Tx>
                    <Tx variant="caption" color={t.colors.textMuted}>
                      {m.progress >= 1 ? 'पूरा ✓' : m.progress > 0 ? `${Math.round(m.progress * 100)}%` : m.duration}
                    </Tx>
                  </Row>
                  <ProgressBar value={m.progress} color={m.progress >= 1 ? t.colors.success : t.colors.primary} />
                </View>
              ))}
            </Card>
          </Animated.View>
        )}

        {/* PPE */}
        <SectionHeader title="PPE ISSUED" hindi="सुरक्षा सामान" />
        {ppe.isLoading ? (
          <Skeleton height={150} radius={16} />
        ) : (
          <Animated.View entering={FadeInDown.delay(160)}>
            <Card style={{ padding: 0, overflow: 'hidden' }}>
              {myPPE.map((p, i, arr) => (
                <View key={p.id}>
                  <ListRow
                    title={p.item}
                    subtitle={`Issued ${p.issued}`}
                    left={
                      <View style={{
                        width: 36, height: 36, borderRadius: 12, alignItems: 'center', justifyContent: 'center',
                        backgroundColor: t.colors.amberSoft,
                      }}>
                        <Ionicons name="shield-checkmark-outline" size={17} color={t.colors.warning} />
                      </View>
                    }
                    right={<Badge label={p.condition.toUpperCase()} tone={p.condition === 'Replace' ? 'danger' : 'success'} />}
                  />
                  {i < arr.length - 1 ? <Divider inset={16} /> : null}
                </View>
              ))}
            </Card>
          </Animated.View>
        )}

        {/* Personal details */}
        <SectionHeader title="PERSONAL DETAILS" hindi="निजी जानकारी" />
        <Animated.View entering={FadeInDown.delay(200)}>
          <Card>
            <KV k="Father" v={w.father ?? '—'} dashed />
            <KV k="Date of birth" v={`${w.dob ?? '—'} (${w.age ?? '—'})`} dashed />
            <KV k="Village · Block" v={`${w.village ?? '—'} · ${w.block ?? '—'}`} dashed />
            <KV k="Phone" v={w.phone} dashed />
            <KV k="Blood group" v={w.bloodGroup ?? '—'} dashed />
            <KV k="Aadhaar" v={w.aadhaarMasked ?? '—'} dashed />
            <KV k="Bank" v={w.bank ? `${w.bank.name} ${w.bank.maskedAccount}${w.bank.upi ? ' · UPI ✓' : ''}` : '—'} dashed />
            <KV k="PF number" v={w.pfNumber ?? '—'} dashed />
            <KV k="ESIC number" v={w.esicNumber ?? '—'} dashed />
            <KV k="Joined" v={w.joinedDate ?? '—'} />
          </Card>
        </Animated.View>

        {/* Settings + sign out */}
        <SectionHeader title="ACCOUNT" hindi="खाता" />
        <Animated.View entering={FadeInDown.delay(240)} style={{ gap: 12 }}>
          <Card style={{ padding: 0, overflow: 'hidden' }}>
            <ListRow
              title="Settings"
              subtitle="Theme, language, notifications"
              left={
                <View style={{
                  width: 36, height: 36, borderRadius: 12, alignItems: 'center', justifyContent: 'center',
                  backgroundColor: t.colors.accentSoft,
                }}>
                  <Ionicons name="settings-outline" size={17} color={t.colors.accent} />
                </View>
              }
              onPress={() => router.push('/settings' as any)}
            />
          </Card>
          <Button title="Sign out · साइन आउट" variant="danger" icon="log-out-outline" onPress={handleSignOut} />
        </Animated.View>
      </ScrollView>
    </View>
  );
}
