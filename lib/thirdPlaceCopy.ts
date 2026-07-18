import type { ThirdPlaceRow } from "./thirdPlaceRanking";

export function getThirdPlaceLegendCopy(rows: ThirdPlaceRow[]): { primary: string; secondary: string; cutLineTied: boolean } {
  const cutLineTied = rows.some((row) => row.status === "boundary");
  if (cutLineTied) {
    return {
      cutLineTied,
      primary: "Final third-place ranking preserved as tournament history. Teams tied on the available published criteria share a truthful tied position.",
      secondary: "The available record does not establish a further internal order for the tied teams.",
    };
  }

  return {
    cutLineTied,
    primary: "Qualified for the Round of 32: the eight highest-ranked third-placed teams in the final table.",
    secondary: "Did not qualify: the remaining third-placed teams in the final table, preserved as tournament history.",
  };
}
