import { Ticker } from "@/components/Ticker";
import { Hero } from "@/components/Hero";
import { TriviaCard } from "@/components/TriviaCard";
import { TeamsByConfederationPreview } from "@/components/TeamsByConfederation";
import { OpeningMatchBanner } from "@/components/OpeningMatchBanner";

// ISR: revalidate periodically so date-dependent countdowns/banners (e.g. "opening
// match today" vs "opening match complete") don't stay frozen on stale static HTML.
export const revalidate = 60;

export default function TodayPage() {
  return (
    <>
      <Ticker />
      <OpeningMatchBanner />
      <Hero />
      <TriviaCard />
      <TeamsByConfederationPreview />
    </>
  );
}
