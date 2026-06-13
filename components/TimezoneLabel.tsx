"use client";

import { useTimezone } from "@/components/TimezoneProvider";
import { COMMON_TIMEZONES, formatTimeZoneLabel } from "@/lib/timezone";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

/**
 * Compact "Times shown in <timezone>" label, reflecting the shared TimezoneProvider state.
 * SSR + first paint: "Times shown in America/New York" (default timezone, no hydration
 * mismatch); updates after hydration to the viewer's selected/detected timezone.
 */
export function TimezoneLabel({ className }: { className?: string }) {
  const { timeZone } = useTimezone();
  return (
    <p className={className ?? "text-[11px] text-white/55"} suppressHydrationWarning>
      Times shown in {formatTimeZoneLabel(timeZone)}
    </p>
  );
}

/**
 * "Times shown in <timezone>" label + a small <select> letting the viewer override the
 * detected/saved timezone. Selection is persisted via TimezoneProvider (localStorage).
 */
export function TimezonePicker({ className }: { className?: string }) {
  const { timeZone, setTimeZone } = useTimezone();
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const options = COMMON_TIMEZONES.includes(timeZone)
    ? COMMON_TIMEZONES
    : [timeZone, ...COMMON_TIMEZONES];

  function handleTimezoneChange(nextTimeZone: string) {
    setTimeZone(nextTimeZone);
    const params = new URLSearchParams(searchParams.toString());
    params.set("tz", nextTimeZone);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }

  return (
    <div className={className ?? "flex flex-wrap items-center gap-2 text-[11px] text-white/55"}>
      <span suppressHydrationWarning>Times shown in {formatTimeZoneLabel(timeZone)}</span>
      <select
        value={timeZone}
        onChange={(e) => handleTimezoneChange(e.target.value)}
        aria-label="Timezone"
        suppressHydrationWarning
        className="rounded border border-white/15 bg-navyCard px-1.5 py-0.5 text-[11px] text-white/70"
      >
        {options.map((tz) => (
          <option key={tz} value={tz}>
            {formatTimeZoneLabel(tz)}
          </option>
        ))}
      </select>
    </div>
  );
}
