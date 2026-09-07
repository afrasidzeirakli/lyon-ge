"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";
import { Minus, Plus, ShoppingBag, Trash, X } from "lucide-react";
import clsx from "clsx";
import { localePath, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { fill } from "@/i18n/dictionaries";
import { formatPrice } from "@/lib/money";
import { toMtavruli } from "@/lib/georgian";
import { useCart } from "./CartProvider";

type Props = { lang: Locale; dict: Dictionary };

export function CartDrawer({ lang, dict }: Props) {
  const cart = useCart();
  const t = dict.cart;

  useEffect(() => {
    if (!cart.isOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && cart.close();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [cart.isOpen, cart]);

  return (
    <>
      <div
        aria-hidden="true"
        onClick={cart.close}
        className={clsx("fixed inset-0 z-[60] bg-ink/50 backdrop-blur-[2px] transition-opacity duration-300", cart.isOpen ? "opacity-100" : "pointer-events-none opacity-0")}
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label={t.title}
        className={clsx(
          "fixed inset-y-0 right-0 z-[70] flex w-full max-w-md flex-col bg-cream shadow-[var(--shadow-float)] transition-transform duration-500 ease-[var(--ease-out-expo)]",
          cart.isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        <header className="flex items-center justify-between border-b border-line px-5 py-4">
          <h2 className="display text-xl">
            {toMtavruli(t.title)} <span className="text-muted-2">{cart.count > 0 ? `(${cart.count})` : ""}</span>
          </h2>
          <button type="button" onClick={cart.close} aria-label={dict.nav.close} className="grid h-10 w-10 place-items-center rounded-full hover:bg-ink/5">
            <X className="h-5 w-5" />
          </button>
        </header>

        {cart.items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
            <ShoppingBag className="h-10 w-10 text-muted-2" strokeWidth={1.5} />
            <p className="font-medium">{t.empty}</p>
            <p className="text-sm text-muted">{t.emptyHint}</p>
            <Link href={localePath(lang, "/shop")} onClick={cart.close} className="btn btn-primary mt-3">
              {t.continue}
            </Link>
          </div>
        ) : (
          <>
            <ul className="flex-1 space-y-4 overflow-y-auto px-5 py-5">
              {cart.items.map((item) => (
                <li key={item.key} className="flex gap-4">
                  <Link href={localePath(lang, `/product/${item.slug}`)} onClick={cart.close} className="product-media relative h-24 w-20 shrink-0 overflow-hidden rounded-xl">
                    {item.image ? <Image src={item.image} alt="" fill sizes="80px" className="object-cover" /> : null}
                  </Link>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        {item.brand ? <p className="text-[11px] tracking-wider text-muted uppercase">{item.brand}</p> : null}
                        <p className="truncate text-[14px] font-medium">{lang === "en" ? item.nameEn : item.nameKa}</p>
                        <p className="mt-0.5 text-[12px] text-muted">
                          {dict.common.size}: {item.size}
                          {item.colorKa ? ` · ${lang === "en" ? item.colorEn : item.colorKa}` : ""}
                        </p>
                      </div>
                      <button type="button" onClick={() => cart.remove(item.key)} aria-label={t.remove} className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-muted hover:bg-ink/5 hover:text-danger">
                        <Trash className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="mt-2 flex items-center justify-between">
                      <div className="inline-flex h-9 items-center rounded-full border border-line bg-paper">
                        <button type="button" onClick={() => cart.setQty(item.key, item.qty - 1)} className="grid h-9 w-9 place-items-center rounded-full hover:bg-cream-2" aria-label="−">
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <span className="w-6 text-center text-sm tabular-nums">{item.qty}</span>
                        <button
                          type="button"
                          onClick={() => cart.setQty(item.key, item.qty + 1)}
                          disabled={item.qty >= item.maxQty}
                          className="grid h-9 w-9 place-items-center rounded-full hover:bg-cream-2 disabled:opacity-40"
                          aria-label="+"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <p className="text-[14px] font-semibold tabular-nums">{formatPrice(item.qty * item.unitPrice)}</p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
            <footer className="border-t border-line bg-paper px-5 py-5">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted">{fill(t.items, { n: cart.count })}</span>
                <span className="text-lg font-semibold tabular-nums">{formatPrice(cart.subtotal)}</span>
              </div>
              <p className="mt-1 text-[12px] text-muted">{t.shippingNote}</p>
              <Link href={localePath(lang, "/checkout")} onClick={cart.close} className="btn btn-primary btn-lg mt-4 w-full">
                {t.checkout}
              </Link>
              <button type="button" onClick={cart.close} className="btn btn-outline mt-2 w-full">
                {t.continue}
              </button>
            </footer>
          </>
        )}
      </aside>
    </>
  );
}
