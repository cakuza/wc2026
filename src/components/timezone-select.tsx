"use client";

import { QUICK_TIMEZONES } from "@/lib/timezones";
import { useTimezone } from "@/components/timezone-provider";

// Shared timezone dropdown wired to the site-wide context. `variant` matches the two
// surface styles in the app (light cards vs. dark pitch panels).
export function TimezoneSelect({
  variant = "light",
  className = ""
}: {
  variant?: "light" | "dark";
  className?: string;
}) {
  const { timeZone, setTimeZone } = useTimezone();
  const base =
    variant === "dark"
      ? "focus-ring w-full rounded-md border border-white/10 bg-pitch px-3 py-3 text-sm normal-case tracking-normal text-white"
      : "focus-ring rounded-md border border-[rgba(14,12,10,.10)] bg-[#F6F4F1] px-3 py-2 text-sm normal-case tracking-normal text-[#0E0C0A]";

  return (
    <select
      aria-label="Timezone"
      value={timeZone}
      onChange={(event) => setTimeZone(event.target.value)}
      className={`${base} ${className}`}
    >
      {!QUICK_TIMEZONES.includes(timeZone) ? <option value={timeZone}>{timeZone} (detected)</option> : null}
      {QUICK_TIMEZONES.map((zone) => (
        <option key={zone} value={zone}>
          {zone}
        </option>
      ))}
    </select>
  );
}
