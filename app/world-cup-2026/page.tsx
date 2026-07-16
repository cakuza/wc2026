import type { Metadata } from "next";
import Link from "next/link";
import { Flag } from "@/components/Flag";
import { BreadcrumbNav, breadcrumbLd } from "@/components/BreadcrumbNav";
import { getTournamentLiveSnapshot } from "@/lib/liveSnapshot";
import { buildKnockoutResolution } from "@/lib/knockoutResolution";
import { getArchiveState } from "@/lib/archiveLifecycle";
import { getParticipantDisplay } from "@/lib/participant-resolution";
import { matchSlug, MATCHES, ARCHIVE_DEFAULT_DATE, TOURNAMENT_FINAL_DATE } from "@/lib/matches";
import { websiteSchema } from "@/lib/schema";

const BASE = "https://www.worldcupmatchday.com";
const now = new Date(ARCHIVE_DEFAULT_DATE);

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const snapshot = await getTournamentLiveSnapshot();
  const resolvedParticipants = buildKnockoutResolution(snapshot.matches);
  const archive = getArchiveState({ matches: MATCHES, liveData: snapshot.liveDataByProviderId, resolvedParticipants, now });

  const title = archive.isComplete
    ? `2026 World Cup Archive: ${archive.champion} Win, Results, Stats & Full Bracket`
    : "2026 World Cup Archive: Final Weekend, Results & Stats";
  const description = archive.isComplete
    ? `${archive.champion} won the 2026 FIFA World Cup, beating ${archive.runnerUp} ${archive.finalResult?.homeScore}-${archive.finalResult?.awayScore} in the final. ${archive.thirdPlace} finished third. Full results, bracket, stats and teams.`
    : "The 2026 FIFA World Cup archive hub: full results, bracket, statistics, teams and groups as the tournament reaches its final weekend.";

  return {
    title,
    description,
    alternates: { canonical: `${BASE}/world-cup-2026` },
    openGraph: { title, description, url: `${BASE}/world-cup-2026`, type: "website" },
  };
}

const breadcrumbs = [{ label: "Home", href: "/" }, { label: "2026 World Cup" }];

