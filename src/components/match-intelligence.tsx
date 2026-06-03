import Link from "next/link";
import { ImageIcon } from "lucide-react";
import { DataStatusNotice } from "@/components/data-status-notice";
import type { MatchIntelligenceBundle } from "@/lib/match-intelligence";
import type { DataConfidence, InjuryWatchItem, LineupWatchItem, MatchWithTeams, NewsWatchItem, TalkingPoint, Team } from "@/lib/types";
import { formatKickoff } from "@/lib/timezones";

export function MatchIntelligencePanel({
  match,
  perspectiveTeam,
  bundle,
  timezone = "Europe/Istanbul"
}: {
  match: MatchWithTeams;
  perspectiveTeam?: Team;
  bundle: MatchIntelligenceBundle;
  timezone?: string;
}) {
  const team = perspectiveTeam || match.homeTeam;
  const opponent = match.homeTeamId === team.id ? match.awayTeam : match.homeTeam;

  return (
    <section className="rounded-lg border border-white/10 bg-white/[0.035] p-4 md:p-5">
      <div className="mb-4 grid gap-3 md:grid-cols-[1fr_auto] md:items-start">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-gold">Opponent watch</p>
          <h2 className="text-2xl font-black text-white">Opponent Watch: {opponent.name}</h2>
          <p className="mt-2 text-sm leading-6 text-white/62">
            {match.homeTeam.fifaCode} vs {match.awayTeam.fifaCode} / {formatKickoff(match.kickoffUtc, timezone)} / {match.venue === "TBD" || match.city === "TBD" ? "Official venue details coming soon" : `${match.venue}, ${match.city}`}
          </p>
        </div>
        <div className="flex flex-wrap gap-2 md:justify-end">
          <DataConfidenceBadge confidence={bundle.intelligence?.confidence || "low"} label="fan notes" />
          <LastChecked value={bundle.intelligence?.lastCheckedUtc} />
        </div>
      </div>
      <details className="mb-4 rounded-lg border border-white/10 bg-white/[0.035] p-3">
        <summary className="cursor-pointer text-sm font-black text-white">Data status</summary>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          {!match.kickoffUtc ? <DataStatusNotice variant="schedulePending" compact /> : null}
          <DataStatusNotice variant="newsWatchPending" compact />
        </div>
      </details>
      <OpponentWatch match={match} team={team} opponent={opponent} bundle={bundle} />
      <div className="mt-4 grid gap-4">
        <TalkingPoints items={bundle.talkingPoints} />
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <ActionLink href={`/cards?template=prediction&match=${match.id}`} label="Create prediction card" />
      </div>
    </section>
  );
}

