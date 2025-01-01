import React, { useMemo, useState } from 'react';
import {
  FlatList,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp } from '../../context/AppContext';
import { StudyBlockCard } from '../../components/assignment/StudyBlockCard';
import { getBlocksForDate } from '../../services/PlanningEngine/Scheduler';
import { Colors, Typography, Spacing, BorderRadius } from '../../styles/theme';

function dateLabel(date: Date): string {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  const sameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();

  if (sameDay(date, today)) return 'Today';
  if (sameDay(date, tomorrow)) return 'Tomorrow';
  return date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
}

function dateString(date: Date): string {
  return date.toISOString().split('T')[0];
}

interface Props {
  navigation: any;
}

export function ScheduleScreen({ navigation }: Props) {
  const { assignments, studyBlocks, atRiskIds, regenerateSchedule, markBlockComplete, markBlockMissed, availability } = useApp();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [refreshing, setRefreshing] = useState(false);

  // Build 7-day selector
  const days = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() + i);
      return d;
    });
  }, []);

  const todayBlocks = useMemo(
    () => getBlocksForDate(studyBlocks, dateString(selectedDate)),
    [studyBlocks, selectedDate]
  );

  const totalMinutes = todayBlocks.reduce((s, b) => s + b.duration_minutes, 0);
  const completedMinutes = todayBlocks
    .filter(b => b.status === 'Completed')
    .reduce((s, b) => s + b.duration_minutes, 0);

  const handleRefresh = async () => {
    setRefreshing(true);
    await regenerateSchedule();
    setRefreshing(false);
  };

  const hasAvailability = availability.length > 0;
  const hasAssignments = assignments.filter(a => a.completion_status !== 'Completed').length > 0;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Today's Plan</Text>
          <Text style={styles.subtitle}>
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.regenBtn}
          onPress={handleRefresh}
        >
          <Text style={styles.regenText}>↺ Refresh</Text>
        </TouchableOpacity>
      </View>

      {/* Date Selector */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.dateStrip}
      >
        {days.map((d, i) => {
          const isSelected = dateString(d) === dateString(selectedDate);
          const blocks = getBlocksForDate(studyBlocks, dateString(d));
          return (
            <TouchableOpacity
              key={i}
              style={[styles.dayChip, isSelected && styles.dayChipActive]}
              onPress={() => setSelectedDate(d)}
            >
              <Text style={[styles.dayName, isSelected && styles.dayTextActive]}>
                {d.toLocaleDateString('en-US', { weekday: 'short' })}
              </Text>
              <Text style={[styles.dayNum, isSelected && styles.dayTextActive]}>
                {d.getDate()}
              </Text>
              {blocks.length > 0 && (
                <View style={[styles.dot, isSelected && styles.dotActive]} />
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Progress bar */}
      {totalMinutes > 0 && (
        <View style={styles.progressSection}>
          <View style={styles.progressRow}>
            <Text style={styles.progressLabel}>
              {dateLabel(selectedDate)} — {Math.floor(totalMinutes / 60)}h {totalMinutes % 60}m planned
            </Text>
            <Text style={styles.progressLabel}>
              {Math.round((completedMinutes / totalMinutes) * 100)}%
            </Text>
          </View>
          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                { width: `${(completedMinutes / totalMinutes) * 100}%` },
              ]}
            />
          </View>
        </View>
      )}

      {/* Block list */}
      <FlatList
        data={todayBlocks}
        keyExtractor={b => b.block_id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={Colors.accent} />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            {!hasAvailability ? (
              <>
                <Text style={styles.emptyTitle}>No study hours set</Text>
                <Text style={styles.emptyText}>
                  Go to Settings → Study Hours to add your available study times.
                </Text>
                <TouchableOpacity
                  style={styles.emptyBtn}
                  onPress={() => navigation.navigate('Settings')}
                >
                  <Text style={styles.emptyBtnText}>Add Study Hours</Text>
                </TouchableOpacity>
              </>
            ) : !hasAssignments ? (
              <>
                <Text style={styles.emptyTitle}>No assignments yet</Text>
                <Text style={styles.emptyText}>
                  Tap + to add an assignment and generate your first plan.
                </Text>
              </>
            ) : (
              <>
                <Text style={styles.emptyTitle}>Free day 🎉</Text>
                <Text style={styles.emptyText}>
                  Nothing scheduled for {dateLabel(selectedDate).toLowerCase()}. Enjoy the break!
                </Text>
              </>
            )}
          </View>
        }
        renderItem={({ item }) => {
          const assignment = assignments.find(a => a.assignment_id === item.assignment_id);
          return (
            <StudyBlockCard
              block={item}
              assignment={assignment}
              onComplete={() => markBlockComplete(item.block_id)}
              onMiss={() => markBlockMissed(item.block_id)}
            />
          );
        }}
      />

      {/* At-risk banner */}
      {atRiskIds.length > 0 && (
        <View style={styles.riskBanner}>
          <Text style={styles.riskBannerText}>
            ⚠️ {atRiskIds.length} assignment{atRiskIds.length > 1 ? 's' : ''} may not finish before deadline
          </Text>
        </View>
      )}

      {/* FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('AddAssignment')}
        activeOpacity={0.85}
      >
        <Text style={styles.fabText}>＋</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  title: { ...Typography.h1, color: Colors.textPrimary },
  subtitle: { ...Typography.caption, color: Colors.textSecondary, marginTop: 2 },
  regenBtn: {
    backgroundColor: Colors.accentLight,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
  },
  regenText: { ...Typography.caption, color: Colors.accent, fontWeight: '600' },
  dateStrip: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
  },
  dayChip: {
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.backgroundSecondary,
    minWidth: 52,
    gap: 2,
  },
  dayChipActive: { backgroundColor: Colors.accent },
  dayName: { ...Typography.caption, color: Colors.textSecondary },
  dayNum: { ...Typography.bodySecondary, color: Colors.textPrimary, fontWeight: '600' },
  dayTextActive: { color: '#fff' },
  dot: {
    width: 5, height: 5,
    borderRadius: 3,
    backgroundColor: Colors.accent,
    marginTop: 2,
  },
  dotActive: { backgroundColor: 'rgba(255,255,255,0.7)' },
  progressSection: { paddingHorizontal: Spacing.lg, marginBottom: Spacing.sm, gap: Spacing.xs },
  progressRow: { flexDirection: 'row', justifyContent: 'space-between' },
  progressLabel: { ...Typography.caption, color: Colors.textSecondary },
  progressTrack: {
    height: 4,
    backgroundColor: Colors.border,
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
  },
  progressFill: { height: '100%', backgroundColor: Colors.success, borderRadius: BorderRadius.full },
  list: { paddingHorizontal: Spacing.lg, paddingBottom: 120 },
  empty: { alignItems: 'center', paddingTop: Spacing.xxl, gap: Spacing.md },
  emptyTitle: { ...Typography.h2, color: Colors.textPrimary },
  emptyText: { ...Typography.bodySecondary, color: Colors.textSecondary, textAlign: 'center', paddingHorizontal: Spacing.lg },
  emptyBtn: {
    backgroundColor: Colors.accent,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.sm,
  },
  emptyBtnText: { ...Typography.button, color: '#fff' },
  riskBanner: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.sm,
    backgroundColor: Colors.warningLight,
    borderLeftWidth: 4,
    borderLeftColor: Colors.warning,
    borderRadius: BorderRadius.sm,
    padding: Spacing.md,
  },
  riskBannerText: { ...Typography.bodySecondary, color: Colors.warning, fontWeight: '600' },
  fab: {
    position: 'absolute',
    bottom: Spacing.xl,
    right: Spacing.lg,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 8,
  },
  fabText: { fontSize: 28, color: '#fff', lineHeight: 32 },
});
