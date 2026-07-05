/**
 * Authoritative resolved participant table for the 2026 FIFA World Cup knockout stage.
 *
 * R32 (matches 73–88): fully resolved from confirmed group stage results as of 2026-06-28.
 * R16+ rows are added only as upstream knockout results become confirmed.
 *
 * Sources: Wikipedia (2026 FIFA World Cup knockout stage), CBS Sports, Al Jazeera,
 *          Yahoo Sports — cross-verified 2026-06-28.
 *
 * Immutable canonical slot definitions remain in lib/matches.ts (ParticipantSlot).
 * This file records the CURRENT RESOLVED STATE only; do not overwrite slot definitions.
 */

export type ResolvedSide = {
  teamKey: string;
  teamCode: string;
};

export type ResolvedMatchParticipants = {
  home?: ResolvedSide;
  away?: ResolvedSide;
  /** ISO date the participant was confirmed. */
  resolvedAt: string;
  /** Confidence level. */
  confidence: "confirmed";
};

/**
 * Map from match number to resolved participants.
 * Only entries present here are considered resolved.
 */
export const RESOLVED_PARTICIPANTS: Readonly<Record<number, ResolvedMatchParticipants>> = {
  // ── Round of 32 ───────────────────────────────────────────────────────────
  // All 16 R32 fixtures confirmed from group stage results (phase completed 2026-06-27).
  // Slot definitions: see lib/matches.ts matchNumber 73–88.
  73: { home: { teamKey: "southAfrica",  teamCode: "za"     }, away: { teamKey: "canada",       teamCode: "ca"     }, resolvedAt: "2026-06-28", confidence: "confirmed" },
  74: { home: { teamKey: "germany",      teamCode: "de"     }, away: { teamKey: "paraguay",     teamCode: "py"     }, resolvedAt: "2026-06-28", confidence: "confirmed" },
  75: { home: { teamKey: "netherlands",  teamCode: "nl"     }, away: { teamKey: "morocco",      teamCode: "ma"     }, resolvedAt: "2026-06-28", confidence: "confirmed" },
  76: { home: { teamKey: "brazil",       teamCode: "br"     }, away: { teamKey: "japan",        teamCode: "jp"     }, resolvedAt: "2026-06-28", confidence: "confirmed" },
  77: { home: { teamKey: "france",       teamCode: "fr"     }, away: { teamKey: "sweden",       teamCode: "se"     }, resolvedAt: "2026-06-28", confidence: "confirmed" },
  78: { home: { teamKey: "ivoryCoast",   teamCode: "ci"     }, away: { teamKey: "norway",       teamCode: "no"     }, resolvedAt: "2026-06-28", confidence: "confirmed" },
  79: { home: { teamKey: "mexico",       teamCode: "mx"     }, away: { teamKey: "ecuador",      teamCode: "ec"     }, resolvedAt: "2026-06-28", confidence: "confirmed" },
  80: { home: { teamKey: "england",      teamCode: "gb-eng" }, away: { teamKey: "drCongo",      teamCode: "cd"     }, resolvedAt: "2026-06-28", confidence: "confirmed" },
  81: { home: { teamKey: "unitedStates", teamCode: "us"     }, away: { teamKey: "bosnia",       teamCode: "ba"     }, resolvedAt: "2026-06-28", confidence: "confirmed" },
  82: { home: { teamKey: "belgium",      teamCode: "be"     }, away: { teamKey: "senegal",      teamCode: "sn"     }, resolvedAt: "2026-06-28", confidence: "confirmed" },
  83: { home: { teamKey: "portugal",     teamCode: "pt"     }, away: { teamKey: "croatia",      teamCode: "hr"     }, resolvedAt: "2026-06-28", confidence: "confirmed" },
  84: { home: { teamKey: "spain",        teamCode: "es"     }, away: { teamKey: "austria",      teamCode: "at"     }, resolvedAt: "2026-06-28", confidence: "confirmed" },
  85: { home: { teamKey: "switzerland",  teamCode: "ch"     }, away: { teamKey: "algeria",      teamCode: "dz"     }, resolvedAt: "2026-06-28", confidence: "confirmed" },
  86: { home: { teamKey: "argentina",    teamCode: "ar"     }, away: { teamKey: "capeVerde",    teamCode: "cv"     }, resolvedAt: "2026-06-28", confidence: "confirmed" },
  87: { home: { teamKey: "colombia",     teamCode: "co"     }, away: { teamKey: "ghana",        teamCode: "gh"     }, resolvedAt: "2026-06-28", confidence: "confirmed" },
  88: { home: { teamKey: "australia",    teamCode: "au"     }, away: { teamKey: "egypt",        teamCode: "eg"     }, resolvedAt: "2026-06-28", confidence: "confirmed" },
  // Round of 16 participants confirmed by finished Round of 32 sources.
  89: { home: { teamKey: "paraguay", teamCode: "py" }, away: { teamKey: "france", teamCode: "fr" }, resolvedAt: "2026-07-04", confidence: "confirmed" },
  90: { home: { teamKey: "canada", teamCode: "ca" }, away: { teamKey: "morocco", teamCode: "ma" }, resolvedAt: "2026-07-04", confidence: "confirmed" },
  91: { home: { teamKey: "brazil", teamCode: "br" }, away: { teamKey: "norway", teamCode: "no" }, resolvedAt: "2026-07-05", confidence: "confirmed" },
  95: { away: { teamKey: "egypt", teamCode: "eg" }, resolvedAt: "2026-07-04", confidence: "confirmed" },
  96: { home: { teamKey: "switzerland", teamCode: "ch" }, away: { teamKey: "colombia", teamCode: "co" }, resolvedAt: "2026-07-04", confidence: "confirmed" },
  97: { home: { teamKey: "france", teamCode: "fr" }, away: { teamKey: "morocco", teamCode: "ma" }, resolvedAt: "2026-07-04", confidence: "confirmed" },
  // M92-Final: unresolved until their source matches conclude.
} as const;

/** Returns the resolved home side for a match number, or null if unresolved. */
export function resolvedHome(matchNumber: number): ResolvedSide | null {
  return RESOLVED_PARTICIPANTS[matchNumber]?.home ?? null;
}

/** Returns the resolved away side for a match number, or null if unresolved. */
export function resolvedAway(matchNumber: number): ResolvedSide | null {
  return RESOLVED_PARTICIPANTS[matchNumber]?.away ?? null;
}
