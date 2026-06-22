import type { Metadata } from "next";
import Link from "next/link";
import { Flag } from "@/components/Flag";
import { LiveDataAutoRefresh } from "@/components/LiveDataAutoRefresh";
import { LiveSnapshotDebug } from "@/components/LiveSnapshotDebug";
import { LiveDataUnavailableNotice } from "@/components/LiveDataUnavailableNotice";
import { QuickAnswer } from "@/components/QuickAnswer";
import { LastUpdated } from "@/components/LastUpdated";
import { BreadcrumbNav, breadcrumbLd } from "@/components/BreadcrumbNav";
import { SourcesAndMethodology } from "@/components/SourcesAndMethodology";
import { getTournamentLiveSnapshot } from "@/lib/liveSnapshot";
import { getLiveRefreshPolicy } from "@/lib/liveRefreshPolicy";
import { GROUP_LETTERS, teamsInGroup, slugFor } from "@/lib/teams";
import { matchesInGroup } from "@/lib/matches";
import { countryName } from "@/lib/i18n";
import { TEAMS } from "@/lib/teams";

const BASE = "https://www.worldcupmatchday.com";

export const dynamic = "force-dynamic";
export const revalidate = 30;

export const metadata: Metadata = {
  title: "World Cup 2026 Qualified & Eliminated Teams — Live Tracker",
  description:
    "Track which teams have qualified for the Round of 32, which are still alive, and which have been eliminated from the 2026 FIFA World Cup.",
  alternates: { canonical: `${BASE}/qualified-eliminated-teams` },
  openGraph: {
    title: "World Cup 2026 Qualified & Eliminated Teams — Live Tracker",
    description:
      "Track qualified, still alive, and eliminated teams at the 2026 FIFA World Cup.",
    url: `${BASE}/qualified-eliminated-teams`,
    type: "website",
  },
};

type TeamStatus = "qualified" | "alive" | "eliminated" | "pending";

function teamCodeForKey(key: string): string {
  return TEAMS.find((t) => t.key === key)?.code ?? "un";
}

const breadcrumbs = [
  { label: "Home", href: "/" },
  { label: "Qualified & Eliminated Teams" },
];

