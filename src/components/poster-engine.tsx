import type { CSSProperties, ReactNode } from "react";
import { GenericJerseyBack } from "@/components/fan-hub-visuals";
import { TeamFlag } from "@/components/team-flag";
import type { MatchWithTeams, PlayerWithStats, Standing, Team } from "@/lib/types";
import { formatKickoff } from "@/lib/timezones";
import { sortPlayersByStat } from "@/lib/utils";

export type PosterRatio = "story" | "square" | "twitter";
export type PosterTheme = "festival" | "night-gold";
export type PosterVariant =
  | "prediction"
  | "player"
  | "chaos"
  | "road"
  | "menu"
  | "boot"
  | "upset"
  | "custom";

export const posterRatios: Record<PosterRatio, { label: string; short: string; width: number; height: number; previewWidth: number }> = {
  story: { label: "9:16 Story", short: "9:16", width: 1080, height: 1920, previewWidth: 330 },
  square: { label: "1:1 Square / WhatsApp / Instagram", short: "1:1", width: 1080, height: 1080, previewWidth: 390 },
  twitter: { label: "16:9 X/Twitter", short: "16:9", width: 1600, height: 900, previewWidth: 560 }
};

const fanDisclaimer = "FAN-MADE - NOT AFFILIATED WITH FIFA OR ANY OFFICIAL ORGANIZER";
const textFit = "break-normal [hyphens:none] [overflow-wrap:normal] [word-break:normal]";

export function PosterPreviewCard({
  variant,
  ratio = "story",
  theme = "festival",
  pro = false,
  width,
  team,
  opponent,
  match,
  matches = [],
  teams = [],
  standings = [],
  players = [],
  group = "A",
  headline,
  subtitle,
  playerName,
  jerseyName,
  shirtNumber,
  scorePrediction,
  footer,
  timeZone = "Europe/Istanbul"
}: {
  variant: PosterVariant;
  ratio?: PosterRatio;
  theme?: PosterTheme;
  pro?: boolean;
  width?: number;
  timeZone?: string;
  team?: Team;
  opponent?: Team;
  match?: MatchWithTeams;
  matches?: MatchWithTeams[];
  teams?: Team[];
  standings?: Standing[];
  players?: PlayerWithStats[];
  group?: string;
  headline?: string;
  subtitle?: string;
  playerName?: string;
  jerseyName?: string;
  shirtNumber?: string;
  scorePrediction?: string;
  footer?: string;
}) {
  const primaryTeam = team || match?.homeTeam || teams[0];
  const frameTeam = primaryTeam || opponent;
  const content = (() => {
    if (variant === "prediction") {
      const home = match?.homeTeam || primaryTeam;
      const away = match?.awayTeam || opponent || teams.find((item) => item.id !== home?.id);
      return <PredictionPoster home={home} away={away} match={match} scorePrediction={scorePrediction} headline={headline} ratio={ratio} timeZone={timeZone} />;
    }
    if (variant === "player") return <PlayerPoster team={frameTeam} headline={headline} playerName={playerName} jerseyName={jerseyName} shirtNumber={shirtNumber} ratio={ratio} />;
    if (variant === "chaos") return <ChaosPoster team={frameTeam} teams={teams} standings={standings} group={group} headline={headline} ratio={ratio} />;
    if (variant === "road") return <RoadPoster team={frameTeam} matches={matches} headline={headline} ratio={ratio} />;
    if (variant === "menu") return <MenuPoster team={frameTeam} matches={matches} headline={headline} ratio={ratio} timeZone={timeZone} />;
    if (variant === "boot") return <BootPoster team={frameTeam} players={players} headline={headline} ratio={ratio} />;
    if (variant === "upset") return <UpsetPoster team={opponent || frameTeam} match={match} headline={headline} subtitle={subtitle} ratio={ratio} />;
    return <CustomPoster team={frameTeam} headline={headline} subtitle={subtitle} playerName={playerName} jerseyName={jerseyName} shirtNumber={shirtNumber} ratio={ratio} />;
  })();

  return (
    <PosterFrame
      team={frameTeam}
      ratio={ratio}
      theme={theme}
      pro={pro}
      width={width}
      label={variantLabel(variant)}
      footer={footer || footerFor(variant)}
    >
      {content}
    </PosterFrame>
  );
}

