"use client";

import { CalendarPlus } from "lucide-react";
import type { MatchWithTeams } from "@/lib/types";
import { useTimezone } from "@/components/timezone-provider";

// Builds and downloads a standards-compliant .ics file for a single match. Times are written
// in UTC (the trailing "Z"), so any calendar app shows them correctly in the user's own zone.
// The currently selected site timezone is noted in the description for reference.

function pad(n: number) {
  return String(n).padStart(2, "0");
}

// ICS UTC timestamp: YYYYMMDDTHHMMSSZ
function toIcsUtc(date: Date) {
  return (
    `${date.getUTCFullYear()}${pad(date.getUTCMonth() + 1)}${pad(date.getUTCDate())}` +
    `T${pad(date.getUTCHours())}${pad(date.getUTCMinutes())}${pad(date.getUTCSeconds())}Z`
  );
}

// Escape ICS TEXT values per RFC 5545.
function escapeIcs(value: string) {
  return value.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");
}

function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

export function AddToCalendarButton({
  match,
  className = "",
  iconOnly = false
}: {
  match: MatchWithTeams;
  className?: string;
  iconOnly?: boolean;
}) {
  const { timeZone } = useTimezone();

  if (!match.kickoffUtc) return null;

  function handleDownload() {
    const start = new Date(match.kickoffUtc as string);
    if (Number.isNaN(start.getTime())) return;
    const end = new Date(start.getTime() + 2 * 60 * 60 * 1000); // assume 2h duration

    const title = `${match.homeTeam.name} vs ${match.awayTeam.name}`;
    const hasVenue = match.venue !== "TBD" && match.city !== "TBD";
    const location = hasVenue ? `${match.venue}, ${match.city}` : "Venue to be confirmed";
    const descParts = [
      "FIFA World Cup 2026",
      match.group ? `Group ${match.group}` : null,
      `Kickoff shown in ${timeZone} on wc26hub`
    ].filter(Boolean) as string[];

    const lines = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//WC26 Hub//World Cup 2026//EN",
      "CALSCALE:GREGORIAN",
      "METHOD:PUBLISH",
      "BEGIN:VEVENT",
      `UID:wc26-${match.id}@wc26hub`,
      `DTSTAMP:${toIcsUtc(new Date())}`,
      `DTSTART:${toIcsUtc(start)}`,
      `DTEND:${toIcsUtc(end)}`,
      `SUMMARY:${escapeIcs(`${title} (World Cup 2026)`)}`,
      `LOCATION:${escapeIcs(location)}`,
      `DESCRIPTION:${escapeIcs(descParts.join(" · "))}`,
      "END:VEVENT",
      "END:VCALENDAR"
    ];
    // CRLF line endings are required by the ICS spec.
    const blob = new Blob([lines.join("\r\n")], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `wc2026-${slugify(`${match.homeTeam.fifaCode}-${match.awayTeam.fifaCode}`)}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  if (iconOnly) {
    return (
      <button
        type="button"
        onClick={handleDownload}
        title="Add to calendar"
        aria-label="Add to calendar"
        className={`focus-ring grid h-9 w-9 place-items-center rounded-md border border-[rgba(14,12,10,.12)] text-[#0E0C0A]/70 transition hover:border-[#0E0C0A]/30 hover:text-[#0E0C0A] ${className}`}
      >
        <CalendarPlus size={16} />
        <span className="sr-only">Add to calendar</span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleDownload}
      className={`focus-ring inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-[rgba(14,12,10,.12)] px-3 py-2 text-sm font-bold text-[#0E0C0A] transition hover:bg-[#0E0C0A]/[0.04] ${className}`}
    >
      <CalendarPlus size={15} />
      Add to calendar
    </button>
  );
}
