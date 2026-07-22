"use client";

import Link from "next/link";
import { useLang } from "@/components/LanguageProvider";
import { GROUP_LETTERS, teamsInGroup } from "@/lib/teams";
import { matchesInGroup } from "@/lib/matches";
import { StandingsTable } from "@/components/StandingsTable";
import { letterToGroupSlug } from "@/lib/groupSlug";
import type { StandingRow } from "@/lib/groupStandings";

type PreviewEntry = {
  teamKey: string;
  opponentKey: string;
  contextKey: "ctx_sets_the_tone" | "ctx_must_not_lose" | "ctx_is_crucial";
};

function groupPreviewEntries(group: string): PreviewEntry[] {
  return matchesInGroup(group)
    .slice(0, 2)
    .flatMap((match, index) => {
      const firstContext = index === 0 ? "ctx_sets_the_tone" : "ctx_must_not_lose";
      return [
        { teamKey: match.homeKey, opponentKey: match.awayKey, contextKey: firstContext },
        { teamKey: match.awayKey, opponentKey: match.homeKey, contextKey: "ctx_is_crucial" },
      ] satisfies PreviewEntry[];
    });
}

function buildPreviewLine(
  template: string,
  teamName: string,
  opponentName: string,
  context: string,
): string {
  return template
    .replace("{team}", teamName)
    .replace("{opponent}", opponentName)
    .replace("{context}", context);
}

interface GroupsContentProps {
  standings: Record<string, StandingRow[]>;
}

export function GroupsContent({ standings }: GroupsContentProps) {
  const { t, country } = useLang();

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="mb-2 font-heading text-4xl font-extrabold uppercase tracking-wide text-ink">Final Group Standings</h1>
      <p className="mb-6 max-w-3xl text-sm text-faint">The group stage is complete. Final positions and the tournament outcomes for all 48 teams are preserved here.</p>

      <div className="grid gap-5 lg:grid-cols-2">
        {GROUP_LETTERS.map((g) => {
          const teams = teamsInGroup(g);
          const previews = groupPreviewEntries(g);
          const rows = standings[g];
          return (
            <div
              key={g}
              className="overflow-hidden rounded-xl border border-line bg-surface"
            >
              {/* Group header */}
              <div className="flex items-center justify-between border-b-2 border-accent bg-canvas px-4 py-3">
                <span className="font-heading text-xl font-extrabold uppercase text-ink">
                  {t("lbl_group")} {g}
                </span>
                <Link
                  href={`/groups/${letterToGroupSlug(g)}`}
                  className="font-heading text-[10px] font-bold uppercase tracking-wide text-accent/70 hover:text-accent transition-colors"
                >
                  Full standings →
                </Link>
              </div>

              {/* Standings table — rows prop carries live data when available */}
              <StandingsTable teams={teams} rows={rows} />

              {/* Group preview (only while no match has been played in this group) */}
              {previews.length > 0 && (!rows || rows.every((r) => r.played === 0)) && (
                <div className="border-t border-line px-4 pb-4 pt-3">
                  <p className="mb-2 font-heading text-[10px] font-extrabold uppercase tracking-[0.25em] text-faint">
                    {t("group_preview_title")}
                  </p>
                  <ul className="space-y-1">
                    {previews.map((entry, i) => (
                      <li key={i} className="text-[12px] leading-snug text-faint">
                        {buildPreviewLine(
                          t("group_preview_template"),
                          country(entry.teamKey),
                          country(entry.opponentKey),
                          t(entry.contextKey),
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Standings sync note */}
      <section className="mt-6 rounded-xl border border-line bg-surface p-4 text-sm text-muted">
        <h2 className="font-heading text-sm font-extrabold uppercase tracking-wide text-ink">How qualification worked</h2>
        <p className="mt-2">The top two teams in each group advanced automatically, with the eight best third-placed teams completing the Round of 32 field. The table above is now historical rather than a live qualification projection.</p>
      </section>

      {/* Related links */}
      <div className="mt-4 flex flex-wrap gap-3 text-sm">
        {[
          { href: "/schedule", label: t("nav_schedule") },
          { href: "/bracket", label: t("nav_bracket") },
          { href: "/world-cup-third-place-qualification", label: "Third-Place Ranking" },
        ].map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className="rounded-lg border border-line bg-surface px-4 py-2 font-heading text-xs font-bold uppercase tracking-wide text-muted transition hover:border-lineStrong hover:text-ink"
          >
            {l.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
