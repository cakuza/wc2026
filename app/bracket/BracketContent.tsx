"use client";

import { useLang } from "@/components/LanguageProvider";
import { Flag } from "@/components/Flag";
import { FINAL_MATCH, QUARTER_FINAL_MATCHES, ROUND_OF_16_MATCHES, ROUND_OF_32_MATCHES, SEMI_FINAL_MATCHES, slotLabel } from "@/lib/knockoutBracket2026";
import { countryName, type Lang } from "@/lib/i18n";
import { MATCHES } from "@/lib/matches";
import { resolvedHome, resolvedAway, RESOLVED_PARTICIPANTS } from "@/lib/resolvedParticipants";
import type { ResolvedParticipantLookup } from "@/lib/participant-resolution";

// WC 2026: 48 teams → 32 knockout teams (top 2 from each of 12 groups + 8 best 3rd-placed)
// Knockout bracket: R32 (16 matches) → R16 (8) → QF (4) → SF (2) → Final (1)

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

const NUM_ROUNDS = 5;                                   // R32 · R16 · QF · SF · Final
const LABEL_H  = 28;                                    // height reserved for round label above bracket
const CANVAS_H = 16 * BASE_SLOT + LABEL_H;             // 16 R32 slots + label row
const CANVAS_W = NUM_ROUNDS * CARD_W + (NUM_ROUNDS - 1) * CON_W; // total canvas width

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

function slotWinnerLabel(
  sourceMatchNum: number,
  t: (key: string) => string,
  lang: Lang
): string {
  if (sourceMatchNum >= 73 && sourceMatchNum <= 88) {
    const hp = resolvedHome(sourceMatchNum);
    const ap = resolvedAway(sourceMatchNum);
    if (hp && ap) {
      return `${t("bracket_winner_of")} ${countryName(hp.teamKey, lang)} vs ${countryName(ap.teamKey, lang)}`;
    }
  }
  if (sourceMatchNum >= 89 && sourceMatchNum <= 96) return t("bracket_r16_winner");
  if (sourceMatchNum >= 97 && sourceMatchNum <= 100) return t("bracket_qf_winner");
  return t("bracket_sf_winner");
}

// --- Bracket slot data ---
// flagCode: flagcdn 2-letter code, present only for resolved participants
type Slot = { label: string; flagCode?: string };
type BMatch = { id: string; dateLabel?: string; home: Slot; away: Slot };

// --- Sub-components ---

