import type { Metadata } from "next";
import { getTournamentLiveSnapshot } from "@/lib/liveSnapshot";
import { StatsNav } from "@/components/StatsNav";
import { BreadcrumbNav, breadcrumbLd } from "@/components/BreadcrumbNav";
import { TeamCompareClient } from "./TeamCompareClient";
import { TEAMS } from "@/lib/teams";
import { countryName } from "@/lib/i18n";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "World Cup 2026 Team Compare - Head to Head Stats",
  description: "Compare team statistics head-to-head for the 2026 World Cup.",
  alternates: { canonical: "https://www.worldcupmatchday.com/stats/compare" },
};

const breadcrumbs = [
  { label: "Home", href: "/" },
  { label: "Stats", href: "/stats" },
  { label: "Compare" },
];

export default async function CompareStatsPage() {
  const snapshot = await getTournamentLiveSnapshot();
  const { teamStatLeaderboards } = snapshot;

  // We only want teams that are actually in the tournament
  const teamsList = TEAMS.map(t => ({
    key: t.key,
    name: countryName(t.key, "en") || t.key
  })).sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd(breadcrumbs, "https://www.worldcupmatchday.com")) }}
      />
      <BreadcrumbNav items={breadcrumbs} />

      <div className="mb-6 mt-4">
        <p className="font-heading text-sm font-bold uppercase tracking-[0.3em] text-accent">
          World Cup 2026
        </p>
        <h1 className="mt-1 font-heading text-3xl font-extrabold uppercase tracking-tight text-ink sm:text-4xl">
          Team Compare
        </h1>
        <p className="mt-2 max-w-3xl text-sm text-faint">
          Compare cumulative tournament statistics between any two teams.
        </p>
      </div>

      <StatsNav />

      <div className="max-w-4xl mx-auto">
        <TeamCompareClient
          teamsList={teamsList}
          teamStatLeaderboards={teamStatLeaderboards}
        />
      </div>
    </div>
  );
}
