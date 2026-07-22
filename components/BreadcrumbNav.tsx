import Link from "next/link";

export type BreadcrumbItem = { label: string; href?: string };

interface BreadcrumbNavProps {
  items: BreadcrumbItem[];
}

export function BreadcrumbNav({ items }: BreadcrumbNavProps) {
  return (
    <nav aria-label="Breadcrumb" className="mb-4">
      <ol className="flex flex-wrap items-center gap-1 font-heading text-[11px] font-bold uppercase tracking-widest text-faint">
        {items.map((item, i) => (
          <li key={i} className="flex items-center gap-1">
            {i > 0 && <span aria-hidden="true">›</span>}
            {item.href ? (
              <Link href={item.href} className="hover:text-muted transition-colors">
                {item.label}
              </Link>
            ) : (
              <span className="text-muted" aria-current="page">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

/** Build JSON-LD BreadcrumbList schema from breadcrumb items. */
export function breadcrumbLd(items: BreadcrumbItem[], base: string) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.label,
      item: item.href ? `${base}${item.href}` : undefined,
    })),
  };
}
