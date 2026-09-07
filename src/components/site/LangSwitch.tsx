"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import clsx from "clsx";
import { localePath, stripLocale, type Locale } from "@/i18n/config";

type Props = { lang: Locale; className?: string; tone?: "light" | "dark" };

/** ენის გადამრთველი — იმავე გვერდზე გადადის მეორე ენით (query პარამეტრების შენარჩუნებით). */
export function LangSwitch({ lang, className, tone = "dark" }: Props) {
  const pathname = usePathname() || "/";
  const params = useSearchParams();
  const base = stripLocale(pathname);
  const other: Locale = lang === "ka" ? "en" : "ka";
  const qs = params.toString();
  return (
    <Link
      href={localePath(other, base) + (qs ? `?${qs}` : "")}
      hrefLang={other}
      className={clsx(
        "inline-flex h-9 items-center rounded-full border px-3 text-[12px] font-semibold tracking-wider uppercase transition",
        tone === "light" ? "border-white/30 text-white hover:bg-white hover:text-ink" : "border-ink/15 text-ink hover:bg-ink hover:text-white",
        className
      )}
      aria-label={other === "en" ? "Switch to English" : "ქართულად გადართვა"}
    >
      {other === "en" ? "EN" : "ᲥᲐᲠ"}
    </Link>
  );
}
