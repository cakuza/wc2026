import { footballProvider } from "@/lib/providers";
import type { MatchWithTeams, PlayerWithStats } from "@/lib/types";

export async function getTeams() {
  return footballProvider.getTeams();
}

export async function getTeam(slug: string) {
  return footballProvider.getTeam(slug);
}

export async function getDataMeta() {
  return footballProvider.getMeta();
}

export async function getMatchesWithTeams(): Promise<MatchWithTeams[]> {
  const [matches, teams] = await Promise.all([
    footballProvider.getMatches(),
    footballProvider.getTeams()
  ]);
  return matches.map((match) => {
    const homeTeam = teams.find((team) => team.id === match.homeTeamId);
    const awayTeam = teams.find((team) => team.id === match.awayTeamId);
    if (!homeTeam || !awayTeam) {
      throw new Error(`Missing team for match ${match.id}`);
    }
    return { ...match, homeTeam, awayTeam };
  });
}

export async function getStandingsWithTeams() {
  const [standings, teams] = await Promise.all([
    footballProvider.getStandings(),
    footballProvider.getTeams()
  ]);
  return standings.map((standing) => ({
    ...standing,
    team: teams.find((team) => team.id === standing.teamId)
  }));
}

export async function getPlayersWithStats(): Promise<PlayerWithStats[]> {
  const [players, stats, teams] = await Promise.all([
    footballProvider.getPlayers(),
    footballProvider.getPlayerStats(),
    footballProvider.getTeams()
  ]);
  return players.map((player) => {
    const stat = stats.find((row) => row.playerId === player.id);
    const team = teams.find((row) => row.id === player.teamId);
    if (!team) {
      throw new Error(`Missing team for player ${player.id}`);
    }
    return {
      ...player,
      team,
      goals: stat?.goals || 0,
      assists: stat?.assists || 0,
      yellowCards: stat?.yellowCards || 0,
      redCards: stat?.redCards || 0
    };
  });
}

export async function getTeamPageData(slug: string) {
  const [team, matches, standings, players] = await Promise.all([
    footballProvider.getTeam(slug),
    getMatchesWithTeams(),
    footballProvider.getStandings(),
    getPlayersWithStats()
  ]);

  if (!team) return null;

  return {
    team,
    fixtures: matches.filter((match) => match.homeTeamId === team.id || match.awayTeamId === team.id),
    groupStandings: standings.filter((row) => row.group === team.group),
    players: players.filter((player) => player.teamId === team.id)
  };
}
