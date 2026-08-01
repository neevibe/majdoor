import React, { useState } from 'react';
import { View, ScrollView, Pressable } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Linking from 'expo-linking';
import Animated, { FadeInDown } from 'react-native-reanimated';
import {
  Tx, Card, Row, Badge, StatusBadge, Avatar, Segmented, Divider, KV,
  Skeleton, SkeletonList, EmptyState,
} from '../../src/ui';
import { useTheme } from '../../src/theme/ThemeContext';
import { useWorker, usePPE, useDocuments, useWorkerMonth, useSalaryHistory } from '../../src/data/hooks';
import { rupees } from '../../src/lib/format';
import * as haptics from '../../src/lib/haptics';

type Tab = 'OVERVIEW' | 'DOCUMENTS' | 'ATTENDANCE' | 'SALARY';

function Tile({ label, value, small }: { label: string; value: string; small?: boolean }) {
  const t = useTheme();
  return (
    <Card style={{ flex: 1, gap: 6, paddingHorizontal: 12 }}>
      <Tx variant="kicker">{label}</Tx>
      {small ? (
        <Tx variant="subMedium" numberOfLines={2}>{value}</Tx>
      ) : (
        <Tx variant="num">{value}</Tx>
      )}
    </Card>
  );
}

function ActionButton({ icon, label, onPress }: {
  icon: keyof typeof Ionicons.glyphMap; label: string; onPress: () => void;
}) {
  const t = useTheme();
  return (
    <Pressable
      onPress={() => { haptics.tap(); onPress(); }}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => ({
        flex: 1, minHeight: 56, borderRadius: t.radius.md, gap: 4,
        alignItems: 'center', justifyContent: 'center',
        backgroundColor: pressed ? t.colors.hairline : t.colors.surface,
        borderWidth: 1, borderColor: t.colors.border,
      })}
    >
      <Ionicons name={icon} size={19} color={t.colors.primary} />
      <Tx variant="caption" color={t.colors.textSecondary}>{label}</Tx>
    </Pressable>
  );
}

