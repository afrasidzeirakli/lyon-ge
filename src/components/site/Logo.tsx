import Link from "next/link";
import clsx from "clsx";
import { localePath, type Locale } from "@/i18n/config";

export type LogoAssets = { name: string; logoUrl: string | null; logoWhiteUrl: string | null };

type Props = {
  lang: Locale;
  assets: LogoAssets;
  variant?: "dark" | "light"; // light = თეთრი ლოგო მუქ ფონზე
  className?: string;
  size?: "sm" | "md" | "lg";
};

export function Logo({ lang, assets, variant = "dark", className, size = "md" }: Props) {
  const heights = { sm: "h-6", md: "h-7", lg: "h-9" } as const;
  const textSizes = { sm: "text-xl", md: "text-2xl", lg: "text-3xl" } as const;
  const url = variant === "light" ? assets.logoWhiteUrl || assets.logoUrl : assets.logoUrl;
  const needsInvert = variant === "light" && !assets.logoWhiteUrl && !!assets.logoUrl;

  return (
    <Link href={localePath(lang, "/")} aria-label={assets.name} className={clsx("inline-flex items-center", className)}>
      {url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={url} alt={assets.name} className={clsx(heights[size], "w-auto", needsInvert && "brightness-0 invert")} />
      ) : (
        <span className={clsx("wordmark", textSizes[size], variant === "light" ? "text-white" : "text-ink")}>{assets.name || "LYON"}</span>
      )}
    </Link>
  );
}
