"use client";

import { useLang } from "@/components/LanguageProvider";
import { Flag } from "@/components/Flag";
import { FINAL_MATCH, QUARTER_FINAL_MATCHES, ROUND_OF_16_MATCHES, ROUND_OF_32_MATCHES, SEMI_FINAL_MATCHES, THIRD_PLACE_MATCH, slotLabel } from "@/lib/knockoutBracket2026";
import { type Lang } from "@/lib/i18n";
import { MATCHES, matchUtcDate, type Match } from "@/lib/matches";
import { RESOLVED_PARTICIPANTS } from "@/lib/resolvedParticipants";
import { COMPLETED_KNOCKOUT_RESULTS } from "@/lib/canonicalMatchResults";
import { getParticipantDisplay, knockoutSlotLabel, isKnockoutMatch, type ResolvedParticipantLookup } from "@/lib/participant-resolution";
import { getTournamentPhaseLabel, type TournamentPhase } from "@/lib/matchCenterSelection";

// --- Layout constants ---
const CARD_H = 62;   // card height in px
const CARD_W = 160;  // card width in px
const CON_W  = 36;   // connector column width (px) — split 18px each side of vertical line
const R32_GAP = 8;   // gap between consecutive R32 cards (px)
const BASE_SLOT = CARD_H + R32_GAP; // 70 px per R32 slot

// slotH(r) = vertical space allocated per match in round r
function slotH(r: number) { return BASE_SLOT * Math.pow(2, r); }

// firstTop(r) = top position of first card in round r (in px, within the bracket canvas)
// Derived so each card in round r is visually centred between its two "parent" cards in round r-1.
function firstTop(r: number): number {
  if (r === 0) return 0;
  return firstTop(r - 1) + slotH(r - 1) / 2;
}

const NUM_ROUNDS = 4;                                   // R32 · R16 · QF · SF
const LABEL_H  = 28;                                    // height reserved for round label above bracket
const CANVAS_H = 16 * BASE_SLOT + LABEL_H;             // 16 R32 slots + label row
const BRACKET_W = NUM_ROUNDS * CARD_W + (NUM_ROUNDS - 1) * CON_W;
const DECIDING_X = BRACKET_W + 48;
const CANVAS_W = DECIDING_X + CARD_W;
const DECIDING_TOP = LABEL_H + firstTop(3) + 90;

// Horizontal left edge of each round column
function roundX(r: number) { return r * (CARD_W + CON_W); }

// --- Helpers ---

function matchDateStr(matchNumber: number): string | undefined {
  const m = MATCHES.find((x): x is Extract<typeof x, { matchNumber: number }> =>
    "matchNumber" in x && x.matchNumber === matchNumber
  );
  if (!m) return undefined;
  const d = new Date(`${m.date}T00:00:00`);
  const day = d.getDate();
  const month = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][d.getMonth()];
  return `${day} ${month}`;
}

// --- Bracket slot data ---
// flagCode: flagcdn 2-letter code, present only for resolved participants
type Slot = { label: string; flagCode?: string };
type BMatch = { id: string; dateLabel?: string; home: Slot; away: Slot; score?: { home: number; away: number; aet: boolean } };

// --- Sub-components ---

function ParticipantRow({ slot, isFinal }: { slot: Slot; isFinal: boolean }) {
  const cls = `font-heading font-bold uppercase ${isFinal ? "text-muted" : "text-faint"}`;
  if (slot.flagCode) {
    return (
      <div className="flex items-center gap-1.5 overflow-hidden">
        <Flag code={slot.flagCode} alt="" width={14} height={10} className="shrink-0 rounded-[2px]" />
        <span className={`truncate text-[11px] leading-none ${cls}`}>{slot.label}</span>
      </div>
    );
  }
  return (
    <div className={`overflow-hidden text-[8px] leading-snug ${cls}`}>{slot.label}</div>
  );
}

