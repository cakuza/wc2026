// football-data.org v4 client
// Competition 2000 = FIFA World Cup (recurring competition — covers WC 2026).
// Returns parsed JSON on success, null if the API key is missing or the fetch fails.

const BASE = "https://api.football-data.org/v4";
const COMPETITION = 2000;

async function apiFetch(path: string) {
  const key = process.env.FOOTBALL_DATA_API_KEY;
  if (!key) return null;
  try {
    const res = await fetch(`${BASE}${path}`, {
      headers: { "X-Auth-Token": key },
      next: { revalidate: 60 }
    });
    if (!res.ok) {
      console.warn(`[football-data] ${path} → HTTP ${res.status}`);
      return null;
    }
    return res.json();
  } catch (err) {
    console.warn(`[football-data] fetch error:`, err);
    return null;
  }
}

export async function fetchLiveMatches() {
  return apiFetch(`/competitions/${COMPETITION}/matches`);
}

export async function fetchLiveStandings() {
  return apiFetch(`/competitions/${COMPETITION}/standings`);
}

/**
 * Fetch live events for a single match from football-data.org.
 *
 * Pass the football-data.org numeric match ID.  Returns null when:
 *  - fdMatchId is null/undefined  (ID not yet mapped — pre-tournament)
 *  - API key is absent
 *  - The remote request fails
 *
 * Uses a 30-second revalidation window so live scores refresh quickly.
 * For scheduled/finished matches a longer TTL is fine — the caller decides.
 */
export async function fetchMatchEvents(fdMatchId: number | null | undefined) {
  if (!fdMatchId) return null;
  const key = process.env.FOOTBALL_DATA_API_KEY;
  if (!key) return null;
  try {
    const res = await fetch(`${BASE}/matches/${fdMatchId}`, {
      headers: { "X-Auth-Token": key },
      next: { revalidate: 30 },
    });
    if (!res.ok) {
      console.warn(`[football-data] /matches/${fdMatchId} → HTTP ${res.status}`);
      return null;
    }
    return res.json();
  } catch (err) {
    console.warn(`[football-data] fetchMatchEvents error:`, err);
    return null;
  }
}
