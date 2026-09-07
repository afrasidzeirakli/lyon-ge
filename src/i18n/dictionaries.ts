import ka from "./dictionaries/ka.json";
import en from "./dictionaries/en.json";
import type { Locale } from "./config";

export type Dictionary = typeof ka;

const dictionaries: Record<Locale, Dictionary> = { ka, en: en as Dictionary };

export function getDictionary(lang: Locale): Dictionary {
  return dictionaries[lang] ?? dictionaries.ka;
}

/** "{n} პროდუქტი" -> ჩასმა */
export function fill(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (_, k) => (k in values ? String(values[k]) : `{${k}}`));
}

export const PRODUCT_TYPES = [
  "sneakers",
  "running",
  "basketball",
  "football",
  "boots",
  "sandals",
  "slippers",
  "formal",
] as const;
export type ProductType = (typeof PRODUCT_TYPES)[number];

export const ORDER_STATUSES = ["new", "confirmed", "shipped", "delivered", "cancelled"] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];
