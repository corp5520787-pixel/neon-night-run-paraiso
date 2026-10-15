import { EventConfig } from './types';

// Default closing deadline: Today October 15, 2026 at 8:00 PM (20:00:00) Mexico City time (UTC-6)
export const DEFAULT_REGISTRATION_CLOSING_ISO = '2026-10-15T20:00:00-06:00';
export const DEFAULT_REGISTRATION_CLOSING_TEXT = 'Hoy a las 8:00 PM (Hora CDMX)';

/**
 * Checks whether registrations are officially closed based on explicit config or deadline timestamp.
 */
export function isRegistrationClosed(config?: Partial<EventConfig> | null): boolean {
  if (config && config.registrationOpen === false) {
    return true;
  }
  const closingIso = config?.registrationClosingDate || DEFAULT_REGISTRATION_CLOSING_ISO;
  const closingTime = new Date(closingIso).getTime();
  const now = Date.now();
  return now >= closingTime;
}

/**
 * Returns the target closing date object.
 */
export function getRegistrationClosingDate(config?: Partial<EventConfig> | null): Date {
  const closingIso = config?.registrationClosingDate || DEFAULT_REGISTRATION_CLOSING_ISO;
  return new Date(closingIso);
}

export interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  totalMs: number;
  isClosed: boolean;
}

/**
 * Computes remaining time until registration closing.
 */
export function calculateRegistrationTimeLeft(config?: Partial<EventConfig> | null): TimeLeft {
  if (config && config.registrationOpen === false) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, totalMs: 0, isClosed: true };
  }

  const targetDate = getRegistrationClosingDate(config);
  const now = Date.now();
  const difference = targetDate.getTime() - now;

  if (difference <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, totalMs: 0, isClosed: true };
  }

  const days = Math.floor(difference / (1000 * 60 * 60 * 24));
  const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((difference % (1000 * 60)) / 1000);

  return {
    days,
    hours,
    minutes,
    seconds,
    totalMs: difference,
    isClosed: false,
  };
}
