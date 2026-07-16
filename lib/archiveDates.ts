/**
 * Candidate calendar dates for /world-cup-2026/results/[date] archive pages.
 * Selection rationale is documented in docs/seo/ROUTE_INVENTORY.md: every
 * date here either has direct GSC query-demand evidence ("total goals so
 * far july N") or is a structurally distinctive tournament date (opener,
 * quarterfinals, semifinals, third-place, final). This is a fixed,
 * deliberately short list — see the brief's explicit prohibition on
 * mass-generating thin daily pages.
 *
 * A date only becomes an actual indexable route once
 * lib/archiveLifecycle.ts#isDateFullyResolved confirms every match up to
 * and including it has a final result — see generateStaticParams in
 * app/world-cup-2026/results/[date]/page.tsx and app/sitemap.ts.
 */
export const CANDIDATE_ARCHIVE_DATES: readonly string[] = [
  "2026-06-11", // opening day
  "2026-07-03",
  "2026-07-04",
  "2026-07-05",
  "2026-07-06",
  "2026-07-07",
  "2026-07-08",
  "2026-07-09", // quarterfinals begin
  "2026-07-10",
  "2026-07-11", // quarterfinals conclude
  "2026-07-12", // rest day between QF and SF — cumulative snapshot only
  "2026-07-14", // semifinal 1
  "2026-07-15", // semifinal 2
  "2026-07-18", // third-place playoff
  "2026-07-19", // final
];
