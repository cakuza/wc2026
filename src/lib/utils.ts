import type { MatchWithTeams, PlayerWithStats, Standing, Team } from "./types";

export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function groupBy<T, K extends string>(items: T[], getKey: (item: T) => K) {
  return items.reduce<Record<K, T[]>>((acc, item) => {
    const key = getKey(item);
    acc[key] = acc[key] || [];
    acc[key].push(item);
    return acc;
  }, {} as Record<K, T[]>);
}

export function goalDifference(standing: Standing) {
  return standing.goalsFor - standing.goalsAgainst;
}

export function sortStandings(rows: Standing[]) {
  return [...rows].sort((a, b) => {
    const points = b.points - a.points;
    if (points !== 0) return points;
    const gd = goalDifference(b) - goalDifference(a);
    if (gd !== 0) return gd;
    return b.goalsFor - a.goalsFor;
  });
}

export function sortPlayersByStat(players: PlayerWithStats[], stat: keyof Pick<PlayerWithStats, "goals" | "assists" | "yellowCards" | "redCards">) {
  return [...players].sort((a, b) => b[stat] - a[stat] || a.name.localeCompare(b.name));
}

export function teamName(teams: Team[], id: string) {
  return teams.find((team) => team.id === id)?.name || id;
}

export function matchTitle(match: MatchWithTeams) {
  return `${match.homeTeam.name} vs ${match.awayTeam.name}`;
}
