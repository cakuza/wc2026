"use client";

import { useCallback, useEffect, useState } from "react";
import { TRIVIA } from "@/lib/trivia";
import { TRIVIA_T } from "@/lib/i18n";
import { useLang } from "@/components/LanguageProvider";

const CATEGORY_STYLES: Record<string, string> = {
  "2026":       "border-accent/40 bg-accent/15 text-accent",
  records:      "border-purple-500/40 bg-purple-500/15 text-purple-300",
  history:      "border-blue-400/40 bg-blue-400/15 text-blue-300",
  players:      "border-yellow-400/40 bg-yellow-400/15 text-yellow-300",
  trophy:       "border-amber-400/40 bg-amber-400/15 text-amber-300",
  hosts:        "border-green-500/40 bg-green-500/15 text-green-300",
  format:       "border-indigo-400/40 bg-indigo-400/15 text-indigo-300",
  goalkeepers:  "border-teal-400/40 bg-teal-400/15 text-teal-300",
  managers:     "border-rose-400/40 bg-rose-400/15 text-rose-300",
};

function pickRandom(exclude = -1): number {
  let idx: number;
  do {
    idx = Math.floor(Math.random() * TRIVIA.length);
  } while (idx === exclude && TRIVIA.length > 1);
  return idx;
}

export function TriviaCard() {
  const { t, lang } = useLang();
  const [idx, setIdx] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);

  const advance = useCallback((currentIdx = -1) => {
    setIdx(pickRandom(currentIdx));
    setRevealed(false);
  }, []);

  // Pick on mount (client-only to avoid hydration mismatch)
  useEffect(() => { advance(); }, [advance]);

  // Auto-rotate every 30 s (resets when the user manually advances)
  useEffect(() => {
    if (idx === null) return;
    const timer = setInterval(() => advance(idx), 30_000);
    return () => clearInterval(timer);
  }, [idx, advance]);

  if (idx === null) return null;

  const rawCard = TRIVIA[idx];
  const translation = TRIVIA_T[rawCard.id]?.[lang];
  const card = translation
    ? { ...rawCard, teaser: translation.teaser, reveal: translation.reveal }
    : rawCard;
  const catStyle = CATEGORY_STYLES[card.category] ?? "border-white/20 bg-white/10 text-white/60";
  const difficultyLabel: Record<string, string> = {
    easy: t("trivia_easy"),
    medium: t("trivia_medium"),
    hard: t("trivia_hard"),
  };

  return (
    <section className="border-y border-white/10 bg-navyCard">
      <div className="mx-auto max-w-7xl px-4 pt-8 pb-4">
        {/* Section header */}
        <div className="mb-5 flex items-center justify-between">
          <h2 className="font-heading text-lg font-extrabold uppercase tracking-wide text-white">
            {t("trivia_title")}
          </h2>
          <span className="font-heading text-xs font-bold uppercase tracking-widest text-white/50">
            {t("trivia_autorotate")}
          </span>
        </div>

        <div className="relative overflow-hidden rounded-xl border border-white/10 bg-navy p-6 shadow-lg sm:p-7">
          {/* Subtle accent glow */}
          <div
            className="pointer-events-none absolute inset-0 opacity-30"
            style={{
              backgroundImage:
                "radial-gradient(50% 80% at 90% 10%, rgba(232,0,28,0.18), transparent 70%)"
            }}
          />

          <div className="relative">
            {/* Badges row */}
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <span className={`rounded-full border px-2.5 py-0.5 font-heading text-[10px] font-extrabold uppercase tracking-widest ${catStyle}`}>
                {card.category}
              </span>
              <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 font-heading text-[10px] font-bold uppercase tracking-widest text-white/40">
                {difficultyLabel[card.difficulty] ?? card.difficulty}
              </span>
              <span className="ms-auto font-heading text-[10px] font-bold uppercase tracking-widest text-white/45">
                {idx + 1} / {TRIVIA.length}
              </span>
            </div>

            {/* Teaser */}
            <p className="text-lg font-semibold leading-snug text-white sm:text-xl">
              {card.teaser}
            </p>

            {/* Reveal answer */}
            {revealed && (
              <div className="mt-4 rounded-lg border border-accent/20 bg-accent/10 px-4 py-3">
                <p className="text-sm font-medium leading-relaxed text-white/85">{card.reveal}</p>
              </div>
            )}

            {/* Actions */}
            <div className="mt-5 flex flex-wrap items-center gap-3">
              {!revealed ? (
                <button
                  type="button"
                  onClick={() => setRevealed(true)}
                  className="rounded-lg bg-accent px-5 py-2.5 font-heading text-sm font-extrabold uppercase tracking-wide text-white transition hover:bg-accent/85 active:scale-95"
                >
                  {t("trivia_reveal")}
                </button>
              ) : null}
              <button
                type="button"
                onClick={() => advance(idx)}
                className="rounded-lg border border-white/10 bg-white/5 px-5 py-2.5 font-heading text-sm font-bold uppercase tracking-wide text-white/60 transition hover:bg-white/10 hover:text-white active:scale-95"
              >
                {t("trivia_next_card")}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
