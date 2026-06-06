"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Globe2, ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLang, LANGUAGES } from "@/components/language-provider";

const navItems = [
  { href: "/", label: "Today" },
  { href: "/groups", label: "Groups" },
  { href: "/matches", label: "Schedule" },
  { href: "/teams", label: "Teams" },
  { href: "/world-cup-quiz", label: "Quiz" }
];

const HEADER_HEIGHT = 64;

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function SiteHeader() {
  const pathname = usePathname() || "/";
  const isHome = pathname === "/";
  const { lang, setLang } = useLang();
  const [scrolledPastHero, setScrolledPastHero] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isHome) return;
    const onScroll = () => {
      const hero = document.getElementById("home-hero");
      const trigger = hero ? hero.offsetHeight - HEADER_HEIGHT : window.innerHeight * 0.6;
      setScrolledPastHero(window.scrollY > trigger);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [isHome]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function onPointerDown(e: PointerEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setLangOpen(false);
      }
    }
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, []);

  const transparent = isHome && !scrolledPastHero;
  const currentLang = LANGUAGES.find((l) => l.code === lang) ?? LANGUAGES[0];

  return (
    <header
      className={cn(
        "sticky top-0 z-50 transition-colors duration-300",
        transparent
          ? "border-b border-transparent bg-transparent"
          : "border-b border-[rgba(14,12,10,.10)] bg-white/92 backdrop-blur"
      )}
    >
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3">
        <Link
          href="/"
          className={cn("flex min-w-max items-center gap-2 font-black tracking-wide", transparent ? "text-white" : "text-[#0E0C0A]")}
        >
          <span
            className={cn(
              "grid h-9 w-9 place-items-center rounded-md text-[#F2C94C]",
              transparent ? "bg-white/10 ring-1 ring-white/20" : "bg-[#0E0C0A]"
            )}
          >
            <ImageIcon size={19} strokeWidth={2.6} />
          </span>
          <span>WC26 Hub</span>
        </Link>

        <nav className="flex flex-1 items-center gap-1 overflow-x-auto text-sm font-bold">
          {navItems.map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <Link
                key={item.label}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "rounded-md px-3 py-2 transition",
                  transparent
                    ? active
                      ? "bg-white text-[#0a0a0a]"
                      : "text-white/80 hover:bg-white/10 hover:text-white"
                    : active
                      ? "bg-[#0E0C0A] text-white hover:bg-[#0E0C0A]"
                      : "text-[#0E0C0A]/70 hover:bg-[#0E0C0A]/[0.05] hover:text-[#0E0C0A]"
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Language picker */}
        <div ref={dropdownRef} className="relative shrink-0">
          <button
            type="button"
            onClick={() => setLangOpen((o) => !o)}
            className={cn(
              "focus-ring flex items-center gap-1.5 rounded-md border px-3 py-2 text-sm font-bold transition",
              transparent
                ? "border-white/30 text-white/85 hover:bg-white/10"
                : "border-[rgba(14,12,10,.12)] text-[#0E0C0A]/70 hover:bg-[#0E0C0A]/[0.05] hover:text-[#0E0C0A]"
            )}
            aria-label="Select language"
            aria-expanded={langOpen}
          >
            <Globe2 size={15} />
            <span>{currentLang.flag}</span>
            <span className="hidden sm:inline">{currentLang.code.toUpperCase()}</span>
          </button>

          {langOpen && (
            <div className="absolute right-0 top-full mt-1.5 z-50 w-44 rounded-xl border border-[rgba(14,12,10,.10)] bg-white shadow-xl">
              {LANGUAGES.map((l) => (
                <button
                  key={l.code}
                  type="button"
                  onClick={() => { setLang(l.code); setLangOpen(false); }}
                  className={cn(
                    "flex w-full items-center gap-2.5 px-4 py-2.5 text-sm font-bold transition first:rounded-t-xl last:rounded-b-xl",
                    l.code === lang
                      ? "bg-[#0E0C0A] text-white"
                      : "text-[#0E0C0A]/80 hover:bg-[#0E0C0A]/[0.06]"
                  )}
                >
                  <span className="text-base leading-none">{l.flag}</span>
                  <span>{l.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
