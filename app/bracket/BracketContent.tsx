"use client";

import { useLang } from "@/components/LanguageProvider";

// WC 2026: 48 teams → 32 knockout teams (top 2 from each of 12 groups + 8 best 3rd-placed)
// Knockout bracket: R32 (16 matches) → R16 (8) → QF (4) → SF (2) → Final (1)

// --- Layout constants ---
const CARD_H = 58;   // card height in px
const CARD_W = 150;  // card width in px
const CON_W  = 36;   // connector column width (px) — split 18px each side of vertical line
const R32_GAP = 8;   // gap between consecutive R32 cards (px)
const BASE_SLOT = CARD_H + R32_GAP; // 66 px per R32 slot

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

// --- Bracket slot data ---
type Slot = { label: string };
type BMatch = { id: string; home: Slot; away: Slot };

// --- Sub-components ---

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
      <div className="flex h-full flex-col justify-center px-3">
        <div className={`truncate font-heading text-[11px] font-bold uppercase leading-none ${isFinal ? "text-white/60" : "text-white/35"}`}>
          {m.home.label}
        </div>
        <div className="my-1.5 h-px bg-white/10" />
        <div className={`truncate font-heading text-[11px] font-bold uppercase leading-none ${isFinal ? "text-white/60" : "text-white/35"}`}>
          {m.away.label}
        </div>
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

export function BracketContent() {
  const { t, lang } = useLang();

  const best3rd = t("bracket_3rd");
  const tbd     = t("bracket_tbd");

  const R32: BMatch[] = [
    { id: "R32-01", home: { label: "1A" },     away: { label: "2B" }     },
    { id: "R32-02", home: { label: "1B" },     away: { label: "2A" }     },
    { id: "R32-03", home: { label: "1C" },     away: { label: "2D" }     },
    { id: "R32-04", home: { label: "1D" },     away: { label: "2C" }     },
    { id: "R32-05", home: { label: "1E" },     away: { label: "2F" }     },
    { id: "R32-06", home: { label: "1F" },     away: { label: "2E" }     },
    { id: "R32-07", home: { label: best3rd },  away: { label: best3rd }  },
    { id: "R32-08", home: { label: best3rd },  away: { label: best3rd }  },
    { id: "R32-09", home: { label: "1G" },     away: { label: "2H" }     },
    { id: "R32-10", home: { label: "1H" },     away: { label: "2G" }     },
    { id: "R32-11", home: { label: "1I" },     away: { label: "2J" }     },
    { id: "R32-12", home: { label: "1J" },     away: { label: "2I" }     },
    { id: "R32-13", home: { label: "1K" },     away: { label: "2L" }     },
    { id: "R32-14", home: { label: "1L" },     away: { label: "2K" }     },
    { id: "R32-15", home: { label: best3rd },  away: { label: best3rd }  },
    { id: "R32-16", home: { label: best3rd },  away: { label: best3rd }  },
  ];

  const tbdMatch = (id: string): BMatch => ({ id, home: { label: tbd }, away: { label: tbd } });

  const ROUND_MATCHES: BMatch[][] = [
    R32,
    Array.from({ length: 8 }, (_, i) => tbdMatch(`r16-${i}`)),
    Array.from({ length: 4 }, (_, i) => tbdMatch(`qf-${i}`)),
    Array.from({ length: 2 }, (_, i) => tbdMatch(`sf-${i}`)),
    [tbdMatch("final")],
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

      {/* Legend — block-level items so text extractors see clear separation */}
      <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-[11px] text-white/55">
        <div><span className="font-bold text-white">1A</span> · {t("bracket_legend_1st")}</div>
        <div><span className="font-bold text-white">2B</span> · {t("bracket_legend_2nd")}</div>
        <div><span className="font-bold text-white">{t("bracket_3rd")}</span> · {t("bracket_legend_best3rd")}</div>
        <div><span className="font-bold text-white">{t("bracket_tbd")}</span> · {t("bracket_legend_tbd_desc")}</div>
      </div>

      {/* Final info */}
      <div className="mt-5 rounded-xl border border-accent/20 bg-accent/5 p-4 text-sm text-white/60">
        <span className="font-heading text-xs font-bold uppercase tracking-widest text-accent">{t("bracket_final")}</span>
        <p className="mt-1">MetLife Stadium · East Rutherford, NJ · <strong className="text-white/80">{FINAL_DATE[lang] ?? FINAL_DATE["en"]}</strong></p>
      </div>

      {/* Format note */}
      <div className="mt-4 rounded-xl border border-white/10 bg-navyCard p-4 text-sm text-white/50">
        <p className="mb-1 font-heading text-[10px] font-bold uppercase tracking-widest text-white/50">{t("bracket_format_heading")}</p>
        <p>{t("bracket_format_text")}</p>
      </div>
    </div>
  );
}
