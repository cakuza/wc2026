"use client";

import { useLang } from "@/components/LanguageProvider";
import { GROUP_LETTERS, teamsInGroup } from "@/lib/teams";
import { matchesInGroup } from "@/lib/matches";
import { StandingsTable } from "@/components/StandingsTable";

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

/** Fill {team}, {opponent}, {context} placeholders in the translated template. */
function buildPreviewLine(
  template: string,
  teamName: string,
  opponentName: string,
  context: string
): string {
  return template
    .replace("{team}", teamName)
    .replace("{opponent}", opponentName)
    .replace("{context}", context);
}

export default function GroupsPage() {
  const { t, country } = useLang();

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="mb-6 font-heading text-4xl font-extrabold uppercase tracking-wide text-white">
        {t("groups_title")}
      </h1>

      <div className="grid gap-5 lg:grid-cols-2">
        {GROUP_LETTERS.map((g) => {
          const teams = teamsInGroup(g);
          const previews = groupPreviewEntries(g);
          return (
            <div
              key={g}
              className="overflow-hidden rounded-xl border border-white/10 bg-navyCard"
            >
              {/* Group header */}
              <div className="flex items-center justify-between border-b-2 border-accent bg-navy px-4 py-3">
                <span className="font-heading text-xl font-extrabold uppercase text-white">
                  {t("lbl_group")} {g}
                </span>
              </div>

              {/* Premium standings table + qualification legend */}
              <StandingsTable teams={teams} showQualInfo />

              {/* Group preview */}
              {previews.length > 0 && (
                <div className="border-t border-white/8 px-4 pb-4 pt-3">
                  <p className="mb-2 font-heading text-[10px] font-extrabold uppercase tracking-[0.25em] text-white/25">
                    {t("group_preview_title")}
                  </p>
                  <ul className="space-y-1">
                    {previews.map((entry, i) => (
                      <li key={i} className="text-[12px] leading-snug text-white/50">
                        {buildPreviewLine(
                          t("group_preview_template"),
                          country(entry.teamKey),
                          country(entry.opponentKey),
                          t(entry.contextKey)
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
    </div>
  );
}
