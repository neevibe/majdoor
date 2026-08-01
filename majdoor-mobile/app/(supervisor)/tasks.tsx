import React, { useCallback, useMemo, useState } from 'react';
import { View, ScrollView, RefreshControl, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { AppHeader } from '../../src/ui/AppHeader';
import { Tx, Card, Row, Badge, Button, Input, Segmented, EmptyState, Skeleton } from '../../src/ui';
import { useTheme } from '../../src/theme/ThemeContext';
import { useTasks } from '../../src/data/hooks';
import { TaskItem } from '../../src/data/types';
import * as haptics from '../../src/lib/haptics';

const SEGMENTS = ['OPEN', 'IN_PROGRESS', 'DONE'] as const;
type Segment = (typeof SEGMENTS)[number];

const NEXT_STATUS: Record<TaskItem['status'], TaskItem['status']> = {
  OPEN: 'IN_PROGRESS',
  IN_PROGRESS: 'DONE',
  DONE: 'OPEN',
};

function statusTone(s: TaskItem['status']): 'accent' | 'warning' | 'success' {
  return s === 'OPEN' ? 'accent' : s === 'IN_PROGRESS' ? 'warning' : 'success';
}

export default function SupervisorTasks() {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const tasks = useTasks();

  const [segment, setSegment] = useState<Segment>('OPEN');
  const [refreshing, setRefreshing] = useState(false);
  const [overrides, setOverrides] = useState<Record<string, TaskItem['status']>>({});
  const [added, setAdded] = useState<TaskItem[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await tasks.refetch();
    setRefreshing(false);
  }, [tasks]);

  const all = useMemo<TaskItem[]>(
    () =>
      [...added, ...(tasks.data ?? [])].map((task) => ({
        ...task,
        status: overrides[task.id] ?? task.status,
      })),
    [added, tasks.data, overrides],
  );

  const list = all.filter((task) => task.status === segment);

  const cycle = (task: TaskItem) => {
    haptics.tap();
    setOverrides((o) => ({ ...o, [task.id]: NEXT_STATUS[task.status] }));
  };

  const addTask = () => {
    const title = newTitle.trim();
    if (!title) return;
    haptics.success();
    setAdded((a) => [
      {
        id: `T-NEW-${Date.now()}`,
        title,
        site: 'L&T Patna Metro C-2',
        due: 'Today',
        assignees: 1,
        status: 'OPEN',
      },
      ...a,
    ]);
    setNewTitle('');
    setShowForm(false);
    setSegment('OPEN');
  };

  return (
    <View style={{ flex: 1, backgroundColor: t.colors.bg }}>
      <AppHeader kicker="साइट कार्य" title="TASKS" />
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: insets.bottom + 110 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={t.colors.primary} />}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Segmented
          options={SEGMENTS}
          value={segment}
          onChange={setSegment}
          labels={{ OPEN: 'OPEN', IN_PROGRESS: 'IN PROGRESS', DONE: 'DONE' }}
        />

        {showForm ? (
          <Animated.View entering={FadeInDown}>
            <Card tone="accent" style={{ marginTop: 12, gap: 12 }}>
              <Tx variant="kicker" color={t.colors.primary}>NEW TASK · नया कार्य</Tx>
              <Input
                placeholder="Task title… e.g. Toolbox talk at Gate 2"
                value={newTitle}
                onChangeText={setNewTitle}
                autoFocus
                returnKeyType="done"
                onSubmitEditing={addTask}
              />
              <Row gap={10}>
                <Button title="Add task" small onPress={addTask} disabled={!newTitle.trim()} style={{ flex: 1 }} />
                <Button title="Cancel" small variant="secondary" onPress={() => { setShowForm(false); setNewTitle(''); }} />
              </Row>
            </Card>
          </Animated.View>
        ) : null}

        <View style={{ marginTop: 12 }}>
          {tasks.isLoading ? (
            <View style={{ gap: 10 }}>
              <Skeleton height={104} radius={16} />
              <Skeleton height={104} radius={16} />
              <Skeleton height={104} radius={16} />
            </View>
          ) : list.length === 0 ? (
            <Card>
              <EmptyState
                icon="checkbox-outline"
                title={segment === 'DONE' ? 'Nothing completed yet' : 'No tasks here'}
                body="Tap a task card to move it forward, or add a new task with +."
              />
            </Card>
          ) : (
            <View style={{ gap: 10 }}>
              {list.map((task, i) => (
                <Animated.View key={task.id} entering={FadeInDown.delay(i * 50)}>
                  <Pressable
                    onPress={() => cycle(task)}
                    accessibilityRole="button"
                    accessibilityLabel={`${task.title} — tap to move to ${NEXT_STATUS[task.status].replace('_', ' ')}`}
                  >
                    {({ pressed }) => (
                      <Card style={{ gap: 10, opacity: pressed ? 0.85 : 1 }}>
                        <Row style={{ justifyContent: 'space-between' }}>
                          <Tx variant="bodyMedium" style={{ flex: 1, marginRight: 8 }} numberOfLines={2}>
                            {task.title}
                          </Tx>
                          <Badge label={task.status.replace('_', ' ')} tone={statusTone(task.status)} />
                        </Row>
                        <Row gap={8} style={{ flexWrap: 'wrap' }}>
                          <Tx variant="caption" color={t.colors.textMuted}>{task.site}</Tx>
                          <Tx variant="caption" color={t.colors.textMuted}>·</Tx>
                          <Tx variant="caption" color={t.colors.textMuted}>{task.due}</Tx>
                          <Badge label={`${task.assignees} ${task.assignees === 1 ? 'WORKER' : 'WORKERS'}`} tone="outline" />
                        </Row>
                        <Row gap={6}>
                          <Ionicons name="repeat-outline" size={13} color={t.colors.textMuted} />
                          <Tx variant="caption" color={t.colors.textMuted}>
                            Tap → {NEXT_STATUS[task.status].replace('_', ' ')}
                          </Tx>
                        </Row>
                      </Card>
                    )}
                  </Pressable>
                </Animated.View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {/* FAB */}
      <Pressable
        onPress={() => { haptics.press(); setShowForm((v) => !v); }}
        accessibilityRole="button"
        accessibilityLabel="New task"
        style={({ pressed }) => ({
          position: 'absolute', right: 20, bottom: insets.bottom + 20,
          width: 56, height: 56, borderRadius: 28,
          alignItems: 'center', justifyContent: 'center',
          backgroundColor: t.colors.primary,
          opacity: pressed ? 0.9 : 1,
          shadowColor: '#000', shadowOpacity: 0.25, shadowRadius: 8, shadowOffset: { width: 0, height: 4 },
          elevation: 6,
        })}
      >
        <Ionicons name={showForm ? 'close' : 'add'} size={28} color={t.colors.onPrimary} />
      </Pressable>
    </View>
  );
}
