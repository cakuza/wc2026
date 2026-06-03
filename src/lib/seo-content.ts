import type { FaqItem, InternalLinkItem } from "@/components/seo-blocks";

export const coreInternalLinks: InternalLinkItem[] = [
  { href: "/matches", label: "Matchups", description: "Filter fixtures by local time, date, team, and group." },
  { href: "/standings", label: "Standings", description: "Browse group tables and third-place watch lists." },
  { href: "/leaderboards", label: "Leaderboards", description: "Track scorers, assists, yellow cards, and red cards." },
  { href: "/cards", label: "Create cards", description: "Generate shareable schedule and leaderboard images." }
];

export const defaultFaqs: FaqItem[] = [
  {
    question: "How are World Cup match times shown?",
    answer: "Imported kick-off timestamps are converted by the timezone selected on the schedule pages."
  },
  {
    question: "Can I see World Cup matches in my local timezone?",
    answer: "Yes. Use the matches page or local-time pages to convert fixtures into your preferred timezone."
  },
  {
    question: "Where can I find today's World Cup matches?",
    answer: "Use the matches page for filters or the dedicated today's matches landing page for a quick, shareable overview."
  },
  {
    question: "How often are standings updated?",
    answer: "Before the tournament, standings stay in pre-tournament mode. During the tournament, the same structure can be updated manually or connected to a cached sports API later."
  },
  {
    question: "Can I share the schedule as an image?",
    answer: "Yes. The cards page includes visual previews and a PNG download workflow for schedules, standings, match previews, and leaderboards."
  }
];

export const seoLandingPages = [
  {
    slug: "world-cup-matches-today",
    title: "World Cup Matches Today",
    description: "See today's World Cup matchups, local times, and quick links to cards and previews.",
    kicker: "Today",
    heading: "World Cup matchups today for cards and previews.",
    intro: [
      "This page is built for fans searching for the fastest way to see the next World Cup fixtures and save local kickoff times.",
      "The schedule uses imported kickoff timestamps, then turns matchups into fan cards and preview copy."
    ],
    mode: "matches-today"
  },
  {
    slug: "world-cup-schedule-local-time",
    title: "World Cup Time Conversion",
    description: "World Cup fixture time conversion by country and timezone.",
    kicker: "Time conversion",
    heading: "World Cup time conversion for imported kickoffs.",
    intro: [
      "World Cup audiences are global, so kickoff time clarity matters before every matchday.",
      "The current product converts imported fixture timestamps while the main experience focuses on fan cards, team roads, and matchup sharing."
    ],
    mode: "schedule"
  },
  {
    slug: "world-cup-standings",
    title: "World Cup Standings",
    description: "Follow World Cup group standings, goal difference, points, and best third-place watch lists.",
    kicker: "Tables",
    heading: "World Cup standings pages ready for search and sharing.",
    intro: [
      "Group tables are one of the highest-intent World Cup searches, so this page gives a fast indexable entry point to standings content.",
      "Pre-tournament standings keep the launch simple while preserving the exact data shape needed for live API or manual updates later."
    ],
    mode: "standings"
  },
  {
    slug: "world-cup-top-scorers",
    title: "World Cup Top Scorers",
    description: "View the World Cup top scorers leaderboard and create shareable top-five scorer cards.",
    kicker: "Goals",
    heading: "World Cup top scorers leaderboard for pre-launch content.",
    intro: [
      "Top scorer searches spike quickly during tournaments. This page gives the leaderboard a dedicated SEO surface while the MVP stays in pre-tournament debate mode.",
      "Each player row can feed social cards, short posts, and leaderboard updates without needing a database in the first launch."
    ],
    mode: "top-scorers"
  },
  {
    slug: "world-cup-assists-leaderboard",
    title: "World Cup Assists Leaderboard",
    description: "Track World Cup assists leaders with mock player stats and shareable leaderboard links.",
    kicker: "Assists",
    heading: "World Cup assists leaderboard for creators and fans.",
    intro: [
      "Assists are a strong secondary leaderboard for fans, fantasy players, and social accounts that need quick stat angles.",
      "The page uses static player stat data now and can be upgraded to a cached API feed when traffic proves demand."
    ],
    mode: "assists"
  },
  {
    slug: "world-cup-yellow-cards",
    title: "World Cup Yellow Cards",
    description: "Check World Cup yellow card leaders and discipline trends with simple mock data.",
    kicker: "Discipline",
    heading: "World Cup yellow cards leaderboard for matchday context.",
    intro: [
      "Discipline pages can capture searches around suspensions, tactical fouls, and tournament storylines.",
      "This MVP keeps the surface lean with mock yellow-card data while leaving room for API-driven updates later."
    ],
    mode: "yellow-cards"
  }
] as const;

export type SeoLandingSlug = (typeof seoLandingPages)[number]["slug"];

export const requestedTeamScheduleSlugs = [
  "brazil-world-cup-schedule",
  "argentina-world-cup-schedule",
  "france-world-cup-schedule",
  "england-world-cup-schedule",
  "portugal-world-cup-schedule",
  "germany-world-cup-schedule",
  "spain-world-cup-schedule",
  "usa-world-cup-schedule",
  "mexico-world-cup-schedule",
  "turkey-world-cup-schedule"
];

export const teamScheduleNames: Record<string, string> = {
  brazil: "Brazil",
  argentina: "Argentina",
  france: "France",
  england: "England",
  portugal: "Portugal",
  germany: "Germany",
  spain: "Spain",
  usa: "United States",
  mexico: "Mexico",
  turkey: "Turkey"
};
