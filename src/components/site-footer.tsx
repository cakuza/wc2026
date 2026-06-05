import Link from "next/link";

const footerLinks = [
  { href: "/world-cup-2026-format", label: "Tournament format" },
  { href: "/world-cup-2026-tiebreakers", label: "Tiebreaker rules" },
  { href: "/groups", label: "Groups" },
  { href: "/matches", label: "Schedule" },
  { href: "/privacy-policy", label: "Privacy Policy" }
];

// Subtle site-wide footer. WC26 Hub is an unofficial fan project.
export function SiteFooter() {
  return (
    <footer className="mx-auto w-full max-w-7xl px-4 py-8 text-center">
      <nav className="mb-3 flex flex-wrap justify-center gap-x-4 gap-y-2 text-xs font-bold text-[#0E0C0A]/60">
        {footerLinks.map((link) => (
          <Link key={link.href} href={link.href} className="transition hover:text-[#B48A00]">
            {link.label}
          </Link>
        ))}
      </nav>
      <p className="text-xs leading-5 text-[#0E0C0A]/45">
        WC26 Hub is a fan-made site. Not affiliated with FIFA or any official organization.
      </p>
    </footer>
  );
}
