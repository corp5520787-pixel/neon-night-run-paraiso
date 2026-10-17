import { EventConfig } from './types';

// Saturday, October 17, 2026, in Mexico City (UTC-6 year-round).
export const PUBLIC_REGISTRATION_OPENS_ISO = '2026-10-17T08:00:00-06:00';
export const PUBLIC_REGISTRATION_CLOSES_ISO = '2026-10-17T22:00:00-06:00';
export const DEFAULT_REGISTRATION_CLOSING_ISO = PUBLIC_REGISTRATION_CLOSES_ISO;
export const DEFAULT_REGISTRATION_CLOSING_TEXT = 'Sábado 17 de octubre a las 10:00 p. m. (hora Ciudad de México)';

export type PublicRegistrationPhase = 'upcoming' | 'open' | 'closed';

/** A manual emergency closure remains effective during the public window. */
export function getPublicRegistrationPhase(
  config?: Partial<EventConfig> | null,
  now = Date.now()
): PublicRegistrationPhase {
  if (config?.registrationOpen === false) return 'closed';
  if (now < Date.parse(PUBLIC_REGISTRATION_OPENS_ISO)) return 'upcoming';
  if (now < Date.parse(PUBLIC_REGISTRATION_CLOSES_ISO)) return 'open';
  return 'closed';
}

export function isRegistrationClosed(config?: Partial<EventConfig> | null, now = Date.now()): boolean {
  return getPublicRegistrationPhase(config, now) !== 'open';
}

export function getRegistrationClosingDate(): Date {
  return new Date(PUBLIC_REGISTRATION_CLOSES_ISO);
}

export interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  totalMs: number;
  isClosed: boolean;
}

/** Count down to opening before 8 a.m. and to closing while registrations are open. */
export function calculateRegistrationTimeLeft(config?: Partial<EventConfig> | null, now = Date.now()): TimeLeft {
  const phase = getPublicRegistrationPhase(config, now);
  const target = phase === 'upcoming'
    ? Date.parse(PUBLIC_REGISTRATION_OPENS_ISO)
    : Date.parse(PUBLIC_REGISTRATION_CLOSES_ISO);
  const totalMs = phase === 'closed' ? 0 : Math.max(0, target - now);

  return {
    days: Math.floor(totalMs / 86400000),
    hours: Math.floor((totalMs % 86400000) / 3600000),
    minutes: Math.floor((totalMs % 3600000) / 60000),
    seconds: Math.floor((totalMs % 60000) / 1000),
    totalMs,
    isClosed: phase !== 'open',
  };
}
