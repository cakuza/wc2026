import type { Metadata } from "next";
import Link from "next/link";
import { TeamsDirectory } from "@/components/TeamsDirectory";
import { TEAMS } from "@/lib/teams";
import { MATCHES } from "@/lib/matches";
import { getTournamentLiveSnapshot } from "@/lib/liveSnapshot";
import { buildKnockoutResolution } from "@/lib/knockoutResolution";
import { getTeamTournamentStatus, getTeamStatusLabel } from "@/lib/teamTournamentStatus";
import { getResolvedAwayTeam, getResolvedHomeTeam } from "@/lib/participant-resolution";

const BASE_URL = "https://www.worldcupmatchday.com";

export const metadata: Metadata = {
  title: "All World Cup 2026 Teams by Confederation",
  description:
    "See all 48 World Cup 2026 teams grouped by confederation, with links to team fixtures, groups and match pages.",
  alternates: { canonical: `${BASE_URL}/teams` },
  openGraph: {
    title: "All World Cup 2026 Teams by Confederation",
    description:
      "All 48 World Cup 2026 teams grouped by confederation, with links to each team's fixtures and group.",
    url: `${BASE_URL}/teams`,
    type: "website",
  },
};

export default async function TeamsPage() {
  const snapshot = await getTournamentLiveSnapshot();
  const resolvedParticipants = buildKnockoutResolution(snapshot.matches);
  const statuses = Object.fromEntries(TEAMS.map((team) => [team.key, getTeamTournamentStatus({ teamKey: team.key, matches: MATCHES, snapshotMatches: snapshot.matches, resolvedParticipants })]));
  const classifications = Object.fromEntries(Object.entries(statuses).map(([key, status]) => [key, status.classification]));

  const match104 = snapshot.matches["match-104"];
  const finalists: string[] = [];
  if (match104) {
    const finalHome = match104.match.homeKey !== "tbd" ? match104.match.homeKey : (getResolvedHomeTeam(match104.match, resolvedParticipants) ?? "tbd");
    const finalAway = match104.match.awayKey !== "tbd" ? match104.match.awayKey : (getResolvedAwayTeam(match104.match, resolvedParticipants) ?? "tbd");
    if (finalHome !== "tbd") finalists.push(finalHome);
    if (finalAway !== "tbd") finalists.push(finalAway);
  }
  const statusLabels = Object.fromEntries(TEAMS.map((team) => [team.key, getTeamStatusLabel(team.key, statuses[team.key], snapshot.matches, resolvedParticipants)]));
  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="mb-2 font-heading text-4xl font-extrabold uppercase tracking-wide text-white">
        All Teams
      </h1>
      <p className="mb-6 max-w-3xl text-sm text-white/55">
        Follow the remaining teams first, then explore every World Cup side by knockout status or confederation.
      </p>

      <TeamsDirectory classifications={classifications} finalists={finalists} statusLabels={statusLabels} />

      <div className="mt-8 flex flex-wrap gap-3 text-sm">
        {[
          { href: "/groups", label: "Groups" },
          { href: "/schedule", label: "Schedule" },
          { href: "/world-cup-2026-teams-by-confederation", label: "About the confederations" },
        ].map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className="rounded-lg border border-white/15 bg-navyCard px-4 py-2 font-heading text-xs font-bold uppercase tracking-wide text-white/70 transition hover:border-white/30 hover:text-white"
          >
            {l.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
