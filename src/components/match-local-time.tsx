"use client";

import { CalendarDays } from "lucide-react";
import { useTimezone } from "@/components/timezone-provider";
import { formatKickoff } from "@/lib/timezones";

// Timezone-aware kickoff line for the match detail header. Resolves from the site-wide
// timezone selection on the client.
export function MatchLocalTime({ kickoffUtc }: { kickoffUtc?: string | null }) {
  const { timeZone } = useTimezone();
  return (
    <span className="inline-flex items-center gap-2">
      <CalendarDays size={17} className="text-[#B48A00]" />
      <span className="font-black text-[#0E0C0A]">
        {kickoffUtc ? `${formatKickoff(kickoffUtc, timeZone)} · Local time` : "Kickoff time to be confirmed"}
      </span>
    </span>
  );
}
