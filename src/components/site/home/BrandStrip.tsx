import Link from "next/link";
import type { Brand } from "@prisma/client";
import { localePath, type Locale } from "@/i18n/config";

export function BrandStrip({ brands, lang, label }: { brands: Brand[]; lang: Locale; label: string }) {
  if (brands.length === 0) return null;
  const items = [...brands, ...brands];
  return (
    <section className="hairline border-b border-line py-8" aria-label={label}>
      <div className="no-scrollbar overflow-hidden">
        <div className="flex w-max animate-marquee items-center gap-14 whitespace-nowrap">
          {items.map((b, i) => (
            <Link
              key={`${b.id}-${i}`}
              href={localePath(lang, `/shop?brand=${b.slug}`)}
              className="display text-3xl text-ink/25 transition-colors hover:text-ink sm:text-4xl"
              aria-hidden={i >= brands.length}
              tabIndex={i >= brands.length ? -1 : 0}
            >
              {b.name}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
