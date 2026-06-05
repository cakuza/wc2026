import type { MatchWithTeams } from "@/lib/types";

// SEO-friendly slug for a match detail page, e.g. "mexico-vs-south-africa-group-a".
// Knockout ties (no group) fall back to the stage name, e.g. "...-round-of-16".
export function matchSlug(match: MatchWithTeams): string {
  const base = `${match.homeTeam.slug}-vs-${match.awayTeam.slug}`;
  if (match.group) return `${base}-group-${match.group.toLowerCase()}`;
  return `${base}-${match.stage.toLowerCase().replace(/\s+/g, "-")}`;
}

// Which matchday (1–3) a group fixture belongs to. A four-team group plays a round robin of
// three matchdays, two fixtures each, in date order. Returns null for non-group matches.
export function matchdayNumber(match: MatchWithTeams, allMatches: MatchWithTeams[]): number | null {
  if (!match.group) return null;
  const groupFixtures = allMatches
    .filter((item) => item.group === match.group)
    .sort((a, b) => Date.parse(a.date) - Date.parse(b.date));
  const index = groupFixtures.findIndex((item) => item.id === match.id);
  if (index < 0) return null;
  return Math.floor(index / 2) + 1;
}
