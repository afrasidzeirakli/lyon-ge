"use server";

import { randomBytes } from "node:crypto";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { computePrice, getLivePromotions } from "@/lib/pricing";
import { getSettings } from "@/lib/settings";
import { formatOrderMessage, sendTelegram } from "@/lib/telegram";
import { siteUrl, displayName } from "@/lib/site";
import type { Locale } from "@/i18n/config";

const itemSchema = z.object({
  productId: z.number().int().positive(),
  size: z.string().min(1).max(20),
  colorKa: z.string().max(60).nullable(),
  colorEn: z.string().max(60).nullable(),
  qty: z.number().int().min(1).max(20),
});

const orderSchema = z.object({
  lang: z.enum(["ka", "en"]),
  customerName: z.string().trim().min(2).max(120),
  phone: z.string().trim().regex(/^\+?[\d\s()-]{9,20}$/),
  city: z.string().trim().min(2).max(80),
  address: z.string().trim().min(3).max(300),
  comment: z.string().trim().max(500).optional().default(""),
  promoCode: z.string().trim().max(40).optional().default(""),
  items: z.array(itemSchema).min(1).max(30),
});

export type PlaceOrderInput = z.input<typeof orderSchema>;
export type PlaceOrderResult =
  | { ok: true; number: string; token: string }
  | { ok: false; error: "generic" | "name" | "phone" | "city" | "address" | "outOfStock" | "productMissing"; detail?: { name: string; size: string } };

type PromoRow = NonNullable<Awaited<ReturnType<typeof prisma.promoCode.findUnique>>>;

function promoIsUsable(p: PromoRow, subtotal: number): boolean {
  const now = new Date();
  if (!p.isActive) return false;
  if (p.startsAt && p.startsAt > now) return false;
  if (p.endsAt && p.endsAt < now) return false;
  if (p.maxUses != null && p.usedCount >= p.maxUses) return false;
  if (subtotal < p.minSubtotal) return false;
  return true;
}

function promoDiscount(p: PromoRow, subtotal: number): number {
  const d = p.type === "percent" ? Math.round((subtotal * p.value) / 100) : p.value;
  return Math.max(0, Math.min(d, subtotal));
}

export async function checkPromo(code: string, subtotal: number): Promise<{ ok: true; code: string; discount: number } | { ok: false }> {
  const clean = code.trim().toUpperCase();
  if (!clean) return { ok: false };
  const promo = await prisma.promoCode.findUnique({ where: { code: clean } });
  if (!promo || !promoIsUsable(promo, subtotal)) return { ok: false };
  return { ok: true, code: promo.code, discount: promoDiscount(promo, subtotal) };
}

