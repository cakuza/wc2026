import type { ThirdPlaceRow } from "./thirdPlaceRanking";

export function getThirdPlaceLegendCopy(rows: ThirdPlaceRow[]): { primary: string; secondary: string; cutLineTied: boolean } {
  const cutLineTied = rows.some((row) => row.status === "boundary");
  if (cutLineTied) {
    return {
      cutLineTied,
      primary: "Current ordering is provisional. Teams tied on the available criteria cannot yet be separated at the qualification cut line.",
      secondary: "Definitive qualifying and outside positions will appear once the available tie-break criteria separate the teams.",
    };
  }

  return {
    cutLineTied,
    primary: "Top 8 third-placed teams are inside the current Round of 32 cut line.",
    secondary: "Rows below the cut line remain a current snapshot until all group matches are complete.",
  };
}
