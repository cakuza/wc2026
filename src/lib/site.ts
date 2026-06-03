export const SITE_NAME = "WC26 Hub";

export function getSiteUrl() {
  // Prefer an explicit canonical domain, then the Vercel-provided deployment URLs, so
  // canonicals always match the live host instead of a stale hardcoded domain.
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit) return explicit.replace(/\/$/, "");
  const productionUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (productionUrl) return `https://${productionUrl}`;
  const deploymentUrl = process.env.VERCEL_URL;
  if (deploymentUrl) return `https://${deploymentUrl}`;
  return "https://wc2026-wine.vercel.app";
}

export function absoluteUrl(path = "/") {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${getSiteUrl()}${normalizedPath}`;
}
