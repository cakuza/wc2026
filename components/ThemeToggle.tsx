"use client";

import React, { useEffect, useState } from "react";
import { useTheme } from "@/components/ThemeProvider";
import { useLang } from "@/components/LanguageProvider";

export function ThemeToggle() {
  const { theme, toggleTheme, isTransitioning } = useTheme();
  const { t } = useLang();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isLight = mounted && theme === "light";
  const label = mounted ? (isLight ? t("theme_switchToNight") : t("theme_switchToDay")) : "Toggle theme";

  return (
    <button
      type="button"
      data-testid="theme-toggle"
      data-mounted={mounted ? "true" : "false"}
      onClick={toggleTheme}
      disabled={isTransitioning}
      aria-label={label}
      aria-pressed={isLight}
      title={label}
      className="group relative flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-line bg-surface text-ink transition hover:bg-hover hover:border-lineStrong focus:outline-none focus:ring-2 focus:ring-accent"
    >
      <span className="sr-only">{label}</span>
      {/* Sun icon for light mode / switching to dark mode */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={`h-5 w-5 transition-transform duration-300 ${
          isLight ? "rotate-0 scale-100 text-amber-500" : "rotate-90 scale-0 text-white/0"
        } absolute`}
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
      </svg>

      {/* Moon icon for dark mode / switching to light mode */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={`h-5 w-5 transition-transform duration-300 ${
          !isLight ? "rotate-0 scale-100 text-slate-200" : "-rotate-90 scale-0 text-white/0"
        } absolute`}
        aria-hidden="true"
      >
        <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9z" />
      </svg>
    </button>
  );
}