export function PosterFrame({
  team,
  ratio,
  theme,
  pro,
  width,
  label,
  footer,
  children
}: {
  team?: Team;
  ratio: PosterRatio;
  theme: PosterTheme;
  pro: boolean;
  width?: number;
  label: string;
  footer: string;
  children: ReactNode;
}) {
  const size = posterRatios[ratio];
  const wide = ratio === "twitter";
  const square = ratio === "square";
  const style = posterStyle(team, theme);
  // Lay the poster out at its baseline width so the fixed type sizes always fit,
  // then scale the whole card to the requested width. This keeps thumbnails and
  // large previews pixel-identical and prevents right-edge text clipping.
  const baseW = size.previewWidth;
  const baseH = Math.round((baseW * size.height) / size.width);
  const previewWidth = width || baseW;
  const scale = previewWidth / baseW;
  return (
    <div
      className="overflow-hidden rounded-[16px] shadow-[0_12px_28px_rgba(14,12,10,.18)]"
      style={{ width: previewWidth, height: baseH * scale }}
    >
      <div
        style={{ width: baseW, height: baseH, transform: `scale(${scale})`, transformOrigin: "top left" }}
      >
      <div
        className={`relative flex h-full flex-col justify-between overflow-hidden ${wide ? "p-5" : square ? "p-5" : "p-6"} text-white`}
        style={style}
      >
        <PosterEffects theme={theme} wide={wide} streamerAccent={normalizeHex(team?.secondaryColor)} />
        <p className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 select-none text-[132px] font-black uppercase leading-none text-white/[0.055] [font-family:var(--font-anton),Impact,sans-serif]">
          WC26
        </p>
        <div className="relative z-10 flex items-center justify-between gap-3">
          <p className="bg-white px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-[#0E0C0A]">{label}</p>
          <p className="bg-[var(--poster-pop)] px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-[var(--poster-pop-ink)]">
            {theme === "night-gold" ? "Style preview" : "Save this"}
          </p>
        </div>
        <div className={`relative z-10 grid flex-1 content-center ${wide ? "gap-3 py-2" : "gap-4 py-4"}`}>
          {children}
        </div>
        <div className="relative z-10 grid gap-1.5">
          <p className="bg-black/35 px-3 py-2 text-center text-[10px] font-black uppercase tracking-[0.14em] text-white/84">{footer}</p>
          <div className="flex items-end justify-between gap-2">
            <p className="max-w-[68%] text-[8px] font-bold uppercase tracking-[0.04em] text-white/46">{fanDisclaimer}</p>
            {!pro ? <p className="text-[10px] font-black uppercase tracking-[0.12em] text-white/62">WC26 HUB</p> : null}
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}

function PosterEffects({ theme, wide, streamerAccent }: { theme: PosterTheme; wide: boolean; streamerAccent?: string | null }) {
  // Floodlight tints and vignette bumped ~20% for a heavier, stadium-lit feel.
  const tint = theme === "night-gold" ? "rgba(231,195,107,.50)" : "rgba(255,248,222,.58)";
  return (
    <>
      <div className="poster-grain pointer-events-none absolute inset-0 opacity-45 mix-blend-overlay" />
      <div className="pointer-events-none absolute inset-0 opacity-35 [background-image:radial-gradient(circle,rgba(255,255,255,.22)_1px,transparent_1px)] [background-size:9px_9px]" />
      <div className={`pointer-events-none absolute inset-0 ${wide ? "bg-[linear-gradient(to_left,#0E0C0A_0%,rgba(14,12,10,.82)_31%,transparent_65%)]" : "bg-[linear-gradient(to_top,#0E0C0A_0%,rgba(14,12,10,.82)_28%,transparent_64%)]"}`} />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(125%_95%_at_50%_42%,transparent_36%,rgba(8,6,4,.66)_100%)]" />
      <div className="pointer-events-none absolute -left-[13%] top-[-34%] h-[150%] w-[44%] rotate-[20deg] blur-[18px]" style={{ background: `linear-gradient(180deg,${tint},transparent 58%)` }} />
      <div className="pointer-events-none absolute -right-[13%] top-[-34%] h-[150%] w-[44%] rotate-[-20deg] blur-[18px]" style={{ background: `linear-gradient(180deg,${tint},transparent 58%)` }} />
      <div className="pointer-events-none absolute left-1/2 top-[-12%] h-[50%] w-[70%] -translate-x-1/2 blur-[8px]" style={{ background: `radial-gradient(60% 100% at 50% 0%,${tint},transparent 70%)` }} />
      <div className="pointer-events-none absolute left-1/2 top-[18%] h-[48%] w-[70%] -translate-x-1/2 rounded-full border border-white/14" />
      <StreamerLayer theme={theme} accent={streamerAccent} />
      {theme === "night-gold" ? <div className="pointer-events-none absolute inset-0 shadow-[inset_0_0_0_2px_rgba(231,195,107,.40)]" /> : null}
    </>
  );
}

