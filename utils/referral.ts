/**
 * referral.ts
 * Wraps a Kiwi deep_link with the Travelpayouts tracking marker.
 * The user is first sent through /redirect (an on-domain interstitial)
 * before being forwarded to the Travelpayouts click-tracking URL,
 * which in turn redirects to Kiwi.com with the flight pre-selected.
 */

/**
 * Build the final tracked URL for a Kiwi deep link.
 * Server-safe: reads TRAVELPAYOUTS_MARKER from env.
 * Client-safe: falls back to the raw deep link if marker is absent.
 */
export function buildTpLink(kiwiDeepLink: string): string {
  // process.env is available in both server components and Next.js API routes.
  // For client components the value must be prefixed NEXT_PUBLIC_ in .env.
  const marker =
    process.env.TRAVELPAYOUTS_MARKER ??
    process.env.NEXT_PUBLIC_TRAVELPAYOUTS_MARKER;

  if (!marker) return kiwiDeepLink;

  return `https://tp.media/r?marker=${marker}&url=${encodeURIComponent(kiwiDeepLink)}&cb=1`;
}

/**
 * Returns the href for the "View Deal" button.
 * Routes through /redirect so the user sees a 2-second
 * "Redirecting to partner…" interstitial on our own domain
 * before landing on Kiwi.com.
 */
export function getTrackedLink(kiwiDeepLink: string): string {
  const tpLink = buildTpLink(kiwiDeepLink);
  return `/redirect?to=${encodeURIComponent(tpLink)}`;
}
