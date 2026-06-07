"use client";

import { useEffect, useState } from "react";
import { useLang } from "@/components/LanguageProvider";
import type { QuizQuestion } from "@/lib/quiz";
import { QUIZ_I18N } from "@/lib/quizI18n";

// Fisher-Yates shuffle (returns a new array).
function shuffle<T>(input: T[]): T[] {
  const a = [...input];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Shuffle each question’s options. `correct` stays the same string for comparison.
function buildDeck(questions: QuizQuestion[]): QuizQuestion[] {
  return questions.map((q) => ({ ...q, options: shuffle(q.options) }));
}

// Result tiers by score (playful, English copy as specified).
function resultTier(score: number): { emoji: string; title: string; sub: string } {
  if (score >= 10) return { emoji: "🏆", title: "World Cup Mastermind", sub: "You know everything about the beautiful game" };
  if (score >= 8) return { emoji: "⚽", title: "Cup Historian", sub: "Impressive football knowledge" };
  if (score >= 6) return { emoji: "🎯", title: "Group Stage Regular", sub: "Solid but room to grow" };
  if (score >= 4) return { emoji: "📺", title: "Casual Fan", sub: "You watch but don’t deep dive" };
  return { emoji: "🌍", title: "First Timer", sub: "Time to study up!" };
}

export function QuizClient() {
  const { t, lang } = useLang();
  const questions = QUIZ_I18N[lang] ?? QUIZ_I18N.en;
  const total = questions.length;
  // Start from the unshuffled deck for a stable SSR/first paint, then shuffle on mount.
  const [deck, setDeck] = useState<QuizQuestion[]>(() => questions.map((q) => ({ ...q })));
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    setDeck(buildDeck(questions));
    setIndex(0);
    setScore(0);
    setSelected(null);
    setFinished(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang]);

  const question = deck[index];

  function choose(i: number) {
    if (selected !== null) return; // locked once answered
    setSelected(i);
    if (question.options[i] === question.correct) setScore((s) => s + 1);
    setTimeout(() => {
      if (index + 1 >= total) {
        setFinished(true);
      } else {
        setIndex((v) => v + 1);
        setSelected(null);
      }
    }, 1150);
  }

  function restart() {
    setDeck(buildDeck(questions));
    setIndex(0);
    setScore(0);
    setSelected(null);
    setFinished(false);
  }

  if (finished) {
    const tier = resultTier(score);
    return (
      <div className="mx-auto max-w-xl rounded-2xl border border-white/10 bg-navyCard p-8 text-center">
        <div className="text-6xl">{tier.emoji}</div>
        <h2 className="mt-4 font-heading text-4xl font-extrabold uppercase tracking-tight text-white sm:text-5xl">{tier.title}</h2>
        <p className="mt-2 text-base text-white/65">{tier.sub}</p>
        <p className="mt-6 font-heading text-2xl font-extrabold text-white">
          <span className="text-sm font-bold uppercase tracking-[0.2em] text-accent">{t("q_yourScore")}</span>
          <br />
          {score}
          <span className="text-white/40">/{total}</span>
        </p>
        <button
          type="button"
          onClick={restart}
          className="mt-7 rounded-lg bg-accent px-6 py-3 font-heading text-sm font-extrabold uppercase tracking-wide text-white transition hover:bg-accent/85"
        >
          {t("q_playAgain")}
        </button>
      </div>
    );
  }

  const progress = t("q_questionOf").replace("{n}", String(index + 1)).replace("{total}", String(total));

  return (
    <div className="mx-auto max-w-xl">
      {/* Progress */}
      <div className="mb-4 flex items-center justify-between">
        <span className="font-heading text-sm font-bold uppercase tracking-wide text-white/50">{progress}</span>
        <span className="font-heading text-sm font-bold uppercase tracking-wide text-accent">
          {t("lbl_pts")}: {score}
        </span>
      </div>
      <div className="mb-6 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
        <div className="h-full rounded-full bg-accent transition-all" style={{ width: `${((index + (selected !== null ? 1 : 0)) / total) * 100}%` }} />
      </div>

      {/* Question */}
      <div className="rounded-2xl border border-white/10 bg-navyCard p-6">
        <h2 className="font-heading text-2xl font-extrabold leading-tight text-white">{question.question}</h2>

        <div className="mt-5 grid gap-3">
          {question.options.map((opt, i) => {
            const answered = selected !== null;
            const isCorrect = opt === question.correct;
            const isPicked = i === selected;
            let cls = "border-white/10 bg-navy text-white hover:border-accent/60";
            if (answered) {
              if (isCorrect) cls = "border-green-500 bg-green-500/15 text-white";
              else if (isPicked) cls = "border-red-500 bg-red-500/15 text-white";
              else cls = "border-white/10 bg-navy text-white/40";
            }
            return (
              <button
                key={`${question.id}-${opt}`}
                type="button"
                onClick={() => choose(i)}
                disabled={answered}
                className={`flex items-center justify-between rounded-lg border px-4 py-3 text-start font-semibold transition ${cls}`}
              >
                <span>{opt}</span>
                {answered && isCorrect ? (
                  <span className="font-heading text-xs font-extrabold uppercase tracking-wide text-green-400">{t("q_correct")}</span>
                ) : answered && isPicked ? (
                  <span className="font-heading text-xs font-extrabold uppercase tracking-wide text-red-400">{t("q_wrong")}</span>
                ) : null}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
