import type { ReactNode } from "react";
import type { Team } from "@/lib/types";

export function StadiumGlowBackground({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`relative overflow-hidden rounded-lg border border-white/10 bg-[#061527] ${className}`}>
      <PitchLinesOverlay />
      <StadiumBeams />
      <ConfettiBurst />
      <div className="relative">{children}</div>
    </div>
  );
}

export function PitchLinesOverlay() {
  return (
    <div className="pointer-events-none absolute inset-0 opacity-20 [background-image:linear-gradient(rgba(255,255,255,.16)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.12)_1px,transparent_1px)] [background-size:36px_36px]" />
  );
}

export function StadiumBeams() {
  return (
    <div className="pointer-events-none absolute inset-0 opacity-70">
      <span className="absolute left-[-18%] top-[-10%] h-[140%] w-24 rotate-[24deg] bg-white/10 blur-sm" />
      <span className="absolute right-[8%] top-[-18%] h-[140%] w-20 rotate-[-18deg] bg-gold/14 blur-sm" />
      <span className="absolute inset-x-0 bottom-0 h-16 bg-[repeating-linear-gradient(90deg,rgba(255,255,255,.16)_0_1px,transparent_1px_18px)]" />
    </div>
  );
}

export function ConfettiBurst() {
  return (
    <div className="pointer-events-none absolute inset-0 opacity-35">
      <span className="absolute left-[18%] top-[16%] h-1 w-8 rotate-12 rounded-full bg-gold" />
      <span className="absolute right-[18%] top-[24%] h-1 w-6 -rotate-12 rounded-full bg-white/70" />
      <span className="absolute bottom-[20%] left-[24%] h-1 w-5 -rotate-45 rounded-full bg-gold/80" />
      <span className="absolute bottom-[28%] right-[24%] h-1 w-7 rotate-45 rounded-full bg-white/60" />
    </div>
  );
}

export function NationGradient({ team, children, className = "" }: { team?: Team; children: ReactNode; className?: string }) {
  const hue = team ? Math.abs(hash(team.name) % 360) : 145;
  return (
    <div
      className={`rounded-lg border border-white/10 ${className}`}
      style={{
        background: `linear-gradient(115deg, hsla(${hue}, 88%, 54%, .55), transparent 34%), linear-gradient(145deg, hsl(${hue}, 58%, 30%), #061527 68%)`
      }}
    >
      {children}
    </div>
  );
}

export function GenericJerseyBack({
  name,
  number,
  team,
  compact = false
}: {
  name: string;
  number: string | number;
  team?: Team;
  compact?: boolean;
}) {
  const displayName = name.trim() || "FAN";
  const hue = team ? Math.abs(hash(team.name) % 360) : 150;
  return (
    <div className="mx-auto grid justify-items-center">
      <div
        className={`relative ${compact ? "h-28 w-28" : "h-40 w-40"} drop-shadow-2xl`}
        aria-label="Generic jersey back silhouette"
      >
        <div
          className="absolute inset-x-[18%] top-0 h-[18%] rounded-t-full border border-white/18"
          style={{ background: `linear-gradient(135deg, hsl(${hue}, 74%, 42%), hsl(${(hue + 42) % 360}, 76%, 48%))` }}
        />
        <div
          className="absolute left-0 top-[12%] h-[34%] w-[28%] -rotate-12 rounded-l-xl border border-white/14"
          style={{ background: `linear-gradient(135deg, hsl(${hue}, 76%, 36%), #061527)` }}
        />
        <div
          className="absolute right-0 top-[12%] h-[34%] w-[28%] rotate-12 rounded-r-xl border border-white/14"
          style={{ background: `linear-gradient(225deg, hsl(${(hue + 34) % 360}, 76%, 40%), #061527)` }}
        />
        <div
          className="absolute inset-x-[15%] top-[12%] h-[82%] rounded-b-3xl rounded-t-lg border border-white/18 p-3 text-center"
          style={{ background: `linear-gradient(120deg, rgba(255,255,255,.20), transparent 30%), linear-gradient(160deg, hsl(${hue}, 78%, 38%), hsl(${(hue + 55) % 360}, 70%, 28%) 55%, #061527)` }}
        >
          <p className={`${compact ? "text-[10px]" : "text-xs"} font-black uppercase tracking-[0.16em] text-white/76`}>{displayName}</p>
          <p className={`${compact ? "text-5xl" : "text-7xl"} font-black leading-none text-white`}>{number || "10"}</p>
          <p className="text-[9px] font-black uppercase tracking-[0.14em] text-white/55">Fan design</p>
        </div>
      </div>
    </div>
  );
}

export function PlayerNamePoster({
  playerName,
  headline,
  team
}: {
  playerName: string;
  headline: string;
  team?: Team;
}) {
  return (
    <NationGradient team={team} className="p-4 text-white">
      <p className="text-xs font-black uppercase tracking-[0.18em] text-gold">{headline}</p>
      <p className="mt-2 text-3xl font-black uppercase leading-none">{playerName}</p>
      <p className="mt-2 text-xs font-bold uppercase tracking-[0.14em] text-white/58">Player-name hype card</p>
    </NationGradient>
  );
}

function hash(value: string) {
  return value.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0);
}
