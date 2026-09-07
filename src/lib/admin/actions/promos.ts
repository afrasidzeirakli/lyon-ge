"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { toTetri } from "@/lib/money";
import { PRODUCT_TYPES } from "@/i18n/dictionaries";

const str = (fd: FormData, key: string) => String(fd.get(key) ?? "").trim();
const date = (fd: FormData, key: string): Date | null => {
  const v = str(fd, key);
  if (!v) return null;
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? null : d;
};
const fail = (path: string, msg: string): never => redirect(`${path}?error=${encodeURIComponent(msg)}`);

export async function savePromoCode(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = Number(formData.get("id")) || undefined;
  const code = str(formData, "code").toUpperCase().replace(/\s+/g, "");
  const type = str(formData, "type") === "fixed" ? "fixed" : "percent";
  const rawValue = str(formData, "value");
  const value = type === "percent" ? Math.round(Number(rawValue)) : toTetri(rawValue);
  if (!code) fail("/admin/promos", "კოდი სავალდებულოა");
  if (!Number.isFinite(value) || value <= 0 || (type === "percent" && value > 100)) fail("/admin/promos", "მნიშვნელობა არასწორია");
  const maxUsesRaw = str(formData, "maxUses");
  const data = {
    code,
    type,
    value,
    minSubtotal: toTetri(str(formData, "minSubtotal") || "0"),
    maxUses: maxUsesRaw ? Math.max(0, Math.round(Number(maxUsesRaw))) : null,
    startsAt: date(formData, "startsAt"),
    endsAt: date(formData, "endsAt"),
    isActive: formData.get("isActive") === "on",
  };
  const clash = await prisma.promoCode.findUnique({ where: { code } });
  if (clash && clash.id !== id) fail("/admin/promos", `კოდი „${code}“ უკვე არსებობს`);
  if (id) await prisma.promoCode.update({ where: { id }, data });
  else await prisma.promoCode.create({ data });
  revalidatePath("/", "layout");
  redirect("/admin/promos?saved=1");
}

export async function deletePromoCode(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = Number(formData.get("id"));
  if (Number.isInteger(id)) await prisma.promoCode.delete({ where: { id } });
  redirect("/admin/promos?deleted=1");
}

export async function savePromotion(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = Number(formData.get("id")) || undefined;
  const titleKa = str(formData, "titleKa");
  const titleEn = str(formData, "titleEn") || titleKa;
  const percent = Math.round(Number(str(formData, "percent")));
  const scope = str(formData, "scope");
  if (!titleKa) fail("/admin/promos", "აქციის სახელი სავალდებულოა");
  if (!Number.isFinite(percent) || percent <= 0 || percent > 100) fail("/admin/promos", "პროცენტი 1–100 უნდა იყოს");
  if (!["all", "category", "brand", "type"].includes(scope)) fail("/admin/promos", "არასწორი მოქმედების არე");
  const productType = str(formData, "productType");
  const data = {
    titleKa,
    titleEn,
    percent,
    scope,
    categoryId: scope === "category" ? Number(formData.get("categoryId")) || null : null,
    brandId: scope === "brand" ? Number(formData.get("brandId")) || null : null,
    productType: scope === "type" && (PRODUCT_TYPES as readonly string[]).includes(productType) ? productType : null,
    startsAt: date(formData, "startsAt"),
    endsAt: date(formData, "endsAt"),
    isActive: formData.get("isActive") === "on",
  };
  if (scope === "category" && !data.categoryId) fail("/admin/promos", "აირჩიე კატეგორია");
  if (scope === "brand" && !data.brandId) fail("/admin/promos", "აირჩიე ბრენდი");
  if (scope === "type" && !data.productType) fail("/admin/promos", "აირჩიე ტიპი");
  if (id) await prisma.promotion.update({ where: { id }, data });
  else await prisma.promotion.create({ data });
  revalidatePath("/", "layout");
  redirect("/admin/promos?saved=1");
}

export async function deletePromotion(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = Number(formData.get("id"));
  if (Number.isInteger(id)) await prisma.promotion.delete({ where: { id } });
  revalidatePath("/", "layout");
  redirect("/admin/promos?deleted=1");
}
