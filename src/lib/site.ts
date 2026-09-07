import { notFound } from "next/navigation";
import { hasLocale, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";

export async function resolveLang(params: Promise<{ lang: string }>): Promise<Locale> {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  return lang;
}

export function siteUrl(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");
}

export function localized<T extends { nameKa: string; nameEn: string }>(entity: T, lang: Locale): string {
  return lang === "en" ? entity.nameEn || entity.nameKa : entity.nameKa || entity.nameEn;
}

/** "Jordan" + "Air Jordan 1" -> "Air Jordan 1"; "Nike" + "Air Max 90" -> "Nike Air Max 90" */
export function displayName(brand: string | null | undefined, name: string): string {
  if (!brand) return name;
  return name.toLowerCase().includes(brand.toLowerCase()) ? name : `${brand} ${name}`;
}

export function typeLabel(dict: Dictionary, type: string | null | undefined): string {
  if (!type) return "";
  const types = dict.types as Record<string, string>;
  return types[type] ?? type;
}

export function categoryLabel(dict: Dictionary, slug: string | null | undefined): string {
  if (!slug) return "";
  const cats = dict.categories as Record<string, string>;
  return cats[slug] ?? slug;
}
