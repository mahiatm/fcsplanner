import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppState, Assignment, Availability, StudyBlock, User } from './DataModels';

const KEYS = {
  USER: 'fcsplanner_user',
  ASSIGNMENTS: 'fcsplanner_assignments',
  AVAILABILITY: 'fcsplanner_availability',
  STUDY_BLOCKS: 'fcsplanner_study_blocks',
};

// ── User ────────────────────────────────────────────────────────────────────

export async function saveUser(user: User): Promise<void> {
  await AsyncStorage.setItem(KEYS.USER, JSON.stringify(user));
}

export async function loadUser(): Promise<User | null> {
  const raw = await AsyncStorage.getItem(KEYS.USER);
  return raw ? JSON.parse(raw) : null;
}

// ── Assignments ──────────────────────────────────────────────────────────────

export async function saveAssignments(assignments: Assignment[]): Promise<void> {
  await AsyncStorage.setItem(KEYS.ASSIGNMENTS, JSON.stringify(assignments));
}

export async function loadAssignments(): Promise<Assignment[]> {
  const raw = await AsyncStorage.getItem(KEYS.ASSIGNMENTS);
  return raw ? JSON.parse(raw) : [];
}

export async function upsertAssignment(assignment: Assignment): Promise<Assignment[]> {
  const existing = await loadAssignments();
  const idx = existing.findIndex(a => a.assignment_id === assignment.assignment_id);
  if (idx >= 0) {
    existing[idx] = assignment;
  } else {
    existing.push(assignment);
  }
  await saveAssignments(existing);
  return existing;
}

export async function deleteAssignment(assignment_id: string): Promise<Assignment[]> {
  const existing = await loadAssignments();
  const updated = existing.filter(a => a.assignment_id !== assignment_id);
  await saveAssignments(updated);
  return updated;
}

// ── Availability ─────────────────────────────────────────────────────────────

export async function saveAvailability(availability: Availability[]): Promise<void> {
  await AsyncStorage.setItem(KEYS.AVAILABILITY, JSON.stringify(availability));
}

export async function loadAvailability(): Promise<Availability[]> {
  const raw = await AsyncStorage.getItem(KEYS.AVAILABILITY);
  return raw ? JSON.parse(raw) : [];
}

export async function upsertAvailability(slot: Availability): Promise<Availability[]> {
  const existing = await loadAvailability();
  const idx = existing.findIndex(a => a.availability_id === slot.availability_id);
  if (idx >= 0) {
    existing[idx] = slot;
  } else {
    existing.push(slot);
  }
  await saveAvailability(existing);
  return existing;
}

export async function deleteAvailability(availability_id: string): Promise<Availability[]> {
  const existing = await loadAvailability();
  const updated = existing.filter(a => a.availability_id !== availability_id);
  await saveAvailability(updated);
  return updated;
}

// ── Study Blocks ──────────────────────────────────────────────────────────────

export async function saveStudyBlocks(blocks: StudyBlock[]): Promise<void> {
  await AsyncStorage.setItem(KEYS.STUDY_BLOCKS, JSON.stringify(blocks));
}

export async function loadStudyBlocks(): Promise<StudyBlock[]> {
  const raw = await AsyncStorage.getItem(KEYS.STUDY_BLOCKS);
  return raw ? JSON.parse(raw) : [];
}

export async function updateStudyBlock(updated: StudyBlock): Promise<StudyBlock[]> {
  const existing = await loadStudyBlocks();
  const idx = existing.findIndex(b => b.block_id === updated.block_id);
  if (idx >= 0) existing[idx] = updated;
  await saveStudyBlocks(existing);
  return existing;
}

// ── Full State ────────────────────────────────────────────────────────────────

export async function loadAppState(): Promise<AppState> {
  const [user, assignments, availability, studyBlocks] = await Promise.all([
    loadUser(),
    loadAssignments(),
    loadAvailability(),
    loadStudyBlocks(),
  ]);
  return { user, assignments, availability, studyBlocks };
}

export async function clearAllData(): Promise<void> {
  await AsyncStorage.multiRemove(Object.values(KEYS));
}
