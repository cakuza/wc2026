export type BracketSlot =
  | { kind: "group"; place: 1 | 2; group: string }
  | { kind: "third"; groups: string[] };

export type RoundOf32Match = {
  matchNumber: number;
  home: BracketSlot;
  away: BracketSlot;
};

export const ROUND_OF_32_MATCHES: RoundOf32Match[] = [
  { matchNumber: 73, home: { kind: "group", place: 2, group: "A" }, away: { kind: "group", place: 2, group: "B" } },
  { matchNumber: 74, home: { kind: "group", place: 1, group: "E" }, away: { kind: "third", groups: ["A", "B", "C", "D", "F"] } },
  { matchNumber: 75, home: { kind: "group", place: 1, group: "F" }, away: { kind: "group", place: 2, group: "C" } },
  { matchNumber: 76, home: { kind: "group", place: 1, group: "C" }, away: { kind: "group", place: 2, group: "F" } },
  { matchNumber: 77, home: { kind: "group", place: 1, group: "I" }, away: { kind: "third", groups: ["C", "D", "F", "G", "H"] } },
  { matchNumber: 78, home: { kind: "group", place: 2, group: "E" }, away: { kind: "group", place: 2, group: "I" } },
  { matchNumber: 79, home: { kind: "group", place: 1, group: "A" }, away: { kind: "third", groups: ["C", "E", "F", "H", "I"] } },
  { matchNumber: 80, home: { kind: "group", place: 1, group: "L" }, away: { kind: "third", groups: ["E", "H", "I", "J", "K"] } },
  { matchNumber: 81, home: { kind: "group", place: 1, group: "D" }, away: { kind: "third", groups: ["B", "E", "F", "I", "J"] } },
  { matchNumber: 82, home: { kind: "group", place: 1, group: "G" }, away: { kind: "third", groups: ["A", "E", "H", "I", "J"] } },
  { matchNumber: 83, home: { kind: "group", place: 2, group: "K" }, away: { kind: "group", place: 2, group: "L" } },
  { matchNumber: 84, home: { kind: "group", place: 1, group: "H" }, away: { kind: "group", place: 2, group: "J" } },
  { matchNumber: 85, home: { kind: "group", place: 1, group: "B" }, away: { kind: "third", groups: ["E", "F", "G", "I", "J"] } },
  { matchNumber: 86, home: { kind: "group", place: 1, group: "J" }, away: { kind: "group", place: 2, group: "H" } },
  { matchNumber: 87, home: { kind: "group", place: 1, group: "K" }, away: { kind: "third", groups: ["D", "E", "I", "J", "L"] } },
  { matchNumber: 88, home: { kind: "group", place: 2, group: "D" }, away: { kind: "group", place: 2, group: "G" } },
];

export const ROUND_OF_16_MATCHES = [
  { matchNumber: 89, homeWinnerOf: 74, awayWinnerOf: 77 },
  { matchNumber: 90, homeWinnerOf: 73, awayWinnerOf: 75 },
  { matchNumber: 91, homeWinnerOf: 76, awayWinnerOf: 78 },
  { matchNumber: 92, homeWinnerOf: 79, awayWinnerOf: 80 },
  { matchNumber: 93, homeWinnerOf: 83, awayWinnerOf: 84 },
  { matchNumber: 94, homeWinnerOf: 81, awayWinnerOf: 82 },
  { matchNumber: 95, homeWinnerOf: 86, awayWinnerOf: 88 },
  { matchNumber: 96, homeWinnerOf: 85, awayWinnerOf: 87 },
];

export const QUARTER_FINAL_MATCHES = [
  { matchNumber: 97,  homeWinnerOf: 89, awayWinnerOf: 90 },
  { matchNumber: 98,  homeWinnerOf: 93, awayWinnerOf: 94 },
  { matchNumber: 99,  homeWinnerOf: 91, awayWinnerOf: 92 },
  { matchNumber: 100, homeWinnerOf: 95, awayWinnerOf: 96 },
];

export const SEMI_FINAL_MATCHES = [
  { matchNumber: 101, homeWinnerOf: 97,  awayWinnerOf: 98  },
  { matchNumber: 102, homeWinnerOf: 99,  awayWinnerOf: 100 },
];

export const THIRD_PLACE_MATCH = { matchNumber: 103, homeLoserOf: 101, awayLoserOf: 102 };

export const FINAL_MATCH = { matchNumber: 104, homeWinnerOf: 101, awayWinnerOf: 102 };

export function slotLabel(slot: BracketSlot): string {
  if (slot.kind === "third") return `3rd ${slot.groups.join("/")}`;
  return `${slot.place}${slot.group}`;
}

export function pathSlotsForGroup(group: string) {
  const winner = ROUND_OF_32_MATCHES.find((match) =>
    [match.home, match.away].some((slot) => slot.kind === "group" && slot.place === 1 && slot.group === group),
  );
  const runnerUp = ROUND_OF_32_MATCHES.find((match) =>
    [match.home, match.away].some((slot) => slot.kind === "group" && slot.place === 2 && slot.group === group),
  );
  const third = ROUND_OF_32_MATCHES.filter((match) =>
    [match.home, match.away].some((slot) => slot.kind === "third" && slot.groups.includes(group)),
  );
  return { winner, runnerUp, third };
}
