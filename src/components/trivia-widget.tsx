"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";
import triviaData from "../../data/worldCupTrivia.json";

type TriviaCard = {
  id: string;
  teaser: string;
  reveal: string;
  category: string;
  difficulty: string;
  rotationWeight: number;
};

const cards = triviaData as TriviaCard[];

// Weighted random pick: heavier rotationWeight items appear more often.
function pickWeighted(items: TriviaCard[]): TriviaCard {
  const total = items.reduce((sum, item) => sum + (item.rotationWeight || 1), 0);
  let roll = Math.random() * total;
  for (const item of items) {
    roll -= item.rotationWeight || 1;
    if (roll <= 0) return item;
  }
  return items[items.length - 1];
}

export function TriviaWidget() {
  // Pick on the client after mount so the weighted random choice never causes a hydration
  // mismatch. Until then we render a stable shell.
  const [card, setCard] = useState<TriviaCard | null>(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    setCard(pickWeighted(cards));
  }, []);

  return (
    <section className="relative overflow-hidden rounded-xl border border-[#E7C36B]/55 bg-[#FDF6E3] p-5 shadow-[0_10px_28px_rgba(180,138,0,.10)] md:p-6">
      {/* Soft amber glow accents for the premium feel */}
      <div className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full bg-[#F2C94C]/20 blur-2xl" />
      <div className="pointer-events-none absolute -bottom-20 -left-12 h-44 w-44 rounded-full bg-[#E7C36B]/15 blur-2xl" />

      <div className="relative">
        <p className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-[#B48A00]">
          <Sparkles size={15} className="fill-[#F2C94C] text-[#B48A00]" />
          World Cup trivia
        </p>

        <div className="mt-4 flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
          <div className="min-w-0 flex-1">
            <p className="text-xl font-black leading-snug text-[#0E0C0A] md:text-2xl">
              {card ? card.teaser : "Loading a World Cup teaser…"}
            </p>

            {card && revealed ? (
              <p className="mt-4 rounded-lg border border-[#E7C36B]/45 bg-white/70 p-4 text-sm font-bold leading-6 text-[#0E0C0A]/85">
                {card.reveal}
              </p>
            ) : null}
          </div>

          {!revealed ? (
            <button
              type="button"
              onClick={() => setRevealed(true)}
              disabled={!card}
              className="focus-ring inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-[#0E0C0A] px-5 py-3 text-sm font-black text-white shadow-[0_6px_16px_rgba(14,12,10,.18)] transition hover:bg-[#23201c] disabled:opacity-50 md:self-center"
            >
              <Sparkles size={15} className="text-[#F2C94C]" />
              Reveal answer
            </button>
          ) : null}
        </div>

        <div className="relative mt-5 flex justify-end border-t border-[#E7C36B]/35 pt-4">
          <Link
            href="/world-cup-quiz"
            className="focus-ring inline-flex items-center gap-1.5 rounded-md px-1 text-sm font-black text-[#B48A00] transition hover:text-[#8A6400]"
          >
            Take the World Cup quiz →
          </Link>
        </div>
      </div>
    </section>
  );
}
