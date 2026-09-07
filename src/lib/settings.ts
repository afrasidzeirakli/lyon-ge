import { cache } from "react";
import { prisma } from "./db";

export type StoreSettings = {
  storeName: string;
  phone: string;
  whatsapp: string; // ციფრები ქვეყნის კოდით, "+"-ის გარეშე: 995596798877
  email: string;
  addressKa: string;
  addressEn: string;
  workingHoursKa: string;
  workingHoursEn: string;
  instagram: string;
  facebook: string;
  tiktok: string;
  shippingFee: number; // თეთრებში
  freeShippingFrom: number; // თეთრებში; 0 = უფასო მიწოდება არ არის
  deliveryDays: string; // "1-3"
  telegramBotToken: string;
  telegramChatId: string;
  logoUrl: string;
  logoWhiteUrl: string;
};

export const defaultSettings: StoreSettings = {
  storeName: "LYON",
  phone: "+995 596 79 88 77",
  whatsapp: "995596798877",
  email: "",
  addressKa: "თბილისი, საქართველო",
  addressEn: "Tbilisi, Georgia",
  workingHoursKa: "ყოველდღე 10:00–20:00",
  workingHoursEn: "Every day 10:00–20:00",
  instagram: "",
  facebook: "",
  tiktok: "",
  shippingFee: 1000,
  freeShippingFrom: 30000,
  deliveryDays: "1-3",
  telegramBotToken: "",
  telegramChatId: "",
  logoUrl: "",
  logoWhiteUrl: "",
};

const NUMERIC_KEYS: (keyof StoreSettings)[] = ["shippingFee", "freeShippingFrom"];

export const getSettings = cache(async (): Promise<StoreSettings> => {
  const rows = await prisma.setting.findMany();
  const out: StoreSettings = { ...defaultSettings };
  for (const row of rows) {
    if (!(row.key in out)) continue;
    const key = row.key as keyof StoreSettings;
    if (NUMERIC_KEYS.includes(key)) {
      (out as Record<string, string | number>)[key] = Number(row.value) || 0;
    } else {
      (out as Record<string, string | number>)[key] = row.value;
    }
  }
  return out;
});

export async function saveSettings(patch: Partial<StoreSettings>): Promise<void> {
  const entries = Object.entries(patch).filter(([k]) => k in defaultSettings);
  if (entries.length === 0) return;
  await prisma.$transaction(
    entries.map(([key, value]) =>
      prisma.setting.upsert({
        where: { key },
        update: { value: String(value ?? "") },
        create: { key, value: String(value ?? "") },
      })
    )
  );
}

/** wa.me ბმული ტექსტით */
export function whatsappLink(number: string, text?: string): string {
  const digits = number.replace(/\D/g, "");
  const base = `https://wa.me/${digits}`;
  return text ? `${base}?text=${encodeURIComponent(text)}` : base;
}

export function telLink(phone: string): string {
  return `tel:${phone.replace(/[^\d+]/g, "")}`;
}
