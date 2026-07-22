"use client";

import Link from "next/link";
import { useLang } from "@/components/LanguageProvider";

export function AboutContent() {
  const { t } = useLang();

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <p className="mb-2 font-heading text-sm font-bold uppercase tracking-[0.3em] text-accent">
        {t("about_tagline")}
      </p>
      <h1 className="mb-6 font-heading text-3xl font-extrabold uppercase tracking-tight text-ink sm:text-4xl">
        {t("about_title")}
      </h1>

      <div className="space-y-5 text-sm leading-relaxed text-muted">
        <p>{t("about_p1")}</p>
        <p>{t("about_p2")}</p>
        <p>{t("about_p3")}</p>
        <p>
          {t("about_p4")}{" "}
          <a
            href="mailto:worldcupmatchday@proton.me"
            className="font-semibold text-accent underline underline-offset-2 hover:text-ink"
          >
            worldcupmatchday@proton.me
          </a>
          .
        </p>
        <p>{t("about_p5")}</p>
      </div>

      <div className="mt-10 flex flex-wrap gap-x-4 gap-y-2 text-sm">
        <Link href="/privacy" className="font-heading font-bold uppercase tracking-wide text-faint hover:text-ink transition">
          {t("about_link_privacy")}
        </Link>
        <span className="text-faint">·</span>
        <Link href="/terms" className="font-heading font-bold uppercase tracking-wide text-faint hover:text-ink transition">
          {t("about_link_terms")}
        </Link>
        <span className="text-faint">·</span>
        <Link href="/contact" className="font-heading font-bold uppercase tracking-wide text-faint hover:text-ink transition">
          {t("about_link_contact")}
        </Link>
        <span className="text-faint">·</span>
        <Link href="/editorial-policy" className="font-heading font-bold uppercase tracking-wide text-faint hover:text-ink transition">
          Editorial Policy
        </Link>
        <span className="text-faint">·</span>
        <Link href="/corrections-policy" className="font-heading font-bold uppercase tracking-wide text-faint hover:text-ink transition">
          Corrections Policy
        </Link>
      </div>
    </div>
  );
}
