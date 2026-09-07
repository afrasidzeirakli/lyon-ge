import Image from "next/image";
import Link from "next/link";
import { localePath, type Locale } from "@/i18n/config";
import { pick, type SectionData } from "@/lib/content";
import { toMtavruli } from "@/lib/georgian";
import { Reveal } from "../Reveal";
import { SectionHeading } from "./SectionHeading";

function Tile({ src, className, delay = 0 }: { src: string; className?: string; delay?: number }) {
  if (!src) return <div className={className} />;
  return (
    <Reveal delay={delay} className={`relative overflow-hidden rounded-[1.5rem] ${className ?? ""}`}>
      <Image src={src} alt="" fill sizes="(max-width: 1024px) 50vw, 25vw" className="object-cover transition-transform duration-[1200ms] ease-[var(--ease-out-expo)] hover:scale-[1.04]" />
    </Reveal>
  );
}

export function Bento({ content, lang }: { content: SectionData; lang: Locale }) {
  const cta = pick(content.cta, lang);
  const caption = pick(content.caption, lang);
  const text = pick(content.text, lang);
  const center = content.image3 as string;

  return (
    <section className="container-x py-16 lg:py-24">
      <Reveal>
        <SectionHeading title={pick(content.title, lang)} subtitle={pick(content.subtitle, lang)} />
      </Reveal>
      <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-[1fr_1.55fr_1fr] lg:grid-rows-[minmax(0,1fr)_minmax(0,1fr)]">
        <Tile src={content.image1 as string} className="aspect-[4/3] lg:aspect-auto" />
        <Reveal delay={60} className="relative order-first overflow-hidden rounded-[1.5rem] sm:col-span-2 lg:order-none lg:col-start-2 lg:row-span-2">
          <div className="relative aspect-[4/5] sm:aspect-[16/10] lg:aspect-auto lg:h-full lg:min-h-[640px]">
            {center ? <Image src={center} alt="" fill sizes="(max-width: 1024px) 100vw, 45vw" className="object-cover" /> : null}
            <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-transparent to-ink/20" aria-hidden="true" />
            {caption ? (
              <p className="display absolute inset-x-0 top-8 text-center text-3xl text-white drop-shadow-lg sm:text-4xl lg:text-5xl">{toMtavruli(caption)}</p>
            ) : null}
            <div className="absolute inset-x-0 bottom-0 flex flex-col items-center gap-4 p-6 text-center sm:p-8">
              {text ? <p className="max-w-md text-[13px] leading-relaxed text-white/85 sm:text-sm">{text}</p> : null}
              {cta ? (
                <Link href={localePath(lang, (content.ctaHref as string) || "/shop")} className="btn btn-light">
                  {cta}
                </Link>
              ) : null}
            </div>
          </div>
        </Reveal>
        <Tile src={content.image4 as string} className="aspect-[4/3] lg:aspect-auto" delay={120} />
        <Tile src={content.image2 as string} className="aspect-[4/3] lg:aspect-auto" delay={180} />
        <Tile src={content.image5 as string} className="aspect-[4/3] lg:aspect-auto" delay={240} />
      </div>
    </section>
  );
}
