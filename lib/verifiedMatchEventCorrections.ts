import type { GoalScorerEvent } from "./worldcup26Provider";

type VerifiedGoalCorrection = {
  note: string;
  events: GoalScorerEvent[];
};

const VERIFIED_GOAL_CORRECTIONS: Record<string, VerifiedGoalCorrection> = {
  "canada-vs-bosnia-jun12": {
    note: "Verified provider correction: worldcup26.ir has C. Larin at 11'; verified event is Cyle Larin at 78'.",
    events: [
      {
        type: "GOAL",
        minute: 21,
        teamName: "Bosnia & Herzegovina",
        playerName: "Jovo Lukić",
        provider: "worldcup26.ir",
        confidence: "high",
      },
      {
        type: "GOAL",
        minute: 78,
        teamName: "Canada",
        playerName: "Cyle Larin",
        provider: "worldcup26.ir",
        confidence: "high",
      },
    ],
  },
  "united-states-vs-paraguay-jun12": {
    note: "Verified provider correction: preserve complete USA-Paraguay goal list with own-goal and stoppage-time metadata.",
    events: [
      {
        type: "GOAL",
        minute: 7,
        minuteLabel: "7'",
        teamName: "United States",
        playerTeamName: "Paraguay",
        playerName: "Damian Bobadilla",
        isOwnGoal: true,
        provider: "worldcup26.ir",
        confidence: "high",
      },
      {
        type: "GOAL",
        minute: 31,
        minuteLabel: "31'",
        teamName: "United States",
        playerTeamName: "United States",
        playerName: "Folarin Balogun",
        isOwnGoal: false,
        provider: "worldcup26.ir",
        confidence: "high",
      },
      {
        type: "GOAL",
        minute: 45,
        stoppageTime: 5,
        minuteLabel: "45+5'",
        teamName: "United States",
        playerTeamName: "United States",
        playerName: "Folarin Balogun",
        isOwnGoal: false,
        provider: "worldcup26.ir",
        confidence: "high",
      },
      {
        type: "GOAL",
        minute: 73,
        minuteLabel: "73'",
        teamName: "Paraguay",
        playerTeamName: "Paraguay",
        playerName: "Maurício",
        isOwnGoal: false,
        provider: "worldcup26.ir",
        confidence: "high",
      },
      {
        type: "GOAL",
        minute: 90,
        stoppageTime: 8,
        minuteLabel: "90+8'",
        teamName: "United States",
        playerTeamName: "United States",
        playerName: "Giovanni Reyna",
        isOwnGoal: false,
        provider: "worldcup26.ir",
        confidence: "high",
      },
    ],
  },
};

function scorerKey(event: GoalScorerEvent): string {
  return `${event.teamName.toLowerCase()}|${event.minute ?? ""}|${event.stoppageTime ?? ""}|${event.playerName.toLowerCase()}|${event.isOwnGoal ? "og" : ""}`;
}

export function applyVerifiedGoalCorrections(
  internalMatchId: string,
  providerEvents: GoalScorerEvent[],
): GoalScorerEvent[] {
  const correction = VERIFIED_GOAL_CORRECTIONS[internalMatchId];
  if (!correction) return providerEvents;

  const merged = [...correction.events];
  const seen = new Set<string>();

  return merged
    .filter((event) => {
      const key = scorerKey(event);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .sort((a, b) => (a.minute ?? 999) - (b.minute ?? 999) || (a.stoppageTime ?? 0) - (b.stoppageTime ?? 0));
}

export function getVerifiedGoalCorrectionNote(internalMatchId: string): string | null {
  return VERIFIED_GOAL_CORRECTIONS[internalMatchId]?.note ?? null;
}
