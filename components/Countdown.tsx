"use client";

import { useEffect, useState } from "react";
import { useLang } from "@/components/LanguageProvider";
import { KICKOFF_TARGET } from "@/lib/matches";

type Parts = { days: number; hours: number; minutes: number; seconds: number };

function diff(target: number): Parts {
  const ms = Math.max(0, target - Date.now());
  return {
    days: Math.floor(ms / 86400000),
    hours: Math.floor((ms / 3600000) % 24),
    minutes: Math.floor((ms / 60000) % 60),
    seconds: Math.floor((ms / 1000) % 60)
  };
}

export function useCountdown() {
  const target = new Date(KICKOFF_TARGET).getTime();
  const [parts, setParts] = useState<Parts | null>(null);
  useEffect(() => {
    setParts(diff(target));
    const id = setInterval(() => setParts(diff(target)), 1000);
    return () => clearInterval(id);
  }, [target]);
  return parts;
}

function pad(n: number) {
  return String(n).padStart(2, "0");
}

export function CountdownTimer() {
  const { t } = useLang();
  const parts = useCountdown();
  const p = parts ?? { days: 0, hours: 0, minutes: 0, seconds: 0 };
  const cells: { value: string; label: string }[] = [
    { value: pad(p.days), label: t("cd_days") },
    { value: pad(p.hours), label: t("cd_hrs") },
    { value: pad(p.minutes), label: t("cd_min") },
    { value: pad(p.seconds), label: t("cd_sec") }
  ];

  return (
    /* suppressHydrationWarning: numbers tick immediately after hydration */
    <div className="flex gap-2 sm:gap-3" suppressHydrationWarning>
      {cells.map((c, i) => (
        <div key={i} className="min-w-[64px] rounded-lg border border-white/10 bg-navyCard px-3 py-2 text-center sm:min-w-[80px]">
          <div className="font-heading text-3xl font-extrabold tabular-nums text-white sm:text-4xl">{c.value}</div>
          <div className="mt-0.5 text-[10px] font-semibold uppercase tracking-wider text-white/50 sm:text-xs">{c.label}</div>
        </div>
      ))}
    </div>
  );
}
