"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireAdmin, hashPassword, verifyPassword } from "@/lib/auth";
import { saveSettings, type StoreSettings } from "@/lib/settings";
import { toTetri } from "@/lib/money";
import { sendTelegram } from "@/lib/telegram";

const str = (fd: FormData, key: string) => String(fd.get(key) ?? "").trim();

function collect(formData: FormData): Partial<StoreSettings> {
  const patch: Partial<StoreSettings> = {};
  const textKeys: (keyof StoreSettings)[] = [
    "storeName", "phone", "email", "addressKa", "addressEn", "workingHoursKa", "workingHoursEn",
    "instagram", "facebook", "tiktok", "deliveryDays", "telegramBotToken", "telegramChatId", "logoUrl", "logoWhiteUrl",
  ];
  for (const k of textKeys) if (formData.has(k)) (patch as Record<string, string | number>)[k] = str(formData, k);
  if (formData.has("whatsapp")) patch.whatsapp = str(formData, "whatsapp").replace(/\D/g, "");
  if (formData.has("shippingFee")) patch.shippingFee = toTetri(str(formData, "shippingFee") || "0");
  if (formData.has("freeShippingFrom")) patch.freeShippingFrom = toTetri(str(formData, "freeShippingFrom") || "0");
  return patch;
}

export async function saveStoreSettings(formData: FormData): Promise<void> {
  await requireAdmin();
  await saveSettings(collect(formData));
  revalidatePath("/", "layout");
  redirect("/admin/settings?saved=1");
}

export async function testTelegram(formData: FormData): Promise<void> {
  await requireAdmin();
  const patch = collect(formData);
  await saveSettings(patch);
  const res = await sendTelegram(patch.telegramBotToken ?? "", patch.telegramChatId ?? "", "✅ LYON: Telegram შეტყობინებები მუშაობს! ახალი შეკვეთები აქ მოვა.");
  revalidatePath("/", "layout");
  if (res.ok) redirect("/admin/settings?tgok=1");
  redirect("/admin/settings?error=" + encodeURIComponent(`Telegram: ${res.error}`));
}

export async function changePassword(formData: FormData): Promise<void> {
  const admin = await requireAdmin();
  const current = String(formData.get("current") ?? "");
  const next = String(formData.get("next") ?? "");
  const confirm = String(formData.get("confirm") ?? "");
  const fresh = await prisma.admin.findUnique({ where: { id: admin.id } });
  if (!fresh || !verifyPassword(current, fresh.passwordHash)) redirect("/admin/settings?error=" + encodeURIComponent("მიმდინარე პაროლი არასწორია"));
  if (next.length < 8) redirect("/admin/settings?error=" + encodeURIComponent("ახალი პაროლი მინ. 8 სიმბოლო უნდა იყოს"));
  if (next !== confirm) redirect("/admin/settings?error=" + encodeURIComponent("პაროლები არ ემთხვევა"));
  await prisma.admin.update({ where: { id: admin.id }, data: { passwordHash: hashPassword(next) } });
  redirect("/admin/settings?pwok=1");
}
