"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { DEFAULT_TIMEZONE, detectBrowserTimeZone, isValidTimeZone } from "@/lib/timezone";

const TZ_KEY = "wc2026-tz";

type TzContextValue = {
  timeZone: string;
  setTimeZone: (tz: string) => void;
};

const TzContext = createContext<TzContextValue | null>(null);

/**
 * Single source of truth for "what timezone should kickoff times be shown in".
 *
 * SSR + first paint: DEFAULT_TIMEZONE (America/New_York) — deterministic, identical on
 * server and client, so no hydration mismatch.
 *
 * After mount, in priority order:
 *  1. ?tz=<IANA zone> query param (validated) — also persisted for future visits
 *  2. previously-saved selection (localStorage)
 *  3. browser-detected timezone (Intl.DateTimeFormat().resolvedOptions().timeZone)
 */
export function TimezoneProvider({ children }: { children: ReactNode }) {
  const [timeZone, setTimeZoneState] = useState(DEFAULT_TIMEZONE);

  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const qsTz = params.get("tz");
      if (qsTz && isValidTimeZone(qsTz)) {
        localStorage.setItem(TZ_KEY, qsTz);
        setTimeZoneState(qsTz);
        return;
      }

      const saved = localStorage.getItem(TZ_KEY);
      if (saved && isValidTimeZone(saved)) {
        setTimeZoneState(saved);
        return;
      }

      setTimeZoneState(detectBrowserTimeZone());
    } catch {
      // keep DEFAULT_TIMEZONE
    }
  }, []);

  const setTimeZone = (tz: string) => {
    if (!isValidTimeZone(tz)) return;
    try {
      localStorage.setItem(TZ_KEY, tz);
    } catch {
      // ignore (e.g. storage disabled)
    }
    setTimeZoneState(tz);
  };

  const value = useMemo<TzContextValue>(() => ({ timeZone, setTimeZone }), [timeZone]);

  return <TzContext.Provider value={value}>{children}</TzContext.Provider>;
}

export function useTimezone() {
  const ctx = useContext(TzContext);
  if (!ctx) throw new Error("useTimezone must be used within TimezoneProvider");
  return ctx;
}
