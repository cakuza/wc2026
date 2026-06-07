"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { COUNTRIES, RTL_LANGS, T, formatMatchDate, type Lang, LANGUAGES } from "@/lib/i18n";

// localStorage keys
const LANG_KEY = "wc2026-lang";
const LANG_SET_KEY = "wc2026-lang-set"; // only present when user EXPLICITLY picked a language

type LangContextValue = {
  lang: Lang;
  setLang: (lang: Lang) => void;
  dir: "ltr" | "rtl";
  locale: string;
  t: (key: string) => string;
  country: (key: string) => string;
  formatDate: (iso: string) => string;
};

const LangContext = createContext<LangContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>("en");

  // Restore preference ONLY if the user explicitly chose one (LANG_SET_KEY flag present).
  // Auto-saved values from previous code versions are ignored, ensuring new/cleared-storage
  // visitors always land on English.
  useEffect(() => {
    const saved = localStorage.getItem(LANG_KEY) as Lang | null;
    const wasExplicit = localStorage.getItem(LANG_SET_KEY) === "1";
    if (wasExplicit && saved && LANGUAGES.some((l) => l.code === saved)) setLang(saved);
  }, []);

  // Drive document lang/dir for RTL support — no localStorage write here.
  useEffect(() => {
    const dir = RTL_LANGS.includes(lang) ? "rtl" : "ltr";
    document.documentElement.lang = lang;
    document.documentElement.dir = dir;
  }, [lang]);

  // Persist only when user explicitly picks a language via the switcher.
  const setLangAndPersist = useCallback((newLang: Lang) => {
    localStorage.setItem(LANG_KEY, newLang);
    localStorage.setItem(LANG_SET_KEY, "1");
    setLang(newLang);
  }, []);

  const value = useMemo<LangContextValue>(() => {
    const meta = LANGUAGES.find((l) => l.code === lang)!;
    const dir = RTL_LANGS.includes(lang) ? "rtl" : "ltr";
    return {
      lang,
      setLang: setLangAndPersist,
      dir,
      locale: meta.locale,
      t: (key: string) => T[lang]?.[key] ?? T.en[key] ?? key,
      country: (key: string) => COUNTRIES[key]?.[lang] ?? COUNTRIES[key]?.en ?? key,
      formatDate: (iso: string) => formatMatchDate(iso, meta.locale)
    };
  }, [lang, setLangAndPersist]);

  return <LangContext.Provider value={value}>{children}</LangContext.Provider>;
}

export function useLang() {
  const ctx = useContext(LangContext);
  if (!ctx) throw new Error("useLang must be used within LanguageProvider");
  return ctx;
}
