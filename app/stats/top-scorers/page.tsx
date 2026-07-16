import type { Metadata } from "next";
import Link from "next/link";
import { LiveDataAutoRefresh } from "@/components/LiveDataAutoRefresh";
import { LiveSnapshotDebug } from "@/components/LiveSnapshotDebug";
import { LastUpdated } from "@/components/LastUpdated";
import { BreadcrumbNav, breadcrumbLd } from "@/components/BreadcrumbNav";
import { StatsNav } from "@/components/StatsNav";
import { TopScorersTable } from "@/components/TopScorersTable";
import { getTournamentLiveSnapshot } from "@/lib/liveSnapshot";
import { getLiveRefreshPolicy } from "@/lib/liveRefreshPolicy";
import { hasTrustedTopScorerData, topScorerRows } from "@/lib/topScorersPageData";

const BASE = "https://www.worldcupmatchday.com";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "World Cup 2026 Top Scorers — Golden Boot Standings",
  description: "Live World Cup 2026 Golden Boot standings. Track leading scorers, goals, penalties and team by team in the 2026 FIFA World Cup.",
  alternates: { canonical: `${BASE}/stats/top-scorers` },
  openGraph: { title: "World Cup 2026 Top Scorers — Golden Boot Standings", description: "Live World Cup 2026 Golden Boot standings. Track leading scorers, goals, penalties and team.", url: `${BASE}/stats/top-scorers`, type: "website" },
};

const breadcrumbs = [{ label: "Home", href: "/" }, { label: "Stats", href: "/stats" }, { label: "Top Scorers" }];

export default async function TopScorersPage() {
  const snapshot = await getTournamentLiveSnapshot();
  const topScorers = topScorerRows(snapshot.topScorers);
  const refreshPolicy = getLiveRefreshPolicy(Object.values(snapshot.matches));
  const hasData = hasTrustedTopScorerData(snapshot);
  const breadcrumbSchema = breadcrumbLd(breadcrumbs, BASE);
  const itemListLd = hasData ? {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "World Cup 2026 Top Scorers",
    description: "Leading goal scorers at the 2026 FIFA World Cup.",
    url: `${BASE}/stats/top-scorers`,
    numberOfItems: topScorers.length,
    itemListElement: topScorers.slice(0, 10).map((scorer) => ({ "@type": "ListItem", position: scorer.rank, name: scorer.playerName, description: `${scorer.goals} goal${scorer.goals !== 1 ? "s" : ""}${scorer.teamName ? ` — ${scorer.teamName}` : ""}` })),
  } : null;

  return <>
    <LiveDataAutoRefresh intervalMs={refreshPolicy.intervalMs} />
    <LiveSnapshotDebug snapshotId={snapshot.snapshotId} generatedAt={snapshot.generatedAt} />
    {breadcrumbSchema ? <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} /> : null}
    {itemListLd ? <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListLd) }} /> : null}
    <div className="mx-auto max-w-3xl px-4 py-8">
      <BreadcrumbNav items={breadcrumbs} />
      <p className="mb-1 font-heading text-sm font-bold uppercase tracking-[0.3em] text-accent">World Cup 2026</p>
      <h1 className="mb-1 font-heading text-3xl font-extrabold uppercase tracking-wide text-white sm:text-4xl">Top Scorers</h1>
      <p className="mb-2 text-sm text-white/50">Golden Boot standings.</p>
      <p className="mb-4 text-sm leading-relaxed text-white/60">The FIFA World Cup Golden Boot is awarded to the tournament&apos;s leading goal scorer. Every completed tournament match counts. Players tied on goals stay level here unless the available, complete tiebreak information separates them.</p>
      <StatsNav />
      {hasData ? <><TopScorersTable rows={topScorers} /><p className="-mt-3 mb-4 text-xs leading-relaxed text-white/45">Assist markers are provider-recorded event data, not official FIFA assist awards. An asterisk means the available assist or minutes coverage is incomplete and is not used to break a goals tie.</p><LastUpdated isoTimestamp={snapshot.updatedAt} label="Scorer data last synced" /></> : !snapshot.isFallback ? <div className="mb-6 rounded-xl border border-white/10 bg-navyCard px-4 py-4 text-sm text-white/50">No scorer data available yet. This table populates once enriched goal events from completed matches are synced.</div> : null}
      <div className="mt-6 flex flex-wrap gap-3">
        {[{ href: "/stats", label: "All Stats" }, { href: "/groups", label: "Group Standings" }, { href: "/world-cup-third-place-qualification", label: "Third-Place Table" }, { href: "/qualified-eliminated-teams", label: "Qualified Teams" }].map((link) => <Link key={link.href} href={link.href} className="rounded-lg border border-white/15 bg-navyCard px-4 py-2 font-heading text-xs font-bold uppercase tracking-wide text-white/70 transition hover:border-white/30 hover:text-white">{link.label}</Link>)}
      </div>
    </div>
  </>;
}
