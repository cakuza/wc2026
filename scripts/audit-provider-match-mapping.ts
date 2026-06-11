/**
 * Audit how many internal fixtures (lib/matches.ts) are mapped to football-data.org
 * match ids, and propose mappings for unmapped fixtures by matching team names + kickoff time.
 *
 * Read-only: does NOT modify lib/matches.ts. Prints a report only.
 *
 * Usage:
 *   npx tsx --env-file=.env scripts/audit-provider-match-mapping.ts
 */

import { MATCHES, matchUtcDate, matchSlug, type Match } from "../lib/matches";
import { countryName } from "../lib/i18n";

const BASE = "https://api.football-data.org/v4";
const COMPETITION_ID = 2000; // FIFA World Cup

// Normalize a team name for fuzzy comparison: lowercase, strip diacritics/punctuation/whitespace.
function normalize(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // strip accents
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

// Known internal-name → provider-name mismatches (after normalize()).
const ALIASES: Record<string, string> = {
  southkorea: "korearepublic",
  capeverde: "caboverde",
  ivorycoast: "cotedivoire",
};

function internalTeamKey(key: string): string {
  const en = countryName(key, "en");
  const norm = normalize(en);
  return ALIASES[norm] ?? norm;
}

type ProviderMatch = {
  id: number;
  utcDate: string;
  status: string;
  homeTeam: { name: string };
  awayTeam: { name: string };
  stage: string;
};

async function main() {
  console.log("=== Provider match mapping audit ===\n");

  const key = process.env.FOOTBALL_DATA_API_KEY;
  if (!key) {
    console.error("FOOTBALL_DATA_API_KEY is NOT set.");
    process.exitCode = 1;
    return;
  }

  const res = await fetch(`${BASE}/competitions/${COMPETITION_ID}/matches`, {
    headers: { "X-Auth-Token": key },
  });
  if (!res.ok) {
    console.error(`Provider fetch failed: HTTP ${res.status}`);
    process.exitCode = 1;
    return;
  }
  const data = await res.json();
  const providerMatches: ProviderMatch[] = (data.matches ?? []).filter(
    (m: ProviderMatch) => m.stage === "GROUP_STAGE"
  );

  console.log(`Internal fixtures: ${MATCHES.length}`);
  console.log(`Provider group-stage fixtures: ${providerMatches.length}\n`);

  const mapped = MATCHES.filter((m) => m.providerIds?.footballData);
  const unmapped = MATCHES.filter((m) => !m.providerIds?.footballData);

  console.log(`Mapped: ${mapped.length}`);
  for (const m of mapped) {
    console.log(`  ${matchSlug(m)} → ${m.providerIds!.footballData}`);
  }
  console.log(`\nUnmapped: ${unmapped.length}`);

  const usedProviderIds = new Set(mapped.map((m) => m.providerIds!.footballData));

  const confident: { internal: Match; provider: ProviderMatch }[] = [];
  const noMatch: Match[] = [];

  for (const m of unmapped) {
    const home = internalTeamKey(m.homeKey);
    const away = internalTeamKey(m.awayKey);
    const utc = matchUtcDate(m).getTime();

    const candidates = providerMatches.filter((p) => {
      if (usedProviderIds.has(p.id)) return false;
      const pHome = normalize(p.homeTeam.name);
      const pAway = normalize(p.awayTeam.name);
      const sameTeams = pHome === home && pAway === away;
      const sameTime = Math.abs(new Date(p.utcDate).getTime() - utc) <= 60 * 60 * 1000; // 1h tolerance
      return sameTeams && sameTime;
    });

    if (candidates.length === 1) {
      confident.push({ internal: m, provider: candidates[0] });
    } else {
      noMatch.push(m);
    }
  }

  console.log(`\nConfident proposed mappings: ${confident.length}`);
  for (const { internal, provider } of confident) {
    console.log(
      `  ${matchSlug(internal)} → ${provider.id}  (${provider.homeTeam.name} vs ${provider.awayTeam.name}, ${provider.utcDate})`
    );
  }

  console.log(`\nLow-confidence / unmatched internal fixtures: ${noMatch.length}`);
  for (const m of noMatch) {
    console.log(
      `  ${matchSlug(m)}  (${countryName(m.homeKey, "en")} vs ${countryName(m.awayKey, "en")}, ${matchUtcDate(m).toISOString()})`
    );
  }

  const matchedProviderIds = new Set([
    ...mapped.map((m) => m.providerIds!.footballData),
    ...confident.map((c) => c.provider.id),
  ]);
  const unmatchedProvider = providerMatches.filter((p) => !matchedProviderIds.has(p.id));
  console.log(`\nUnmatched provider fixtures: ${unmatchedProvider.length}`);
  for (const p of unmatchedProvider) {
    console.log(`  ${p.id}  ${p.homeTeam.name} vs ${p.awayTeam.name}  ${p.utcDate}`);
  }
}

main().catch((err) => {
  console.error("Script error:", err);
  process.exit(1);
});
