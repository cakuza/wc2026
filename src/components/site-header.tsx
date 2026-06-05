"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Globe2, ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Today" },
  { href: "/groups", label: "Groups" },
  { href: "/matches", label: "Schedule" },
  { href: "/teams", label: "Teams" },
  { href: "/world-cup-quiz", label: "Quiz" }
];

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function SiteHeader() {
  const pathname = usePathname() || "/";

  return (
    <header className="sticky top-0 z-50 border-b border-[rgba(14,12,10,.10)] bg-white/92 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3">
        <Link href="/" className="flex min-w-max items-center gap-2 font-black tracking-wide text-[#0E0C0A]">
          <span className="grid h-9 w-9 place-items-center rounded-md bg-[#0E0C0A] text-[#F2C94C]">
            <ImageIcon size={19} strokeWidth={2.6} />
          </span>
          <span>WC26 Hub</span>
        </Link>
        <nav className="flex flex-1 items-center gap-1 overflow-x-auto text-sm font-bold text-[#0E0C0A]/70">
          {navItems.map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <Link
                key={item.label}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "rounded-md px-3 py-2 transition",
                  active
                    ? "bg-[#0E0C0A] text-white hover:bg-[#0E0C0A]"
                    : "hover:bg-[#0E0C0A]/[0.05] hover:text-[#0E0C0A]"
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <button className="focus-ring hidden items-center gap-2 rounded-md border border-[rgba(14,12,10,.12)] px-3 py-2 text-sm text-[#0E0C0A]/70 md:flex">
          <Globe2 size={16} />
          EN
        </button>
      </div>
    </header>
  );
}