function ParticipantRow({ slot, isFinal }: { slot: Slot; isFinal: boolean }) {
  const cls = `font-heading font-bold uppercase ${isFinal ? "text-white/60" : "text-white/40"}`;
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
          : "border-white/10 bg-navyCard"
      }`}
      style={{ width: CARD_W, height: CARD_H }}
    >
      <div className="flex h-full flex-col justify-center gap-1.5 px-3">
        <ParticipantRow slot={m.home} isFinal={isFinal} />
        <div className="h-px bg-white/10" />
        <ParticipantRow slot={m.away} isFinal={isFinal} />
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

function labelForResolved(side: { teamKey: string } | undefined, fallback: string, lang: Parameters<typeof countryName>[1]): string {
  return side ? countryName(side.teamKey, lang) : fallback;
}

export function BracketContent({ resolvedParticipants }: { resolvedParticipants?: ResolvedParticipantLookup }) {
  const { t, lang } = useLang();

  const mapMatch = (match: any, isR32: boolean) => {
    const resolved = resolvedParticipants?.[match.matchNumber] ?? RESOLVED_PARTICIPANTS[match.matchNumber];
    return {
      id: `M${match.matchNumber}`,
      dateLabel: matchDateStr(match.matchNumber),
      home: {
        label: resolved?.home ? countryName(resolved.home.teamKey, lang) : (isR32 ? slotLabel(match.home) : slotWinnerLabel(match.homeWinnerOf, t, lang)),
        flagCode: resolved?.home?.teamCode ?? undefined,
      },
      away: {
        label: resolved?.away ? countryName(resolved.away.teamKey, lang) : (isR32 ? slotLabel(match.away) : slotWinnerLabel(match.awayWinnerOf, t, lang)),
        flagCode: resolved?.away?.teamCode ?? undefined,
      },
    };
  };

  const ROUND_MATCHES: BMatch[][] = [
    ROUND_OF_32_MATCHES.map((m) => mapMatch(m, true)),
    ROUND_OF_16_MATCHES.map((m) => mapMatch(m, false)),
    QUARTER_FINAL_MATCHES.map((m) => mapMatch(m, false)),
    SEMI_FINAL_MATCHES.map((m) => mapMatch(m, false)),
    [mapMatch(FINAL_MATCH, false)],
  ];

  const ROUND_LABELS = [
    t("bracket_r32"),
    t("bracket_r16"),
    t("bracket_qf"),
    t("bracket_sf"),
    t("bracket_final"),
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      {/* Page header */}
      <div className="mb-2 flex flex-wrap items-end justify-between gap-3">
        <h1 className="font-heading text-4xl font-extrabold uppercase tracking-wide text-white">
          {t("bracket_title")}
        </h1>
        <span className="rounded-lg border border-accent/30 bg-accent/10 px-3 py-1.5 font-heading text-xs font-bold uppercase tracking-widest text-accent">
          FIFA World Cup 2026
        </span>
      </div>
      <p className="mb-1 max-w-3xl text-sm text-white/50">{t("bracket_intro")}</p>
      <p className="mb-6 text-sm text-white/40">{t("bracket_note")}</p>

      {/* Scrollable bracket canvas */}
      <div className="overflow-x-auto rounded-xl border border-white/10 bg-navy p-5">
        <div
          className="relative"
          style={{ width: CANVAS_W, height: CANVAS_H }}
        >
          {ROUND_MATCHES.map((matches, ri) => {
            const isFinal = ri === NUM_ROUNDS - 1;
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
                  <span className={`font-heading text-[10px] font-bold uppercase tracking-widest ${isFinal ? "text-accent" : "text-white/50"}`}>
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
                      <div className="mb-1 font-heading text-[9px] font-bold uppercase tracking-widest text-white/25">
                        {m.dateLabel}
                      </div>
                    )}
                    <MatchCard m={m} isFinal={isFinal} />
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
                          className="absolute bg-white/15"
                          style={{ left: rx + CARD_W, top: topCenter - 0.5, width: CON_W / 2, height: 1 }}
                        />
                        {/* Horiz line from bot match → vertical */}
                        <div
                          className="absolute bg-white/15"
                          style={{ left: rx + CARD_W, top: botCenter - 0.5, width: CON_W / 2, height: 1 }}
                        />
                        {/* Vertical connector */}
                        <div
                          className="absolute bg-white/15"
                          style={{ left: vertX - 0.5, top: topCenter, width: 1, height: botCenter - topCenter }}
                        />
                        {/* Horiz line from vertical → next round card */}
                        <div
                          className="absolute bg-white/15"
                          style={{ left: vertX, top: midY - 0.5, width: CON_W / 2, height: 1 }}
                        />
                      </div>
                    );
                  })}
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-[11px] text-white/55">
        <div><span className="font-bold text-white">{t("bracket_3rd")}</span> · {t("bracket_legend_best3rd")}</div>
      </div>

      {/* Final info */}
      <div className="mt-5 rounded-xl border border-accent/20 bg-accent/5 p-4 text-sm text-white/60">
        <span className="font-heading text-xs font-bold uppercase tracking-widest text-accent">{t("bracket_final")}</span>
        <p className="mt-1">New York New Jersey Stadium (MetLife Stadium) · East Rutherford, NJ · <strong className="text-white/80">{FINAL_DATE[lang] ?? FINAL_DATE["en"]}</strong></p>
      </div>

      {/* Format note */}
      <div className="mt-4 rounded-xl border border-white/10 bg-navyCard p-4 text-sm text-white/50">
        <p className="mb-1 font-heading text-[10px] font-bold uppercase tracking-widest text-white/50">{t("bracket_format_heading")}</p>
        <p>{t("bracket_format_text")}</p>
      </div>
    </div>
  );
}
