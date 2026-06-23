/**
 * IndexNow submission helper — dry-run by default.
 *
 * Real submissions only execute when INDEXNOW_ENABLED=true is set in the
 * environment AND the public IndexNow key file is served at /[key].txt.
 *
 * The key itself (INDEXNOW_KEY env var) is the *public* verification value
 * specified by the IndexNow protocol — it appears as a public URL, which is
 * expected. Never log or expose a secret alongside it.
 *
 * Rate limits:
 * - Bing/IndexNow: 10,000 URLs per batch per day.
 * - We deduplicate within a session and batch per changed match snapshot.
 */

const BASE = "https://www.worldcupmatchday.com";
const INDEXNOW_ENDPOINT = "https://api.indexnow.org/indexnow";

export type IndexNowResult = {
  dryRun: boolean;
  urls: string[];
  status?: number;
  error?: string;
};

/** Build the set of URLs that are affected when a match result changes. */
export function urlsForMatchChange(opts: {
  matchSlug: string;
  homeTeamSlug: string;
  awayTeamSlug: string;
  groupLetter: string;
}): string[] {
  const { matchSlug, homeTeamSlug, awayTeamSlug, groupLetter } = opts;
  return [
    `${BASE}/matches/${matchSlug}`,
    `${BASE}/teams/${homeTeamSlug}`,
    `${BASE}/teams/${awayTeamSlug}`,
    `${BASE}/groups/group-${groupLetter.toLowerCase()}`,
    `${BASE}/groups`,
    `${BASE}/stats/top-scorers`,
    `${BASE}/stats`,
    `${BASE}/world-cup-third-place-qualification`,
    `${BASE}/qualified-eliminated-teams`,
    `${BASE}/today`,
    BASE,
  ];
}

/**
 * Submit URLs to IndexNow. Dry-run by default — set INDEXNOW_ENABLED=true to
 * enable real submissions. INDEXNOW_KEY must also be set to the public key
 * registered with IndexNow.
 *
 * Do NOT call this on every snapshot refresh — only when meaningful content
 * changes (match result, scorer, standings update).
 */
export async function submitIndexNow(urls: string[]): Promise<IndexNowResult> {
  const enabled = process.env.INDEXNOW_ENABLED === "true";
  const key = process.env.INDEXNOW_KEY;

  // Always deduplicate
  const deduped = [...new Set(urls)];

  if (!enabled || !key) {
    return { dryRun: true, urls: deduped };
  }

  try {
    const body = {
      host: "www.worldcupmatchday.com",
      key,
      keyLocation: `${BASE}/${key}.txt`,
      urlList: deduped,
    };
    const res = await fetch(INDEXNOW_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify(body),
    });
    return { dryRun: false, urls: deduped, status: res.status };
  } catch (err: unknown) {
    return {
      dryRun: false,
      urls: deduped,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}
