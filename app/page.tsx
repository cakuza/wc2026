import { Ticker } from "@/components/Ticker";
import { Hero } from "@/components/Hero";
import { TriviaCard } from "@/components/TriviaCard";
import { TeamsByConfederationPreview } from "@/components/TeamsByConfederation";
import { OpeningMatchBanner } from "@/components/OpeningMatchBanner";

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