export function OpponentWatch({
  opponent,
  bundle
}: {
  match: MatchWithTeams;
  team: Team;
  opponent: Team;
  bundle: MatchIntelligenceBundle;
}) {
  const visibleRiskNotes = (bundle.intelligence?.riskNotes || []).filter((note) => !/reminder|injury feed|lineup feed|news feed/i.test(note));
  return (
    <div className="rounded-lg border border-gold/20 bg-gold/8 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-gold">Save before kickoff</p>
          <h3 className="mt-1 text-xl font-black text-white">{opponent.flagEmoji} {opponent.name} opponent summary</h3>
        </div>
        <SourceLabel labels={bundle.intelligence?.sourceLabels || ["Review notes later"]} />
      </div>
      <p className="mt-3 text-sm leading-6 text-white/68">{bundle.intelligence?.opponentSummary || "Save the matchup now. Reviewed opponent notes can be added closer to matchday."}</p>
      <div className="mt-3 grid gap-2 md:grid-cols-2">
        {(bundle.intelligence?.keyPlayerWatch || ["Create prediction card", "Create opponent watch card"]).map((item) => (
          <span key={item} className="rounded-md bg-pitch/70 px-3 py-2 text-sm font-bold text-white/72">{item}</span>
        ))}
      </div>
      {visibleRiskNotes.length ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {visibleRiskNotes.map((note) => (
            <span key={note} className="rounded-full border border-white/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.1em] text-white/50">{note}</span>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export function InjuryWatchList({ items, title = "Injury Watch" }: { items: InjuryWatchItem[]; title?: string }) {
  return (
    <Panel title={title} kicker="Reported / expected / monitoring">
      {items.length ? items.map((item) => (
        <div key={item.id} className="rounded-md bg-pitch/70 p-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="font-black text-white">{item.playerName}</p>
            <DataConfidenceBadge confidence={item.confidence} label={item.status} />
          </div>
          <p className="mt-2 text-sm leading-6 text-white/62">{item.reason}</p>
          <p className="mt-2 text-xs font-bold uppercase tracking-[0.12em] text-white/42">{item.expectedReturn || "Return unknown"}</p>
          <SourceLabel labels={[item.sourceLabel]} />
        </div>
      )) : <EmptyCopy text="No sourced injury or suspension items yet. Add reviewed notes closer to matchday." />}
    </Panel>
  );
}

export function LineupWatchPreview({ items, title = "Lineup Watch" }: { items: LineupWatchItem[]; title?: string }) {
  return (
    <Panel title={title} kicker="Predicted / confirmed later">
      {items.length ? items.map((item) => (
        <div key={`${item.matchId}-${item.teamId}`} className="rounded-md bg-pitch/70 p-3">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <p className="font-black text-white">{item.formation} / {item.type}</p>
            <DataConfidenceBadge confidence={item.confidence} label={item.isSample ? "review later" : item.type} />
          </div>
          <div className="grid gap-2">
            {item.players.slice(0, 6).map((player) => (
              <div key={`${player.playerName}-${player.position}`} className="flex items-center justify-between rounded-md bg-white/[0.05] px-3 py-2 text-sm">
                <span className="font-bold text-white">{player.shirtNumber ? `#${player.shirtNumber} ` : ""}{player.playerName}</span>
                <span className="text-white/50">{player.position} / {player.status}</span>
              </div>
            ))}
          </div>
          <SourceLabel labels={[item.sourceLabel]} />
        </div>
      )) : <EmptyCopy text="No predicted lineup yet. Add one after review." />}
    </Panel>
  );
}

export function NewsHeadlines({ items }: { items: NewsWatchItem[] }) {
  return (
    <Panel title="Latest Headlines" kicker="Title / source / short summary only">
      {items.length ? items.map((item) => (
        <div key={item.id} className="rounded-md bg-pitch/70 p-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="font-black text-white">{item.title}</p>
            <DataConfidenceBadge confidence={item.confidence} label={item.isSample ? "review later" : item.category} />
          </div>
          <p className="mt-2 text-sm leading-6 text-white/62">{item.summary}</p>
          <p className="mt-2 text-xs font-bold uppercase tracking-[0.12em] text-white/42">{item.sourceName} / {new Date(item.publishedAt).toLocaleDateString("en")}</p>
          {item.isSensitive ? <p className="mt-2 text-xs font-bold text-gold">Sensitive: needs careful source review before publishing.</p> : null}
        </div>
      )) : <EmptyCopy text="No reviewed headlines yet. Add title, source, date, and link later." />}
    </Panel>
  );
}

export function TalkingPoints({ items }: { items: TalkingPoint[] }) {
  return (
    <Panel title="Talking Points" kicker="Safe debate prompts">
      {items.length ? items.map((item) => (
        <div key={item.id} className="rounded-md bg-pitch/70 p-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="font-black text-white">{item.title}</p>
            <DataConfidenceBadge confidence={item.confidence} label={item.category} />
          </div>
          <p className="mt-2 text-sm leading-6 text-white/62">{item.body}</p>
          {item.sourceLabel ? <SourceLabel labels={[item.sourceLabel]} /> : null}
        </div>
      )) : <EmptyCopy text="No talking points yet. Add tactical, player, or rivalry prompts later." />}
    </Panel>
  );
}

export function DataConfidenceBadge({ confidence, label }: { confidence: DataConfidence; label?: string }) {
  const color = confidence === "high" ? "border-emerald-400/30 text-emerald-200" : confidence === "medium" ? "border-gold/35 text-gold" : "border-white/12 text-white/55";
  return <span className={`rounded-full border px-2 py-1 text-[10px] font-black uppercase tracking-[0.12em] ${color}`}>{label || confidence}</span>;
}

export function SourceLabel({ labels }: { labels: string[] }) {
  // Hide internal/dev source tags; only surface real attributions to users.
  const shown = labels.filter((label) => !/mvp|static|fallback|pending|manual|review (notes )?later/i.test(label));
  if (!shown.length) return null;
  return <p className="mt-2 text-[10px] font-black uppercase tracking-[0.12em] text-white/38">Source: {shown.join(", ")}</p>;
}

export function LastChecked({ value }: { value?: string }) {
  if (!value) return null;
  return <span className="rounded-full border border-white/10 px-2 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-white/45">Checked {new Date(value).toLocaleDateString("en")}</span>;
}

function Panel({ title, kicker, children }: { title: string; kicker: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.035] p-4">
      <p className="text-xs font-black uppercase tracking-[0.18em] text-gold">{kicker}</p>
      <h3 className="mt-1 text-xl font-black text-white">{title}</h3>
      <div className="mt-3 grid gap-3">{children}</div>
    </div>
  );
}

function ActionLink({ href, label }: { href: string; label: string }) {
  return (
    <Link href={href} className="focus-ring inline-flex items-center gap-2 rounded-md border border-white/12 px-3 py-2 text-xs font-bold text-white hover:text-gold">
      <ImageIcon size={14} />
      {label}
    </Link>
  );
}

function EmptyCopy({ text }: { text: string }) {
  return <p className="rounded-md bg-pitch/70 p-3 text-sm leading-6 text-white/55">{text}</p>;
}
