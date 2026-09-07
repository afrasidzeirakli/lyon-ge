import Image from "next/image";
import Link from "next/link";
import clsx from "clsx";
import { localePath, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import type { ProductWithPrice } from "@/lib/catalog";
import { localized } from "@/lib/site";
import { Price } from "./Price";

type Props = {
  product: ProductWithPrice;
  lang: Locale;
  dict: Dictionary;
  className?: string;
  priority?: boolean;
  sizes?: string;
};

export function ProductCard({ product, lang, dict, className, priority, sizes }: Props) {
  const image = product.images[0]?.url ?? null;
  const name = localized(product, lang);
  const soldOut = product.totalStock <= 0;
  const { pricing } = product;

  return (
    <Link href={localePath(lang, `/product/${product.slug}`)} className={clsx("group block", className)}>
      <div className="product-media relative aspect-[4/5] overflow-hidden rounded-card shadow-[var(--shadow-card)]">
        {image ? (
          <Image
            src={image}
            alt={name}
            fill
            priority={priority}
            sizes={sizes ?? "(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"}
            className={clsx("object-cover transition-transform duration-[900ms] ease-[var(--ease-out-expo)] group-hover:scale-[1.05]", soldOut && "opacity-60")}
          />
        ) : (
          <div className="absolute inset-0 grid place-items-center text-muted-2">LYON</div>
        )}
        <div className="absolute top-3 left-3 flex flex-col items-start gap-1.5">
          {product.isNew ? <span className="badge bg-ink text-white">{dict.common.new}</span> : null}
          {pricing.discountPercent > 0 ? <span className="badge bg-accent text-white">−{pricing.discountPercent}%</span> : null}
          {soldOut ? <span className="badge bg-white/90 text-ink">{dict.common.outOfStock}</span> : null}
        </div>
        {product.isBestSeller && !product.isNew ? (
          <span className="badge absolute top-3 right-3 bg-white/90 text-ink">{dict.common.bestSeller}</span>
        ) : null}
      </div>

      <div className="mt-3.5 flex items-start justify-between gap-3">
        <div className="min-w-0">
          {product.brand ? <p className="text-[11px] font-medium tracking-[0.12em] text-muted uppercase">{product.brand.name}</p> : null}
          <h3 className="mt-0.5 truncate text-[15px] leading-snug font-medium text-ink group-hover:underline group-hover:underline-offset-4">{name}</h3>
        </div>
        <Price price={pricing.price} finalPrice={pricing.finalPrice} className="shrink-0 justify-end text-right" />
      </div>
      {product.colors.length > 0 ? (
        <div className="mt-2 flex items-center gap-1.5">
          {product.colors.slice(0, 5).map((c) => (
            <span
              key={c.id}
              title={lang === "en" ? c.nameEn : c.nameKa}
              className="h-3.5 w-3.5 rounded-full border border-ink/10"
              style={{ backgroundColor: c.hex }}
            />
          ))}
          {product.colors.length > 5 ? <span className="text-[11px] text-muted">+{product.colors.length - 5}</span> : null}
        </div>
      ) : null}
    </Link>
  );
}
