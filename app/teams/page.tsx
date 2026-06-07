"use client";

import { TeamsGrid } from "@/components/TeamsGrid";
import { useLang } from "@/components/LanguageProvider";

export default function TeamsPage() {
  const { t } = useLang();
  return (
    <div className="mx-auto max-w-7xl px-4 pt-8">
      <h1 className="font-heading text-4xl font-extrabold uppercase tracking-wide text-white">{t("teams_title")}</h1>
      <p className="mt-2 max-w-3xl text-sm text-white/50">{t("teams_intro")}</p>
      <div className="-mx-4">
        <TeamsGrid />
      </div>
    </div>
  );
}
