"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { slugify, randomSuffix } from "@/lib/slug";
import { PRODUCT_TYPES } from "@/i18n/dictionaries";

const schema = z.object({
  id: z.number().int().positive().optional(),
  nameKa: z.string().trim().min(1, "ქართული სახელი სავალდებულოა").max(160),
  nameEn: z.string().trim().max(160).default(""),
  slug: z.string().trim().max(120).default(""),
  descriptionKa: z.string().trim().max(5000).default(""),
  descriptionEn: z.string().trim().max(5000).default(""),
  brandId: z.number().int().positive().nullable(),
  categoryId: z.number().int().positive().nullable(),
  productType: z.enum(PRODUCT_TYPES).nullable(),
  price: z.number().int().min(0, "ფასი უნდა იყოს 0 ან მეტი"),
  salePrice: z.number().int().min(0).nullable(),
  isNew: z.boolean(),
  isBestSeller: z.boolean(),
  isFeatured: z.boolean(),
  isActive: z.boolean(),
  images: z.array(z.object({ url: z.string().trim().min(1).max(1000), alt: z.string().trim().max(200).default("") })).max(20),
  colors: z.array(z.object({ nameKa: z.string().trim().max(60), nameEn: z.string().trim().max(60), hex: z.string().trim().regex(/^#[0-9a-fA-F]{6}$/) })).max(20),
  sizes: z.array(z.object({ size: z.string().trim().min(1).max(20), stock: z.number().int().min(0).max(100000) })).max(60),
});

export type ProductInput = z.input<typeof schema>;
export type SaveProductResult = { ok: true; id: number } | { ok: false; error: string };

async function uniqueSlug(base: string, excludeId?: number): Promise<string> {
  let slug = slugify(base) || `product-${randomSuffix()}`;
  for (let i = 0; i < 20; i++) {
    const clash = await prisma.product.findUnique({ where: { slug }, select: { id: true } });
    if (!clash || clash.id === excludeId) return slug;
    slug = `${slugify(base)}-${randomSuffix()}`;
  }
  return `${slugify(base)}-${Date.now()}`;
}

export async function saveProduct(raw: ProductInput): Promise<SaveProductResult> {
  await requireAdmin();
  const parsed = schema.safeParse(raw);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "არასწორი მონაცემები" };
  const d = parsed.data;

  // ზომების დუბლიკატები
  const seen = new Set<string>();
  for (const s of d.sizes) {
    const key = s.size.toLowerCase();
    if (seen.has(key)) return { ok: false, error: `ზომა „${s.size}“ ორჯერ მეორდება` };
    seen.add(key);
  }
  if (d.salePrice != null && d.salePrice >= d.price) return { ok: false, error: "ფასდაკლებული ფასი საწყისზე ნაკლები უნდა იყოს" };

  const slug = await uniqueSlug(d.slug || d.nameEn || d.nameKa, d.id);
  const base = {
    slug,
    nameKa: d.nameKa,
    nameEn: d.nameEn || d.nameKa,
    descriptionKa: d.descriptionKa,
    descriptionEn: d.descriptionEn,
    brandId: d.brandId,
    categoryId: d.categoryId,
    productType: d.productType,
    price: d.price,
    salePrice: d.salePrice,
    isNew: d.isNew,
    isBestSeller: d.isBestSeller,
    isFeatured: d.isFeatured,
    isActive: d.isActive,
  };
  const nested = {
    images: { create: d.images.map((im, i) => ({ url: im.url, alt: im.alt || null, sortOrder: i })) },
    colors: { create: d.colors.map((c, i) => ({ nameKa: c.nameKa || c.nameEn, nameEn: c.nameEn || c.nameKa, hex: c.hex, sortOrder: i })) },
    sizes: { create: d.sizes.map((s, i) => ({ size: s.size, stock: s.stock, sortOrder: i })) },
  };

  let id: number;
  if (d.id) {
    await prisma.$transaction([
      prisma.productImage.deleteMany({ where: { productId: d.id } }),
      prisma.productColor.deleteMany({ where: { productId: d.id } }),
      prisma.productSize.deleteMany({ where: { productId: d.id } }),
      prisma.product.update({ where: { id: d.id }, data: { ...base, ...nested } }),
    ]);
    id = d.id;
  } else {
    const created = await prisma.product.create({ data: { ...base, ...nested } });
    id = created.id;
  }
  revalidatePath("/", "layout");
  return { ok: true, id };
}

export async function deleteProduct(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = Number(formData.get("id"));
  if (!Number.isInteger(id)) return;
  await prisma.product.delete({ where: { id } });
  revalidatePath("/", "layout");
  redirect("/admin/products?deleted=1");
}

export async function toggleProductActive(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = Number(formData.get("id"));
  const product = await prisma.product.findUnique({ where: { id }, select: { isActive: true } });
  if (!product) return;
  await prisma.product.update({ where: { id }, data: { isActive: !product.isActive } });
  revalidatePath("/", "layout");
}
