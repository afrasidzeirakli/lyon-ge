export const locales = ["ka", "en"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "ka";

export function hasLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}

/** ლოკალიზებული ბმული: ქართული ენისთვის პრეფიქსი არ არის, ინგლისურისთვის /en */
export function localePath(lang: Locale, path: string): string {
  const p = path.startsWith("/") ? path : `/${path}`;
  if (lang === defaultLocale) return p;
  return p === "/" ? `/${lang}` : `/${lang}${p}`;
}

/** გვერდის მისამართიდან ლოკალის პრეფიქსის მოშორება */
export function stripLocale(pathname: string): string {
  const m = /^\/(ka|en)(\/|$)/.exec(pathname);
  if (!m) return pathname || "/";
  const rest = pathname.slice(m[0].length - (m[2] === "/" ? 1 : 0));
  return rest || "/";
}
