"use client";

import { useLang } from "@/components/LanguageProvider";
import { GROUP_LETTERS, teamsInGroup } from "@/lib/teams";
import { StandingsTable } from "@/components/StandingsTable";

// Structured MD1 preview data — one entry per team per group.
// teamKey / opponentKey must match COUNTRIES keys in lib/i18n.ts.
// contextKey must be one of: "ctx_sets_the_tone" | "ctx_must_not_lose" | "ctx_is_crucial"
type PreviewEntry = {
  teamKey: string;
  opponentKey: string;
  contextKey: "ctx_sets_the_tone" | "ctx_must_not_lose" | "ctx_is_crucial";
};

const GROUP_PREVIEWS: Record<string, PreviewEntry[]> = {
  A: [
    { teamKey: "mexico",      opponentKey: "southAfrica",  contextKey: "ctx_sets_the_tone" },
    { teamKey: "southAfrica", opponentKey: "mexico",       contextKey: "ctx_is_crucial" },
    { teamKey: "southKorea",  opponentKey: "czechia",      contextKey: "ctx_must_not_lose" },
    { teamKey: "czechia",     opponentKey: "southKorea",   contextKey: "ctx_sets_the_tone" },
  ],
  B: [
    { teamKey: "canada",      opponentKey: "bosnia",       contextKey: "ctx_sets_the_tone" },
    { teamKey: "bosnia",      opponentKey: "canada",       contextKey: "ctx_is_crucial" },
    { teamKey: "morocco",     opponentKey: "switzerland",  contextKey: "ctx_sets_the_tone" },
    { teamKey: "switzerland", opponentKey: "morocco",      contextKey: "ctx_sets_the_tone" },
  ],
  C: [
    { teamKey: "brazil",   opponentKey: "uruguay",   contextKey: "ctx_sets_the_tone" },
    { teamKey: "uruguay",  opponentKey: "brazil",    contextKey: "ctx_is_crucial" },
    { teamKey: "colombia", opponentKey: "serbia",    contextKey: "ctx_must_not_lose" },
    { teamKey: "serbia",   opponentKey: "colombia",  contextKey: "ctx_is_crucial" },
  ],
  D: [
    { teamKey: "unitedStates", opponentKey: "paraguay",     contextKey: "ctx_sets_the_tone" },
    { teamKey: "paraguay",     opponentKey: "unitedStates",  contextKey: "ctx_is_crucial" },
    { teamKey: "turkey",       opponentKey: "australia",    contextKey: "ctx_sets_the_tone" },
    { teamKey: "australia",    opponentKey: "turkey",       contextKey: "ctx_is_crucial" },
  ],
  E: [
    { teamKey: "germany", opponentKey: "curacao",  contextKey: "ctx_sets_the_tone" },
    { teamKey: "curacao", opponentKey: "germany",  contextKey: "ctx_is_crucial" },
    { teamKey: "belgium", opponentKey: "denmark",  contextKey: "ctx_is_crucial" },
    { teamKey: "denmark", opponentKey: "belgium",  contextKey: "ctx_must_not_lose" },
  ],
  F: [
    { teamKey: "netherlands", opponentKey: "scotland",    contextKey: "ctx_sets_the_tone" },
    { teamKey: "scotland",    opponentKey: "netherlands",  contextKey: "ctx_is_crucial" },
    { teamKey: "norway",      opponentKey: "egypt",        contextKey: "ctx_must_not_lose" },
    { teamKey: "egypt",       opponentKey: "norway",       contextKey: "ctx_is_crucial" },
  ],
  G: [
    { teamKey: "japan",    opponentKey: "cameroon", contextKey: "ctx_sets_the_tone" },
    { teamKey: "cameroon", opponentKey: "japan",    contextKey: "ctx_must_not_lose" },
    { teamKey: "nigeria",  opponentKey: "ecuador",  contextKey: "ctx_is_crucial" },
    { teamKey: "ecuador",  opponentKey: "nigeria",  contextKey: "ctx_sets_the_tone" },
  ],
  H: [
    { teamKey: "spain",      opponentKey: "capeVerde",   contextKey: "ctx_sets_the_tone" },
    { teamKey: "capeVerde",  opponentKey: "spain",       contextKey: "ctx_is_crucial" },
    { teamKey: "ivoryCoast", opponentKey: "iran",        contextKey: "ctx_must_not_lose" },
    { teamKey: "iran",       opponentKey: "ivoryCoast",  contextKey: "ctx_is_crucial" },
  ],
  I: [
    { teamKey: "france",      opponentKey: "senegal",      contextKey: "ctx_sets_the_tone" },
    { teamKey: "senegal",     opponentKey: "france",       contextKey: "ctx_is_crucial" },
    { teamKey: "saudiArabia", opponentKey: "qatar",        contextKey: "ctx_is_crucial" },
    { teamKey: "qatar",       opponentKey: "saudiArabia",  contextKey: "ctx_must_not_lose" },
  ],
  J: [
    { teamKey: "argentina",  opponentKey: "algeria",     contextKey: "ctx_sets_the_tone" },
    { teamKey: "algeria",    opponentKey: "argentina",   contextKey: "ctx_is_crucial" },
    { teamKey: "uzbekistan", opponentKey: "newZealand",  contextKey: "ctx_must_not_lose" },
    { teamKey: "newZealand", opponentKey: "uzbekistan",  contextKey: "ctx_sets_the_tone" },
  ],
  K: [
    { teamKey: "portugal", opponentKey: "drCongo",  contextKey: "ctx_sets_the_tone" },
    { teamKey: "drCongo",  opponentKey: "portugal", contextKey: "ctx_is_crucial" },
    { teamKey: "panama",   opponentKey: "jamaica",  contextKey: "ctx_sets_the_tone" },
    { teamKey: "jamaica",  opponentKey: "panama",   contextKey: "ctx_sets_the_tone" },
  ],
  L: [
    { teamKey: "england", opponentKey: "croatia", contextKey: "ctx_sets_the_tone" },
    { teamKey: "croatia", opponentKey: "england", contextKey: "ctx_is_crucial" },
    { teamKey: "tunisia", opponentKey: "ukraine", contextKey: "ctx_sets_the_tone" },
    { teamKey: "ukraine", opponentKey: "tunisia", contextKey: "ctx_must_not_lose" },
  ],
};

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
          const previews = GROUP_PREVIEWS[g] ?? [];
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
