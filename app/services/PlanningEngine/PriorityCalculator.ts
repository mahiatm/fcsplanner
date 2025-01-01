import { Assignment } from '../data/DataModels';

// Weights for the prioritization formula
const WEIGHT_DEADLINE = 0.6;
const WEIGHT_DIFFICULTY = 0.4;

// Difficulty multiplier: how many hours per difficulty point per day-of-proximity
const DIFFICULTY_HOURS_MAP: Record<number, number> = {
  1: 0.5,
  2: 0.75,
  3: 1.0,
  4: 1.25,
  5: 1.5,
  6: 2.0,
  7: 2.5,
  8: 3.0,
  9: 3.5,
  10: 4.0,
};

/**
 * Calculate estimated total study hours needed for an assignment.
 * If the user provided estimated_workload_hours, scale by difficulty.
 * Otherwise derive from difficulty alone.
 */
export function estimateTotalHours(assignment: Assignment): number {
  const baseHours =
    assignment.estimated_workload_hours > 0
      ? assignment.estimated_workload_hours
      : DIFFICULTY_HOURS_MAP[assignment.difficulty_rating] ?? 1.5;

  // Scale by difficulty factor: difficulty 10 = 2x base, difficulty 1 = 0.5x
  const difficultyFactor = 0.4 + (assignment.difficulty_rating / 10) * 1.6;
  return baseHours * difficultyFactor;
}

/**
 * Calculate a priority score for an assignment.
 * Higher score = higher urgency = scheduled sooner.
 *
 * Formula: (Deadline Proximity * W_D) + (Difficulty Score * W_Diff)
 */
export function calculatePriorityScore(assignment: Assignment, now: Date = new Date()): number {
  const deadline = new Date(assignment.deadline);
  const hoursUntilDeadline = Math.max(
    (deadline.getTime() - now.getTime()) / (1000 * 60 * 60),
    0
  );

  // Deadline proximity: inversely proportional to hours left (capped at 168h = 1 week for normalization)
  const deadlineProximity = hoursUntilDeadline === 0 ? 1 : Math.min(168 / hoursUntilDeadline, 1);

  // Difficulty score normalized to 0-1
  const difficultyNorm = assignment.difficulty_rating / 10;

  const score = deadlineProximity * WEIGHT_DEADLINE + difficultyNorm * WEIGHT_DIFFICULTY;
  return Math.round(score * 1000) / 1000;
}

/**
 * Sort assignments by priority score (descending).
 */
export function sortByPriority(assignments: Assignment[], now: Date = new Date()): Assignment[] {
  return [...assignments]
    .filter(a => a.completion_status !== 'Completed')
    .map(a => ({ ...a, priority_score: calculatePriorityScore(a, now) }))
    .sort((a, b) => (b.priority_score ?? 0) - (a.priority_score ?? 0));
}

/**
 * Determine priority label from score.
 */
export function getPriorityLabel(score: number): 'critical' | 'high' | 'medium' | 'low' {
  if (score >= 0.8) return 'critical';
  if (score >= 0.55) return 'high';
  if (score >= 0.3) return 'medium';
  return 'low';
}

/**
 * Check if an assignment is at risk of missing its deadline.
 */
export function isAtRisk(
  assignment: Assignment,
  scheduledMinutes: number,
  now: Date = new Date()
): boolean {
  const totalNeededHours = estimateTotalHours(assignment);
  const totalScheduledHours = scheduledMinutes / 60;
  return totalScheduledHours < totalNeededHours * 0.8; // 80% threshold = at risk
}