function StreamerLayer({ theme, accent }: { theme: PosterTheme; accent?: string | null }) {
  // Festival streamers lead with the team's secondary color so the confetti carries
  // a team detail; night/gold keeps its fixed premium palette.
  const colors = theme === "night-gold"
    ? ["#E7C36B", "#FFFFFF", "#C8962F"]
    : [...(accent ? [accent] : []), "#FF2D6B", "#E7C36B", "#C6F23E", "#1FA9F6", "#FFFFFF"];
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden opacity-75">
      {Array.from({ length: 28 }).map((_, index) => {
        // Round to a precision the browser's CSS parser preserves verbatim, otherwise
        // the SSR string and the client-computed float disagree and hydration breaks.
        const left = (seeded(index, 11) * 100).toFixed(2);
        const top = (seeded(index, 29) * 100).toFixed(2);
        const rotate = (seeded(index, 47) * 360).toFixed(2);
        const color = colors[Math.floor(seeded(index, 71) * colors.length)] || "#fff";
        const kind = seeded(index, 83);
        const common = { left: `${left}%`, top: `${top}%`, transform: `rotate(${rotate}deg)`, backgroundColor: color };
        if (kind < 0.45) return <span key={index} className="absolute block h-[3px] w-8 rounded-full" style={common} />;
        if (kind < 0.72) return <span key={index} className="absolute block h-2 w-2 rounded-full" style={common} />;
        if (kind < 0.88) return <span key={index} className="absolute block h-3 w-2 rounded-sm" style={common} />;
        return <span key={index} className="absolute block h-2 w-2 border-b-2 border-l-2" style={{ left: `${left}%`, top: `${top}%`, transform: `rotate(${rotate}deg)`, borderColor: color }} />;
      })}
    </div>
  );
}

function RoadPoster({ team, matches, headline, ratio }: { team?: Team; matches: MatchWithTeams[]; headline?: string; ratio: PosterRatio }) {
  const rows = matches.slice(0, 3);
  const wide = ratio === "twitter";
  // Coherent Country Road copy: subtitle = ROAD TO 2026 - GROUP X, body = fixed schedule line.
  const head = (
    <div className={wide ? "min-w-0 flex-1" : ""}>
      <PosterKick>Road to 2026 - Group {team?.group || ""}</PosterKick>
      <div className="mt-3 flex items-center gap-3">
        <FlagBlock team={team} size={wide ? "md" : "lg"} />
        <p className="text-2xl uppercase leading-[.92] text-[var(--poster-pop)] [font-family:var(--font-anton),Impact,sans-serif]">The road<br />starts here</p>
      </div>
      <PosterTitle compact={wide || longName(team?.name)}>{headline || `${(team?.name || "Country").toUpperCase()}'S ROAD STARTS HERE`}</PosterTitle>
      <PosterSub>Fan-made schedule card. Save it before matchday.</PosterSub>
    </div>
  );
  const list = (
    <div className={`grid gap-2 ${wide ? "w-[46%] shrink-0" : ""}`}>
      {rows.map((match, index) => {
        const opponent = team && match.homeTeamId === team.id ? match.awayTeam : match.homeTeam;
        return (
          <div key={match.id} className="grid grid-cols-[auto_auto_1fr_auto] items-center gap-2 bg-white/10 p-2.5 backdrop-blur">
            <span className="text-xl font-black text-[var(--poster-pop)] [font-family:var(--font-anton),Impact,sans-serif]">{index + 1}</span>
            <TeamFlag team={opponent} width={30} />
            <span className={`min-w-0 text-sm font-black uppercase leading-none ${textFit}`}>{opponent.name}</span>
            <span className="text-[9px] font-black uppercase tracking-[0.12em] text-white/58">MD{index + 1}</span>
          </div>
        );
      })}
    </div>
  );
  if (wide) return <div className="flex items-center justify-between gap-5">{head}{list}</div>;
  return <>{head}<div className="mt-auto pb-3">{list}</div></>;
}

