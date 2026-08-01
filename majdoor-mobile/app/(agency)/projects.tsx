import React, { useCallback, useState } from 'react';
import { View, ScrollView, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppHeader } from '../../src/ui/AppHeader';
import { Tx, Card, Row, Badge, Button, SectionHeader, ListRow, Divider, Skeleton, Avatar } from '../../src/ui';
import { useTheme } from '../../src/theme/ThemeContext';
import { useSites, useClients, useContractors, useJobs } from '../../src/data/hooks';
import { formatIN, rupeesCompact } from '../../src/lib/format';

export default function Projects() {
  const t = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const sites = useSites();
  const clients = useClients();
  const contractors = useContractors();
  const jobs = useJobs();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([sites.refetch(), clients.refetch(), contractors.refetch(), jobs.refetch()]);
    setRefreshing(false);
  }, [sites, clients, contractors, jobs]);

  return (
    <View style={{ flex: 1, backgroundColor: t.colors.bg }}>
      <AppHeader kicker="SITES · CLIENTS · DEMAND" title="PROJECTS" />
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: insets.bottom + 28 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={t.colors.primary} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Sites */}
        <SectionHeader title="ACTIVE SITES" hindi="साइट" />
        {sites.isLoading ? (
          <Skeleton height={280} radius={16} />
        ) : (
          <View style={{ gap: 10 }}>
            {(sites.data ?? []).map((s) => (
              <Card key={s.id} style={{ gap: 10 }}>
                <Row style={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <View style={{ flex: 1, gap: 2 }}>
                    <Tx variant="h3" numberOfLines={1}>{s.name}</Tx>
                    <Tx variant="caption" color={t.colors.textMuted}>
                      {s.client} · {s.district}
                    </Tx>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Tx variant="num" color={t.colors.primary}>{formatIN(s.onDuty)}</Tx>
                    <Tx variant="caption" color={t.colors.textMuted}>ON DUTY</Tx>
                  </View>
                </Row>
                <Row gap={8} style={{ flexWrap: 'wrap' }}>
                  <Badge label={`SHIFT ${s.shift}`} tone="outline" />
                  <Badge label={`${s.gates.length} GATE${s.gates.length > 1 ? 'S' : ''}`} tone="neutral" />
                  <Badge label={`GEOFENCE ${s.geofenceMeters} m`} tone="accent" />
                  {s.qrGateActive ? <Badge label="QR ACTIVE" tone="success" /> : null}
                </Row>
              </Card>
            ))}
          </View>
        )}

        {/* Clients */}
        <SectionHeader title="CLIENTS" hindi="ग्राहक" />
        {clients.isLoading ? (
          <Skeleton height={200} radius={16} />
        ) : (
          <Card style={{ padding: 0, overflow: 'hidden' }}>
            {(clients.data ?? []).map((c, i, arr) => (
              <View key={c.id}>
                <ListRow
                  title={c.name}
                  subtitle={`${c.contact} · ${c.sites.join(', ')}`}
                  left={<Avatar initials={c.name.slice(0, 2).toUpperCase()} size={40} />}
                  right={<Tx variant="h3" color={t.colors.success}>{rupeesCompact(c.monthlyBilling)}</Tx>}
                />
                {i < arr.length - 1 ? <Divider inset={16} /> : null}
              </View>
            ))}
          </Card>
        )}

        {/* Contractors */}
        <SectionHeader title="CONTRACTORS" hindi="ठेकेदार" />
        {contractors.isLoading ? (
          <Skeleton height={220} radius={16} />
        ) : (
          <Card style={{ padding: 0, overflow: 'hidden' }}>
            {(contractors.data ?? []).map((c, i, arr) => (
              <View key={c.id}>
                <ListRow
                  title={c.name}
                  subtitle={`${c.contact} · ${c.sector}`}
                  right={
                    <View style={{ alignItems: 'flex-end' }}>
                      <Tx variant="subMedium">{formatIN(c.workersDeployed)}</Tx>
                      <Tx variant="caption" color={t.colors.textMuted}>deployed</Tx>
                    </View>
                  }
                />
                {i < arr.length - 1 ? <Divider inset={16} /> : null}
              </View>
            ))}
          </Card>
        )}

        {/* Open demand */}
        <SectionHeader title="OPEN DEMAND" hindi="मांग" />
        {jobs.isLoading ? (
          <Skeleton height={200} radius={16} />
        ) : (
          <Card style={{ padding: 0, overflow: 'hidden' }}>
            {(jobs.data ?? []).map((j, i, arr) => (
              <View key={j.id}>
                <Row style={{ justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, minHeight: 48 }}>
                  <View style={{ flex: 1, gap: 2 }}>
                    <Tx variant="bodyMedium">{j.title}</Tx>
                    <Tx variant="caption" color={t.colors.textMuted}>{j.site}</Tx>
                  </View>
                  <Tx variant="h3" color={t.colors.primary}>₹{j.wage}/day</Tx>
                </Row>
                {i < arr.length - 1 ? <Divider inset={16} /> : null}
              </View>
            ))}
          </Card>
        )}
        <Button
          title="Post demand"
          icon="megaphone-outline"
          style={{ marginTop: 12 }}
          onPress={() => router.push('/post-demand' as any)}
        />
      </ScrollView>
    </View>
  );
}
