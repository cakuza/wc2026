import { Ticker } from "@/components/Ticker";
import { Hero } from "@/components/Hero";
import { TriviaCard } from "@/components/TriviaCard";
import { TeamsGrid } from "@/components/TeamsGrid";

export default function TodayPage() {
  return (
    <>
      <Ticker />
      <Hero />
      <TriviaCard />
      <TeamsGrid showHeading />
    </>
  );
}