function PredictionPoster({ home, away, match, headline, scorePrediction, ratio, timeZone }: { home?: Team; away?: Team; match?: MatchWithTeams; headline?: string; scorePrediction?: string; ratio: PosterRatio; timeZone: string }) {
  const tall = ratio === "story";
  return (
    <>
      <div className="text-center">
        <PosterKick>{home?.name || "Home"} vs {away?.name || "Away"} - Group {match?.group || home?.group || ""}</PosterKick>
        <h2 className="mt-2 text-4xl uppercase leading-[.88] [font-family:var(--font-anton),Impact,sans-serif]">{headline || "Drop Your Score"}</h2>
      </div>
      <div className={`flex flex-1 items-center justify-center gap-3 ${tall ? "flex-col" : "flex-row"}`}>
        <ScoreSide team={home} score={scorePrediction?.split("-")[0]?.trim() || "?"} tall={tall} />
        <p className="shrink-0 text-4xl text-[var(--poster-pop)] [font-family:var(--font-anton),Impact,sans-serif]">VS</p>
        <ScoreSide team={away} score={scorePrediction?.split("-")[1]?.trim() || "?"} tall={tall} />
      </div>
      <p className="text-center text-[10px] font-black uppercase tracking-[0.14em] text-white/68">{formatKickoff(match?.kickoffUtc, timeZone)}</p>
    </>
  );
}

function ScoreSide({ team, score, tall }: { team?: Team; score: string; tall: boolean }) {
  return (
    <div className={`grid justify-items-center gap-2 ${tall ? "w-full" : "flex-1"}`}>
      <FlagBlock team={team} size={tall ? "lg" : "md"} />
      <p className={`max-w-full text-center ${longName(team?.name) ? "text-lg" : "text-xl"} uppercase leading-[.94] [font-family:var(--font-anton),Impact,sans-serif] ${textFit}`}>{team?.name || "Team"}</p>
      <p className="min-w-20 bg-white px-3 py-1 text-center text-6xl leading-none text-[#0E0C0A] [font-family:var(--font-anton),Impact,sans-serif]">{score}</p>
    </div>
  );
}

function PlayerPoster({ team, headline, playerName, jerseyName, shirtNumber, ratio }: { team?: Team; headline?: string; playerName?: string; jerseyName?: string; shirtNumber?: string; ratio: PosterRatio }) {
  const wide = ratio === "twitter";
  const name = playerName || headline?.replace(/\s+WATCH$/i, "") || "Player";
  // Coherent Player Watch copy: subtitle = team / WC2026, body = fixed line. Derived here so
  // schedule/prediction text can never bleed in from shared state.
  const label = (
    <div className="min-w-0 flex-1">
      <div className="flex items-center gap-3">
        <FlagBlock team={team} size="sm" />
        <PosterKick>{team?.name || "Fan pick"} / WC2026</PosterKick>
      </div>
      <PosterTitle compact={wide || name.length > 13}>{headline || `${name} WATCH`}</PosterTitle>
      <p className="mt-2 text-[10px] font-black uppercase tracking-[0.18em] text-white/70">Big-game energy. The name is enough.</p>
    </div>
  );
  const jersey = <GenericJerseyBack name={jerseyName || name.split(" ").slice(-1)[0]} number={shirtNumber || "10"} team={team} compact />;
  if (wide) return <div className="flex items-center gap-5">{label}<div className="shrink-0 scale-110">{jersey}</div></div>;
  return <><div className="grid flex-1 place-items-center">{jersey}</div><div className="pb-3">{label}</div></>;
}

