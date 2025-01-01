import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Assignment, StudyBlock } from '../../services/data/DataModels';
import { formatTimeRange } from '../../services/PlanningEngine/Scheduler';
import { calculatePriorityScore, getPriorityLabel } from '../../services/PlanningEngine/PriorityCalculator';
import { Colors, Typography, Spacing, BorderRadius, Shadow } from '../../styles/theme';

const PRIORITY_COLORS: Record<string, string> = {
  critical: Colors.priorityCritical,
  high: Colors.priorityHigh,
  medium: Colors.priorityMedium,
  low: Colors.priorityLow,
};

interface Props {
  block: StudyBlock;
  assignment?: Assignment;
  onComplete?: () => void;
  onMiss?: () => void;
}

export function StudyBlockCard({ block, assignment, onComplete, onMiss }: Props) {
  const timeRange = formatTimeRange(block.start_datetime, block.duration_minutes);
  const hours = Math.floor(block.duration_minutes / 60);
  const mins = block.duration_minutes % 60;
  const durationLabel = hours > 0 ? `${hours}h ${mins > 0 ? `${mins}m` : ''}`.trim() : `${mins}m`;

  const score = assignment ? calculatePriorityScore(assignment) : 0;
  const level = assignment ? getPriorityLabel(score) : 'low';
  const barColor = PRIORITY_COLORS[level];

  const isCompleted = block.status === 'Completed';
  const isMissed = block.status === 'Missed';

  return (
    <View style={[styles.card, Shadow.card, isCompleted && styles.completedCard]}>
      <View style={[styles.priorityBar, { backgroundColor: isCompleted ? Colors.success : barColor }]} />

      <View style={styles.content}>
        <View style={styles.row}>
          <Text style={styles.time}>{timeRange}</Text>
          <Text style={styles.duration}>{durationLabel}</Text>
        </View>

        <Text style={[styles.name, isCompleted && styles.strikethrough]} numberOfLines={2}>
          {assignment?.name ?? 'Study Block'}
        </Text>

        {assignment && (
          <Text style={styles.course}>{assignment.course}</Text>
        )}

        {block.type === 'Adjusted' && (
          <View style={styles.typeBadge}>
            <Text style={styles.typeText}>Rescheduled</Text>
          </View>
        )}
        {block.type === 'CatchUp' && (
          <View style={[styles.typeBadge, { backgroundColor: Colors.warningLight }]}>
            <Text style={[styles.typeText, { color: Colors.warning }]}>Catch Up</Text>
          </View>
        )}

        {!isCompleted && !isMissed && (
          <View style={styles.actions}>
            <TouchableOpacity onPress={onComplete} style={styles.completeBtn}>
              <Text style={styles.completeBtnText}>Complete</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={onMiss} style={styles.missBtn}>
              <Text style={styles.missBtnText}>Missed</Text>
            </TouchableOpacity>
          </View>
        )}

        {isCompleted && (
          <Text style={styles.completedLabel}>✓ Completed</Text>
        )}
        {isMissed && (
          <Text style={styles.missedLabel}>✗ Missed — rescheduled</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: Colors.backgroundCard,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.sm,
    overflow: 'hidden',
  },
  completedCard: {
    opacity: 0.6,
  },
  priorityBar: {
    width: 4,
  },
  content: {
    flex: 1,
    padding: Spacing.md,
    gap: Spacing.xs,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  time: {
    ...Typography.caption,
    color: Colors.accent,
    fontWeight: '600',
  },
  duration: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  name: {
    ...Typography.bodyPrimary,
    color: Colors.textPrimary,
    fontWeight: '500',
  },
  strikethrough: {
    textDecorationLine: 'line-through',
    color: Colors.textSecondary,
  },
  course: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  typeBadge: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.accentLight,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
    marginTop: 2,
  },
  typeText: {
    ...Typography.caption,
    color: Colors.accent,
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.xs,
  },
  completeBtn: {
    flex: 1,
    backgroundColor: Colors.successLight,
    paddingVertical: 6,
    borderRadius: BorderRadius.sm,
    alignItems: 'center',
  },
  completeBtnText: {
    ...Typography.caption,
    color: Colors.success,
    fontWeight: '600',
  },
  missBtn: {
    flex: 1,
    backgroundColor: Colors.errorLight,
    paddingVertical: 6,
    borderRadius: BorderRadius.sm,
    alignItems: 'center',
  },
  missBtnText: {
    ...Typography.caption,
    color: Colors.error,
    fontWeight: '600',
  },
  completedLabel: {
    ...Typography.caption,
    color: Colors.success,
    fontWeight: '600',
    marginTop: 2,
  },
  missedLabel: {
    ...Typography.caption,
    color: Colors.error,
    fontWeight: '600',
    marginTop: 2,
  },
});
