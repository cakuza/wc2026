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
    <section className="rounded-lg border border-[rgba(14,12,10,.10)] bg-white p-4 shadow-[0_8px_18px_rgba(14,12,10,.05)] md:p-5">
      <p className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-[#B48A00]">
        <Sparkles size={14} />
        World Cup trivia
      </p>
      <p className="mt-3 text-lg font-black leading-snug text-[#0E0C0A] md:text-xl">
        {card ? card.teaser : "Loading a World Cup teaser…"}
      </p>

      {card && revealed ? (
        <p className="mt-3 rounded-md bg-[#F6F4F1] p-3 text-sm font-bold leading-6 text-[#0E0C0A]/80">{card.reveal}</p>
      ) : null}

      <div className="mt-4 flex flex-wrap items-center gap-3">
        {!revealed ? (
          <button
            type="button"
            onClick={() => setRevealed(true)}
            disabled={!card}
            className="focus-ring inline-flex items-center justify-center rounded-md bg-[#0E0C0A] px-4 py-2.5 text-sm font-black text-white transition hover:bg-[#23201c] disabled:opacity-50"
          >
            Reveal answer
          </button>
        ) : (
          <Link
            href="/world-cup-quiz"
            className="focus-ring inline-flex items-center justify-center rounded-md bg-[#0E0C0A] px-4 py-2.5 text-sm font-black text-white transition hover:bg-[#23201c]"
          >
            Take the World Cup quiz →
          </Link>
        )}
      </div>
    </section>
  );
}