export async function placeOrder(raw: PlaceOrderInput): Promise<PlaceOrderResult> {
  const parsed = orderSchema.safeParse(raw);
  if (!parsed.success) {
    const field = parsed.error.issues[0]?.path[0];
    const map: Record<string, PlaceOrderResult & { ok: false }> = {
      customerName: { ok: false, error: "name" },
      phone: { ok: false, error: "phone" },
      city: { ok: false, error: "city" },
      address: { ok: false, error: "address" },
    };
    return (typeof field === "string" && map[field]) || { ok: false, error: "generic" };
  }
  const input = parsed.data;
  const settings = await getSettings();
  const promos = await getLivePromotions();

  // პროდუქტების და ფასების გადამოწმება სერვერზე (კლიენტის ფასს არ ვენდობით)
  const ids = [...new Set(input.items.map((i) => i.productId))];
  const products = await prisma.product.findMany({
    where: { id: { in: ids }, isActive: true },
    include: { sizes: true, images: { orderBy: { sortOrder: "asc" }, take: 1 }, brand: true },
  });
  const byId = new Map(products.map((p) => [p.id, p]));

  type Line = { productId: number; name: string; slug: string; size: string; color: string | null; imageUrl: string | null; qty: number; unitPrice: number; lineTotal: number; sizeId: number };
  const lines: Line[] = [];
  for (const item of input.items) {
    const product = byId.get(item.productId);
    if (!product) return { ok: false, error: "productMissing" };
    const sizeRow = product.sizes.find((s) => s.size === item.size);
    const name = displayName(product.brand?.name ?? null, input.lang === "en" ? product.nameEn : product.nameKa);
    if (!sizeRow || sizeRow.stock < item.qty) return { ok: false, error: "outOfStock", detail: { name, size: item.size } };
    const unitPrice = computePrice(product, promos).finalPrice;
    lines.push({
      productId: product.id,
      name,
      slug: product.slug,
      size: item.size,
      color: input.lang === "en" ? item.colorEn : item.colorKa,
      imageUrl: product.images[0]?.url ?? null,
      qty: item.qty,
      unitPrice,
      lineTotal: unitPrice * item.qty,
      sizeId: sizeRow.id,
    });
  }

  const subtotal = lines.reduce((s, l) => s + l.lineTotal, 0);
  let discount = 0;
  let promoCode: string | null = null;
  let promoId: number | null = null;
  if (input.promoCode) {
    const promo = await prisma.promoCode.findUnique({ where: { code: input.promoCode.toUpperCase() } });
    if (promo && promoIsUsable(promo, subtotal)) {
      discount = promoDiscount(promo, subtotal);
      promoCode = promo.code;
      promoId = promo.id;
    }
  }
  const afterDiscount = subtotal - discount;
  const shipping = settings.freeShippingFrom > 0 && afterDiscount >= settings.freeShippingFrom ? 0 : settings.shippingFee;
  const total = afterDiscount + shipping;
  const token = randomBytes(12).toString("base64url");

  const order = await prisma.$transaction(async (tx) => {
    // მარაგის ატომური შემცირება
    for (const l of lines) {
      const res = await tx.productSize.updateMany({ where: { id: l.sizeId, stock: { gte: l.qty } }, data: { stock: { decrement: l.qty } } });
      if (res.count !== 1) throw new Error(`OUT_OF_STOCK:${l.name}:${l.size}`);
    }
    if (promoId != null) await tx.promoCode.update({ where: { id: promoId }, data: { usedCount: { increment: 1 } } });
    const created = await tx.order.create({
      data: {
        number: `tmp-${token}`,
        accessToken: token,
        status: "new",
        customerName: input.customerName,
        phone: input.phone,
        city: input.city,
        address: input.address,
        comment: input.comment || null,
        subtotal,
        discount,
        promoCode,
        shipping,
        total,
        lang: input.lang,
        items: {
          create: lines.map((l) => ({
            productId: l.productId,
            name: l.name,
            slug: l.slug,
            size: l.size,
            color: l.color,
            imageUrl: l.imageUrl,
            qty: l.qty,
            unitPrice: l.unitPrice,
            lineTotal: l.lineTotal,
          })),
        },
      },
      include: { items: true },
    });
    return tx.order.update({ where: { id: created.id }, data: { number: `LY-${1000 + created.id}` }, include: { items: true } });
  }).catch((e: unknown) => {
    const msg = e instanceof Error ? e.message : "";
    if (msg.startsWith("OUT_OF_STOCK:")) {
      const [, name, size] = msg.split(":");
      return { outOfStock: { name, size } } as const;
    }
    throw e;
  });

  if ("outOfStock" in order) return { ok: false, error: "outOfStock", detail: order.outOfStock };

  // Telegram შეტყობინება (შეცდომა შეკვეთას არ აჩერებს)
  if (settings.telegramBotToken && settings.telegramChatId) {
    const text = formatOrderMessage(order, `${siteUrl()}/admin/orders/${order.id}`);
    await sendTelegram(settings.telegramBotToken, settings.telegramChatId, text);
  }

  return { ok: true, number: order.number, token };
}

export async function getOrderSummary(lang: Locale, number: string, token: string) {
  void lang;
  const order = await prisma.order.findUnique({ where: { number }, include: { items: true } });
  if (!order || order.accessToken !== token) return null;
  return order;
}
