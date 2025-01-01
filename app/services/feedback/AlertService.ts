// AlertService.ts — manages in-app toast/banner notifications

export type AlertType = 'warning' | 'success' | 'error' | 'info';

export interface AppAlert {
  id: string;
  type: AlertType;
  message: string;
  duration?: number; // ms, default 3500
}

type AlertListener = (alert: AppAlert) => void;

let listener: AlertListener | null = null;
let counter = 0;

export function setAlertListener(fn: AlertListener) {
  listener = fn;
}

export function showAlert(type: AlertType, message: string, duration = 3500) {
  const alert: AppAlert = {
    id: `alert_${++counter}`,
    type,
    message,
    duration,
  };
  if (listener) listener(alert);
}

// Convenience helpers
export const alerts = {
  warning: (msg: string) => showAlert('warning', msg, 5000),
  success: (msg: string) => showAlert('success', msg, 2500),
  error: (msg: string) => showAlert('error', msg, 5000),
  info: (msg: string) => showAlert('info', msg, 3500),

  missingFields: () =>
    showAlert('error', 'Please ensure Assignment Name, Deadline, and Difficulty (1–10) are set.'),

  impossibleSchedule: (name: string) =>
    showAlert(
      'warning',
      `Warning: Insufficient available study time before the deadline for "${name}". Consider extending the deadline or adding more study hours.`,
      6000
    ),

  atRisk: (names: string[]) =>
    showAlert(
      'warning',
      `CRITICAL: ${names.join(', ')} ${names.length === 1 ? 'is' : 'are'} projected to be late. Please review your study time or deadline.`,
      8000
    ),

  scheduleRegenerated: () =>
    showAlert('success', 'Schedule updated successfully.'),

  assignmentSaved: () =>
    showAlert('success', 'Assignment saved.'),

  timeConstraint: (names: string[]) =>
    showAlert(
      'warning',
      `Schedule adjusted. Deadlines for ${names.join(', ')} may be affected.`,
      6000
    ),
};
