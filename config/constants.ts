// FCSPLANNER Application Constants

export const MAX_DIFFICULTY = 10;
export const MIN_DIFFICULTY = 1;
export const DEFAULT_DIFFICULTY = 5;

export const DEFAULT_STUDY_BLOCK_MINUTES = 60;
export const MIN_BLOCK_MINUTES = 15;
export const MAX_BLOCK_MINUTES = 120;

export const SCHEDULE_LOOKAHEAD_DAYS = 21;

export const PRIORITY_WEIGHTS = {
  DEADLINE: 0.6,
  DIFFICULTY: 0.4,
};

export const AT_RISK_THRESHOLD = 0.8; // 80% of needed hours scheduled = at risk

export const APP_NAME = 'FCSPLANNER';
export const APP_VERSION = '1.0.0';
