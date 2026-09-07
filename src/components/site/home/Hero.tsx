import Image from "next/image";
import Link from "next/link";
import { Check } from "lucide-react";
import { localePath, type Locale } from "@/i18n/config";
import { pick, type SectionData } from "@/lib/content";
import { Headline } from "../Headline";

export function Hero({ content, lang }: { content: SectionData; lang: Locale }) {
  const image = (content.image as string) || "";
  const badges = [pick(content.badge1, lang), pick(content.badge2, lang), pick(content.badge3, lang)].filter(Boolean);
  const primaryHref = (content.ctaPrimaryHref as string) || "/shop";
  const secondaryHref = (content.ctaSecondaryHref as string) || "/shop?new=1";
  const eyebrow = pick(content.eyebrow, lang);
  const subtitle = pick(content.subtitle, lang);
  const ctaPrimary = pick(content.ctaPrimary, lang);
  const ctaSecondary = pick(content.ctaSecondary, lang);

  return (
    <section className="relative isolate h-[100svh] max-h-[1040px] min-h-[640px] overflow-hidden bg-ink text-white">
      {image ? (
        <Image src={image} alt="" fill priority sizes="100vw" className="animate-fade-in object-cover object-center" />
      ) : null}
      <div className="hero-shade absolute inset-0" aria-hidden="true" />

      <div className="container-x relative flex h-full flex-col justify-end pt-32 pb-12 lg:pb-16">
        <div className="grid items-end gap-10 lg:grid-cols-[1.4fr_1fr]">
          <div className="max-w-4xl">
            {eyebrow ? (
              <p className="animate-fade-up mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-[12px] font-medium tracking-[0.16em] uppercase backdrop-blur-md">
                <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                {eyebrow}
              </p>
            ) : null}
            <Headline
              as="h1"
              text={pick(content.title, lang)}
              className="animate-fade-up text-[11.5vw] leading-[0.94] sm:text-7xl lg:text-[6.5rem] xl:text-[7.5rem] [animation-delay:80ms]"
              accentClassName="text-white/45"
            />
            {subtitle ? <p className="animate-fade-up mt-6 max-w-xl text-lg leading-relaxed text-white/80 [animation-delay:160ms]">{subtitle}</p> : null}
            <div className="animate-fade-up mt-8 flex flex-wrap gap-3 [animation-delay:240ms]">
              {ctaPrimary ? (
                <Link href={localePath(lang, primaryHref)} className="btn btn-light btn-lg">
                  {ctaPrimary}
                </Link>
              ) : null}
              {ctaSecondary ? (
                <Link href={localePath(lang, secondaryHref)} className="btn btn-outline-light btn-lg">
                  {ctaSecondary}
                </Link>
              ) : null}
            </div>
          </div>

          {badges.length > 0 ? (
            <ul className="animate-fade-up flex flex-col gap-2 lg:items-end [animation-delay:320ms]">
              {badges.map((b) => (
                <li key={b} className="inline-flex items-center gap-2.5 rounded-full border border-white/15 bg-white/10 py-2 pr-4 pl-2 text-[13px] font-medium backdrop-blur-md">
                  <span className="grid h-6 w-6 place-items-center rounded-full bg-white text-ink">
                    <Check className="h-3.5 w-3.5" strokeWidth={3} />
                  </span>
                  {b}
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </div>
    </section>
  );
}
