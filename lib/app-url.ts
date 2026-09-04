/**
 * Utility to reliably determine the public application URL for links, QR codes, and transactional emails.
 * Handles Cloud Run environments, reverse proxy headers (x-forwarded-host, host),
 * local development, and custom domains.
 */

export function resolvePublicAppUrl(
  req?: Request | { headers?: Headers | { get: (k: string) => string | null } }
): string {
  // 1. If running client-side in the browser, window.location.origin is always accurate
  if (typeof window !== 'undefined' && window.location?.origin) {
    return window.location.origin.replace(/\/$/, '');
  }

  // 2. If an active request object is provided, derive from forwarded headers
  if (req && 'headers' in req && req.headers) {
    const host = typeof req.headers.get === 'function'
      ? (req.headers.get('x-forwarded-host') || req.headers.get('host'))
      : null;
    const proto = typeof req.headers.get === 'function'
      ? (req.headers.get('x-forwarded-proto') || 'https')
      : 'https';

    if (host && !host.includes('localhost') && !host.includes('127.0.0.1')) {
      return `${proto}://${host}`.replace(/\/$/, '');
    }
  }

  // 3. Platform environment variables (Cloud Run sets APP_URL to the real deployed container URL)
  const appUrl = process.env.APP_URL;
  if (appUrl && !appUrl.includes('localhost') && !appUrl.includes('neonnightrunparaiso.mx')) {
    return appUrl.replace(/\/$/, '');
  }

  // 4. Custom NEXT_PUBLIC_APP_URL if defined and active (not the placeholder/unresolved domain)
  const nextPublicAppUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (
    nextPublicAppUrl &&
    !nextPublicAppUrl.includes('neonnightrunparaiso.mx') &&
    !nextPublicAppUrl.includes('localhost')
  ) {
    return nextPublicAppUrl.replace(/\/$/, '');
  }

  // 5. Vercel deployment URL
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`.replace(/\/$/, '');
  }

  // 6. Active Google Cloud Run container URL fallback
  return 'https://ais-dev-tjqa7ekwb52nplxis6aeus-108908076268.us-west2.run.app';
}

export function getParticipantTicketUrl(
  folio: string,
  req?: Request | { headers?: Headers | { get: (k: string) => string | null } }
): string {
  const baseUrl = resolvePublicAppUrl(req);
  return `${baseUrl}/participante/${encodeURIComponent(folio.trim())}`;
}
