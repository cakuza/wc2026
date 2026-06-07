"use client";

import { QuizClient } from "@/components/QuizClient";
import { useLang } from "@/components/LanguageProvider";

export default function QuizPage() {
  const { t } = useLang();
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="mb-8 text-center font-heading text-4xl font-extrabold uppercase tracking-tight text-white sm:text-5xl">
        {t("quiz_title")}
      </h1>
      <QuizClient />
    </div>
  );
}
