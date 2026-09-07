"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { slugify, randomSuffix } from "@/lib/slug";

const str = (fd: FormData, key: string) => String(fd.get(key) ?? "").trim();

async function uniqueSlug(table: "category" | "brand", base: string, excludeId?: number): Promise<string> {
  let slug = slugify(base) || `${table}-${randomSuffix()}`;
  for (let i = 0; i < 20; i++) {
    const clash = table === "category" ? await prisma.category.findUnique({ where: { slug }, select: { id: true } }) : await prisma.brand.findUnique({ where: { slug }, select: { id: true } });
    if (!clash || clash.id === excludeId) return slug;
    slug = `${slugify(base)}-${randomSuffix()}`;
  }
  return `${slugify(base)}-${Date.now()}`;
}

export async function saveCategory(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = Number(formData.get("id")) || undefined;
  const nameKa = str(formData, "nameKa");
  const nameEn = str(formData, "nameEn") || nameKa;
  if (!nameKa) redirect("/admin/categories?error=" + encodeURIComponent("სახელი სავალდებულოა"));
  const slug = await uniqueSlug("category", str(formData, "slug") || nameEn, id);
  const data = { nameKa, nameEn, slug, imageUrl: str(formData, "imageUrl") || null, sortOrder: Number(formData.get("sortOrder")) || 0 };
  if (id) await prisma.category.update({ where: { id }, data });
  else await prisma.category.create({ data });
  revalidatePath("/", "layout");
  redirect("/admin/categories?saved=1");
}

export async function deleteCategory(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = Number(formData.get("id"));
  if (Number.isInteger(id)) await prisma.category.delete({ where: { id } });
  revalidatePath("/", "layout");
  redirect("/admin/categories?deleted=1");
}

export async function saveBrand(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = Number(formData.get("id")) || undefined;
  const name = str(formData, "name");
  if (!name) redirect("/admin/brands?error=" + encodeURIComponent("სახელი სავალდებულოა"));
  const slug = await uniqueSlug("brand", str(formData, "slug") || name, id);
  const data = { name, slug, logoUrl: str(formData, "logoUrl") || null };
  if (id) await prisma.brand.update({ where: { id }, data });
  else await prisma.brand.create({ data });
  revalidatePath("/", "layout");
  redirect("/admin/brands?saved=1");
}

export async function deleteBrand(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = Number(formData.get("id"));
  if (Number.isInteger(id)) await prisma.brand.delete({ where: { id } });
  revalidatePath("/", "layout");
  redirect("/admin/brands?deleted=1");
}
