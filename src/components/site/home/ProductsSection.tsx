import Link from "next/link";
import { localePath, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import type { ProductWithPrice } from "@/lib/catalog";
import { ProductCard } from "../ProductCard";
import { ProductCarousel } from "../ProductCarousel";
import { Reveal } from "../Reveal";
import { SectionHeading } from "./SectionHeading";

type Props = {
  title: string;
  subtitle?: string;
  products: ProductWithPrice[];
  lang: Locale;
  dict: Dictionary;
  viewAllHref?: string;
};

export function ProductsSection({ title, subtitle, products, lang, dict, viewAllHref }: Props) {
  if (products.length === 0) return null;
  return (
    <section className="container-x py-16 lg:py-24">
      <Reveal>
        <SectionHeading title={title} subtitle={subtitle} />
      </Reveal>
      <div className="mt-12">
        <ProductCarousel labels={{ prev: dict.common.prev, next: dict.common.next }}>
          {products.map((p, i) => (
            <div key={p.id} data-card className="w-[74vw] shrink-0 snap-start sm:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)] xl:w-[calc(25%-18px)]">
              <ProductCard product={p} lang={lang} dict={dict} priority={i < 2} sizes="(max-width: 640px) 74vw, (max-width: 1024px) 50vw, 25vw" />
            </div>
          ))}
        </ProductCarousel>
      </div>
      {viewAllHref ? (
        <div className="mt-6 text-center">
          <Link href={localePath(lang, viewAllHref)} className="text-sm font-medium underline underline-offset-4 hover:text-muted">
            {dict.common.viewAll}
          </Link>
        </div>
      ) : null}
    </section>
  );
}
