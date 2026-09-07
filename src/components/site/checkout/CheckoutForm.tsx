"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Check, LoaderCircle, Tag } from "lucide-react";
import clsx from "clsx";
import { localePath, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { fill } from "@/i18n/dictionaries";
import { formatPrice } from "@/lib/money";
import { displayName } from "@/lib/site";
import { toMtavruli } from "@/lib/georgian";
import { useCart } from "../cart/CartProvider";
import { checkPromo, placeOrder } from "@/app/(site)/[lang]/checkout/actions";

type Props = {
  lang: Locale;
  dict: Dictionary;
  shippingFee: number;
  freeShippingFrom: number;
};

export function CheckoutForm({ lang, dict, shippingFee, freeShippingFrom }: Props) {
  const t = dict.checkout;
  const cart = useCart();
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [form, setForm] = useState({ customerName: "", phone: "", city: "", address: "", comment: "" });
  const [promoInput, setPromoInput] = useState("");
  const [promo, setPromo] = useState<{ code: string; discount: number } | null>(null);
  const [promoError, setPromoError] = useState(false);
  const [promoPending, setPromoPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const subtotal = cart.subtotal;
  const discount = promo ? Math.min(promo.discount, subtotal) : 0;
  const afterDiscount = subtotal - discount;
  const shipping = freeShippingFrom > 0 && afterDiscount >= freeShippingFrom ? 0 : shippingFee;
  const total = afterDiscount + shipping;

  const update = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const applyPromo = async () => {
    setPromoError(false);
    setPromoPending(true);
    try {
      const res = await checkPromo(promoInput, subtotal);
      if (res.ok) {
        setPromo({ code: res.code, discount: res.discount });
        setPromoInput(res.code);
      } else {
        setPromo(null);
        setPromoError(true);
      }
    } finally {
      setPromoPending(false);
    }
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const res = await placeOrder({
        lang,
        ...form,
        promoCode: promo?.code ?? "",
        items: cart.items.map((i) => ({ productId: i.productId, size: i.size, colorKa: i.colorKa, colorEn: i.colorEn, qty: i.qty })),
      });
      if (res.ok) {
        cart.clear();
        router.push(localePath(lang, `/order/${res.number}?t=${res.token}`));
        return;
      }
      const errors = t.errors as Record<string, string>;
      if (res.error === "outOfStock" && res.detail) setError(fill(errors.outOfStock, res.detail));
      else setError(errors[res.error] ?? errors.generic);
    });
  };

  if (!cart.hydrated) return null;

  if (cart.items.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-line px-6 py-20 text-center">
        <p className="text-lg font-medium">{t.emptyCart}</p>
        <Link href={localePath(lang, "/shop")} className="btn btn-primary mt-6">
          {t.continueShopping}
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="grid gap-10 lg:grid-cols-[1fr_420px] lg:gap-16">
      <div className="space-y-10">
        <section>
          <h2 className="display text-2xl">{toMtavruli(t.contact)}</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <Field label={t.name} required>
              <input value={form.customerName} onChange={update("customerName")} required autoComplete="name" className="field" />
            </Field>
            <Field label={t.phone} required>
              <input value={form.phone} onChange={update("phone")} required inputMode="tel" autoComplete="tel" placeholder={t.phonePlaceholder} className="field" />
            </Field>
          </div>
        </section>

        <section>
          <h2 className="display text-2xl">{toMtavruli(t.delivery)}</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-[1fr_2fr]">
            <Field label={t.city} required>
              <input value={form.city} onChange={update("city")} required autoComplete="address-level2" className="field" />
            </Field>
            <Field label={t.address} required>
              <input value={form.address} onChange={update("address")} required autoComplete="street-address" className="field" />
            </Field>
          </div>
          <div className="mt-4">
            <Field label={t.comment}>
              <textarea value={form.comment} onChange={update("comment")} placeholder={t.commentPlaceholder} className="field-area" />
            </Field>
          </div>
        </section>

        <section>
          <h2 className="display text-2xl">{toMtavruli(t.payment)}</h2>
          <div className="mt-5 flex items-start gap-3 rounded-2xl border border-line bg-paper p-5 text-[14px]">
            <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-ink text-white">
              <Check className="h-3.5 w-3.5" strokeWidth={3} />
            </span>
            <p>{t.paymentNote}</p>
          </div>
        </section>
      </div>

      <aside className="card h-max p-6 lg:sticky lg:top-24">
        <h2 className="display text-2xl">{toMtavruli(t.summary)}</h2>
        <ul className="mt-5 space-y-4">
          {cart.items.map((i) => (
            <li key={i.key} className="flex gap-3">
              <div className="product-media relative h-16 w-14 shrink-0 overflow-hidden rounded-lg">{i.image ? <Image src={i.image} alt="" fill sizes="56px" className="object-cover" /> : null}</div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[14px] font-medium">{displayName(i.brand, lang === "en" ? i.nameEn : i.nameKa)}</p>
                <p className="text-[12px] text-muted">
                  {dict.common.size} {i.size}
                  {i.colorKa ? ` · ${lang === "en" ? i.colorEn : i.colorKa}` : ""} · ×{i.qty}
                </p>
              </div>
              <p className="text-[14px] font-semibold tabular-nums">{formatPrice(i.qty * i.unitPrice)}</p>
            </li>
          ))}
        </ul>

        <div className="mt-5 border-t border-line pt-5">
          <label className="text-[12px] font-semibold tracking-[0.14em] text-muted uppercase">{t.promo}</label>
          <div className="mt-2 flex gap-2">
            <div className="relative flex-1">
              <Tag className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-muted" />
              <input
                value={promoInput}
                onChange={(e) => {
                  setPromoInput(e.target.value.toUpperCase());
                  setPromoError(false);
                }}
                placeholder={t.promoPlaceholder}
                className={clsx("field h-11 pl-10 uppercase", promo && "border-success")}
              />
            </div>
            <button type="button" onClick={applyPromo} disabled={promoPending || !promoInput} className="btn btn-outline h-11 px-4">
              {promoPending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : t.apply}
            </button>
          </div>
          {promo ? <p className="mt-2 text-[13px] text-success">✓ {t.promoApplied}</p> : null}
          {promoError ? <p className="mt-2 text-[13px] text-danger">{t.promoInvalid}</p> : null}
        </div>

        <dl className="mt-5 space-y-2 border-t border-line pt-5 text-[14px]">
          <Row label={t.subtotal} value={formatPrice(subtotal)} />
          {discount > 0 ? <Row label={`${t.discount}${promo ? ` (${promo.code})` : ""}`} value={`−${formatPrice(discount)}`} className="text-success" /> : null}
          <Row label={t.shipping} value={shipping === 0 ? t.free : formatPrice(shipping)} />
          <div className="flex items-center justify-between border-t border-line pt-3 text-base">
            <dt className="font-semibold">{t.total}</dt>
            <dd className="text-xl font-semibold tabular-nums">{formatPrice(total)}</dd>
          </div>
        </dl>

        {error ? <p className="mt-4 rounded-xl bg-danger/10 px-4 py-3 text-[13px] text-danger">{error}</p> : null}

        <button type="submit" disabled={pending} className="btn btn-primary btn-lg mt-5 w-full">
          {pending ? (
            <>
              <LoaderCircle className="h-5 w-5 animate-spin" /> {t.placing}
            </>
          ) : (
            t.placeOrder
          )}
        </button>
      </aside>
    </form>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[13px] font-medium">
        {label}
        {required ? <span className="text-danger"> *</span> : null}
      </span>
      {children}
    </label>
  );
}

function Row({ label, value, className }: { label: string; value: string; className?: string }) {
  return (
    <div className={clsx("flex items-center justify-between", className)}>
      <dt className="text-muted">{label}</dt>
      <dd className="tabular-nums">{value}</dd>
    </div>
  );
}
