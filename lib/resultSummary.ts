import type { LiveMatchEvent } from "./liveMatchData";
import type { GoalEventCompleteness } from "./goalEventCompleteness";

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
  return goal.minute != null ? ` in the ${ordinal(goal.minute)} minute` : "";
}

function isStoppageTime(goal: LiveMatchEvent) {
  return typeof goal.stoppageTime === "number" && goal.stoppageTime > 0;
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
    const finalScore = `${finalHome}–${finalAway}`;

    if (ownGoal && wasLevel && scorerNowLeads) {
      const early = goal.minute != null && goal.minute <= 15 ? "An early " : "";
      clauses.push(`${early}${playerName} own goal gave ${teamName} the lead${minutePhrase(goal)}`);
    } else if (!ownGoal && playerGoals > 1 && !summarizedBrace.has(playerName)) {
      summarizedBrace.add(playerName);
      clauses.push(`${playerName} scored twice`);
    } else if (!ownGoal && playerGoals > 1 && summarizedBrace.has(playerName)) {
      continue;
    } else if (
      !ownGoal &&
      i === usable.length - 1 &&
      winnerName &&
      isWinnerGoal &&
      ((isHome && beforeHome > beforeAway) || (isAway && beforeAway > beforeHome))
    ) {
      clauses.push(`${playerName} completed the ${finalScore} win${isStoppageTime(goal) ? " in stoppage time" : minutePhrase(goal)}`);
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
