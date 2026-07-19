import type { LiveMatchEvent } from "./liveMatchData";
import type { GoalEventCompleteness } from "./goalEventCompleteness";

/** Natural-language result summary derived from the canonical match presentation state. */
export function formatCanonicalResultSummary({
  homeName,
  awayName,
  homeScore,
  awayScore,
  scoreDuration,
  winner,
  penaltyShootoutScore,
}: {
  homeName: string;
  awayName: string;
  homeScore: number | null;
  awayScore: number | null;
  scoreDuration?: string | null;
  winner?: "HOME_TEAM" | "AWAY_TEAM" | "DRAW" | null;
  penaltyShootoutScore?: { home: number | null; away: number | null } | null;
}): string {
  if (homeScore === null || awayScore === null) return "";

  const homeWon = winner === "HOME_TEAM" || (winner !== "AWAY_TEAM" && homeScore > awayScore);
  const awayWon = winner === "AWAY_TEAM" || (winner !== "HOME_TEAM" && awayScore > homeScore);
  const winnerName = homeWon ? homeName : awayWon ? awayName : null;
  const loserName = homeWon ? awayName : awayWon ? homeName : null;
  const winnerScore = homeWon ? homeScore : awayScore;
  const loserScore = homeWon ? awayScore : homeScore;

  if (scoreDuration === "PENALTY_SHOOTOUT") {
    const penalties = penaltyShootoutScore?.home !== null && penaltyShootoutScore?.home !== undefined && penaltyShootoutScore?.away !== null && penaltyShootoutScore?.away !== undefined
      ? ` ${penaltyShootoutScore.home}-${penaltyShootoutScore.away} on penalties`
      : " on penalties";
    return `${homeName} and ${awayName} drew ${homeScore}–${awayScore}; ${winnerName ?? "The winner"} advanced${penalties}`;
  }
  if (scoreDuration === "EXTRA_TIME" && winnerName && loserName) {
    return `${winnerName} won after extra time, ${winnerScore}–${loserScore} against ${loserName}`;
  }
  if (winnerName && loserName) return `${winnerName} beat ${loserName} ${winnerScore}–${loserScore}`;
  return `${homeName} and ${awayName} drew ${homeScore}–${awayScore}`;
}

function ordinal(n: number) {
  const suffix = n % 10 === 1 && n % 100 !== 11 ? "st" : n % 10 === 2 && n % 100 !== 12 ? "nd" : n % 10 === 3 && n % 100 !== 13 ? "rd" : "th";
  return `${n}${suffix}`;
}

