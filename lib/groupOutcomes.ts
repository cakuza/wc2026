import type { StandingRow } from "./groupStandings";
import { type TeamClassification } from "./teamTournamentStatus";

export function resolveGroupOutcome(
  rank: number,
  classification: TeamClassification,
  allGroupMatchesFinished: boolean
): string | null {
  if (!allGroupMatchesFinished) {
    return null;
  }

  const advanced = classification === "ACTIVE_KNOCKOUT" || classification === "ELIMINATED_KNOCKOUT";

  if (advanced) {
    if (rank === 1) return "Advanced as group winner";
    if (rank === 2) return "Advanced as runner-up";
    if (rank === 3) return "Advanced as a third-place qualifier";
    // Failsafe if data is weird, though normally rank 4 can't advance
    return "Advanced"; 
  }

  if (classification === "ELIMINATED_GROUP_STAGE" || !advanced) {
    return "Eliminated in the group stage";
  }

  return null;
}
