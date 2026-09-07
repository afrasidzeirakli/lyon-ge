import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, Phone, ShieldCheck, Truck } from "lucide-react";
import { hasLocale, localePath } from "@/i18n/config";
import { getDictionary, fill } from "@/i18n/dictionaries";
import { resolveLang, localized, typeLabel, siteUrl } from "@/lib/site";
import { getProductBySlug, getRelatedProducts } from "@/lib/catalog";
import { getSettings, telLink } from "@/lib/settings";
import { formatPrice } from "@/lib/money";
import { Gallery } from "@/components/site/product/Gallery";
import { BuyPanel } from "@/components/site/product/BuyPanel";
import { Price } from "@/components/site/Price";
import { ProductCard } from "@/components/site/ProductCard";
import { Headline } from "@/components/site/Headline";
import { Lines } from "@/components/site/Headline";

type Props = { params: Promise<{ lang: string; slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang, slug } = await params;
  if (!hasLocale(lang)) return {};
  const product = await getProductBySlug(slug);
  if (!product) return {};
  const name = localized(product, lang);
  const description = (lang === "en" ? product.descriptionEn : product.descriptionKa) || name;
  return {
    title: `${product.brand ? product.brand.name + " " : ""}${name}`,
    description: description.slice(0, 160),
    openGraph: { images: product.images[0] ? [{ url: product.images[0].url }] : [] },
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const lang = await resolveLang(params);
  const dict = getDictionary(lang);
  const product = await getProductBySlug(slug);
  if (!product) notFound();
  const [related, settings] = await Promise.all([getRelatedProducts(product), getSettings()]);

  const name = localized(product, lang);
  const description = lang === "en" ? product.descriptionEn : product.descriptionKa;
  const t = dict.product;
  const url = `${siteUrl()}${localePath(lang, `/product/${product.slug}`)}`;
  const { pricing } = product;

  return (
    <div className="container-x pt-6 pb-16 lg:pt-8">
      <nav aria-label="breadcrumb" className="flex flex-wrap items-center gap-1.5 text-[13px] text-muted">
        <Link href={localePath(lang, "/shop")} className="hover:text-ink">
          {dict.nav.shop}
        </Link>
        {product.category ? (
          <>
            <ChevronRight className="h-3.5 w-3.5" />
            <Link href={localePath(lang, `/shop?category=${product.category.slug}`)} className="hover:text-ink">
              {localized(product.category, lang)}
            </Link>
          </>
        ) : null}
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-ink">{name}</span>
      </nav>

      <div className="mt-6 grid gap-10 lg:grid-cols-[1.15fr_1fr] lg:gap-16">
        <Gallery images={product.images} name={name} badge={product.isNew ? dict.common.new : pricing.discountPercent > 0 ? `−${pricing.discountPercent}%` : null} />

        <div className="lg:pt-2">
          <div className="flex flex-wrap items-center gap-2 text-[12px] font-medium tracking-[0.14em] text-muted uppercase">
            {product.brand ? (
              <Link href={localePath(lang, `/shop?brand=${product.brand.slug}`)} className="hover:text-ink">
                {product.brand.name}
              </Link>
            ) : null}
            {product.productType ? (
              <>
                <span aria-hidden="true">·</span>
                <span>{typeLabel(dict, product.productType)}</span>
              </>
            ) : null}
          </div>
          <Headline as="h1" text={name} className="mt-2 text-3xl sm:text-4xl lg:text-5xl" />
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <Price price={pricing.price} finalPrice={pricing.finalPrice} size="lg" />
            {pricing.discountPercent > 0 ? (
              <span className="badge bg-accent/10 text-accent">{fill(t.youSave, { amount: formatPrice(pricing.price - pricing.finalPrice) })}</span>
            ) : null}
            {pricing.promotion ? <span className="badge bg-ink text-white">{lang === "en" ? pricing.promotion.titleEn : pricing.promotion.titleKa}</span> : null}
          </div>

          <div className="mt-8">
            <BuyPanel
              product={{
                id: product.id,
                slug: product.slug,
                nameKa: product.nameKa,
                nameEn: product.nameEn,
                brand: product.brand?.name ?? null,
                image: product.images[0]?.url ?? null,
                finalPrice: pricing.finalPrice,
                sizes: product.sizes.map((s) => ({ size: s.size, stock: s.stock })),
                colors: product.colors.map((c) => ({ nameKa: c.nameKa, nameEn: c.nameEn, hex: c.hex })),
              }}
              lang={lang}
              dict={dict}
              whatsapp={settings.whatsapp}
              url={url}
            />
          </div>

          <ul className="mt-8 space-y-3 rounded-2xl border border-line bg-paper p-5 text-[14px]">
            <li className="flex items-start gap-3">
              <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-success" />
              <span>{t.original}</span>
            </li>
            <li className="flex items-start gap-3">
              <Truck className="mt-0.5 h-5 w-5 shrink-0 text-ink" />
              <span>
                {fill(t.deliveryText, { days: settings.deliveryDays })}{" "}
                <span className="text-muted">
                  {settings.shippingFee > 0 ? fill(t.shippingFee, { fee: formatPrice(settings.shippingFee) }) : ""}
                  {settings.freeShippingFrom > 0 ? ` · ${fill(t.freeFrom, { amount: formatPrice(settings.freeShippingFrom) })}` : ""}
                </span>
              </span>
            </li>
            {settings.phone ? (
              <li className="flex items-start gap-3">
                <Phone className="mt-0.5 h-5 w-5 shrink-0 text-ink" />
                <a href={telLink(settings.phone)} className="hover:underline">
                  {t.callUs}: {settings.phone}
                </a>
              </li>
            ) : null}
          </ul>

          {description ? (
            <div className="mt-8">
              <h2 className="text-[12px] font-semibold tracking-[0.16em] text-muted uppercase">{t.description}</h2>
              <p className="mt-3 text-[15px] leading-relaxed text-ink-3">
                <Lines text={description} />
              </p>
            </div>
          ) : null}
        </div>
      </div>

      {related.length > 0 ? (
        <section className="mt-20">
          <Headline text={t.related} className="text-3xl sm:text-4xl" />
          <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-8 sm:gap-x-6 lg:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} lang={lang} dict={dict} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
