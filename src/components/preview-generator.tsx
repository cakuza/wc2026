"use client";

import { Copy } from "lucide-react";
import { useMemo, useState } from "react";
import type { MatchWithTeams } from "@/lib/types";
import { formatKickoff } from "@/lib/timezones";
import { matchTitle } from "@/lib/utils";

export function PreviewGenerator({ matches }: { matches: MatchWithTeams[] }) {
  const [matchId, setMatchId] = useState(matches[0]?.id || "");
  const selected = matches.find((match) => match.id === matchId) || matches[0];

  const generated = useMemo(() => {
    if (!selected) return null;
    return generateDrafts(selected);
  }, [selected]);

  const [drafts, setDrafts] = useState(generated);
  const [status, setStatus] = useState("");

  if (!selected || !generated) return null;

  const currentDrafts = drafts || generated;

  return (
    <div className="grid gap-5 lg:grid-cols-[360px_1fr]">
      <aside className="rounded-lg border border-white/10 bg-white/[0.04] p-4">
        <label className="grid gap-2 text-xs font-bold uppercase tracking-[0.14em] text-white/55">
          Match
          <select
            value={selected.id}
            onChange={(event) => {
              const next = matches.find((match) => match.id === event.target.value) || selected;
              setMatchId(next.id);
              setDrafts(generateDrafts(next));
            }}
            className="focus-ring rounded-md border border-white/10 bg-pitch px-3 py-3 text-sm normal-case tracking-normal text-white"
          >
            {matches.map((match) => (
              <option key={match.id} value={match.id}>
                {match.homeTeam.name} vs {match.awayTeam.name}
              </option>
            ))}
          </select>
        </label>
        <div className="mt-5 rounded-md bg-pitch p-4 text-sm leading-6 text-white/68">
          <p className="font-bold text-white">{matchTitle(selected)}</p>
          <p>{selected.kickoffUtc ? formatKickoff(selected.kickoffUtc, "Europe/Istanbul") : "Local time unavailable."}</p>
          <p>{selected.venue === "TBD" || selected.city === "TBD" ? "Venue unavailable." : `${selected.venue}, ${selected.city}`}</p>
        </div>
        <p className="mt-4 text-sm text-white/55">{status || "All copy is generated locally from deterministic templates."}</p>
      </aside>
      <div className="grid gap-4">
        <Textarea label="Match hype headline" value={currentDrafts.headline} onChange={(headline) => setDrafts({ ...currentDrafts, headline })} rows={2} />
        <Textarea label="X post" value={currentDrafts.x} onChange={(x) => setDrafts({ ...currentDrafts, x })} rows={4} helperText={`${currentDrafts.x.length}/280 characters`} onCopy={() => copyText(currentDrafts.x, "X post")} />
        <Textarea label="WhatsApp message" value={currentDrafts.whatsapp} onChange={(whatsapp) => setDrafts({ ...currentDrafts, whatsapp })} rows={4} onCopy={() => copyText(currentDrafts.whatsapp, "WhatsApp message")} />
        <Textarea label="Group-chat post" value={currentDrafts.telegram} onChange={(telegram) => setDrafts({ ...currentDrafts, telegram })} rows={6} onCopy={() => copyText(currentDrafts.telegram, "Group-chat post")} />
        <Textarea label="Instagram caption" value={currentDrafts.instagram} onChange={(instagram) => setDrafts({ ...currentDrafts, instagram })} rows={5} onCopy={() => copyText(currentDrafts.instagram, "Instagram caption")} />
        <Textarea label="Short SEO paragraph" value={currentDrafts.seo} onChange={(seo) => setDrafts({ ...currentDrafts, seo })} rows={5} onCopy={() => copyText(currentDrafts.seo, "SEO paragraph")} />
      </div>
    </div>
  );

  async function copyText(value: string, label: string) {
    try {
      await navigator.clipboard.writeText(value);
      setStatus(`${label} copied.`);
    } catch {
      setStatus("Copy failed in this browser. Select the text manually.");
    }
  }
}

function generateDrafts(match: MatchWithTeams) {
  const title = matchTitle(match);
  const time = match.kickoffUtc ? formatKickoff(match.kickoffUtc, "Europe/Istanbul") : "Local time unavailable";
  const venueLine = match.venue === "TBD" || match.city === "TBD" ? "Venue unavailable" : `${match.venue}, ${match.city}`;
  const matchLink = `/matches`;
  const teamLink = `/teams/${match.homeTeam.slug}`;
  return {
    headline: `${title}: Group ${match.group} gets a storyline`,
    x: `${title} gives Group ${match.group} its next storyline. Who starts stronger?\n\nSave the matchup: ${matchLink}\n\n#WorldCup2026`,
    whatsapp: `Group ${match.group} matchup: ${title}. ${time}. Save this one and send it to the group.`,
    telegram: `${title}\nGroup ${match.group} matchup\n${time}\n${venueLine}\n\nSave the schedule and create a fan card before kickoff.\n\nSchedule: ${matchLink}`,
    instagram: `First-game pressure, group-stage nerves, and a chance to set the tone.\n\n${title}\nSave the matchup.\n\n${time}\n\n#WorldCup #WorldCup2026`,
    seo: `${title} is a Group ${match.group} World Cup 2026 matchup built for fan-card sharing, prediction posts, and schedule saving. ${time}. ${venueLine}. Follow the full schedule at ${matchLink} and the ${match.homeTeam.name} team page at ${teamLink}.`
  };
}

function Textarea({
  label,
  value,
  onChange,
  rows,
  helperText,
  onCopy
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  rows: number;
  helperText?: string;
  onCopy?: () => void;
}) {
  return (
    <label className="grid gap-2 text-xs font-bold uppercase tracking-[0.14em] text-white/55">
      <span className="flex items-center justify-between gap-3">
        {label}
        {onCopy ? (
          <button type="button" onClick={onCopy} className="focus-ring inline-flex items-center gap-2 rounded-md border border-white/10 px-2 py-1 text-white/70">
            <Copy size={14} />
            Copy
          </button>
        ) : null}
      </span>
      <textarea
        value={value}
        rows={rows}
        onChange={(event) => onChange(event.target.value)}
        className="focus-ring min-h-28 rounded-lg border border-white/10 bg-white/[0.04] p-4 text-sm normal-case leading-6 tracking-normal text-white"
      />
      {helperText ? <span className="text-right text-xs normal-case tracking-normal text-white/45">{helperText}</span> : null}
    </label>
  );
}
