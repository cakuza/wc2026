"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useLang } from "@/components/LanguageProvider";
import { DESKTOP_LINKS, PRIMARY_LINKS, SECONDARY_LINKS, isActive } from "@/lib/navLinks";

function PrimaryIcon({ href }: { href: string }) {
  const common = {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    className: "h-5 w-5",
    "aria-hidden": true,
  };
  switch (href) {
    case "/today":
      return (
        <svg {...common} xmlns="http://www.w3.org/2000/svg">
          <rect x="3" y="4" width="18" height="18" rx="2" />
          <path d="M16 2v4M8 2v4M3 10h18" />
        </svg>
      );
    case "/schedule":
      return (
        <svg {...common} xmlns="http://www.w3.org/2000/svg">
          <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />
        </svg>
      );
    case "/groups":
      return (
        <svg {...common} xmlns="http://www.w3.org/2000/svg">
          <path d="M3 3v18h18" />
          <rect x="7" y="11" width="3" height="6" />
          <rect x="13" y="7" width="3" height="10" />
        </svg>
      );
    case "/teams":
      return (
        <svg {...common} xmlns="http://www.w3.org/2000/svg">
          <path d="M12 3l8 3v5c0 4.5-3 8-8 10-5-2-8-5.5-8-10V6z" />
        </svg>
      );
    default:
      return null;
  }
}

function MobileDrawer({
  open,
  onClose,
  pathname,
  t,
}: {
  open: boolean;
  onClose: () => void;
  pathname: string;
  t: (key: string) => string;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const restoreFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;

    restoreFocusRef.current = (document.activeElement as HTMLElement) ?? null;
    const panel = panelRef.current;
    const getFocusable = () =>
      panel
        ? Array.from(
            panel.querySelectorAll<HTMLElement>(
              'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
            ),
          )
        : [];

    getFocusable()[0]?.focus();

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== "Tab") return;
      const items = getFocusable();
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
      restoreFocusRef.current?.focus?.();
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label={t("nav_more")}>
      <button
        type="button"
        aria-label={t("nav_more")}
        tabIndex={-1}
        onClick={onClose}
        className="absolute inset-0 h-full w-full bg-black/60"
      />
      <div
        ref={panelRef}
        className="absolute right-0 top-0 flex h-full w-72 max-w-[85vw] flex-col overflow-y-auto border-l border-white/10 bg-navy shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
          <span className="font-heading text-sm font-extrabold uppercase tracking-wide text-white">
            {t("nav_more")}
          </span>
          <button
            type="button"
            aria-label="Close menu"
            onClick={onClose}
            className="flex h-11 w-11 items-center justify-center rounded border border-white/15 bg-white/5 text-white transition hover:bg-white/10"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5" aria-hidden>
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
        <nav aria-label="Secondary" className="flex flex-col gap-1 px-3 py-3">
          {SECONDARY_LINKS.map((l) => {
            const active = isActive(pathname, l.href);
            return (
              <Link
                key={l.href}
                href={l.href}
                onClick={onClose}
                aria-current={active ? "page" : undefined}
                className={`flex min-h-[44px] items-center rounded-lg px-4 font-heading text-sm font-bold uppercase tracking-wide transition ${
                  active ? "bg-accent text-white" : "text-white/75 hover:bg-white/10 hover:text-white"
                }`}
              >
                {l.label ?? t(l.key)}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}

export function Nav() {
  const { t } = useLang();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const closeMenu = useCallback(() => setMenuOpen(false), []);

  // Close the drawer whenever the route changes (covers link clicks and
  // browser back/forward while the drawer is open).
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  return (
    <header className="sticky top-0 z-40 border-b-[3px] border-accent bg-navy">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-2 px-4 sm:gap-4">
        <div className="flex min-w-0 items-center gap-6">
          <Link href="/" className="flex min-w-0 items-center gap-1.5 sm:gap-2" onClick={closeMenu}>
            <span className="truncate font-heading text-base font-extrabold tracking-tight text-white sm:text-xl">WorldCupMatchDay</span>
            <span className="shrink-0 font-sans text-[11px] font-black tracking-widest bg-red-600 text-white px-1.5 py-0.5 rounded">2026</span>
          </Link>
          {/* Desktop nav */}
          <nav aria-label="Primary" className="hidden items-center gap-1 lg:flex">
            {DESKTOP_LINKS.map((l) => {
              const active = isActive(pathname, l.href);
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  aria-current={active ? "page" : undefined}
                  className={`rounded px-3 py-2 font-heading text-sm font-bold uppercase tracking-wide transition ${
                    active ? "bg-accent text-white" : "text-white/70 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  {l.label ?? t(l.key)}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <LanguageSwitcher />
          {/* Hamburger button — mobile only, opens the secondary drawer */}
          <button
            type="button"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-haspopup="dialog"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((o) => !o)}
            className="flex h-11 w-11 items-center justify-center rounded border border-white/15 bg-white/5 text-white transition hover:bg-white/10 lg:hidden"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5" aria-hidden>
              <path d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* Persistent mobile primary nav — visible without opening any menu */}
      <nav aria-label="Primary" className="border-t border-white/10 bg-navy lg:hidden">
        <div className="mx-auto grid max-w-7xl grid-cols-4">
          {PRIMARY_LINKS.map((l) => {
            const active = isActive(pathname, l.href);
            return (
              <Link
                key={l.href}
                href={l.href}
                aria-current={active ? "page" : undefined}
                className={`flex min-h-[44px] flex-col items-center justify-center gap-0.5 px-1 py-1.5 font-heading text-[11px] font-bold uppercase tracking-wide transition ${
                  active
                    ? "text-white"
                    : "text-white/60 hover:text-white"
                }`}
              >
                <PrimaryIcon href={l.href} />
                <span className="w-full truncate text-center">{t(l.key)}</span>
                <span
                  aria-hidden
                  className={`h-0.5 w-6 rounded-full ${active ? "bg-accent" : "bg-transparent"}`}
                />
              </Link>
            );
          })}
        </div>
      </nav>

      <MobileDrawer open={menuOpen} onClose={closeMenu} pathname={pathname} t={t} />
    </header>
  );
}