function ChaosPoster({ team, teams, standings, group, headline, ratio }: { team?: Team; teams: Team[]; standings: Standing[]; group: string; headline?: string; ratio: PosterRatio }) {
  const wide = ratio === "twitter";
  const groupTeams = standings
    .filter((row) => row.group === group)
    .slice(0, 4)
    .map((row) => teams.find((item) => item.id === row.teamId))
    .filter(Boolean) as Team[];
  const shown = groupTeams.length ? groupTeams : teams.filter((item) => item.group === (team?.group || group)).slice(0, 4);
  const title = (
    <div className="min-w-0 flex-1">
      <PosterKick>Group stage</PosterKick>
      <PosterTitle compact={wide}>{headline || `Group ${team?.group || group} is loaded`}</PosterTitle>
      <p className="mt-3 inline-block rotate-[-2deg] bg-white px-3 py-1 text-3xl uppercase leading-none text-[#0E0C0A] [font-family:var(--font-anton),Impact,sans-serif]">Who survives?</p>
    </div>
  );
  const grid = (
    <div className={`grid grid-cols-2 gap-2 ${wide ? "w-[50%] shrink-0" : ""}`}>
      {shown.map((item) => (
        <div key={item.id} className="flex items-center gap-2 bg-white/10 p-2.5 backdrop-blur">
          <TeamFlag team={item} width={30} />
          <span className={`min-w-0 ${longName(item.name) ? "text-base" : "text-lg"} uppercase leading-none [font-family:var(--font-anton),Impact,sans-serif] ${textFit}`}>{item.name}</span>
        </div>
      ))}
    </div>
  );
  if (wide) return <div className="flex items-center gap-5">{title}{grid}</div>;
  return <>{title}<div className="mt-auto pb-3">{grid}</div></>;
}

function MenuPoster({ team, matches, headline, ratio, timeZone }: { team?: Team; matches: MatchWithTeams[]; headline?: string; ratio: PosterRatio; timeZone: string }) {
  const wide = ratio === "twitter";
  return (
    <div className={wide ? "grid grid-cols-[.85fr_1fr] items-center gap-5" : ""}>
      <div>
        <PosterKick>Matchday Menu</PosterKick>
        <PosterTitle compact={wide}>{headline || `Group ${team?.group || ""} Matchday`}</PosterTitle>
      </div>
      <div className="mt-auto grid gap-2 pb-3">
        {matches.slice(0, wide ? 3 : 4).map((match) => (
          <div key={match.id} className="grid grid-cols-[auto_1fr_auto_1fr_auto] items-center gap-2 bg-white/10 p-2.5">
            <TeamFlag team={match.homeTeam} width={28} />
            <span className={`min-w-0 text-sm font-black uppercase ${textFit}`}>{match.homeTeam.name}</span>
            <span className="text-[10px] font-black uppercase tracking-[0.12em] text-[var(--poster-pop)]">{formatKickoff(match.kickoffUtc, timeZone).split(",").at(-1) || "TBD"}</span>
            <span className={`min-w-0 text-right text-sm font-black uppercase ${textFit}`}>{match.awayTeam.name}</span>
            <TeamFlag team={match.awayTeam} width={28} className="justify-self-end" />
          </div>
        ))}
      </div>
    </div>
  );
}

