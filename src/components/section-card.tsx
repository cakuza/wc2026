import type { ReactNode } from "react";

export function SectionCard({
  title,
  action,
  children
}: {
  title: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="rounded-lg border border-[rgba(14,12,10,.10)] bg-white p-4 md:p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-xl font-black text-[#0E0C0A]">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}