function MatchCard({ m, isFinal = false }: { m: BMatch; isFinal?: boolean }) {
  return (
    <div
      className={`overflow-hidden rounded-lg border ${
        isFinal
          ? "border-accent/50 bg-gradient-to-b from-accent/15 to-navy shadow-lg shadow-accent/10"
          : "border-line bg-surface"
      }`}
      style={{ width: CARD_W, height: CARD_H }}
    >
      <div className="flex h-full flex-col justify-center gap-1.5 px-3">
        <div className="flex items-center gap-1">
          <div className="min-w-0 flex-1"><ParticipantRow slot={m.home} isFinal={isFinal} /></div>
          {m.score ? <span className="font-heading text-[11px] font-extrabold tabular-nums text-ink">{m.score.home}</span> : null}
        </div>
        <div className="h-px bg-line" />
        <div className="flex items-center gap-1">
          <div className="min-w-0 flex-1"><ParticipantRow slot={m.away} isFinal={isFinal} /></div>
          {m.score ? <span className="font-heading text-[11px] font-extrabold tabular-nums text-ink">{m.score.away}</span> : null}
        </div>
        {m.score?.aet ? <span className="text-[8px] font-bold uppercase tracking-widest text-faint">AET</span> : null}
      </div>
    </div>
  );
}

const FINAL_DATE: Record<string, string> = {
  en: "19 July 2026",
  tr: "19 Temmuz 2026",
  es: "19 de julio de 2026",
  fr: "19 juillet 2026",
  de: "19. Juli 2026",
  pt: "19 de julho de 2026",
  ar: "19 يوليو 2026",
  ja: "2026年7月19日",
};

export function buildBracketMatchModel({
  match,
  isR32,
  resolvedParticipants,
  t,
  lang,
}: {
  match: any;
  isR32: boolean;
  resolvedParticipants?: ResolvedParticipantLookup;
  t: (key: string) => string;
  lang: Lang;
}): BMatch {
    const scheduleMatch = MATCHES.find((x): x is Match & { matchNumber: number } =>
      "matchNumber" in x && x.matchNumber === match.matchNumber
    );
    const homeDisplay = scheduleMatch ? getParticipantDisplay(scheduleMatch, "home", resolvedParticipants, lang) : null;
    const awayDisplay = scheduleMatch ? getParticipantDisplay(scheduleMatch, "away", resolvedParticipants, lang) : null;
    const resolved = resolvedParticipants?.[match.matchNumber] ?? RESOLVED_PARTICIPANTS[match.matchNumber];
    const result = COMPLETED_KNOCKOUT_RESULTS[match.matchNumber];
    return {
      id: `M${match.matchNumber}`,
      dateLabel: matchDateStr(match.matchNumber),
      home: {
        label: homeDisplay?.isResolved ? homeDisplay.label : (isR32 ? slotLabel(match.home) : (scheduleMatch && isKnockoutMatch(scheduleMatch) ? knockoutSlotLabel(scheduleMatch.homeSlot, lang, resolvedParticipants) : "TBD")),
        flagCode: homeDisplay?.teamCode ?? resolved?.home?.teamCode ?? undefined,
      },
      away: {
        label: awayDisplay?.isResolved ? awayDisplay.label : (isR32 ? slotLabel(match.away) : (scheduleMatch && isKnockoutMatch(scheduleMatch) ? knockoutSlotLabel(scheduleMatch.awaySlot, lang, resolvedParticipants) : "TBD")),
        flagCode: awayDisplay?.teamCode ?? resolved?.away?.teamCode ?? undefined,
      },
      ...(result ? { score: { home: result.homeScore, away: result.awayScore, aet: result.scoreDuration === "EXTRA_TIME" } } : {}),
    };
}

