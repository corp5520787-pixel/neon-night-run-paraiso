// Shareable, unlisted link. Possession of this link grants access until 7 p.m. CDMX.
export const LAST_SPOTS_ACCESS = 'a23352017848e58a0199a6887854ec1d';
export const LAST_SPOTS_PATH = `/ultimos-cupos/${LAST_SPOTS_ACCESS}`;
export const LAST_SPOTS_OPENS = '2026-11-07T00:00:00-06:00';
export const LAST_SPOTS_CLOSES = '2026-11-07T19:00:00-06:00';

export function isLastSpotsOpen(access: string, now = Date.now()): boolean {
  return access === LAST_SPOTS_ACCESS &&
    now >= Date.parse(LAST_SPOTS_OPENS) &&
    now < Date.parse(LAST_SPOTS_CLOSES);
}