function BootPoster({ team, players, headline, ratio }: { team?: Team; players: PlayerWithStats[]; headline?: string; ratio: PosterRatio }) {
  const wide = ratio === "twitter";
  const rows: Array<{ label: string; team?: Team; emoji?: string }> = players.length
    ? sortPlayersByStat(players, "goals").slice(0, wide ? 4 : 5).map((player) => ({ label: player.displayName || player.name, team: player.team }))
    : [
        // Global debate card: vary the icons so it reads as an open question, not a
        // single-country list. Row 1 anchors on the selected team (real flag); the rest
        // stay generic icons.
        { label: "PICK YOUR NO. 1", team },
        { label: "DARK HORSE STRIKER", emoji: "🌍" },
        { label: "PENALTY TAKER", emoji: "⚽" },
        { label: "BREAKOUT STAR", emoji: "🔥" }
      ];
  return (
    <div className={wide ? "grid grid-cols-[.8fr_1fr] items-center gap-5" : ""}>
      <div>
        <PosterKick>The Debate</PosterKick>
        <PosterTitle compact={wide}>{headline || "Who wins the Golden Boot?"}</PosterTitle>
      </div>
      <div className="mt-auto grid gap-2 pb-3">
        {rows.map((row, index) => (
          <div key={`${row.label}-${index}`} className={`grid grid-cols-[auto_auto_1fr] items-center gap-3 p-2.5 ${index === 0 ? "border border-[var(--poster-pop)] bg-white/16" : "bg-white/8"}`}>
            <span className="text-2xl text-[var(--poster-pop)] [font-family:var(--font-anton),Impact,sans-serif]">{index + 1}</span>
            {row.team ? <TeamFlag team={row.team} width={26} /> : <span className="text-xl leading-none">{row.emoji}</span>}
            <span className={`min-w-0 text-sm font-black uppercase ${textFit}`}>{row.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function UpsetPoster({ team, match, headline, subtitle, ratio }: { team?: Team; match?: MatchWithTeams; headline?: string; subtitle?: string; ratio: PosterRatio }) {
  const wide = ratio === "twitter";
  return (
    <div className={wide ? "grid grid-cols-[auto_1fr] items-center gap-5" : ""}>
      <FlagBlock team={team} size={wide ? "lg" : "xl"} />
      <div>
        <PosterKick>Upset Watch - Group {match?.group || team?.group || ""}</PosterKick>
        <PosterTitle compact={wide || longName(team?.name)}>{headline || `${team?.name || "Team"} can shock the group`}</PosterTitle>
        <PosterSub>{subtitle || "Dark horse - No fear - Believe"}</PosterSub>
      </div>
    </div>
  );
}

function CustomPoster({ team, headline, subtitle, playerName, jerseyName, shirtNumber, ratio }: { team?: Team; headline?: string; subtitle?: string; playerName?: string; jerseyName?: string; shirtNumber?: string; ratio: PosterRatio }) {
  const wide = ratio === "twitter";
  return (
    <div className={wide ? "grid grid-cols-[1fr_auto] items-center gap-5" : "grid h-full content-between"}>
      <div>
        <div className="flex items-center justify-between gap-3">
          <PosterKick>Fan Card</PosterKick>
          <FlagBlock team={team} size="sm" />
        </div>
        <PosterTitle compact={wide || (headline || "").length > 15}>{headline || "We Believe"}</PosterTitle>
        <PosterSub>{subtitle || playerName || team?.name || "Your flag. Your words."}</PosterSub>
      </div>
      {wide ? <GenericJerseyBack name={jerseyName || team?.fifaCode || "FAN"} number={shirtNumber || "26"} team={team} compact /> : null}
    </div>
  );
}

function PosterKick({ children }: { children: ReactNode }) {
  return <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[var(--poster-pop)]">{children}</p>;
}

function PosterTitle({ children, compact = false }: { children: ReactNode; compact?: boolean }) {
  return (
    <h2 className={`${compact ? "text-5xl" : "text-6xl"} mt-4 ${textFit} uppercase leading-[.84] tracking-[0.02em] text-white [font-family:var(--font-anton),Impact,sans-serif] [text-shadow:0_10px_30px_rgba(0,0,0,.45)]`}>
      {children}
    </h2>
  );
}

function PosterSub({ children }: { children: ReactNode }) {
  return <p className="mt-3 text-sm font-black uppercase leading-5 text-white/78">{children}</p>;
}

function FlagBlock({ team, size = "md" }: { team?: Team; size?: "sm" | "md" | "lg" | "xl" }) {
  const width = size === "xl" ? 96 : size === "lg" ? 72 : size === "md" ? 60 : 48;
  return <TeamFlag team={team} width={width} className="drop-shadow-[0_12px_24px_rgba(0,0,0,.35)]" />;
}

function posterStyle(team: Team | undefined, theme: PosterTheme): CSSProperties {
  const accent = normalizeHex(team?.primaryColor) || "#FF2D6B";
  if (theme === "night-gold") {
    return {
      background: `radial-gradient(circle at 18% 8%, rgba(231,195,107,.50), transparent 25%), radial-gradient(circle at 82% 72%, ${accent}40, transparent 34%), linear-gradient(140deg,#1A1712 0%,#0B0908 62%)`,
      "--poster-pop": "#E7C36B",
      "--poster-pop-ink": "#0E0C0A"
    } as CSSProperties;
  }
  // Festival/color theme: real team color, lightened at the top and deepened at the
  // bottom, so the shared black focus zone + grain read as a poster, not a flat fill.
  // The team's accent color drives the pop (kicker text, VS, "Save this" badge); dark
  // accents get lifted so they stay legible on the dark focus zone, keeping their hue.
  const accentColor = normalizeHex(team?.accentColor);
  let pop = "#C6F23E";
  let popInk = "#0E0C0A";
  if (accentColor) {
    const accentLum = luminance(accentColor);
    if (accentLum >= 0.45) {
      pop = accentColor;
      popInk = accentLum > 0.6 ? "#0E0C0A" : "#FFFFFF";
    } else {
      pop = shade(accentColor, 55); // lift dark accents so they read on the dark zone
      popInk = "#0E0C0A";
    }
  }
  return {
    background: `linear-gradient(155deg, ${shade(accent, 8)}, ${shade(accent, -34)})`,
    "--poster-pop": pop,
    "--poster-pop-ink": popInk
  } as CSSProperties;
}

function normalizeHex(value?: string) {
  if (!value) return null;
  const hex = value.trim().replace(/^#/, "");
  return /^[0-9a-fA-F]{6}$/.test(hex) ? `#${hex}` : null;
}

// Lighten (pct > 0) or darken (pct < 0) a #rrggbb color toward white/black.
function shade(hex: string, pct: number) {
  const n = parseInt(hex.replace("#", ""), 16);
  let r = (n >> 16) & 255;
  let g = (n >> 8) & 255;
  let b = n & 255;
  const f = pct / 100;
  r = Math.round(r + (f > 0 ? 255 - r : r) * f);
  g = Math.round(g + (f > 0 ? 255 - g : g) * f);
  b = Math.round(b + (f > 0 ? 255 - b : b) * f);
  const clamp = (x: number) => Math.max(0, Math.min(255, x));
  return `rgb(${clamp(r)},${clamp(g)},${clamp(b)})`;
}

function luminance(hex: string) {
  const n = parseInt(hex.replace("#", ""), 16);
  if (Number.isNaN(n)) return 0.4;
  const r = ((n >> 16) & 255) / 255;
  const g = ((n >> 8) & 255) / 255;
  const b = (n & 255) / 255;
  return 0.299 * r + 0.587 * g + 0.114 * b;
}

function seeded(index: number, salt: number) {
  const x = Math.sin(index * 29.13 + salt * 71) * 10000;
  return x - Math.floor(x);
}

function longName(name?: string) {
  return Boolean(name && name.length > 13);
}

function variantLabel(variant: PosterVariant) {
  return {
    prediction: "Prediction",
    player: "Player watch",
    chaos: "Group chaos",
    road: "Country road",
    menu: "Matchday menu",
    boot: "Golden boot",
    upset: "Upset watch",
    custom: "Fan card"
  }[variant];
}

function footerFor(variant: PosterVariant) {
  return {
    prediction: "Prediction battle / WC26 Hub",
    player: "Player watch / WC26 Hub",
    chaos: "Group debate / WC26 Hub",
    road: "Fan-made schedule / WC26 Hub",
    menu: "Matchday menu / WC26 Hub",
    boot: "Prediction debate / WC26 Hub",
    upset: "Fan-made preview / WC26 Hub",
    custom: "Custom fan card / WC26 Hub"
  }[variant];
}
