import squadsByTeam from "../../data/squads.json";

// squads.json is keyed by project team id -> array of { name, number, position }.
// Sourced from reported WC2026 final-squad lists (Al Jazeera, June 2026). Names only;
// shirt numbers are not published by the source, so `number` is null.
export type SquadPosition = "GK" | "DEF" | "MID" | "FWD";
export type SquadEntry = { name: string; number: number | null; position: SquadPosition };
export type SquadStatus = "pending" | "provisional" | "official";

const SQUADS = squadsByTeam as Record<string, SquadEntry[]>;

export const SQUAD_SOURCE_LABEL = "Reported squads - Al Jazeera (June 2026). Names only; numbers pending.";

export function getTeamSquad(teamId: string): SquadEntry[] {
  return SQUADS[teamId] ?? [];
}

export function squadStatusFor(teamId: string): SquadStatus {
  return (SQUADS[teamId]?.length ?? 0) > 0 ? "provisional" : "pending";
}

export function getSquadStatusMap(): Record<string, SquadStatus> {
  return Object.fromEntries(Object.keys(SQUADS).map((id) => [id, squadStatusFor(id)]));
}

// Back-compat for existing consumers that read squad.squadStatus.
export function getSquad(teamId: string): { teamId: string; squadStatus: SquadStatus; players: SquadEntry[] } | null {
  const players = SQUADS[teamId];
  if (!players) return null;
  return { teamId, squadStatus: squadStatusFor(teamId), players };
}

// Star player for a Player Watch default: first forward, else first midfielder, else first listed.
export function getStarPlayer(teamId: string): SquadEntry | null {
  const squad = getTeamSquad(teamId);
  return squad.find((p) => p.position === "FWD") || squad.find((p) => p.position === "MID") || squad[0] || null;
}

// URL-safe slug for a player name (used in /cards?player=<slug> deep links).
export function playerSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/['".]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function findSquadPlayer(teamId: string, slug: string): SquadEntry | null {
  return getTeamSquad(teamId).find((p) => playerSlug(p.name) === slug) || null;
}

// Squad grouped by position, in display order, skipping empty groups.
export function getSquadByPosition(teamId: string): Array<{ position: SquadPosition; label: string; players: SquadEntry[] }> {
  const squad = getTeamSquad(teamId);
  const labels: Record<SquadPosition, string> = { GK: "Goalkeepers", DEF: "Defenders", MID: "Midfielders", FWD: "Forwards" };
  return (["GK", "DEF", "MID", "FWD"] as SquadPosition[])
    .map((position) => ({ position, label: labels[position], players: squad.filter((p) => p.position === position) }))
    .filter((group) => group.players.length > 0);
}
