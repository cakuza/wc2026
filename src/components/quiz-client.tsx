"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Check, RotateCcw, Share2, X } from "lucide-react";
import quizData from "../../data/worldCupQuiz.json";

type Question = {
  id: string;
  question: string;
  options: string[];
  correct: string;
};

const QUESTIONS = quizData as Question[];
const TOTAL = QUESTIONS.length;
const SHARE_URL = "wc2026-wine.vercel.app/world-cup-quiz";

function scoreLabel(score: number): string {
  if (score <= 2) return "Casual Fan";
  if (score <= 5) return "Group Stage Watcher";
  if (score <= 7) return "Knockout Expert";
  if (score <= 9) return "World Cup Historian";
  return "Golden Ball Brain";
}

// Deterministic per-render shuffle so options aren't always in the same order, without
// causing hydration issues (computed once in a memo on the client).
function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function QuizClient() {
  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [finished, setFinished] = useState(false);
  const [status, setStatus] = useState("");
  // Re-shuffle options whenever the question changes.
  const options = useMemo(() => (finished ? [] : shuffle(QUESTIONS[current].options)), [current, finished]);

  const question = QUESTIONS[current];

  function choose(option: string) {
    if (selected) return; // already answered
    setSelected(option);
    if (option === question.correct) setScore((value) => value + 1);
  }

  function next() {
    if (current + 1 >= TOTAL) {
      setFinished(true);
    } else {
      setCurrent((value) => value + 1);
      setSelected(null);
    }
  }

  function restart() {
    setCurrent(0);
    setScore(0);
    setSelected(null);
    setFinished(false);
    setStatus("");
  }

  async function share(finalScore: number) {
    const text = `I scored ${finalScore}/${TOTAL} — ${scoreLabel(finalScore)}. Can you beat me? ${SHARE_URL}`;
    try {
      if (navigator.share) {
        await navigator.share({ text });
        return;
      }
      await navigator.clipboard.writeText(text);
      setStatus("Result copied — paste it anywhere.");
    } catch {
      setStatus("Couldn't share automatically. Copy this: " + text);
    }
  }

  if (finished) {
    const label = scoreLabel(score);
    return (
      <section className="rounded-[22px] border border-[rgba(14,12,10,.10)] bg-white p-6 text-center shadow-[0_18px_50px_rgba(14,12,10,.08)] md:p-8">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-[#B48A00]">Your result</p>
        <p className="mt-3 text-6xl font-black text-[#0E0C0A] [font-family:Impact,Arial_Black,sans-serif]">{score}/{TOTAL}</p>
        <p className="mt-2 text-2xl font-black text-[#FF2D6B]">{label}</p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <button
            type="button"
            onClick={() => share(score)}
            className="focus-ring inline-flex items-center gap-2 rounded-md bg-[#0E0C0A] px-5 py-3 font-black text-white transition hover:bg-[#23201c]"
          >
            <Share2 size={17} />
            Share result
          </button>
          <button
            type="button"
            onClick={restart}
            className="focus-ring inline-flex items-center gap-2 rounded-md border border-[rgba(14,12,10,.16)] px-5 py-3 font-black text-[#0E0C0A] transition hover:border-[#0E0C0A]/40"
          >
            <RotateCcw size={16} />
            Play again
          </button>
        </div>
        {status ? <p className="mt-4 text-sm font-bold text-[#0E0C0A]/60">{status}</p> : null}
        <p className="mt-6 text-sm text-[#0E0C0A]/55">
          Keep exploring: <Link href="/groups" className="font-bold text-[#B48A00] hover:underline">groups</Link>,{" "}
          <Link href="/matches" className="font-bold text-[#B48A00] hover:underline">schedule</Link> and{" "}
          <Link href="/teams" className="font-bold text-[#B48A00] hover:underline">all 48 teams</Link>.
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-[22px] border border-[rgba(14,12,10,.10)] bg-white p-5 shadow-[0_18px_50px_rgba(14,12,10,.08)] md:p-7">
      <div className="mb-4 flex items-center justify-between gap-3">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-[#B48A00]">Question {current + 1} of {TOTAL}</p>
        <p className="text-xs font-black uppercase tracking-[0.14em] text-[#0E0C0A]/45">Score {score}</p>
      </div>
      {/* progress bar */}
      <div className="mb-5 h-1.5 w-full overflow-hidden rounded-full bg-[#0E0C0A]/8">
        <div className="h-full rounded-full bg-[#1FA960] transition-all" style={{ width: `${(current / TOTAL) * 100}%` }} />
      </div>

      <h2 className="text-xl font-black leading-snug text-[#0E0C0A] md:text-2xl">{question.question}</h2>

      <div className="mt-5 grid gap-2.5">
        {options.map((option) => {
          const isCorrect = option === question.correct;
          const isChosen = option === selected;
          let cls = "border-[rgba(14,12,10,.14)] bg-white hover:border-[#0E0C0A]/40";
          if (selected) {
            if (isCorrect) cls = "border-[#1FA960] bg-[#1FA96012]";
            else if (isChosen) cls = "border-[#FF2D6B] bg-[#FF2D6B10]";
            else cls = "border-[rgba(14,12,10,.10)] bg-white opacity-60";
          }
          return (
            <button
              key={option}
              type="button"
              onClick={() => choose(option)}
              disabled={Boolean(selected)}
              className={`focus-ring flex items-center justify-between gap-3 rounded-lg border px-4 py-3 text-left text-sm font-bold text-[#0E0C0A] transition ${cls}`}
            >
              <span>{option}</span>
              {selected && isCorrect ? <Check size={18} className="shrink-0 text-[#1FA960]" /> : null}
              {selected && isChosen && !isCorrect ? <X size={18} className="shrink-0 text-[#FF2D6B]" /> : null}
            </button>
          );
        })}
      </div>

      {selected ? (
        <div className="mt-5 flex items-center justify-between gap-3">
          <p className="text-sm font-black text-[#0E0C0A]">
            {selected === question.correct ? "Correct!" : `Not quite — the answer is ${question.correct}.`}
          </p>
          <button
            type="button"
            onClick={next}
            className="focus-ring inline-flex items-center justify-center rounded-md bg-[#0E0C0A] px-5 py-2.5 text-sm font-black text-white transition hover:bg-[#23201c]"
          >
            {current + 1 >= TOTAL ? "See result" : "Next question"}
          </button>
        </div>
      ) : null}
    </section>
  );
}
