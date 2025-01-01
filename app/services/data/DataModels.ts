// FCSPLANNER Data Models

export interface User {
  user_id: string;
  username: string;
  created_at: string;
  onboarding_complete: boolean;
}

export interface Assignment {
  assignment_id: string;
  user_id: string;
  name: string;
  course: string;
  deadline: string; // ISO datetime string
  estimated_workload_hours: number;
  difficulty_rating: number; // 1-10
  completion_status: 'Pending' | 'InProgress' | 'Completed';
  priority_score?: number; // calculated dynamically
  created_at: string;
}

export interface Availability {
  availability_id: string;
  user_id: string;
  day_of_week: number; // 1=Monday, 7=Sunday
  start_time: string; // "HH:MM"
  end_time: string;   // "HH:MM"
}

export interface StudyBlock {
  block_id: string;
  assignment_id: string;
  block_date: string;       // "YYYY-MM-DD"
  start_datetime: string;   // ISO datetime
  duration_minutes: number;
  type: 'Planned' | 'Adjusted' | 'CatchUp';
  status: 'Scheduled' | 'Missed' | 'Completed';
}

export interface AppState {
  user: User | null;
  assignments: Assignment[];
  availability: Availability[];
  studyBlocks: StudyBlock[];
}

// Day labels helper
export const DAY_LABELS: Record<number, string> = {
  1: 'Monday',
  2: 'Tuesday',
  3: 'Wednesday',
  4: 'Thursday',
  5: 'Friday',
  6: 'Saturday',
  7: 'Sunday',
};
