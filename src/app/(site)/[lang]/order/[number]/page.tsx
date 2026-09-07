import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { CircleCheck } from "lucide-react";
import { hasLocale, localePath } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { resolveLang } from "@/lib/site";
import { prisma } from "@/lib/db";
import { getSettings, whatsappLink } from "@/lib/settings";
import { formatPrice } from "@/lib/money";
import { Headline } from "@/components/site/Headline";
import { WhatsAppIcon } from "@/components/site/WhatsAppFab";

type Props = { params: Promise<{ lang: string; number: string }>; searchParams: Promise<{ t?: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  return { title: getDictionary(lang).checkout.successTitle, robots: { index: false } };
}

export default async function OrderPage({ params, searchParams }: Props) {
  const { number } = await params;
  const lang = await resolveLang(params);
  const dict = getDictionary(lang);
  const { t: token } = await searchParams;
  const t = dict.checkout;
  const [order, settings] = await Promise.all([prisma.order.findUnique({ where: { number }, include: { items: true } }), getSettings()]);
  const visible = order && token && order.accessToken === token ? order : null;
  const statuses = dict.order.status as Record<string, string>;

  return (
    <div className="container-x pt-10 pb-16 lg:pt-16">
      <div className="mx-auto max-w-2xl">
        <div className="flex flex-col items-center text-center">
          <span className="grid h-16 w-16 place-items-center rounded-full bg-success/10 text-success">
            <CircleCheck className="h-9 w-9" />
          </span>
          <Headline as="h1" text={t.successTitle} className="mt-5 text-4xl sm:text-5xl" />
          <p className="mt-3 max-w-md text-muted">{t.successText}</p>
          <p className="mt-6 rounded-full bg-paper px-5 py-2 text-sm shadow-[var(--shadow-card)]">
            {t.orderNumber}: <span className="font-semibold tabular-nums">{number}</span>
            {visible ? <span className="ml-2 badge bg-ink text-white">{statuses[visible.status] ?? visible.status}</span> : null}
          </p>
        </div>

        {visible ? (
          <div className="card mt-10 p-6">
            <h2 className="text-[12px] font-semibold tracking-[0.16em] text-muted uppercase">{dict.order.items}</h2>
            <ul className="mt-4 divide-y divide-line">
              {visible.items.map((i) => (
                <li key={i.id} className="flex items-center gap-4 py-3">
                  <div className="product-media relative h-16 w-14 shrink-0 overflow-hidden rounded-lg">{i.imageUrl ? <Image src={i.imageUrl} alt="" fill sizes="56px" className="object-cover" /> : null}</div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[14px] font-medium">{i.name}</p>
                    <p className="text-[12px] text-muted">
                      {dict.common.size} {i.size}
                      {i.color ? ` · ${i.color}` : ""} · ×{i.qty}
                    </p>
                  </div>
                  <p className="text-[14px] font-semibold tabular-nums">{formatPrice(i.lineTotal)}</p>
                </li>
              ))}
            </ul>
            <dl className="mt-4 space-y-1.5 border-t border-line pt-4 text-[14px]">
              <div className="flex justify-between">
                <dt className="text-muted">{t.subtotal}</dt>
                <dd className="tabular-nums">{formatPrice(visible.subtotal)}</dd>
              </div>
              {visible.discount > 0 ? (
                <div className="flex justify-between text-success">
                  <dt>
                    {t.discount}
                    {visible.promoCode ? ` (${visible.promoCode})` : ""}
                  </dt>
                  <dd className="tabular-nums">−{formatPrice(visible.discount)}</dd>
                </div>
              ) : null}
              <div className="flex justify-between">
                <dt className="text-muted">{t.shipping}</dt>
                <dd className="tabular-nums">{visible.shipping === 0 ? t.free : formatPrice(visible.shipping)}</dd>
              </div>
              <div className="flex justify-between border-t border-line pt-2 text-base font-semibold">
                <dt>{t.total}</dt>
                <dd className="tabular-nums">{formatPrice(visible.total)}</dd>
              </div>
            </dl>
            <div className="mt-5 border-t border-line pt-4 text-[14px]">
              <h3 className="text-[12px] font-semibold tracking-[0.16em] text-muted uppercase">{dict.order.customer}</h3>
              <p className="mt-2">
                {visible.customerName} · {visible.phone}
              </p>
              <p className="text-muted">
                {visible.city}, {visible.address}
              </p>
            </div>
          </div>
        ) : null}

        <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Link href={localePath(lang, "/shop")} className="btn btn-primary">
            {t.continueShopping}
          </Link>
          {settings.whatsapp ? (
            <a href={whatsappLink(settings.whatsapp, `${number}`)} target="_blank" rel="noopener noreferrer" className="btn btn-outline">
              <WhatsAppIcon className="h-4 w-4" /> {t.whatsappHelp}
            </a>
          ) : null}
        </div>
      </div>
    </div>
  );
}
