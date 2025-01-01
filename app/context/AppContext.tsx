import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';
import { Assignment, Availability, StudyBlock, User } from '../services/data/DataModels';
import * as DB from '../services/data/LocalDBManager';
import { generateSchedule } from '../services/PlanningEngine/Scheduler';
import { alerts } from '../services/feedback/AlertService';

interface AppContextType {
  user: User | null;
  assignments: Assignment[];
  availability: Availability[];
  studyBlocks: StudyBlock[];
  atRiskIds: string[];
  isLoading: boolean;

  createUser: (username: string) => Promise<void>;
  addAssignment: (data: Omit<Assignment, 'assignment_id' | 'user_id' | 'created_at' | 'completion_status'>) => Promise<void>;
  updateAssignment: (assignment: Assignment) => Promise<void>;
  deleteAssignment: (id: string) => Promise<void>;
  completeAssignment: (id: string) => Promise<void>;

  upsertAvailability: (slot: Omit<Availability, 'availability_id' | 'user_id'> & { availability_id?: string }) => Promise<void>;
  deleteAvailability: (id: string) => Promise<void>;

  regenerateSchedule: () => Promise<void>;
  markBlockComplete: (blockId: string) => Promise<void>;
  markBlockMissed: (blockId: string) => Promise<void>;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [availability, setAvailability] = useState<Availability[]>([]);
  const [studyBlocks, setStudyBlocks] = useState<StudyBlock[]>([]);
  const [atRiskIds, setAtRiskIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load all data on mount
  useEffect(() => {
    (async () => {
      const state = await DB.loadAppState();
      setUser(state.user);
      setAssignments(state.assignments);
      setAvailability(state.availability);
      setStudyBlocks(state.studyBlocks);
      setIsLoading(false);
    })();
  }, []);

  const regenerateSchedule = useCallback(async (
    currentAssignments = assignments,
    currentAvailability = availability,
    currentBlocks = studyBlocks,
    currentUser = user
  ) => {
    if (!currentUser) return;
    const active = currentAssignments.filter(a => a.completion_status !== 'Completed');
    const { blocks, atRiskIds: riskIds } = generateSchedule(
      active,
      currentAvailability,
      currentUser.user_id,
      currentBlocks
    );
    await DB.saveStudyBlocks(blocks);
    setStudyBlocks(blocks);
    setAtRiskIds(riskIds);

    if (riskIds.length > 0) {
      const riskNames = currentAssignments
        .filter(a => riskIds.includes(a.assignment_id))
        .map(a => a.name);
      alerts.atRisk(riskNames);
    }
  }, [assignments, availability, studyBlocks, user]);

  const createUser = async (username: string) => {
    const newUser: User = {
      user_id: uuidv4(),
      username,
      created_at: new Date().toISOString(),
      onboarding_complete: true,
    };
    await DB.saveUser(newUser);
    setUser(newUser);
  };

  const addAssignment = async (data: Omit<Assignment, 'assignment_id' | 'user_id' | 'created_at' | 'completion_status'>) => {
    if (!user) return;
    const newAssignment: Assignment = {
      ...data,
      assignment_id: uuidv4(),
      user_id: user.user_id,
      created_at: new Date().toISOString(),
      completion_status: 'Pending',
    };
    const updated = await DB.upsertAssignment(newAssignment);
    setAssignments(updated);
    alerts.assignmentSaved();
    await regenerateSchedule(updated, availability, studyBlocks, user);
  };

  const updateAssignment = async (assignment: Assignment) => {
    const updated = await DB.upsertAssignment(assignment);
    setAssignments(updated);
    await regenerateSchedule(updated, availability, studyBlocks, user);
  };

  const deleteAssignment = async (id: string) => {
    const updated = await DB.deleteAssignment(id);
    setAssignments(updated);
    const cleanedBlocks = studyBlocks.filter(b => b.assignment_id !== id);
    await DB.saveStudyBlocks(cleanedBlocks);
    setStudyBlocks(cleanedBlocks);
  };

  const completeAssignment = async (id: string) => {
    const a = assignments.find(x => x.assignment_id === id);
    if (!a) return;
    await updateAssignment({ ...a, completion_status: 'Completed' });
    alerts.success(`"${a.name}" marked complete. Great work!`);
  };

  const upsertAvailabilitySlot = async (
    slot: Omit<Availability, 'availability_id' | 'user_id'> & { availability_id?: string }
  ) => {
    if (!user) return;
    const full: Availability = {
      ...slot,
      availability_id: slot.availability_id ?? uuidv4(),
      user_id: user.user_id,
    };
    const updated = await DB.upsertAvailability(full);
    setAvailability(updated);
    await regenerateSchedule(assignments, updated, studyBlocks, user);
  };

  const deleteAvailabilitySlot = async (id: string) => {
    const updated = await DB.deleteAvailability(id);
    setAvailability(updated);
    await regenerateSchedule(assignments, updated, studyBlocks, user);
  };

  const markBlockComplete = async (blockId: string) => {
    const block = studyBlocks.find(b => b.block_id === blockId);
    if (!block) return;
    const updated = await DB.updateStudyBlock({ ...block, status: 'Completed' });
    setStudyBlocks(updated);
    alerts.success('Study block completed!');
  };

  const markBlockMissed = async (blockId: string) => {
    const block = studyBlocks.find(b => b.block_id === blockId);
    if (!block) return;
    const updated = await DB.updateStudyBlock({ ...block, status: 'Missed' });
    setStudyBlocks(updated);
    // Re-schedule to catch up
    await regenerateSchedule(assignments, availability, updated, user);
    alerts.warning('Block missed. Schedule adjusted to catch up.');
  };

  return (
    <AppContext.Provider
      value={{
        user,
        assignments,
        availability,
        studyBlocks,
        atRiskIds,
        isLoading,
        createUser,
        addAssignment,
        updateAssignment,
        deleteAssignment,
        completeAssignment,
        upsertAvailability: upsertAvailabilitySlot,
        deleteAvailability: deleteAvailabilitySlot,
        regenerateSchedule: () => regenerateSchedule(),
        markBlockComplete,
        markBlockMissed,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
