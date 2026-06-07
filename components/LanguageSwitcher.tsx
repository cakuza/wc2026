"use client";

import { useEffect, useRef, useState } from "react";
import { Flag } from "@/components/Flag";
import { useLang } from "@/components/LanguageProvider";
import { LANGUAGES } from "@/lib/i18n";

export function LanguageSwitcher() {
  const { lang, setLang } = useLang();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const current = LANGUAGES.find((l) => l.code === lang)!;

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded border border-white/15 bg-white/5 px-3 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <Flag code={current.flag} name={current.name} width={22} height={16} className="rounded-sm" />
        <span>{current.label}</span>
        <span className="text-xs opacity-60">▾</span>
      </button>

      {open ? (
        <ul
          className="absolute end-0 z-50 mt-2 w-60 overflow-hidden rounded-lg border border-white/10 bg-navyCard shadow-2xl"
          role="listbox"
        >
          {LANGUAGES.map((l) => (
            <li key={l.code}>
              <button
                type="button"
                onClick={() => {
                  setLang(l.code);
                  setOpen(false);
                }}
                className={`flex w-full items-center gap-3 px-3 py-2.5 text-start transition hover:bg-white/10 ${
                  l.code === lang ? "bg-white/5" : ""
                }`}
                role="option"
                aria-selected={l.code === lang}
              >
                <Flag code={l.flag} name={l.name} width={26} height={19} className="rounded-sm" />
                <span className="flex-1">
                  <span className="block text-sm font-semibold text-white">{l.name}</span>
                  <span className="block text-xs text-white/55">{l.native}</span>
                </span>
                <span className="text-xs font-bold text-white/40">{l.label}</span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
