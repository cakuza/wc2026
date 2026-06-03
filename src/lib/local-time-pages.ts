export const localTimePages = [
  { slug: "usa", country: "USA", timeZone: "America/New_York", label: "Eastern Time", intro: "For US fans, this page converts every imported kickoff into Eastern Time." },
  { slug: "uk", country: "UK", timeZone: "Europe/London", label: "UK time", intro: "UK viewers can scan every group-stage kickoff in local UK time." },
  { slug: "canada", country: "Canada", timeZone: "America/Toronto", label: "Eastern Canada time", intro: "Canada has host-city energy in 2026, and this page keeps the schedule in Eastern Canada time." },
  { slug: "mexico", country: "Mexico", timeZone: "America/Mexico_City", label: "Mexico City time", intro: "Mexico fans can see the tournament schedule in Mexico City time." },
  { slug: "brazil", country: "Brazil", timeZone: "America/Sao_Paulo", label: "Brasilia time", intro: "Brazil matchdays travel fast on social; this page keeps kickoffs in Brasilia time." },
  { slug: "argentina", country: "Argentina", timeZone: "America/Argentina/Buenos_Aires", label: "Buenos Aires time", intro: "Argentina fans can scan fixtures and build cards with Buenos Aires kickoff times." },
  { slug: "turkey", country: "Turkey", timeZone: "Europe/Istanbul", label: "Turkey time", intro: "Turkey viewers can see every imported fixture in Istanbul time." },
  { slug: "germany", country: "Germany", timeZone: "Europe/Berlin", label: "Germany time", intro: "Germany fans can create cards and check kickoffs in German local time." },
  { slug: "spain", country: "Spain", timeZone: "Europe/Madrid", label: "Spain time", intro: "Spain viewers get team links, card links, and kickoff conversion in Madrid time." },
  { slug: "france", country: "France", timeZone: "Europe/Paris", label: "France time", intro: "France fans can use card tools and scan kickoffs in Paris time." },
  { slug: "portugal", country: "Portugal", timeZone: "Europe/Lisbon", label: "Portugal time", intro: "Portugal fans can move quickly from local kickoff times to team-road cards." },
  { slug: "saudi-arabia", country: "Saudi Arabia", timeZone: "Asia/Riyadh", label: "Saudi Arabia time", intro: "Saudi Arabia viewers can browse imported kickoffs in Riyadh time." }
] as const;

export type LocalTimeSlug = (typeof localTimePages)[number]["slug"];

export function getLocalTimePage(slug: string) {
  return localTimePages.find((page) => page.slug === slug);
}
