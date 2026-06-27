import type { GoalScorerEvent } from "./worldcup26Provider";

type VerifiedGoalCorrection = {
  note: string;
  events: GoalScorerEvent[];
};

const VERIFIED_GOAL_CORRECTIONS: Record<string, VerifiedGoalCorrection> = {
  "turkey-vs-united-states-jun25": {
    note: "Verified: worldcup26.ir returns 'Baris Alpr Ailmaz' and 'Kan Aihan' due to Persian transliteration. Correct scorers confirmed: Trusty 3', Güler 10', Yılmaz 31', Berhalter 49', Ayhan 90+8'.",
    events: [
      {
        type: "GOAL",
        minute: 3,
        minuteLabel: "3'",
        teamName: "United States",
        playerTeamName: "United States",
        playerName: "Auston Trusty",
        isOwnGoal: false,
        isPenalty: false,
        provider: "worldcup26.ir",
        confidence: "high",
      },
      {
        type: "GOAL",
        minute: 10,
        minuteLabel: "10'",
        teamName: "Turkey",
        playerTeamName: "Turkey",
        playerName: "Arda Güler",
        isOwnGoal: false,
        isPenalty: false,
        provider: "worldcup26.ir",
        confidence: "high",
      },
      {
        type: "GOAL",
        minute: 31,
        minuteLabel: "31'",
        teamName: "Turkey",
        playerTeamName: "Turkey",
        playerName: "Barış Alper Yılmaz",
        isOwnGoal: false,
        isPenalty: false,
        provider: "worldcup26.ir",
        confidence: "high",
      },
      {
        type: "GOAL",
        minute: 49,
        minuteLabel: "49'",
        teamName: "United States",
        playerTeamName: "United States",
        playerName: "Sebastian Berhalter",
        isOwnGoal: false,
        isPenalty: false,
        provider: "worldcup26.ir",
        confidence: "high",
      },
      {
        type: "GOAL",
        minute: 90,
        stoppageTime: 8,
        minuteLabel: "90+8'",
        teamName: "Turkey",
        playerTeamName: "Turkey",
        playerName: "Kaan Ayhan",
        isOwnGoal: false,
        isPenalty: false,
        provider: "worldcup26.ir",
        confidence: "high",
      },
    ],
  },
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
  // ── Own-goal attribution corrections ────────────────────────────────────
  // Each match below had ≥1 own goal that the provider either mislabelled
  // (wrong player name via Persian transliteration) or failed to flag as OG
  // (isOwnGoal omitted / false when it must be true). A full replacement is
  // used so every surface sees the authoritative event set in one place.

  "tunisia-vs-netherlands-jun25": {
    note: "Verified: 3' Ellyes Skhiri (Tunisia) scores OG benefiting Netherlands; provider shows 'Alis Skhiri' without OG flag. 54' Hazem Mastouri (Tunisia) — provider 'Hazm Mstvri'. 62' Jan van Hecke (Netherlands) — provider 'Ian Fn Hkh'. All corrections per Sky Sports / FOX Sports match report 2026-06-25.",
    events: [
      {
        type: "GOAL",
        minute: 3,
        minuteLabel: "3'",
        teamName: "Netherlands",
        playerTeamName: "Tunisia",
        playerName: "Ellyes Skhiri",
        isOwnGoal: true,
        isPenalty: false,
        provider: "worldcup26.ir",
        confidence: "high",
      },
      {
        type: "GOAL",
        minute: 7,
        minuteLabel: "7'",
        teamName: "Netherlands",
        playerTeamName: "Netherlands",
        playerName: "Brian Brobbey",
        isOwnGoal: false,
        isPenalty: false,
        provider: "worldcup26.ir",
        confidence: "high",
      },
      {
        type: "GOAL",
        minute: 54,
        minuteLabel: "54'",
        teamName: "Tunisia",
        playerTeamName: "Tunisia",
        playerName: "Hazem Mastouri",
        isOwnGoal: false,
        isPenalty: false,
        provider: "worldcup26.ir",
        confidence: "high",
      },
      {
        type: "GOAL",
        minute: 62,
        minuteLabel: "62'",
        teamName: "Netherlands",
        playerTeamName: "Netherlands",
        playerName: "Jan van Hecke",
        isOwnGoal: false,
        isPenalty: false,
        provider: "worldcup26.ir",
        confidence: "high",
      },
    ],
  },

  "united-states-vs-australia-jun19": {
    note: "Verified: 11' Cameron Burgess (Australia defender) scores OG benefiting USA; provider shows 'Kamrvn Bargs' without OG flag, listed as USA player. 43' Alex Freeman (USA). Corrections per NBC Sports / FIFA match report 2026-06-19.",
    events: [
      {
        type: "GOAL",
        minute: 11,
        minuteLabel: "11'",
        teamName: "United States",
        playerTeamName: "Australia",
        playerName: "Cameron Burgess",
        isOwnGoal: true,
        isPenalty: false,
        provider: "worldcup26.ir",
        confidence: "high",
      },
      {
        type: "GOAL",
        minute: 43,
        minuteLabel: "43'",
        teamName: "United States",
        playerTeamName: "United States",
        playerName: "Alex Freeman",
        isOwnGoal: false,
        isPenalty: false,
        provider: "worldcup26.ir",
        confidence: "high",
      },
    ],
  },

  "spain-vs-saudi-arabia-jun21": {
    note: "Verified: 49' Hassan Altambakti (Saudi Arabia defender) scores OG benefiting Spain; provider shows 'Hassan Mohamed Altmbkti' without OG flag. Other Spain goals unaffected by corruption but included for completeness. Corrections per FIFA match report / ESPN 2026-06-21.",
    events: [
      {
        type: "GOAL",
        minute: 10,
        minuteLabel: "10'",
        teamName: "Spain",
        playerTeamName: "Spain",
        playerName: "Lamine Yamal",
        isOwnGoal: false,
        isPenalty: false,
        provider: "worldcup26.ir",
        confidence: "high",
      },
      {
        type: "GOAL",
        minute: 21,
        minuteLabel: "21'",
        teamName: "Spain",
        playerTeamName: "Spain",
        playerName: "Mikel Oyarzabal",
        isOwnGoal: false,
        isPenalty: false,
        provider: "worldcup26.ir",
        confidence: "high",
      },
      {
        type: "GOAL",
        minute: 24,
        minuteLabel: "24'",
        teamName: "Spain",
        playerTeamName: "Spain",
        playerName: "Mikel Oyarzabal",
        isOwnGoal: false,
        isPenalty: false,
        provider: "worldcup26.ir",
        confidence: "high",
      },
      {
        type: "GOAL",
        minute: 49,
        minuteLabel: "49'",
        teamName: "Spain",
        playerTeamName: "Saudi Arabia",
        playerName: "Hassan Altambakti",
        isOwnGoal: true,
        isPenalty: false,
        provider: "worldcup26.ir",
        confidence: "high",
      },
    ],
  },

  "bosnia-vs-qatar-jun24": {
    note: "Verified: 29' Kerim Alajbegović (Bosnia) — provider 'Karim Alaibgvvich'. 34' Sultan Al-Brake (Qatar defender) scores OG benefiting Bosnia — provider 'Abvnad' (Mahmoud Abunada GK) without OG flag; FIFA/ESPN credit Sultan Al-Brake. 42' Hassan Al-Haydos (Qatar). 80' Ermin Mahmić (Bosnia) — provider 'Armin Mhmich'. Corrections per FIFA match report / FOX Sports / Sky Sports 2026-06-24.",
    events: [
      {
        type: "GOAL",
        minute: 29,
        minuteLabel: "29'",
        teamName: "Bosnia & Herzegovina",
        playerTeamName: "Bosnia & Herzegovina",
        playerName: "Kerim Alajbegović",
        isOwnGoal: false,
        isPenalty: false,
        provider: "worldcup26.ir",
        confidence: "high",
      },
      {
        type: "GOAL",
        minute: 34,
        minuteLabel: "34'",
        teamName: "Bosnia & Herzegovina",
        playerTeamName: "Qatar",
        playerName: "Sultan Al-Brake",
        isOwnGoal: true,
        isPenalty: false,
        provider: "worldcup26.ir",
        confidence: "high",
      },
      {
        type: "GOAL",
        minute: 42,
        minuteLabel: "42'",
        teamName: "Qatar",
        playerTeamName: "Qatar",
        playerName: "Hassan Al-Haydos",
        isOwnGoal: false,
        isPenalty: false,
        provider: "worldcup26.ir",
        confidence: "high",
      },
      {
        type: "GOAL",
        minute: 80,
        minuteLabel: "80'",
        teamName: "Bosnia & Herzegovina",
        playerTeamName: "Bosnia & Herzegovina",
        playerName: "Ermin Mahmić",
        isOwnGoal: false,
        isPenalty: false,
        provider: "worldcup26.ir",
        confidence: "high",
      },
    ],
  },

  "portugal-vs-uzbekistan-jun23": {
    note: "Verified: 60' Abduvohid Nematov (Uzbekistan GK) scores OG benefiting Portugal — provider 'Abdalvhid Namtvf' without OG flag. Other Portugal goals are unaffected by corruption but included for completeness. Corrections per FIFA match report / tapmad.com / ESPN 2026-06-23.",
    events: [
      {
        type: "GOAL",
        minute: 6,
        minuteLabel: "6'",
        teamName: "Portugal",
        playerTeamName: "Portugal",
        playerName: "Cristiano Ronaldo",
        isOwnGoal: false,
        isPenalty: true,
        provider: "worldcup26.ir",
        confidence: "high",
      },
      {
        type: "GOAL",
        minute: 17,
        minuteLabel: "17'",
        teamName: "Portugal",
        playerTeamName: "Portugal",
        playerName: "Nuno Mendes",
        isOwnGoal: false,
        isPenalty: false,
        provider: "worldcup26.ir",
        confidence: "high",
      },
      {
        type: "GOAL",
        minute: 39,
        minuteLabel: "39'",
        teamName: "Portugal",
        playerTeamName: "Portugal",
        playerName: "Cristiano Ronaldo",
        isOwnGoal: false,
        isPenalty: false,
        provider: "worldcup26.ir",
        confidence: "high",
      },
      {
        type: "GOAL",
        minute: 60,
        minuteLabel: "60'",
        teamName: "Portugal",
        playerTeamName: "Uzbekistan",
        playerName: "Abduvohid Nematov",
        isOwnGoal: true,
        isPenalty: false,
        provider: "worldcup26.ir",
        confidence: "high",
      },
      {
        type: "GOAL",
        minute: 87,
        minuteLabel: "87'",
        teamName: "Portugal",
        playerTeamName: "Portugal",
        playerName: "Rafael Leão",
        isOwnGoal: false,
        isPenalty: false,
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
