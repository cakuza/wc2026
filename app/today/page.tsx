import type { Metadata } from "next";
import Link from "next/link";
import { Flag } from "@/components/Flag";
import { MatchTime } from "@/components/MatchTime";
import { getDisplayMatchday, matchSlug, type Match } from "@/lib/matches";
import { countryName } from "@/lib/i18n";

const BASE_URL = "https://www.worldcupmatchday.com";

// Recompute "today" periodically so the page stays fresh across day boundaries while still
// being statically served (and present in raw HTML) for crawlers.
export const revalidate = 1800;

export const metadata: Metadata = {
  title: "World Cup Matches Today – Fixtures, Kickoff Times & Venues",
  description:
    "See today's World Cup 2026 matches with teams, kickoff times, groups and venues.",
  alternates: { canonical: `${BASE_URL}/today` },
  openGraph: {
    title: "World Cup Matches Today – Fixtures, Kickoff Times & Venues",
    description:
      "See today's World Cup 2026 matches with teams, kickoff times, groups and venues.",
    url: `${BASE_URL}/today`,
    type: "website",
  },
};

const FAQS: { q: string; a: string }[] = [
  {
    q: "Who plays today in the World Cup?",
    a: "When games are scheduled, today's fixtures are listed above with their kickoff times, groups and venues. If there are no matches today, the next upcoming matchday is shown instead.",
  },
  {
    q: "What time are today's World Cup matches?",
    a: "Kickoff times are shown in US Eastern (ET) and, in your browser, in your own local timezone. The tournament's opening match kicks off at 3:00 PM ET on 11 June 2026.",
  },
  {
    q: "Where can I see the full World Cup schedule?",
    a: "The complete fixture list is on the schedule page, and the 12 groups with standings are on the groups page.",
  },
  {
    q: "Is this an official FIFA site?",
    a: "No. WorldCupMatchDay is an independent fan resource for following the 2026 World Cup and is not affiliated with FIFA.",
  },
];

const faqLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQS.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
};

function longDate(iso: string) {
  return new Intl.DateTimeFormat("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(`${iso}T00:00:00`));
}

function MatchRow({ m }: { m: Match }) {
  const home = countryName(m.homeKey, "en");
  const away = countryName(m.awayKey, "en");
  return (
    <Link
      href={`/matches/${matchSlug(m)}`}
      className="flex items-center gap-3 rounded-lg border border-white/10 bg-navyCard px-4 py-3 transition hover:border-white/20 hover:bg-white/5"
    >
      <div className="flex flex-1 items-center justify-end gap-2 text-end">
        <span className="truncate font-semibold text-white">{home}</span>
        <Flag code={m.homeCode} name={home} width={30} height={22} />
      </div>
      <span className="shrink-0 rounded bg-navy px-2 py-1 font-heading text-xs font-bold uppercase text-white/50">
        vs
      </span>
      <div className="flex flex-1 items-center gap-2">
        <Flag code={m.awayCode} name={away} width={30} height={22} />
        <span className="truncate font-semibold text-white">{away}</span>
      </div>
      <div className="ms-2 hidden w-32 shrink-0 text-end text-xs text-white/50 sm:block">
        <MatchTime match={m} className="font-semibold text-white/80" />
        <div>
          {m.group ? `Group ${m.group}` : ""}
          {m.group && m.venue ? " · " : ""}
          {m.venue ?? ""}
        </div>
      </div>
    </Link>
  );
}

export default function TodayPage() {
  const md = getDisplayMatchday();
  const isToday = md.labelKey === "sec_todayMatches";
  const days = md.days ?? [{ date: md.date, matches: md.matches }];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }}
      />

      <div className="mx-auto max-w-4xl px-4 py-8">
        <h1 className="mb-2 font-heading text-4xl font-extrabold uppercase tracking-wide text-white">
          {isToday ? "World Cup Matches Today" : "No World Cup Matches Today"}
        </h1>
        <p className="mb-6 max-w-3xl text-sm text-white/50">
          See today&apos;s World Cup 2026 matches, kickoff times, teams, groups and venues. If no
          matches are scheduled today, the next upcoming fixtures are shown.
        </p>

        {!isToday && (
          <div className="mb-6 rounded-xl border border-white/10 bg-navyCard px-4 py-4 text-sm text-white/60">
            <p className="font-semibold text-white/80">No World Cup matches are scheduled today.</p>
            <p className="mt-1">Here are the next upcoming fixtures. See the full {" "}
              <Link href="/schedule" className="font-semibold text-accent underline underline-offset-2 hover:text-white">match schedule</Link>{" "}
              or the {" "}
              <Link href="/groups" className="font-semibold text-accent underline underline-offset-2 hover:text-white">group standings</Link>.
            </p>
          </div>
        )}

        <div className="space-y-8">
          {days.map(({ date, matches }) => (
            <section key={date}>
              <h2 className="mb-3 border-b-2 border-accent pb-2 font-heading text-xl font-extrabold uppercase tracking-wide text-white">
                {isToday ? "Today" : "Next"} · {longDate(date)}
              </h2>
              <div className="space-y-2">
                {matches.map((m, i) => (
                  <MatchRow key={`${date}-${i}`} m={m} />
                ))}
              </div>
            </section>
          ))}
        </div>

        {/* Quick links */}
        <div className="mt-8 flex flex-wrap gap-3 text-sm">
          <Link href="/schedule" className="rounded-lg border border-white/15 bg-navyCard px-4 py-2 font-heading text-xs font-bold uppercase tracking-wide text-white/70 transition hover:border-white/30 hover:text-white">
            Full Schedule
          </Link>
          <Link href="/groups" className="rounded-lg border border-white/15 bg-navyCard px-4 py-2 font-heading text-xs font-bold uppercase tracking-wide text-white/70 transition hover:border-white/30 hover:text-white">
            Groups
          </Link>
          <Link href="/world-cup-schedule-local-time" className="rounded-lg border border-white/15 bg-navyCard px-4 py-2 font-heading text-xs font-bold uppercase tracking-wide text-white/70 transition hover:border-white/30 hover:text-white">
            Schedule by Time Zone
          </Link>
        </div>

        {/* FAQ */}
        <section className="mt-10">
          <h2 className="mb-3 font-heading text-2xl font-extrabold uppercase tracking-wide text-white">
            FAQ
          </h2>
          <div className="space-y-3">
            {FAQS.map((f) => (
              <div key={f.q} className="rounded-xl border border-white/10 bg-navyCard p-4">
                <h3 className="font-heading text-sm font-extrabold uppercase tracking-wide text-white sm:text-base">
                  {f.q}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-white/70">{f.a}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
