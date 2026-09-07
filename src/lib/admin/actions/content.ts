"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { sections, saveContent, type SectionData } from "@/lib/content";

export async function saveContentSection(formData: FormData): Promise<void> {
  await requireAdmin();
  const key = String(formData.get("key") ?? "");
  const section = sections.find((s) => s.key === key);
  if (!section) redirect("/admin/content?error=" + encodeURIComponent("უცნობი სექცია"));

  const data: SectionData = {};
  for (const field of section.fields) {
    if (field.localized) {
      data[field.key] = {
        ka: String(formData.get(`${field.key}__ka`) ?? "").trim(),
        en: String(formData.get(`${field.key}__en`) ?? "").trim(),
      };
    } else {
      data[field.key] = String(formData.get(field.key) ?? "").trim();
    }
  }
  await saveContent(key, data);
  revalidatePath("/", "layout");
  redirect(`/admin/content?saved=1&open=${key}`);
}

export async function resetContentSection(formData: FormData): Promise<void> {
  await requireAdmin();
  const key = String(formData.get("key") ?? "");
  await prisma.siteContent.deleteMany({ where: { key } });
  revalidatePath("/", "layout");
  redirect(`/admin/content?reset=1&open=${key}`);
}
