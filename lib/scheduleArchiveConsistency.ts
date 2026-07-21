import { MATCHES } from "./matches";

export type ScheduleArchiveCounts = {
  live: number;
  syncing: number;
  upcoming: number;
  completed: number;
  total: number;
};

export function assertScheduleArchiveConsistency(
  isTournamentComplete: boolean,
  counts: ScheduleArchiveCounts,
): void {
  if (!isTournamentComplete) {
    return;
  }

  const totalMatches = counts.total || MATCHES.length;

  if (
    counts.live !== 0 ||
    counts.syncing !== 0 ||
    counts.upcoming !== 0 ||
    counts.completed !== totalMatches
  ) {
    throw new Error(
      `Schedule archive consistency invariant failure: isTournamentComplete is true, but match counts indicate incomplete state: ${JSON.stringify(
        counts,
      )}`,
    );
  }
}
