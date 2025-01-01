import { generateSchedule, getBlocksForDate, formatTimeRange } from '../../app/services/PlanningEngine/Scheduler';
import { Assignment, Availability } from '../../app/services/data/DataModels';

function makeAssignment(id: string, daysUntilDeadline: number, difficulty = 5): Assignment {
  const deadline = new Date();
  deadline.setDate(deadline.getDate() + daysUntilDeadline);
  return {
    assignment_id: id,
    user_id: 'user-1',
    name: `Assignment ${id}`,
    course: 'AP Test',
    deadline: deadline.toISOString(),
    estimated_workload_hours: 2,
    difficulty_rating: difficulty,
    completion_status: 'Pending',
    created_at: new Date().toISOString(),
  };
}

function makeAvailability(dow: number, startHour: number, endHour: number): Availability {
  return {
    availability_id: `avail-${dow}`,
    user_id: 'user-1',
    day_of_week: dow,
    start_time: `${String(startHour).padStart(2, '0')}:00`,
    end_time: `${String(endHour).padStart(2, '0')}:00`,
  };
}

describe('Scheduler Integration', () => {
  const allDays: Availability[] = [1, 2, 3, 4, 5, 6, 7].map(d =>
    makeAvailability(d, 16, 20) // 4 hours daily
  );

  describe('generateSchedule', () => {
    it('generates blocks for pending assignments', () => {
      const assignments = [makeAssignment('a1', 5), makeAssignment('a2', 7)];
      const { blocks } = generateSchedule(assignments, allDays, 'user-1');
      expect(blocks.length).toBeGreaterThan(0);
    });

    it('does not exceed available slot time', () => {
      const assignments = [makeAssignment('a1', 3, 10)];
      const { blocks } = generateSchedule(assignments, allDays, 'user-1');

      // Group blocks by date and check total duration doesn't exceed 240 min (4h)
      const byDate: Record<string, number> = {};
      for (const b of blocks) {
        byDate[b.block_date] = (byDate[b.block_date] ?? 0) + b.duration_minutes;
      }
      Object.values(byDate).forEach(totalMin => {
        expect(totalMin).toBeLessThanOrEqual(240);
      });
    });

    it('marks at-risk assignments when there is not enough time', () => {
      // Very tight deadline + high difficulty + minimal availability
      const tightAvail = [makeAvailability(1, 20, 21)]; // only 1h on Monday
      const hardAssignment = makeAssignment('hard', 1, 10); // due tomorrow, difficulty 10
      const { atRiskIds } = generateSchedule([hardAssignment], tightAvail, 'user-1');
      expect(atRiskIds).toContain('hard');
    });

    it('returns empty blocks when no availability defined', () => {
      const assignments = [makeAssignment('a1', 5)];
      const { blocks } = generateSchedule(assignments, [], 'user-1');
      expect(blocks).toHaveLength(0);
    });

    it('returns empty blocks when no assignments', () => {
      const { blocks } = generateSchedule([], allDays, 'user-1');
      expect(blocks).toHaveLength(0);
    });

    it('prioritizes urgent assignments earlier in schedule', () => {
      const urgent = makeAssignment('urgent', 2, 7);
      const relaxed = makeAssignment('relaxed', 14, 3);
      const { blocks } = generateSchedule([relaxed, urgent], allDays, 'user-1');

      const urgentBlocks = blocks.filter(b => b.assignment_id === 'urgent');
      const relaxedBlocks = blocks.filter(b => b.assignment_id === 'relaxed');

      if (urgentBlocks.length > 0 && relaxedBlocks.length > 0) {
        const firstUrgent = urgentBlocks[0].block_date;
        const firstRelaxed = relaxedBlocks[0].block_date;
        expect(firstUrgent <= firstRelaxed).toBe(true);
      }
    });
  });

  describe('getBlocksForDate', () => {
    it('filters blocks to a specific date', () => {
      const assignments = [makeAssignment('a1', 5)];
      const { blocks } = generateSchedule(assignments, allDays, 'user-1');
      const today = new Date().toISOString().split('T')[0];
      const todayBlocks = getBlocksForDate(blocks, today);
      todayBlocks.forEach(b => expect(b.block_date).toBe(today));
    });

    it('excludes missed blocks', () => {
      const assignments = [makeAssignment('a1', 5)];
      const { blocks } = generateSchedule(assignments, allDays, 'user-1');
      const missed = blocks.map(b => ({ ...b, status: 'Missed' as const }));
      const today = new Date().toISOString().split('T')[0];
      const result = getBlocksForDate(missed, today);
      expect(result).toHaveLength(0);
    });
  });

  describe('formatTimeRange', () => {
    it('returns a non-empty string', () => {
      const result = formatTimeRange(new Date().toISOString(), 60);
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
      expect(result).toContain('–');
    });
  });
});
