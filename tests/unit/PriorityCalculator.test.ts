import {
  calculatePriorityScore,
  estimateTotalHours,
  getPriorityLabel,
  sortByPriority,
} from '../../app/services/PlanningEngine/PriorityCalculator';
import { Assignment } from '../../app/services/data/DataModels';

function makeAssignment(overrides: Partial<Assignment> = {}): Assignment {
  const deadline = new Date();
  deadline.setDate(deadline.getDate() + 3);
  return {
    assignment_id: 'test-1',
    user_id: 'user-1',
    name: 'Test Assignment',
    course: 'AP Calculus',
    deadline: deadline.toISOString(),
    estimated_workload_hours: 0,
    difficulty_rating: 5,
    completion_status: 'Pending',
    created_at: new Date().toISOString(),
    ...overrides,
  };
}

describe('PriorityCalculator', () => {
  describe('estimateTotalHours', () => {
    it('scales higher for difficulty 10 vs difficulty 1', () => {
      const easy = makeAssignment({ difficulty_rating: 1 });
      const hard = makeAssignment({ difficulty_rating: 10 });
      expect(estimateTotalHours(hard)).toBeGreaterThan(estimateTotalHours(easy));
    });

    it('uses provided estimated_workload_hours as base', () => {
      const a = makeAssignment({ estimated_workload_hours: 4, difficulty_rating: 5 });
      const hours = estimateTotalHours(a);
      expect(hours).toBeGreaterThan(0);
      expect(hours).toBeGreaterThanOrEqual(4 * 0.4);
    });
  });

  describe('calculatePriorityScore', () => {
    it('returns a value between 0 and 1', () => {
      const a = makeAssignment();
      const score = calculatePriorityScore(a);
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(1);
    });

    it('scores overdue assignment at max deadline proximity', () => {
      const past = new Date();
      past.setDate(past.getDate() - 1);
      const a = makeAssignment({ deadline: past.toISOString() });
      const score = calculatePriorityScore(a);
      expect(score).toBeGreaterThan(0.5);
    });

    it('higher difficulty gives higher score', () => {
      const now = new Date();
      const deadline = new Date(now);
      deadline.setDate(now.getDate() + 14);
      const low = makeAssignment({ difficulty_rating: 1, deadline: deadline.toISOString() });
      const high = makeAssignment({ difficulty_rating: 10, deadline: deadline.toISOString() });
      expect(calculatePriorityScore(high)).toBeGreaterThan(calculatePriorityScore(low));
    });

    it('closer deadline gives higher score at same difficulty', () => {
      const now = new Date();
      const soon = new Date(now); soon.setDate(now.getDate() + 1);
      const later = new Date(now); later.setDate(now.getDate() + 14);
      const urgent = makeAssignment({ deadline: soon.toISOString(), difficulty_rating: 5 });
      const relaxed = makeAssignment({ deadline: later.toISOString(), difficulty_rating: 5 });
      expect(calculatePriorityScore(urgent)).toBeGreaterThanOrEqual(calculatePriorityScore(relaxed));
    });
  });

  describe('getPriorityLabel', () => {
    it('returns critical for high scores', () => {
      expect(getPriorityLabel(0.9)).toBe('critical');
    });
    it('returns low for low scores', () => {
      expect(getPriorityLabel(0.1)).toBe('low');
    });
  });

  describe('sortByPriority', () => {
    it('excludes completed assignments', () => {
      const completed = makeAssignment({ completion_status: 'Completed' });
      const pending = makeAssignment({ completion_status: 'Pending', assignment_id: 'test-2' });
      const sorted = sortByPriority([completed, pending]);
      expect(sorted).toHaveLength(1);
      expect(sorted[0].assignment_id).toBe('test-2');
    });

    it('orders by descending priority score', () => {
      const now = new Date();
      const d1 = new Date(now); d1.setDate(now.getDate() + 1);
      const d2 = new Date(now); d2.setDate(now.getDate() + 10);
      const urgent = makeAssignment({ assignment_id: 'urgent', deadline: d1.toISOString() });
      const later = makeAssignment({ assignment_id: 'later', deadline: d2.toISOString() });
      const sorted = sortByPriority([later, urgent]);
      expect(sorted[0].assignment_id).toBe('urgent');
    });
  });
});
