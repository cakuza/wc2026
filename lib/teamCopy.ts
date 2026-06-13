export function pluralize(count: number, singular: string, plural = `${singular}s`): string {
  return `${count} ${count === 1 ? singular : plural}`;
}

export function pointsText(points: number): string {
  return pluralize(points, "point");
}

export function matchesText(matches: number): string {
  return pluralize(matches, "match", "matches");
}

export function possessiveTeamName(name: string): string {
  return name.endsWith("s") ? `${name}'` : `${name}'s`;
}

export function playedGroupSummary({
  teamName,
  group,
  played,
  points,
  goalDifference,
}: {
  teamName: string;
  group: string;
  played: number;
  points: number;
  goalDifference: number;
}): string {
  const signedGoalDifference = goalDifference > 0 ? `+${goalDifference}` : String(goalDifference);
  return `${teamName} have played ${matchesText(played)} in Group ${group}, with ${pointsText(points)} and a ${signedGoalDifference} goal difference.`;
}

export function firstMatchResultSentence({
  teamName,
  opponentName,
  date,
  homeScore,
  awayScore,
}: {
  teamName: string;
  opponentName: string;
  date: string;
  homeScore: number;
  awayScore: number;
}): string {
  return `${possessiveTeamName(teamName)} first match was against ${opponentName} on ${date}, finishing ${homeScore}-${awayScore}.`;
}
