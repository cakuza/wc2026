import { Ticker } from "@/components/Ticker";
import { Hero } from "@/components/Hero";
import { TriviaCard } from "@/components/TriviaCard";
import { TeamsByConfederationPreview } from "@/components/TeamsByConfederation";

export default function TodayPage() {
  return (
    <>
      <Ticker />
      <Hero />
      <TriviaCard />
      <TeamsByConfederationPreview />
    </>
  );
}
