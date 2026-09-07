import "server-only";
import { cache } from "react";
import type { Prisma } from "@prisma/client";
import { prisma } from "./db";
import { computePrice, getLivePromotions, type PriceInfo } from "./pricing";

export const productInclude = {
  images: { orderBy: { sortOrder: "asc" as const } },
  colors: { orderBy: { sortOrder: "asc" as const } },
  sizes: { orderBy: { sortOrder: "asc" as const } },
  brand: true,
  category: true,
} satisfies Prisma.ProductInclude;

export type ProductFull = Prisma.ProductGetPayload<{ include: typeof productInclude }>;
export type ProductWithPrice = ProductFull & { pricing: PriceInfo; totalStock: number };

function withPrice(product: ProductFull, promos: Awaited<ReturnType<typeof getLivePromotions>>): ProductWithPrice {
  return {
    ...product,
    pricing: computePrice(product, promos),
    totalStock: product.sizes.reduce((s, x) => s + x.stock, 0),
  };
}

export const getTaxonomies = cache(async () => {
  const [categories, brands] = await Promise.all([
    prisma.category.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.brand.findMany({ orderBy: { name: "asc" } }),
  ]);
  return { categories, brands };
});

export type ShopFilters = {
  q?: string;
  category?: string; // slug
  brand?: string; // slug (მძიმით გამოყოფილი რამდენიმე)
  type?: string; // productType (მძიმით გამოყოფილი)
  size?: string; // მძიმით გამოყოფილი
  min?: number; // ლარებში
  max?: number; // ლარებში
  sale?: boolean;
  new?: boolean;
  sort?: "newest" | "price-asc" | "price-desc" | "popular";
};

const split = (v?: string) => (v ? v.split(",").map((s) => s.trim()).filter(Boolean) : []);

export async function getShopProducts(filters: ShopFilters): Promise<ProductWithPrice[]> {
  const where: Prisma.ProductWhereInput = { isActive: true };
  const and: Prisma.ProductWhereInput[] = [];

  if (filters.q) {
    const q = filters.q.trim();
    and.push({
      OR: [
        { nameKa: { contains: q } },
        { nameEn: { contains: q } },
        { brand: { name: { contains: q } } },
        { descriptionKa: { contains: q } },
        { descriptionEn: { contains: q } },
      ],
    });
  }
  if (filters.category) and.push({ category: { slug: filters.category } });
  const brands = split(filters.brand);
  if (brands.length) and.push({ brand: { slug: { in: brands } } });
  const types = split(filters.type);
  if (types.length) and.push({ productType: { in: types } });
  const sizes = split(filters.size);
  if (sizes.length) and.push({ sizes: { some: { size: { in: sizes }, stock: { gt: 0 } } } });
  if (filters.new) and.push({ isNew: true });
  if (and.length) where.AND = and;

  const [rows, promos] = await Promise.all([
    prisma.product.findMany({ where, include: productInclude, orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }] }),
    getLivePromotions(),
  ]);

  let list = rows.map((r) => withPrice(r, promos));
  if (filters.sale) list = list.filter((p) => p.pricing.discountPercent > 0);
  if (filters.min != null) list = list.filter((p) => p.pricing.finalPrice >= filters.min! * 100);
  if (filters.max != null) list = list.filter((p) => p.pricing.finalPrice <= filters.max! * 100);

  switch (filters.sort) {
    case "price-asc":
      list.sort((a, b) => a.pricing.finalPrice - b.pricing.finalPrice);
      break;
    case "price-desc":
      list.sort((a, b) => b.pricing.finalPrice - a.pricing.finalPrice);
      break;
    case "popular":
      list.sort((a, b) => Number(b.isBestSeller) - Number(a.isBestSeller) || a.sortOrder - b.sortOrder);
      break;
    case "newest":
      list.sort((a, b) => Number(b.isNew) - Number(a.isNew) || b.createdAt.getTime() - a.createdAt.getTime());
      break;
    default:
      break;
  }
  return list;
}

export async function getProductBySlug(slug: string): Promise<ProductWithPrice | null> {
  const [row, promos] = await Promise.all([
    prisma.product.findUnique({ where: { slug }, include: productInclude }),
    getLivePromotions(),
  ]);
  if (!row || !row.isActive) return null;
  return withPrice(row, promos);
}

export async function getRelatedProducts(product: ProductFull, limit = 4): Promise<ProductWithPrice[]> {
  const promos = await getLivePromotions();
  const rows = await prisma.product.findMany({
    where: {
      isActive: true,
      id: { not: product.id },
      OR: [
        { productType: product.productType ?? undefined },
        { brandId: product.brandId ?? undefined },
        { categoryId: product.categoryId ?? undefined },
      ],
    },
    include: productInclude,
    orderBy: [{ isBestSeller: "desc" }, { sortOrder: "asc" }],
    take: limit,
  });
  return rows.map((r) => withPrice(r, promos));
}

export async function getHomeProducts() {
  const promos = await getLivePromotions();
  const [best, fresh] = await Promise.all([
    prisma.product.findMany({ where: { isActive: true, isBestSeller: true }, include: productInclude, orderBy: { sortOrder: "asc" }, take: 8 }),
    prisma.product.findMany({ where: { isActive: true, isNew: true }, include: productInclude, orderBy: [{ createdAt: "desc" }, { sortOrder: "asc" }], take: 8 }),
  ]);
  return { bestSellers: best.map((r) => withPrice(r, promos)), newArrivals: fresh.map((r) => withPrice(r, promos)) };
}

export async function getAvailableSizes(): Promise<string[]> {
  const rows = await prisma.productSize.findMany({ where: { product: { isActive: true } }, select: { size: true }, distinct: ["size"] });
  return rows.map((r) => r.size).sort((a, b) => Number(a) - Number(b) || a.localeCompare(b));
}