export default function WorkerProfile() {
  const t = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ id: string }>();
  const id = String(params.id ?? '');

  const worker = useWorker(id);
  const ppe = usePPE();
  const docs = useDocuments(id);
  const month = useWorkerMonth();
  const salary = useSalaryHistory();
  const [tab, setTab] = useState<Tab>('OVERVIEW');

  const w = worker.data;

  return (
    <View style={{ flex: 1, backgroundColor: t.colors.bg, paddingTop: insets.top }}>
      {/* Header row */}
      <Row style={{ paddingHorizontal: 20, paddingVertical: 10, gap: 10 }}>
        <Pressable
          onPress={() => { haptics.tap(); router.back(); }}
          hitSlop={12}
          accessibilityLabel="Back"
          style={{
            width: 42, height: 42, borderRadius: 14, alignItems: 'center', justifyContent: 'center',
            backgroundColor: t.dark ? 'rgba(255,255,255,0.08)' : '#EDEDF0',
          }}
        >
          <Ionicons name="chevron-back" size={22} color={t.colors.text} />
        </Pressable>
        <Tx variant="kicker">WORKER PROFILE · प्रोफ़ाइल</Tx>
      </Row>

      {worker.isLoading ? (
        <View style={{ paddingHorizontal: 20, gap: 14 }}>
          <Skeleton height={140} radius={16} />
          <Skeleton height={44} radius={12} />
          <SkeletonList rows={4} />
        </View>
      ) : !w ? (
        <EmptyState
          icon="person-outline"
          title="Worker not found"
          body={`कोई रिकॉर्ड नहीं · No worker in the registry with ID ${id}.`}
          actionTitle="Go back"
          onAction={() => router.back()}
        />
      ) : (
        <ScrollView
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: insets.bottom + 28 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Identity */}
          <Animated.View entering={FadeInDown.duration(280)}>
            <Card style={{ gap: 12 }}>
              <Row gap={14}>
                <Avatar initials={w.initials} size={72} />
                <View style={{ flex: 1, gap: 4 }}>
                  <Tx variant="h1">{w.name.toUpperCase()}</Tx>
                  <Tx variant="sub" color={t.colors.textSecondary}>
                    {w.id} · {w.skill} ({w.category}) · {w.district}
                  </Tx>
                </View>
              </Row>
              <Row gap={8} style={{ flexWrap: 'wrap' }}>
                <StatusBadge status={w.status} />
                {w.aadhaarVerified ? <Badge label="AADHAAR ✓" tone="success" /> : null}
                {w.policeVerified ? <Badge label="POLICE ✓" tone="success" /> : null}
                <Badge label={`★ ${w.rating.toFixed(1)}`} tone="outline" />
              </Row>
            </Card>
          </Animated.View>

          {/* Actions */}
          <Row gap={10} style={{ marginTop: 12 }}>
            <ActionButton icon="call-outline" label="Call" onPress={() => Linking.openURL(`tel:${w.phone.replace(/\s/g, '')}`)} />
            <ActionButton icon="logo-whatsapp" label="WhatsApp" onPress={() => Linking.openURL(`https://wa.me/${w.phone.replace(/[^\d]/g, '')}`)} />
            <ActionButton icon="share-social-outline" label="Share" onPress={() => haptics.press()} />
          </Row>

          {/* Tabs */}
          <View style={{ marginTop: 16, marginBottom: 4 }}>
            <Segmented
              options={['OVERVIEW', 'DOCUMENTS', 'ATTENDANCE', 'SALARY'] as const}
              value={tab}
              onChange={setTab}
              labels={{ OVERVIEW: 'OVERVIEW', DOCUMENTS: 'DOCS', ATTENDANCE: 'ATTEND.', SALARY: 'SALARY' }}
            />
          </View>

          {tab === 'OVERVIEW' ? (
            <Animated.View entering={FadeInDown.duration(240)}>
              <Row gap={10} style={{ marginTop: 12, alignItems: 'stretch' }}>
                <Tile label="CURRENT SITE" value={w.currentSite ?? '—'} small />
                <Tile label="ATTENDANCE (JUL)" value="26 / 27" />
                <Tile label="ADVANCE" value={rupees(w.advanceBalance)} />
              </Row>

              <Tx variant="kicker" style={{ marginTop: 24, marginBottom: 10 }}>SKILLS & EXPERIENCE · कौशल</Tx>
              <Card style={{ gap: 10 }}>
                <Row gap={8} style={{ flexWrap: 'wrap' }}>
                  {w.skills.map((s) => <Badge key={s} label={s.toUpperCase()} tone="accent" />)}
                </Row>
                <Row gap={8} style={{ flexWrap: 'wrap' }}>
                  {w.yearsExperience ? <Badge label={`${w.yearsExperience} YRS EXPERIENCE`} tone="outline" /> : null}
                  {(w.languages ?? []).map((l) => <Badge key={l} label={l.toUpperCase()} tone="outline" />)}
                </Row>
              </Card>

              <Tx variant="kicker" style={{ marginTop: 24, marginBottom: 10 }}>PPE & TOOLS · सुरक्षा उपकरण</Tx>
              <Card style={{ padding: 0, overflow: 'hidden' }}>
                {(ppe.data ?? []).filter((p) => p.workerId === w.id).length === 0 ? (
                  <View style={{ padding: 16 }}>
                    <Tx variant="sub" color={t.colors.textMuted}>No PPE issued yet.</Tx>
                  </View>
                ) : (
                  (ppe.data ?? []).filter((p) => p.workerId === w.id).map((p, i, arr) => (
                    <View key={p.id}>
                      <Row style={{ paddingHorizontal: 16, paddingVertical: 12, gap: 12, minHeight: 48 }}>
                        <Ionicons name="shield-checkmark-outline" size={18} color={t.colors.accent} />
                        <View style={{ flex: 1, gap: 2 }}>
                          <Tx variant="bodyMedium">{p.item}</Tx>
                          <Tx variant="caption" color={t.colors.textMuted}>Issued {p.issued}</Tx>
                        </View>
                        <Badge
                          label={p.condition.toUpperCase()}
                          tone={p.condition === 'Good' ? 'success' : p.condition === 'Replace' ? 'danger' : 'neutral'}
                        />
                      </Row>
                      {i < arr.length - 1 ? <Divider inset={16} /> : null}
                    </View>
                  ))
                )}
              </Card>

              <Tx variant="kicker" style={{ marginTop: 24, marginBottom: 10 }}>PERSONAL · व्यक्तिगत</Tx>
              <Card>
                <KV k="Father's name" v={w.father ?? '—'} dashed />
                <KV k="Date of birth" v={w.dob ? `${w.dob}${w.age ? ` · ${w.age} yrs` : ''}` : '—'} dashed />
                <KV k="Village / block" v={w.village ? `${w.village} · ${w.block ?? ''}` : '—'} dashed />
                <KV k="Phone" v={w.phone} dashed />
                <KV k="Blood group" v={w.bloodGroup ?? '—'} dashed />
                <KV k="Aadhaar" v={w.aadhaarMasked ?? '—'} dashed />
                <KV k="Bank" v={w.bank ? `${w.bank.name} ${w.bank.maskedAccount}${w.bank.upi ? ' · UPI ✓' : ''}` : '—'} dashed />
                <KV k="PF number" v={w.pfNumber ?? '—'} dashed />
                <KV k="ESIC" v={w.esicNumber ?? '—'} dashed />
                <KV k="Daily wage" v={`${rupees(w.dailyWage)}${w.askedWage ? ` · asks ${rupees(w.askedWage)}` : ''}`} dashed />
                <KV k="Joined" v={w.joinedDate ?? '—'} />
              </Card>
            </Animated.View>
          ) : null}

          {tab === 'DOCUMENTS' ? (
            <Animated.View entering={FadeInDown.duration(240)} style={{ marginTop: 12 }}>
              {docs.isLoading ? (
                <SkeletonList rows={4} />
              ) : (docs.data ?? []).length === 0 ? (
                <EmptyState
                  icon="document-outline"
                  title="No documents"
                  body="इस श्रमिक के दस्तावेज़ अभी अपलोड नहीं हुए · Documents will appear once uploaded by the agency."
                />
              ) : (
                <Card style={{ padding: 0, overflow: 'hidden' }}>
                  {(docs.data ?? []).map((d, i, arr) => (
                    <View key={d.id}>
                      <Row style={{ paddingHorizontal: 16, paddingVertical: 12, gap: 12, minHeight: 48 }}>
                        <View style={{
                          width: 38, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center',
                          backgroundColor: t.colors.accentSoft,
                        }}>
                          <Ionicons
                            name={d.format === 'PDF' ? 'document-text-outline' : 'image-outline'}
                            size={18}
                            color={t.colors.accent}
                          />
                        </View>
                        <View style={{ flex: 1, gap: 2 }}>
                          <Tx variant="kicker">{d.type}</Tx>
                          <Tx variant="bodyMedium">{d.name}</Tx>
                          <Tx variant="caption" color={t.colors.textMuted}>{d.format} · {d.meta}</Tx>
                        </View>
                        <Ionicons name="chevron-forward" size={18} color={t.colors.textMuted} />
                      </Row>
                      {i < arr.length - 1 ? <Divider inset={66} /> : null}
                    </View>
                  ))}
                </Card>
              )}
            </Animated.View>
          ) : null}

          {tab === 'ATTENDANCE' ? (
            <Animated.View entering={FadeInDown.duration(240)} style={{ marginTop: 12 }}>
              {month.isLoading ? (
                <Skeleton height={260} radius={16} />
              ) : (
                <Card style={{ gap: 12 }}>
                  <Tx variant="kicker">JULY 2026 · जुलाई</Tx>
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                    {(month.data ?? []).map((d) => {
                      const day = Number(d.date.slice(-2));
                      const bg =
                        d.mark === 'P' ? t.colors.primary
                        : d.mark === 'A' ? t.colors.dangerSoft
                        : t.colors.amberSoft;
                      const fg =
                        d.mark === 'P' ? '#fff'
                        : d.mark === 'A' ? t.colors.danger
                        : t.colors.warning;
                      return (
                        <View key={d.date} style={{ width: `${100 / 7}%`, padding: 3 }}>
                          <View style={{
                            aspectRatio: 1, borderRadius: 10, alignItems: 'center', justifyContent: 'center',
                            backgroundColor: bg, gap: 1,
                          }}>
                            <Tx variant="subMedium" color={fg}>{day}</Tx>
                            {d.mark !== 'P' ? (
                              <Tx variant="caption" color={fg} style={{ fontSize: 10, lineHeight: 11 }}>{d.mark}</Tx>
                            ) : null}
                          </View>
                        </View>
                      );
                    })}
                  </View>
                  <Tx variant="caption" color={t.colors.textMuted}>
                    ■ Present 26 · □ Absent 1 · ◪ Half+OT 14, 21
                  </Tx>
                  <Divider />
                  <Row gap={8}>
                    <Ionicons name="location-outline" size={14} color={t.colors.textMuted} />
                    <Tx variant="caption" color={t.colors.textMuted}>
                      GPS + face verified at L&T Patna Metro C-2 gate.
                    </Tx>
                  </Row>
                </Card>
              )}
            </Animated.View>
          ) : null}

          {tab === 'SALARY' ? (
            <Animated.View entering={FadeInDown.duration(240)} style={{ marginTop: 12, gap: 10 }}>
              {salary.isLoading ? (
                <SkeletonList rows={4} />
              ) : (
                (salary.data ?? []).map((m, i) => (
                  <Animated.View key={m.month} entering={FadeInDown.delay(i * 60).duration(240)}>
                    <Card style={{ gap: 8 }}>
                      <Row style={{ justifyContent: 'space-between' }}>
                        <View style={{ gap: 2 }}>
                          <Tx variant="h3">{m.month.toUpperCase()}</Tx>
                          <Tx variant="caption" color={t.colors.textMuted}>
                            {m.days} days · gross {rupees(m.gross)}
                          </Tx>
                        </View>
                        <View style={{ alignItems: 'flex-end', gap: 4 }}>
                          <Tx variant="num">{rupees(m.net)}</Tx>
                          <Badge label={m.mode.toUpperCase()} tone={m.paid ? 'success' : 'warning'} />
                        </View>
                      </Row>
                      <Tx variant="caption" color={t.colors.textMuted}>
                        advance −{rupees(m.advance)} · PF+ESIC −{rupees(m.pfEsic)}
                      </Tx>
                    </Card>
                  </Animated.View>
                ))
              )}
            </Animated.View>
          ) : null}
        </ScrollView>
      )}
    </View>
  );
}
