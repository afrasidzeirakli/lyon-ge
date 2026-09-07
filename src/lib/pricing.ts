import type { Product, Promotion } from "@prisma/client";
import { prisma } from "./db";

export type PriceInfo = {
  price: number; // საწყისი ფასი
  finalPrice: number; // საბოლოო ფასი ყველა ფასდაკლების გათვალისწინებით
  discountPercent: number; // 0 თუ ფასდაკლება არ არის
  promotion: Promotion | null;
};

type Priceable = Pick<Product, "price" | "salePrice" | "categoryId" | "brandId" | "productType">;

export function isPromotionLive(p: Promotion, now = new Date()): boolean {
  if (!p.isActive) return false;
  if (p.startsAt && p.startsAt > now) return false;
  if (p.endsAt && p.endsAt < now) return false;
  return true;
}

export function promotionApplies(p: Promotion, product: Priceable): boolean {
  switch (p.scope) {
    case "all":
      return true;
    case "category":
      return p.categoryId != null && p.categoryId === product.categoryId;
    case "brand":
      return p.brandId != null && p.brandId === product.brandId;
    case "type":
      return !!p.productType && p.productType === product.productType;
    default:
      return false;
  }
}

export function computePrice(product: Priceable, promotions: Promotion[]): PriceInfo {
  const base = product.salePrice && product.salePrice > 0 && product.salePrice < product.price ? product.salePrice : product.price;
  let bestPercent = 0;
  let best: Promotion | null = null;
  for (const p of promotions) {
    if (promotionApplies(p, product) && p.percent > bestPercent) {
      bestPercent = p.percent;
      best = p;
    }
  }
  const finalPrice = Math.max(0, Math.round((base * (100 - bestPercent)) / 100));
  const discountPercent = product.price > 0 && finalPrice < product.price ? Math.round((1 - finalPrice / product.price) * 100) : 0;
  return { price: product.price, finalPrice, discountPercent, promotion: best };
}

export async function getLivePromotions(): Promise<Promotion[]> {
  const all = await prisma.promotion.findMany({ where: { isActive: true } });
  const now = new Date();
  return all.filter((p) => isPromotionLive(p, now));
}
