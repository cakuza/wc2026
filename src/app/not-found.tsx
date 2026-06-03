import Link from "next/link";
import { PageShell } from "@/components/page-shell";

export default function NotFound() {
  return (
    <PageShell>
      <section className="rounded-lg border border-white/10 bg-white/[0.04] p-8 text-center">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-gold">404</p>
        <h1 className="mt-3 text-3xl font-black text-white">Page not found</h1>
        <p className="mx-auto mt-3 max-w-xl text-white/62">This route is not in the static World Cup 2026 MVP yet.</p>
        <Link href="/" className="mt-6 inline-flex rounded-md bg-gold px-4 py-3 font-black text-pitch">
          Go home
        </Link>
      </section>
    </PageShell>
  );
}
