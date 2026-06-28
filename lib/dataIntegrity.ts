import { TEAMS, GROUPS, GROUP_LETTERS } from "./teams";
import { MATCHES, matchSlug } from "./matches";
import { COUNTRIES } from "./i18n";
import { CONFEDERATION_BY_TEAM, CONFEDERATIONS } from "./confederations";

// Teams that were in an earlier (incorrect) draw and must never reappear in any public
// World Cup 2026 data surface: team set, fixtures, group source, country names, or the
// routes/sitemap/links derived from them.
export const DENYLISTED_TEAMS = [
  "serbia",
  "denmark",
  "cameroon",
  "nigeria",
  "jamaica",
  "ukraine",
] as const;

/**
 * Hard invariant check for the canonical World Cup 2026 data. Throws on any violation, which
 * fails `next build` (this runs at build time via app/sitemap.ts). Keeping it in the build
 * graph means stale or inconsistent data can never ship.
 */
export function assertWorldCupData(): void {
  const errors: string[] = [];

  if (TEAMS.length !== 48) {
    errors.push(`Expected exactly 48 teams, found ${TEAMS.length}.`);
  }
  if (GROUP_LETTERS.length !== 12) {
    errors.push(`Expected exactly 12 groups, found ${GROUP_LETTERS.length}.`);
  }

  // Exactly 4 teams per group, and no team in more than one group.
  const groupByTeam = new Map<string, string>();
  for (const g of GROUP_LETTERS) {
    const keys = GROUPS[g] ?? [];
    if (keys.length !== 4) {
      errors.push(`Group ${g} must have exactly 4 teams, found ${keys.length}.`);
    }
    for (const key of keys) {
      const existing = groupByTeam.get(key);
      if (existing) {
        errors.push(`Team "${key}" appears in both group ${existing} and group ${g}.`);
      } else {
        groupByTeam.set(key, g);
      }
    }
  }

  const validKeys = new Set(TEAMS.map((t) => t.key));

  // Every fixture must reference known teams.
  for (const m of MATCHES) {
    if (!validKeys.has(m.homeKey) && m.homeKey !== "tbd") {
      errors.push(`Match ${matchSlug(m)} references unknown home team "${m.homeKey}".`);
    }
    if (!validKeys.has(m.awayKey) && m.awayKey !== "tbd") {
      errors.push(`Match ${matchSlug(m)} references unknown away team "${m.awayKey}".`);
    }
  }

  // Every team must have a localized country name.
  for (const t of TEAMS) {
    if (!COUNTRIES[t.key]) {
      errors.push(`Team "${t.key}" has no COUNTRIES entry in lib/i18n.ts.`);
    }
  }

  // Every team must map to a known confederation (used by the by-confederation page).
  const confCodes = new Set(CONFEDERATIONS.map((c) => c.code));
  for (const t of TEAMS) {
    const conf = CONFEDERATION_BY_TEAM[t.key];
    if (!conf) {
      errors.push(`Team "${t.key}" has no confederation in lib/confederations.ts.`);
    } else if (!confCodes.has(conf)) {
      errors.push(`Team "${t.key}" has unknown confederation "${conf}".`);
    }
  }

  // No denylisted team may appear in any canonical data surface.
  for (const banned of DENYLISTED_TEAMS) {
    if (validKeys.has(banned)) errors.push(`Denylisted team "${banned}" present in TEAMS.`);
    if (groupByTeam.has(banned)) errors.push(`Denylisted team "${banned}" present in GROUPS.`);
    if (COUNTRIES[banned]) errors.push(`Denylisted team "${banned}" present in COUNTRIES.`);
    if (MATCHES.some((m) => m.homeKey === banned || m.awayKey === banned)) {
      errors.push(`Denylisted team "${banned}" present in MATCHES.`);
    }
  }

  if (errors.length > 0) {
    throw new Error(
      `World Cup 2026 data integrity check failed:\n - ${errors.join("\n - ")}`
    );
  }
}