export default async function WorldCup2026Page() {
  const snapshot = await getTournamentLiveSnapshot();
  const resolvedParticipants = buildKnockoutResolution(snapshot.matches);
  const archive = getArchiveState({ matches: MATCHES, liveData: snapshot.liveDataByProviderId, resolvedParticipants, now });
  const stats = snapshot.tournamentStats;
  const topScorer = snapshot.topScorers[0] ?? null;

  const collectionLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: archive.isComplete ? `2026 World Cup Archive: ${archive.champion} Winner` : "2026 World Cup Archive",
    url: `${BASE}/world-cup-2026`,
    description: archive.isComplete
      ? `${archive.champion} won the 2026 FIFA World Cup. Complete archive of results, bracket, statistics and teams.`
      : "The 2026 FIFA World Cup archive hub, updated through the final weekend of the tournament.",
    dateModified: snapshot.generatedAt,
  };

  const finalists = archive.finalResult
    ? [
        { label: archive.finalResult.homeLabel, code: getParticipantDisplay(archive.finalResult.match, "home", resolvedParticipants, "en").teamCode },
        { label: archive.finalResult.awayLabel, code: getParticipantDisplay(archive.finalResult.match, "away", resolvedParticipants, "en").teamCode },
      ]
    : [];

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd(breadcrumbs, BASE)) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema()) }} />
      <BreadcrumbNav items={breadcrumbs} />

      <p className="mb-1 font-heading text-sm font-bold uppercase tracking-[0.3em] text-accent">FIFA World Cup 2026</p>
      <h1 className="mb-2 font-heading text-4xl font-extrabold uppercase tracking-wide text-white sm:text-5xl">
        {archive.isComplete ? "2026 World Cup Archive" : "2026 World Cup: Final Weekend"}
      </h1>
      <p className="mb-6 max-w-2xl text-sm leading-relaxed text-white/60">
        11 June – 19 July 2026, hosted across the United States, Mexico and Canada.
        {archive.isComplete
          ? " The tournament is complete. This page is the permanent archive of what happened."
          : " The tournament is reaching its conclusion — this page will become the permanent tournament archive once the Final is complete."}
      </p>

      {archive.isComplete && archive.finalResult ? (
        <section className="mb-8 rounded-xl border border-accent/40 bg-gradient-to-b from-accent/10 to-navyCard p-6">
          <p className="mb-3 font-heading text-[11px] font-bold uppercase tracking-widest text-accent">Champion</p>
          <div className="mb-4 flex flex-wrap items-center gap-4">
            {finalists.map((f, i) => (
              <div key={f.label} className={`flex items-center gap-2 ${i === 0 ? "font-extrabold text-white" : "text-white/60"}`}>
                {f.code && <Flag code={f.code} alt="" width={32} height={22} />}
                <span className="font-heading text-lg uppercase tracking-wide">{f.label}</span>
              </div>
            ))}
          </div>
          <p className="mb-1 text-2xl font-extrabold text-white">
            {archive.finalResult.homeLabel} {archive.finalResult.homeScore}–{archive.finalResult.awayScore} {archive.finalResult.awayLabel}
          </p>
          <p className="text-sm text-white/60">
            <Link href={`/matches/${matchSlug(archive.finalResult.match)}`} className="underline decoration-white/30 underline-offset-2 hover:text-white">
              Full Final match report →
            </Link>
          </p>
          {archive.thirdPlaceResult && (
            <p className="mt-3 text-sm text-white/60">
              Third place: <span className="font-bold text-white">{archive.thirdPlace}</span> beat {archive.fourthPlace}{" "}
              {archive.thirdPlaceResult.homeScore}–{archive.thirdPlaceResult.awayScore} in the{" "}
              <Link href={`/matches/${matchSlug(archive.thirdPlaceResult.match)}`} className="underline decoration-white/30 underline-offset-2 hover:text-white">
                Third-place playoff
              </Link>.
            </p>
          )}
        </section>
      ) : (
        <section className="mb-8 rounded-xl border border-white/10 bg-navyCard p-6">
          <p className="mb-2 font-heading text-[11px] font-bold uppercase tracking-widest text-white/40">Tournament at a glance</p>
          <p className="text-sm text-white/60">
            The Third-place playoff and Final remain to be played. Follow live results on the{" "}
            <Link href="/today" className="underline decoration-white/30 underline-offset-2 hover:text-white">Match Center</Link>{" "}
            or the{" "}
            <Link href="/bracket" className="underline decoration-white/30 underline-offset-2 hover:text-white">complete bracket</Link>.
          </p>
        </section>
      )}

      <section className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "Matches played", value: stats.matchesPlayed },
          { label: "Total goals", value: stats.totalGoals },
          { label: "Goals per match", value: stats.averageGoalsPerMatch },
          { label: "Clean sheets", value: stats.cleanSheets },
        ].map((tile) => (
          <div key={tile.label} className="rounded-lg border border-white/10 bg-navy px-4 py-3 text-center">
            <p className="font-heading text-2xl font-extrabold text-white">{tile.value}</p>
            <p className="mt-1 text-[11px] uppercase tracking-widest text-white/40">{tile.label}</p>
          </div>
        ))}
      </section>

      {topScorer && (
        <p className="mb-8 text-sm text-white/60">
          Golden Boot leader: <span className="font-bold text-white">{topScorer.playerName}</span>
          {topScorer.teamName ? ` (${topScorer.teamName})` : ""} with {topScorer.goals} goal{topScorer.goals !== 1 ? "s" : ""}. See the{" "}
          <Link href="/stats/top-scorers" className="underline decoration-white/30 underline-offset-2 hover:text-white">full Top Scorers table</Link>.
        </p>
      )}

      <section className="mb-8">
        <h2 className="mb-3 font-heading text-lg font-bold uppercase tracking-wide text-white">Explore the archive</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {[
            { href: "/world-cup-2026/results", label: "Full Results", desc: "Every match, every score" },
            { href: "/bracket", label: "Complete Bracket", desc: "Full knockout path" },
            { href: "/stats", label: "Final Statistics", desc: "Goals, scorers, records" },
            { href: "/teams", label: "Teams", desc: "All 48 nations" },
            { href: "/groups", label: "Groups", desc: "Final group standings" },
            { href: "/schedule", label: "Schedule", desc: "Full match calendar" },
          ].map((link) => (
            <Link key={link.href} href={link.href} className="rounded-lg border border-white/10 bg-navyCard p-4 transition hover:border-white/25">
              <p className="font-heading text-sm font-bold uppercase tracking-wide text-white">{link.label}</p>
              <p className="mt-1 text-xs text-white/50">{link.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      <p className="text-xs text-white/40">Tournament window: 11 June – {TOURNAMENT_FINAL_DATE}.</p>
    </div>
  );
}
