"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export function LiveDataAutoRefresh({ intervalMs }: { intervalMs: number | null }) {
  const router = useRouter();

  useEffect(() => {
    if (!intervalMs) return;
    const interval = intervalMs;

    let timer: ReturnType<typeof setTimeout> | null = null;
    let cancelled = false;

    function clearTimer() {
      if (!timer) return;
      clearTimeout(timer);
      timer = null;
    }

    function schedule() {
      clearTimer();
      if (cancelled || document.hidden) return;

      const jitter = Math.floor(Math.random() * 5_000);
      timer = setTimeout(() => {
        if (!cancelled && !document.hidden) router.refresh();
        schedule();
      }, interval + jitter);
    }

    function handleVisibilityChange() {
      if (document.hidden) {
        clearTimer();
      } else {
        router.refresh();
        schedule();
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange);
    schedule();

    return () => {
      cancelled = true;
      clearTimer();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [intervalMs, router]);

  return null;
}