function normalizeTeamName(name: string | null | undefined): string {
  return (name ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

function minutePhrase(goal: LiveMatchEvent) {
  if (goal.minute != null) {
    if (typeof goal.stoppageTime === "number" && goal.stoppageTime > 0) {
      return ` at ${goal.minute}+${goal.stoppageTime}'`;
    }
    return ` in the ${ordinal(goal.minute)} minute`;
  }
  return "";
}

function neutralScorerSentence(goals: LiveMatchEvent[]) {
  const parts = goals.map((goal) => {
    const team = goal.teamName ? ` for ${goal.teamName}` : "";
    if (goal.type === "OWN_GOAL" || goal.isOwnGoal) {
      return `${goal.playerName} own goal counted${team}${minutePhrase(goal)}`;
    }
    return `${goal.playerName} scored${team}${minutePhrase(goal)}`;
  });
  if (parts.length === 1) return `${parts[0]}.`;
  return `${parts.slice(0, -1).join(", ")}, and ${parts[parts.length - 1]}.`;
}

export function buildScorerSentence(
  goals: LiveMatchEvent[] | undefined,
  homeName?: string,
  awayName?: string,
  completeness?: GoalEventCompleteness,
) {
  if (completeness && !completeness.isGoalEventDataComplete) return null;
  if (!goals || goals.length === 0) return null;
  const usable = goals
    .filter((goal) => goal.playerName)
    .sort((a, b) => (a.minute ?? 999) - (b.minute ?? 999) || (a.stoppageTime ?? 0) - (b.stoppageTime ?? 0));
  if (usable.length === 0) return null;

  const homeKey = normalizeTeamName(homeName);
  const awayKey = normalizeTeamName(awayName);
  if (!homeKey || !awayKey) return neutralScorerSentence(usable);

  let homeGoals = 0;
  let awayGoals = 0;
  const clauses: string[] = [];
  const playerGoalCounts = new Map<string, number>();
  for (const goal of usable) {
    if (goal.type === "OWN_GOAL" || goal.isOwnGoal || !goal.playerName) continue;
    playerGoalCounts.set(goal.playerName, (playerGoalCounts.get(goal.playerName) ?? 0) + 1);
  }
  const summarizedBrace = new Set<string>();

  for (let i = 0; i < usable.length; i++) {
    const goal = usable[i];
    const teamKey = normalizeTeamName(goal.teamName);
    const isHome = teamKey === homeKey;
    const isAway = teamKey === awayKey;
    if (!isHome && !isAway) return neutralScorerSentence(usable);

    const beforeHome = homeGoals;
    const beforeAway = awayGoals;
    if (isHome) homeGoals++;
    if (isAway) awayGoals++;

    const teamName = isHome ? homeName : awayName;
    const wasLevel = beforeHome === beforeAway;
    const isLevel = homeGoals === awayGoals;
    const scorerNowLeads = isHome ? homeGoals > awayGoals : awayGoals > homeGoals;
    const scorerWasBehind = isHome ? beforeHome < beforeAway : beforeAway < beforeHome;
    const ownGoal = goal.type === "OWN_GOAL" || goal.isOwnGoal;
    const playerName = goal.playerName ?? "";
    const playerGoals = playerGoalCounts.get(playerName) ?? 0;
    const finalHome = usable.filter((g) => normalizeTeamName(g.teamName) === homeKey).length;
    const finalAway = usable.filter((g) => normalizeTeamName(g.teamName) === awayKey).length;
    const winnerName = finalHome > finalAway ? homeName : finalAway > finalHome ? awayName : null;
    const winnerKey = finalHome > finalAway ? homeKey : finalAway > finalHome ? awayKey : "";
    const isWinnerGoal = teamKey === winnerKey;
    const finalScore = finalHome > finalAway ? `${finalHome}–${finalAway}` : `${finalAway}–${finalHome}`;

    if (ownGoal && wasLevel && scorerNowLeads) {
      const early = goal.minute != null && goal.minute <= 15 ? "An early " : "";
      clauses.push(`${early}${playerName} own goal gave ${teamName} the lead${minutePhrase(goal)}`);
    } else if (!ownGoal && playerGoals > 1 && !summarizedBrace.has(playerName)) {
      summarizedBrace.add(playerName);
      if (playerGoals === 2) {
        clauses.push(`${playerName} scored twice`);
      } else if (playerGoals === 3) {
        clauses.push(`${playerName} scored a hat-trick`);
      } else {
        clauses.push(`${playerName} scored ${playerGoals} goals`);
      }
    } else if (!ownGoal && playerGoals > 1 && summarizedBrace.has(playerName)) {
      continue;
    } else if (
      !ownGoal &&
      i === usable.length - 1 &&
      winnerName &&
      isWinnerGoal &&
      ((isHome && beforeHome > beforeAway) || (isAway && beforeAway > beforeHome))
    ) {
      clauses.push(`${playerName} completed the ${finalScore} win${minutePhrase(goal)}`);
    } else if (!ownGoal && scorerWasBehind && !isLevel) {
      clauses.push(`${playerName} pulled one back for ${teamName}${minutePhrase(goal)}`);
    } else if (wasLevel && scorerNowLeads) {
      clauses.push(`${playerName} put ${teamName} ahead${minutePhrase(goal)}`);
    } else if (scorerWasBehind && isLevel) {
      clauses.push(`${playerName} equalized for ${teamName}${minutePhrase(goal)}`);
    } else {
      clauses.push(`${playerName} scored for ${teamName}${minutePhrase(goal)}`);
    }
  }

  if (clauses.length === 1) return `${clauses[0]}.`;
  if (clauses.length === 2) return `${clauses[0]} before ${clauses[1]}.`;
  return `${clauses.slice(0, -1).join(", ")}, and ${clauses[clauses.length - 1]}.`;
}
