"use client";

import { useMemo, useState } from "react";
import { Check, Minus, Plus, ShoppingBag } from "lucide-react";
import clsx from "clsx";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { fill } from "@/i18n/dictionaries";
import { whatsappLink } from "@/lib/settings";
import { useCart } from "../cart/CartProvider";
import { WhatsAppIcon } from "../WhatsAppFab";

export type BuyProduct = {
  id: number;
  slug: string;
  nameKa: string;
  nameEn: string;
  brand: string | null;
  image: string | null;
  finalPrice: number;
  sizes: { size: string; stock: number }[];
  colors: { nameKa: string; nameEn: string; hex: string }[];
};

type Props = { product: BuyProduct; lang: Locale; dict: Dictionary; whatsapp: string; url: string };

export function BuyPanel({ product, lang, dict, whatsapp, url }: Props) {
  const cart = useCart();
  const t = dict.product;
  const [size, setSize] = useState<string | null>(null);
  const [colorIdx, setColorIdx] = useState(0);
  const [qty, setQty] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [added, setAdded] = useState(false);

  const name = lang === "en" ? product.nameEn : product.nameKa;
  const selected = useMemo(() => product.sizes.find((s) => s.size === size) ?? null, [product.sizes, size]);
  const anyStock = product.sizes.some((s) => s.stock > 0);
  const color = product.colors[colorIdx] ?? null;
  const maxQty = selected ? Math.max(1, selected.stock) : 1;

  const waText = fill(t.whatsappMessage, { name: `${product.brand ? product.brand + " " : ""}${name}`, size: size ? ` (${dict.common.size} ${size})` : "", url });

  const add = () => {
    if (!selected) {
      setError(t.sizeRequired);
      return;
    }
    setError(null);
    cart.add({
      productId: product.id,
      slug: product.slug,
      nameKa: product.nameKa,
      nameEn: product.nameEn,
      brand: product.brand,
      image: product.image,
      size: selected.size,
      colorKa: color?.nameKa ?? null,
      colorEn: color?.nameEn ?? null,
      qty,
      unitPrice: product.finalPrice,
      maxQty: selected.stock,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="space-y-6">
      {product.colors.length > 0 ? (
        <div>
          <div className="mb-2.5 flex items-center justify-between text-sm">
            <span className="font-medium">{dict.common.color}</span>
            {color ? <span className="text-muted">{lang === "en" ? color.nameEn : color.nameKa}</span> : null}
          </div>
          <div className="flex flex-wrap gap-2">
            {product.colors.map((c, i) => (
              <button
                key={`${c.hex}-${i}`}
                type="button"
                onClick={() => setColorIdx(i)}
                aria-label={lang === "en" ? c.nameEn : c.nameKa}
                aria-pressed={i === colorIdx}
                className={clsx("grid h-9 w-9 place-items-center rounded-full border-2 transition", i === colorIdx ? "border-ink" : "border-transparent hover:border-ink/30")}
              >
                <span className="h-6 w-6 rounded-full border border-ink/10" style={{ backgroundColor: c.hex }} />
              </button>
            ))}
          </div>
        </div>
      ) : null}

      <div>
        <div className="mb-2.5 flex items-center justify-between text-sm">
          <span className="font-medium">{t.selectSize}</span>
          <span className="text-muted">{t.sizeGuide}</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {product.sizes.map((s) => {
            const out = s.stock <= 0;
            const active = s.size === size;
            return (
              <button
                key={s.size}
                type="button"
                disabled={out}
                onClick={() => {
                  setSize(s.size);
                  setQty(1);
                  setError(null);
                }}
                aria-pressed={active}
                className={clsx(
                  "relative h-11 min-w-14 rounded-full border px-4 text-[14px] tabular-nums transition",
                  active ? "border-ink bg-ink text-white" : "border-line bg-paper hover:border-ink",
                  out && "cursor-not-allowed text-muted-2 line-through hover:border-line"
                )}
              >
                {s.size}
                {!out && s.stock <= 2 ? <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-accent" title={dict.common.lowStock} /> : null}
              </button>
            );
          })}
        </div>
        {selected && selected.stock <= 2 ? <p className="mt-2 text-[12px] text-accent">{dict.common.lowStock}</p> : null}
        {error ? <p className="mt-2 text-[13px] text-danger">{error}</p> : null}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="inline-flex h-12 items-center self-start rounded-full border border-line bg-paper">
          <button type="button" onClick={() => setQty((q) => Math.max(1, q - 1))} className="grid h-12 w-12 place-items-center rounded-full hover:bg-cream-2" aria-label="−">
            <Minus className="h-4 w-4" />
          </button>
          <span className="w-8 text-center tabular-nums">{qty}</span>
          <button type="button" onClick={() => setQty((q) => Math.min(maxQty, q + 1))} disabled={qty >= maxQty} className="grid h-12 w-12 place-items-center rounded-full hover:bg-cream-2 disabled:opacity-40" aria-label="+">
            <Plus className="h-4 w-4" />
          </button>
        </div>
        <button type="button" onClick={add} disabled={!anyStock} className={clsx("btn btn-lg flex-1", added ? "bg-success text-white" : "btn-primary")}>
          {added ? <Check className="h-5 w-5" /> : <ShoppingBag className="h-5 w-5" />}
          {anyStock ? (added ? dict.common.added : dict.common.addToCart) : dict.common.outOfStock}
        </button>
      </div>

      {whatsapp ? (
        <a href={whatsappLink(whatsapp, waText)} target="_blank" rel="noopener noreferrer" className="btn btn-whatsapp btn-lg w-full">
          <WhatsAppIcon className="h-5 w-5" /> {t.whatsappOrder}
        </a>
      ) : null}
    </div>
  );
}