export function BracketContent({ resolvedParticipants, tournamentPhase }: { resolvedParticipants?: ResolvedParticipantLookup; tournamentPhase: TournamentPhase }) {
  const { t, lang } = useLang();

  const mapMatch = (match: any, isR32: boolean) =>
    buildBracketMatchModel({ match, isR32, resolvedParticipants, t, lang });

  const ROUND_MATCHES: BMatch[][] = [
    ROUND_OF_32_MATCHES.map((m) => mapMatch(m, true)),
    ROUND_OF_16_MATCHES.map((m) => mapMatch(m, false)),
    QUARTER_FINAL_MATCHES.map((m) => mapMatch(m, false)),
    SEMI_FINAL_MATCHES.map((m) => mapMatch(m, false)),
  ];

  const ROUND_LABELS = [
    t("bracket_r32"),
    t("bracket_r16"),
    t("bracket_qf"),
    t("bracket_sf"),
  ];
  const thirdPlaceModel = mapMatch(THIRD_PLACE_MATCH, false);
  const finalModel = mapMatch(FINAL_MATCH, false);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      {/* Page header */}
      <div className="mb-2 flex flex-wrap items-end justify-between gap-3">
        <h1 className="font-heading text-4xl font-extrabold uppercase tracking-wide text-ink">
          {t("bracket_title")}
        </h1>
        <span className="rounded-lg border border-accent/30 bg-accent/10 px-3 py-1.5 font-heading text-xs font-bold uppercase tracking-widest text-accentText">
          FIFA World Cup 2026
        </span>
      </div>
      <p className="mb-1 max-w-3xl text-sm text-faint">{t("bracket_intro")}</p>
      <p className="mb-6 text-sm text-faint">Current phase · {getTournamentPhaseLabel(tournamentPhase)}</p>

      {/* Scrollable bracket canvas */}
      <div className="overflow-x-auto rounded-xl border border-line bg-canvas p-5">
        <div
          className="relative"
          style={{ width: CANVAS_W, height: CANVAS_H }}
        >
          {ROUND_MATCHES.map((matches, ri) => {
            const rx = roundX(ri);
            const ft = firstTop(ri) + LABEL_H;
            const sh = slotH(ri);

            return (
              <div key={ri}>
                {/* Round label */}
                <div
                  className="absolute text-center"
                  style={{ left: rx, width: CARD_W, top: 0 }}
                >
                  <span className="font-heading text-[10px] font-bold uppercase tracking-widest text-faint">
                    {ROUND_LABELS[ri]}
                  </span>
                </div>

                {/* Match cards */}
                {matches.map((m, mi) => (
                  <div
                    key={m.id}
                    className="absolute"
                    style={{ left: rx, top: ft + mi * sh }}
                  >
                    {m.dateLabel && (
                      <div className="mb-1 font-heading text-[9px] font-bold uppercase tracking-widest text-faint">
                        {m.dateLabel}
                      </div>
                    )}
                    <MatchCard m={m} />
                  </div>
                ))}

                {/* Connector lines to next round */}
                {ri < NUM_ROUNDS - 1 &&
                  matches.map((_, mi) => {
                    if (mi % 2 !== 0) return null;

                    const topCenter = ft + mi * sh + CARD_H / 2;
                    const botCenter = ft + (mi + 1) * sh + CARD_H / 2;
                    const midY = (topCenter + botCenter) / 2;
                    const vertX = rx + CARD_W + CON_W / 2;

                    return (
                      <div key={`con-${ri}-${mi}`}>
                        {/* Horiz line from top match → vertical */}
                        <div
                          className="absolute bg-line"
                          style={{ left: rx + CARD_W, top: topCenter - 0.5, width: CON_W / 2, height: 1 }}
                        />
                        {/* Horiz line from bot match → vertical */}
                        <div
                          className="absolute bg-line"
                          style={{ left: rx + CARD_W, top: botCenter - 0.5, width: CON_W / 2, height: 1 }}
                        />
                        {/* Vertical connector */}
                        <div
                          className="absolute bg-line"
                          style={{ left: vertX - 0.5, top: topCenter, width: 1, height: botCenter - topCenter }}
                        />
                        {/* Horiz line from vertical → next round card */}
                        <div
                          className="absolute bg-line"
                          style={{ left: vertX, top: midY - 0.5, width: CON_W / 2, height: 1 }}
                        />
                      </div>
                    );
                  })}
              </div>
            );
          })}

          <aside
            className="absolute"
            style={{ left: DECIDING_X, top: 0, width: CARD_W }}
            aria-label="Deciding matches"
          >
            <p className="text-center font-heading text-[10px] font-bold uppercase tracking-widest text-faint">
              Deciding matches
            </p>
            <div className="absolute left-0" style={{ top: DECIDING_TOP }}>
              <p className="mb-2 font-heading text-[9px] font-bold uppercase tracking-widest text-faint">
                Third-place playoff
              </p>
              <MatchCard m={thirdPlaceModel} />
              <p className="mb-2 mt-10 font-heading text-[9px] font-bold uppercase tracking-widest text-accentText">
                {t("bracket_final")}
              </p>
              <MatchCard m={finalModel} isFinal />
              <p className="mt-3 text-[10px] leading-relaxed text-faint">
                {FINAL_DATE[lang] ?? FINAL_DATE.en}<br />New York New Jersey Stadium
              </p>
            </div>
          </aside>
        </div>
      </div>

      {/* Format note */}
      <div className="mt-4 rounded-xl border border-line bg-surface p-4 text-sm text-faint">
        <p className="mb-1 font-heading text-[10px] font-bold uppercase tracking-widest text-faint">{t("bracket_format_heading")}</p>
        <p>{t("bracket_format_text")}</p>
      </div>
    </div>
  );
}
