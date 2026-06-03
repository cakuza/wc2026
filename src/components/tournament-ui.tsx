import Link from "next/link";
import { ArrowRight, Bell, Bookmark, ImageIcon, ShieldCheck, Sparkles } from "lucide-react";
import type { ReactNode } from "react";
import type { Team } from "@/lib/types";

export function TournamentHero({
  kicker,
  title,
  copy,
  children,
  side
}: {
  kicker: string;
  title: string;
  copy: string;
  children?: ReactNode;
  side?: ReactNode;
}) {
  return (
    <section className="tournament-grid mb-8 grid gap-6 overflow-hidden rounded-[28px] border border-[rgba(14,12,10,.10)] bg-white px-5 py-7 shadow-[0_24px_70px_rgba(14,12,10,.10)] md:px-8 md:py-10 lg:grid-cols-[1.05fr_1.05fr]">
      <div>
        <p className="mb-3 text-xs font-black uppercase tracking-[0.2em] text-[#B48A00]">{kicker}</p>
        <h1 className="max-w-4xl text-5xl font-black leading-[0.92] text-[#0E0C0A] md:text-7xl">{title}</h1>
        <p className="mt-4 max-w-2xl text-lg leading-8 text-[#0E0C0A]/70">{copy}</p>
        {children}
      </div>
      {side}
    </section>
  );
}

export function MatchdayBadge({ children }: { children: ReactNode }) {
  return <Badge icon={<Sparkles size={14} />}>{children}</Badge>;
}

export function LocalTimeBadge({ children = "Real local times" }: { children?: ReactNode }) {
  return <Badge icon={<Bell size={14} />}>{children}</Badge>;
}

export function FanMadeBadge() {
  return <Badge icon={<ShieldCheck size={14} />}>Fan-made / rights-safe</Badge>;
}

export function SaveThisBadge() {
  return <Badge icon={<Bookmark size={14} />}>Save this</Badge>;
}

export function GroupChip({ group }: { group: string }) {
  return <span className="rounded-full bg-[#F2C94C] px-3 py-1 text-xs font-black uppercase text-[#0E0C0A]">Group {group}</span>;
}

export function TeamFlagHeader({ team, eyebrow }: { team: Team; eyebrow: string }) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <span className="text-5xl leading-none">{team.flagEmoji}</span>
      <div>
        <p className="text-xs font-black uppercase tracking-[0.18em] text-[#B48A00]">{eyebrow}</p>
        <h1 className="text-4xl font-black leading-tight text-white md:text-6xl">{team.name}</h1>
      </div>
    </div>
  );
}

export function StadiumSection({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <section className={`tournament-grid overflow-hidden rounded-lg border border-[rgba(14,12,10,.10)] bg-white ${className}`}>
      {children}
    </section>
  );
}

export function PosterCTA({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link href={href} className="focus-ring inline-flex items-center gap-2 rounded-md bg-[#0E0C0A] px-4 py-3 font-black text-white">
      <ImageIcon size={18} />
      {children}
      <ArrowRight size={18} />
    </Link>
  );
}

export function ShareCTA({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link href={href} className="focus-ring inline-flex items-center gap-2 rounded-md border border-[rgba(14,12,10,.14)] px-4 py-3 font-bold text-[#0E0C0A]">
      <Bookmark size={17} />
      {children}
    </Link>
  );
}

function Badge({ icon, children }: { icon: ReactNode; children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-[rgba(14,12,10,.10)] bg-white px-3 py-1 text-xs font-black uppercase tracking-[0.12em] text-[#0E0C0A]/72">
      {icon}
      {children}
    </span>
  );
}
