"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { getBrowserTimezone } from "@/lib/timezones";

// Site-wide timezone selection. The chosen zone is shared across every page (homepage,
// matches list, team pages) and persisted to localStorage, so changing it in one selector
// updates all kickoff times everywhere and survives navigation/reloads. On first load we
// auto-detect the visitor's browser timezone.

const STORAGE_KEY = "wc26.timezone";
const DEFAULT_TZ = "Europe/Istanbul";

type TimezoneContextValue = {
  timeZone: string;
  setTimeZone: (tz: string) => void;
};

const TimezoneContext = createContext<TimezoneContextValue>({
  timeZone: DEFAULT_TZ,
  setTimeZone: () => {}
});

export function TimezoneProvider({ children }: { children: ReactNode }) {
  const [timeZone, setTimeZoneState] = useState(DEFAULT_TZ);

  // Initialize from a saved choice, otherwise from the detected browser zone. Runs on the
  // client only, so SSR markup stays stable and hydration-safe.
  useEffect(() => {
    let saved: string | null = null;
    try {
      saved = window.localStorage.getItem(STORAGE_KEY);
    } catch {
      saved = null;
    }
    setTimeZoneState(saved || getBrowserTimezone());
  }, []);

  // Keep tabs in sync if the zone is changed in another tab/window.
  useEffect(() => {
    function onStorage(event: StorageEvent) {
      if (event.key === STORAGE_KEY && event.newValue) {
        setTimeZoneState(event.newValue);
      }
    }
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const setTimeZone = useCallback((tz: string) => {
    setTimeZoneState(tz);
    try {
      window.localStorage.setItem(STORAGE_KEY, tz);
    } catch {
      // ignore (private mode / storage disabled)
    }
  }, []);

  return <TimezoneContext.Provider value={{ timeZone, setTimeZone }}>{children}</TimezoneContext.Provider>;
}

export function useTimezone() {
  return useContext(TimezoneContext);
}
