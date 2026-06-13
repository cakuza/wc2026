"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { DEFAULT_TIMEZONE, detectBrowserTimeZone, isValidTimeZone, TZ_COOKIE } from "@/lib/timezone";

const TZ_KEY = "wc2026-tz";

/** Persist the timezone in a cookie so the server can read it on the next request. */
function persistTimeZoneCookie(tz: string) {
  try {
    const maxAge = 60 * 60 * 24 * 365; // 1 year
    document.cookie = `${TZ_COOKIE}=${encodeURIComponent(tz)}; path=/; max-age=${maxAge}; samesite=lax`;
  } catch {
    // ignore (e.g. cookies disabled)
  }
}

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
        persistTimeZoneCookie(qsTz);
        setTimeZoneState(qsTz);
        return;
      }

      const saved = localStorage.getItem(TZ_KEY);
      if (saved && isValidTimeZone(saved)) {
        persistTimeZoneCookie(saved);
        setTimeZoneState(saved);
        return;
      }

      const detected = detectBrowserTimeZone();
      persistTimeZoneCookie(detected);
      setTimeZoneState(detected);
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
    persistTimeZoneCookie(tz);
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