export default async function QualifiedEliminatedPage() {
  const snapshot = await getTournamentLiveSnapshot();
  const refreshPolicy = getLiveRefreshPolicy(Object.values(snapshot.matches));

  type TeamEntry = {
    key: string;
    group: string;
    status: TeamStatus;
    points?: number;
    rank?: number;
  };

  const entries: TeamEntry[] = [];

  for (const letter of GROUP_LETTERS) {
    const standingsRows = snapshot.standingsByGroup[letter] ?? [];
    const groupMatches = matchesInGroup(letter);
    const matchesPlayed = standingsRows.reduce((sum, r) => sum + r.played, 0) / 2;
    const totalMatches = 6; // 6 matches per group

    // How many matches has each team played?
    for (const team of teamsInGroup(letter)) {
      const row = standingsRows.find((r) => r.teamKey === team.key);
      const teamMatchesPlayed = row?.played ?? 0;
      const rank = row ? standingsRows.indexOf(row) + 1 : 0;
      const points = row?.points ?? 0;

      let status: TeamStatus;

      if (snapshot.isFallback || matchesPlayed === 0) {
        status = "pending";
      } else if (teamMatchesPlayed === 3) {
        // All 3 group matches played — final standing is known
        if (rank <= 2) {
          status = "qualified";
        } else if (rank === 4) {
          status = "eliminated";
        } else {
          // 3rd place — may still qualify via best third; don't claim status without full table
          status = "alive";
        }
      } else if (teamMatchesPlayed < 3) {
        // Mathematical elimination check: if team cannot reach enough points
        // to catch 2nd place even with perfect remaining results, they're out.
        // We check if: max achievable points < current 2nd-place points
        const gamesLeft = 3 - teamMatchesPlayed;
        const maxAchievable = points + gamesLeft * 3;
        const secondPlacePoints = standingsRows[1]?.points ?? 0;
        if (secondPlacePoints > maxAchievable && row !== undefined) {
          status = "eliminated";
        } else {
          status = "alive";
        }
      } else {
        status = "alive";
      }

      entries.push({ key: team.key, group: letter, status, points, rank });
    }
  }

  const qualified = entries.filter((e) => e.status === "qualified");
  const alive = entries.filter((e) => e.status === "alive");
  const eliminated = entries.filter((e) => e.status === "eliminated");
  const pending = entries.filter((e) => e.status === "pending");

  const breadcrumbSchema = breadcrumbLd(breadcrumbs, BASE);

  function TeamCard({ entry }: { entry: TeamEntry }) {
    const name = countryName(entry.key, "en");
    const code = teamCodeForKey(entry.key);
    const slug = slugFor(entry.key);
    return (
      <Link
        href={`/teams/${slug}`}
        className="flex items-center gap-2 rounded-lg border border-white/10 bg-navyCard px-3 py-2 text-xs font-bold text-white/70 transition hover:border-white/30 hover:text-white"
      >
        <Flag code={code} width={26} height={18} />
        <div className="min-w-0">
          <p className="truncate font-bold text-white">{name}</p>
          <p className="text-[10px] text-white/40">Group {entry.group}</p>
        </div>
      </Link>
    );
  }

  function Section({
    title,
    color,
    badge,
    teams,
    empty,
  }: {
    title: string;
    color: string;
    badge: string;
    teams: TeamEntry[];
    empty: string;
  }) {
    return (
      <section className="mb-6">
        <div className="mb-2 flex items-center gap-2">
          <h2 className={`font-heading text-lg font-extrabold uppercase tracking-wide ${color}`}>
            {title}
          </h2>
          <span
            className={`rounded px-2 py-0.5 font-heading text-xs font-bold ${color} bg-current/10`}
          >
            {badge} ({teams.length})
          </span>
        </div>
        {teams.length > 0 ? (
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {teams.map((e) => (
              <TeamCard key={e.key} entry={e} />
            ))}
          </div>
        ) : (
          <p className="text-sm text-white/40">{empty}</p>
        )}
      </section>
    );
  }

  const totalKnownQualified = qualified.length;
  const maxPossibleQualified = 32; // 24 auto + 8 third-place

  return (
    <>
      <LiveDataAutoRefresh intervalMs={refreshPolicy.intervalMs} />
      <LiveSnapshotDebug snapshotId={snapshot.snapshotId} generatedAt={snapshot.generatedAt} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <div className="mx-auto max-w-3xl px-4 py-8">
        <BreadcrumbNav items={breadcrumbs} />

        <p className="mb-1 font-heading text-sm font-bold uppercase tracking-[0.3em] text-accent">
          World Cup 2026
        </p>
        <h1 className="mb-1 font-heading text-3xl font-extrabold uppercase tracking-wide text-white sm:text-4xl">
          Qualified &amp; Eliminated Teams
        </h1>
        <p className="mb-4 text-sm text-white/50">
          Live tracker — updates as group-stage results are confirmed.
        </p>

        {snapshot.isFallback && (
          <div className="mb-4">
            <LiveDataUnavailableNotice show />
          </div>
        )}

        {totalKnownQualified > 0 && (
          <QuickAnswer label="Qualification progress">
            {totalKnownQualified} team{totalKnownQualified !== 1 ? "s have" : " has"} confirmed a
            place in the Round of 32 so far. {eliminated.length > 0 ? `${eliminated.length} team${eliminated.length !== 1 ? "s are" : " is"} eliminated. ` : ""}
            Third-place qualification (8 best third-placed teams) is determined once all group
            matches are complete.
          </QuickAnswer>
        )}

        <Section
          title="Qualified"
          color="text-green-400"
          badge="Round of 32"
          teams={qualified}
          empty="No teams have confirmed qualification yet."
        />

        <Section
          title="Still Alive"
          color="text-amber-400"
          badge="Active"
          teams={alive}
          empty="No teams in this category yet."
        />

        <Section
          title="Eliminated"
          color="text-red-400"
          badge="Out"
          teams={eliminated}
          empty="No teams have been eliminated yet."
        />

        {pending.length > 0 && (
          <section className="mb-6">
            <h2 className="mb-2 font-heading text-lg font-extrabold uppercase tracking-wide text-white/40">
              Yet to Play ({pending.length})
            </h2>
            <p className="text-sm text-white/40">
              These teams&apos; group matches have not started. Status will be shown once play
              begins.
            </p>
          </section>
        )}

        <LastUpdated isoTimestamp={snapshot.updatedAt} label="Status last checked" />

        {/* Methodology */}
        <div className="mb-6 mt-4 rounded-xl border border-white/10 bg-navyCard px-4 py-4">
          <h2 className="mb-2 font-heading text-xs font-extrabold uppercase tracking-wide text-white/50">
            Methodology
          </h2>
          <ul className="space-y-1 text-xs leading-relaxed text-white/40">
            <li>
              <strong className="text-white/60">Qualified</strong> — finished 1st or 2nd in their
              group after all 3 group matches.
            </li>
            <li>
              <strong className="text-white/60">Mathematically eliminated</strong> — cannot reach
              enough points to finish in the top two, even with all remaining matches won.
            </li>
            <li>
              <strong className="text-white/60">Still alive</strong> — all other teams with
              remaining matches or unresolved third-place qualification.
            </li>
            <li>
              Third-placed teams are shown as &quot;Still alive&quot; until the full third-place
              ranking is resolved — see the{" "}
              <Link
                href="/world-cup-third-place-qualification"
                className="text-accent hover:underline"
              >
                Best Third-Place Teams table
              </Link>
              .
            </li>
            <li>
              Qualification is only claimed where mathematically certain from the available data.
              Displays &quot;Not yet determined&quot; where uncertainty remains.
            </li>
          </ul>
        </div>

        {/* Related links */}
        <div className="flex flex-wrap gap-3">
          {[
            { href: "/groups", label: "All Groups" },
            { href: "/world-cup-third-place-qualification", label: "Third-Place Table" },
            { href: "/stats/top-scorers", label: "Top Scorers" },
            { href: "/bracket", label: "Bracket" },
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

        <SourcesAndMethodology>
          <p>
            Qualification status is derived from live standings data. &quot;Mathematically
            eliminated&quot; is only asserted when a team cannot reach the required point total with
            their remaining matches — no speculative elimination is shown.
          </p>
          <p>WorldCupMatchDay is not affiliated with FIFA.</p>
        </SourcesAndMethodology>
      </div>
    </>
  );
}
