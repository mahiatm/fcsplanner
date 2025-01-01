import { Assignment, Availability, StudyBlock } from '../data/DataModels';
import { estimateTotalHours, sortByPriority } from './PriorityCalculator';

interface TimeSlot {
  date: string;       // YYYY-MM-DD
  startMinutes: number; // minutes from midnight
  endMinutes: number;
  availableMinutes: number;
}

/**
 * Convert "HH:MM" string to minutes from midnight.
 */
function timeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

/**
 * Format a date as YYYY-MM-DD string.
 */
function dateToString(date: Date): string {
  return date.toISOString().split('T')[0];
}

/**
 * Add minutes to a date and return ISO string.
 */
function addMinutes(date: Date, minutes: number): Date {
  return new Date(date.getTime() + minutes * 60000);
}

/**
 * Get the JS day-of-week (0=Sun) and convert to our 1=Mon convention.
 */
function jsToOurDow(jsDay: number): number {
  return jsDay === 0 ? 7 : jsDay;
}

/**
 * Generate available time slots for the next `daysAhead` days based on
 * user-defined weekly availability.
 */
function generateAvailableSlots(
  availability: Availability[],
  daysAhead: number = 14,
  now: Date = new Date()
): TimeSlot[] {
  const slots: TimeSlot[] = [];
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);

  for (let d = 0; d < daysAhead; d++) {
    const day = new Date(today);
    day.setDate(today.getDate() + d);
    const dow = jsToOurDow(day.getDay());

    const daySlots = availability.filter(a => a.day_of_week === dow);
    for (const slot of daySlots) {
      const startMin = timeToMinutes(slot.start_time);
      const endMin = timeToMinutes(slot.end_time);

      // If today, skip slots already past
      let effectiveStart = startMin;
      if (d === 0) {
        const nowMin = now.getHours() * 60 + now.getMinutes();
        if (endMin <= nowMin) continue;
        effectiveStart = Math.max(startMin, nowMin + 15); // 15-min buffer
      }

      if (effectiveStart >= endMin) continue;

      slots.push({
        date: dateToString(day),
        startMinutes: effectiveStart,
        endMinutes: endMin,
        availableMinutes: endMin - effectiveStart,
      });
    }
  }

  return slots.sort((a, b) =>
    a.date.localeCompare(b.date) || a.startMinutes - b.startMinutes
  );
}

/**
 * Core scheduling function.
 * Distributes study time across available slots based on priority.
 * Returns generated StudyBlocks.
 */
export function generateSchedule(
  assignments: Assignment[],
  availability: Availability[],
  userId: string,
  existingBlocks: StudyBlock[] = [],
  now: Date = new Date()
): { blocks: StudyBlock[]; atRiskIds: string[] } {
  const prioritized = sortByPriority(assignments, now);
  const slots = generateAvailableSlots(availability, 21, now); // 3-week lookahead

  // Track remaining minutes needed per assignment
  const remainingMinutes: Record<string, number> = {};
  for (const a of prioritized) {
    const totalHours = estimateTotalHours(a);
    // Subtract already-completed blocks
    const doneMin = existingBlocks
      .filter(b => b.assignment_id === a.assignment_id && b.status === 'Completed')
      .reduce((sum, b) => sum + b.duration_minutes, 0);
    remainingMinutes[a.assignment_id] = Math.max(0, totalHours * 60 - doneMin);
  }

  // Copy slots so we can consume capacity
  const slotCapacity = slots.map(s => ({ ...s }));
  const newBlocks: StudyBlock[] = [];
  const blockIdCounter: Record<string, number> = {};
  const atRiskIds: string[] = [];

  // Round-robin pass: allocate time to assignments in priority order per slot
  for (const slot of slotCapacity) {
    let slotRemaining = slot.availableMinutes;
    let cursor = slot.startMinutes;

    const date = new Date(`${slot.date}T00:00:00`);

    for (const assignment of prioritized) {
      if (slotRemaining <= 0) break;
      if (remainingMinutes[assignment.assignment_id] <= 0) continue;

      // Don't schedule past deadline
      const deadline = new Date(assignment.deadline);
      const slotStart = new Date(date);
      slotStart.setHours(Math.floor(cursor / 60), cursor % 60, 0, 0);
      if (slotStart >= deadline) continue;

      const allocate = Math.min(
        slotRemaining,
        remainingMinutes[assignment.assignment_id],
        120 // max 2-hour block per assignment per slot
      );

      if (allocate < 15) continue; // Don't create tiny blocks

      blockIdCounter[assignment.assignment_id] =
        (blockIdCounter[assignment.assignment_id] ?? 0) + 1;

      const startDt = new Date(date);
      startDt.setHours(Math.floor(cursor / 60), cursor % 60, 0, 0);

      newBlocks.push({
        block_id: `${assignment.assignment_id}_${slot.date}_${cursor}`,
        assignment_id: assignment.assignment_id,
        block_date: slot.date,
        start_datetime: startDt.toISOString(),
        duration_minutes: allocate,
        type: 'Planned',
        status: 'Scheduled',
      });

      remainingMinutes[assignment.assignment_id] -= allocate;
      slotRemaining -= allocate;
      cursor += allocate;
    }
  }

  // Identify at-risk assignments (still have remaining time after all slots exhausted)
  for (const a of prioritized) {
    if (remainingMinutes[a.assignment_id] > 15) {
      atRiskIds.push(a.assignment_id);
    }
  }

  return { blocks: newBlocks, atRiskIds };
}

/**
 * Get study blocks for a specific date.
 */
export function getBlocksForDate(blocks: StudyBlock[], date: string): StudyBlock[] {
  return blocks
    .filter(b => b.block_date === date && b.status !== 'Missed')
    .sort((a, b) => a.start_datetime.localeCompare(b.start_datetime));
}

/**
 * Format a start_datetime + duration into a human-readable time range.
 * e.g. "4:00 PM – 5:30 PM"
 */
export function formatTimeRange(startIso: string, durationMin: number): string {
  const start = new Date(startIso);
  const end = addMinutes(start, durationMin);
  const fmt = (d: Date) =>
    d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  return `${fmt(start)} – ${fmt(end)}`;
}
