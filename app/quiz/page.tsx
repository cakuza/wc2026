import type { Metadata } from "next";
import { QuizContent } from "@/components/QuizContent";

const BASE_URL = "https://www.worldcupmatchday.com";

export const metadata: Metadata = {
  title: "World Cup Quiz — Test Your 2026 Knowledge",
  description:
    "Take a quick interactive World Cup quiz covering tournament history, records and the 2026 edition. See how well you know the beautiful game.",
  alternates: { canonical: `${BASE_URL}/quiz` },
  openGraph: {
    title: "World Cup Quiz — Test Your 2026 Knowledge",
    description:
      "A quick interactive quiz on World Cup history, records and the 2026 tournament.",
    url: `${BASE_URL}/quiz`,
    type: "website",
  },
};

export default function QuizPage() {
  return <QuizContent />;
}
