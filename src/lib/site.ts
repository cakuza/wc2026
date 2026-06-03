export const SITE_NAME = "WC26 Hub";

// Canonical production host. Set NEXT_PUBLIC_SITE_URL in Vercel to override (e.g. a custom
// domain); otherwise this is pinned to the live deployment so canonicals are deterministic.
export const SITE_URL = "https://wc2026-wine.vercel.app";

export function getSiteUrl() {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit) return explicit.replace(/\/$/, "");
  return SITE_URL;
}

export function absoluteUrl(path = "/") {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${getSiteUrl()}${normalizedPath}`;
}
