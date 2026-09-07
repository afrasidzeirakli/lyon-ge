"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, ShoppingBag, Trash } from "lucide-react";
import { localePath, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { fill } from "@/i18n/dictionaries";
import { formatPrice } from "@/lib/money";
import { useCart } from "./CartProvider";

export function CartPage({ lang, dict }: { lang: Locale; dict: Dictionary }) {
  const cart = useCart();
  const t = dict.cart;
  if (!cart.hydrated) return null;

  if (cart.items.length === 0) {
    return (
      <div className="flex flex-col items-center rounded-2xl border border-dashed border-line px-6 py-20 text-center">
        <ShoppingBag className="h-10 w-10 text-muted-2" strokeWidth={1.5} />
        <p className="mt-3 text-lg font-medium">{t.empty}</p>
        <p className="mt-1 text-sm text-muted">{t.emptyHint}</p>
        <Link href={localePath(lang, "/shop")} className="btn btn-primary mt-6">
          {t.continue}
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_380px] lg:gap-16">
      <ul className="divide-y divide-line">
        {cart.items.map((item) => (
          <li key={item.key} className="flex gap-5 py-5">
            <Link href={localePath(lang, `/product/${item.slug}`)} className="product-media relative h-32 w-26 shrink-0 overflow-hidden rounded-xl sm:h-36 sm:w-30">
              {item.image ? <Image src={item.image} alt="" fill sizes="120px" className="object-cover" /> : null}
            </Link>
            <div className="flex min-w-0 flex-1 flex-col">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  {item.brand ? <p className="text-[11px] tracking-wider text-muted uppercase">{item.brand}</p> : null}
                  <Link href={localePath(lang, `/product/${item.slug}`)} className="block truncate text-[16px] font-medium hover:underline">
                    {lang === "en" ? item.nameEn : item.nameKa}
                  </Link>
                  <p className="mt-1 text-[13px] text-muted">
                    {dict.common.size}: {item.size}
                    {item.colorKa ? ` · ${lang === "en" ? item.colorEn : item.colorKa}` : ""}
                  </p>
                </div>
                <button type="button" onClick={() => cart.remove(item.key)} aria-label={t.remove} className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-muted hover:bg-ink/5 hover:text-danger">
                  <Trash className="h-4 w-4" />
                </button>
              </div>
              <div className="mt-auto flex items-center justify-between pt-3">
                <div className="inline-flex h-10 items-center rounded-full border border-line bg-paper">
                  <button type="button" onClick={() => cart.setQty(item.key, item.qty - 1)} className="grid h-10 w-10 place-items-center rounded-full hover:bg-cream-2" aria-label="−">
                    <Minus className="h-3.5 w-3.5" />
                  </button>
                  <span className="w-7 text-center text-sm tabular-nums">{item.qty}</span>
                  <button type="button" onClick={() => cart.setQty(item.key, item.qty + 1)} disabled={item.qty >= item.maxQty} className="grid h-10 w-10 place-items-center rounded-full hover:bg-cream-2 disabled:opacity-40" aria-label="+">
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>
                <p className="font-semibold tabular-nums">{formatPrice(item.qty * item.unitPrice)}</p>
              </div>
            </div>
          </li>
        ))}
      </ul>

      <aside className="card h-max p-6 lg:sticky lg:top-24">
        <div className="flex items-center justify-between">
          <span className="text-muted">{fill(t.items, { n: cart.count })}</span>
          <span className="text-xl font-semibold tabular-nums">{formatPrice(cart.subtotal)}</span>
        </div>
        <p className="mt-1 text-[12px] text-muted">{t.shippingNote}</p>
        <Link href={localePath(lang, "/checkout")} className="btn btn-primary btn-lg mt-5 w-full">
          {t.checkout}
        </Link>
        <Link href={localePath(lang, "/shop")} className="btn btn-outline mt-2 w-full">
          {t.continue}
        </Link>
      </aside>
    </div>
  );
}
