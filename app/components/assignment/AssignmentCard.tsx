import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Assignment } from '../../services/data/DataModels';
import { calculatePriorityScore, getPriorityLabel } from '../../services/PlanningEngine/PriorityCalculator';
import { Colors, Typography, Spacing, BorderRadius, Shadow } from '../../styles/theme';
import { DifficultyIndicator } from './DifficultyIndicator';

const PRIORITY_COLORS: Record<string, string> = {
  critical: Colors.priorityCritical,
  high: Colors.priorityHigh,
  medium: Colors.priorityMedium,
  low: Colors.priorityLow,
};

interface Props {
  assignment: Assignment;
  isAtRisk?: boolean;
  onPress?: () => void;
  onComplete?: () => void;
}

export function AssignmentCard({ assignment, isAtRisk, onPress, onComplete }: Props) {
  const score = calculatePriorityScore(assignment);
  const level = getPriorityLabel(score);
  const borderColor = PRIORITY_COLORS[level];

  const deadline = new Date(assignment.deadline);
  const now = new Date();
  const daysLeft = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  const deadlineLabel =
    daysLeft < 0
      ? 'Overdue'
      : daysLeft === 0
      ? 'Due today'
      : daysLeft === 1
      ? 'Due tomorrow'
      : `Due in ${daysLeft} days`;

  return (
    <TouchableOpacity activeOpacity={0.8} onPress={onPress} style={[styles.card, Shadow.card]}>
      <View style={[styles.priorityBar, { backgroundColor: borderColor }]} />

      <View style={styles.content}>
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <Text style={styles.name} numberOfLines={2}>{assignment.name}</Text>
            <Text style={styles.course}>{assignment.course}</Text>
          </View>
          {isAtRisk && (
            <View style={styles.riskBadge}>
              <Text style={styles.riskText}>At Risk</Text>
            </View>
          )}
        </View>

        <DifficultyIndicator rating={assignment.difficulty_rating} />

        <View style={styles.footer}>
          <Text
            style={[
              styles.deadline,
              daysLeft <= 1 && { color: Colors.error },
              daysLeft <= 3 && daysLeft > 1 && { color: Colors.warning },
            ]}
          >
            {deadlineLabel}
          </Text>

          {assignment.completion_status === 'Pending' && onComplete && (
            <TouchableOpacity onPress={onComplete} style={styles.completeBtn}>
              <Text style={styles.completeBtnText}>Mark Done</Text>
            </TouchableOpacity>
          )}

          {assignment.completion_status === 'Completed' && (
            <View style={styles.completedBadge}>
              <Text style={styles.completedText}>✓ Done</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
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
  priorityBar: {
    width: 4,
  },
  content: {
    flex: 1,
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
  },
  name: {
    ...Typography.bodyPrimary,
    color: Colors.textPrimary,
    fontWeight: '500',
  },
  course: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing.xs,
  },
  deadline: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  completeBtn: {
    backgroundColor: Colors.accentLight,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  completeBtnText: {
    ...Typography.caption,
    color: Colors.accent,
    fontWeight: '600',
  },
  riskBadge: {
    backgroundColor: Colors.errorLight,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  riskText: {
    ...Typography.caption,
    color: Colors.error,
    fontWeight: '600',
  },
  completedBadge: {
    backgroundColor: Colors.successLight,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  completedText: {
    ...Typography.caption,
    color: Colors.success,
    fontWeight: '600',
  },
});
