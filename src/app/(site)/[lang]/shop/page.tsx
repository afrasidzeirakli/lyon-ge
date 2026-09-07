import type { Metadata } from "next";
import { Suspense } from "react";
import { getDictionary, fill } from "@/i18n/dictionaries";
import { hasLocale } from "@/i18n/config";
import { resolveLang, localized, categoryLabel } from "@/lib/site";
import { getShopProducts, getTaxonomies, getAvailableSizes, type ShopFilters } from "@/lib/catalog";
import { ProductCard } from "@/components/site/ProductCard";
import { Filters, SortSelect } from "@/components/site/shop/Filters";
import { Headline } from "@/components/site/Headline";

type SP = Record<string, string | string[] | undefined>;
type Props = { params: Promise<{ lang: string }>; searchParams: Promise<SP> };

const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? "";
const num = (v: string) => (v && /^\d+$/.test(v) ? Number(v) : undefined);

function parseFilters(sp: SP): ShopFilters {
  const sort = one(sp.sort);
  return {
    q: one(sp.q) || undefined,
    category: one(sp.category) || undefined,
    brand: one(sp.brand) || undefined,
    type: one(sp.type) || undefined,
    size: one(sp.size) || undefined,
    min: num(one(sp.min)),
    max: num(one(sp.max)),
    sale: one(sp.sale) === "1",
    new: one(sp.new) === "1",
    sort: (["newest", "price-asc", "price-desc", "popular"] as const).includes(sort as never) ? (sort as ShopFilters["sort"]) : "newest",
  };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const dict = getDictionary(lang);
  return { title: dict.shop.title, description: dict.meta.description };
}

export default async function ShopPage({ params, searchParams }: Props) {
  const lang = await resolveLang(params);
  const dict = getDictionary(lang);
  const filters = parseFilters(await searchParams);
  const [products, { categories, brands }, sizes] = await Promise.all([getShopProducts(filters), getTaxonomies(), getAvailableSizes()]);

  let title = dict.shop.title;
  if (filters.q) title = fill(dict.shop.searchResults, { q: filters.q });
  else if (filters.category) {
    const cat = categories.find((c) => c.slug === filters.category);
    title = cat ? localized(cat, lang) : categoryLabel(dict, filters.category);
  } else if (filters.sale) title = dict.nav.sale;
  else if (filters.new) title = dict.nav.new;

  return (
    <div className="container-x pt-8 pb-16 lg:pt-12">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Headline as="h1" text={title} className="text-4xl sm:text-5xl lg:text-6xl" />
          <p className="mt-2 text-sm text-muted">{fill(dict.shop.results, { n: products.length })}</p>
        </div>
        <Suspense>
          <SortSelect dict={dict} />
        </Suspense>
      </div>

      <div className="mt-8 grid gap-8 lg:mt-12 lg:grid-cols-[240px_1fr] lg:gap-12">
        <div>
          <Suspense>
            <Filters
              lang={lang}
              dict={dict}
              categories={categories.map((c) => ({ value: c.slug, label: localized(c, lang) }))}
              brands={brands.map((b) => ({ value: b.slug, label: b.name }))}
              sizes={sizes}
            />
          </Suspense>
        </div>

        {products.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-line py-24 text-center">
            <p className="text-lg font-medium">{dict.shop.noResults}</p>
            <p className="mt-1 text-sm text-muted">{dict.shop.noResultsHint}</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 content-start gap-x-4 gap-y-8 self-start sm:gap-x-6 lg:grid-cols-3 lg:gap-y-10 xl:grid-cols-4">
            {products.map((p, i) => (
              <ProductCard key={p.id} product={p} lang={lang} dict={dict} priority={i < 4} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
