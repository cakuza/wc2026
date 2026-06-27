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
      <h1 className="mb-6 font-heading text-3xl font-extrabold uppercase tracking-tight text-white sm:text-4xl">
        {t("about_title")}
      </h1>

      <div className="space-y-5 text-sm leading-relaxed text-white/70">
        <p>{t("about_p1")}</p>
        <p>{t("about_p2")}</p>
        <p>{t("about_p3")}</p>
        <p>
          {t("about_p4")}{" "}
          <a
            href="mailto:worldcupmatchday@proton.me"
            className="font-semibold text-accent underline underline-offset-2 hover:text-white"
          >
            worldcupmatchday@proton.me
          </a>
          .
        </p>
        <p>{t("about_p5")}</p>
      </div>

      <div className="mt-10 flex gap-4 text-sm">
        <Link href="/privacy" className="font-heading font-bold uppercase tracking-wide text-white/40 hover:text-white/80 transition">
          {t("about_link_privacy")}
        </Link>
        <span className="text-white/20">·</span>
        <Link href="/terms" className="font-heading font-bold uppercase tracking-wide text-white/40 hover:text-white/80 transition">
          {t("about_link_terms")}
        </Link>
        <span className="text-white/20">·</span>
        <Link href="/contact" className="font-heading font-bold uppercase tracking-wide text-white/40 hover:text-white/80 transition">
          {t("about_link_contact")}
        </Link>
      </div>
    </div>
  );
}
