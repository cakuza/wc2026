import type { ReactNode } from "react";

export function PageShell({ children }: { children: ReactNode }) {
  return <main className="mx-auto w-full max-w-7xl px-4 py-6 text-[#0E0C0A] md:py-8">{children}</main>;
}

export function PageIntro({
  kicker,
  title,
  copy,
  children
}: {
  kicker: string;
  title: string;
  copy: string;
  children?: ReactNode;
}) {
  return (
    <section className="mb-6 grid gap-4 md:mb-8 md:grid-cols-[1fr_auto] md:items-end">
      <div>
        <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-[#B48A00]">{kicker}</p>
        <h1 className="max-w-4xl text-3xl font-black leading-tight text-[#0E0C0A] md:text-5xl">{title}</h1>
        <p className="mt-3 max-w-2xl text-base leading-7 text-[#0E0C0A]/68">{copy}</p>
      </div>
      {children}
    </section>
  );
}
