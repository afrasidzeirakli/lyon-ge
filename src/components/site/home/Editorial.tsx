import Image from "next/image";
import Link from "next/link";
import { localePath, type Locale } from "@/i18n/config";
import { pick, type SectionData } from "@/lib/content";
import { Headline } from "../Headline";
import { Reveal } from "../Reveal";
import { SectionHeading } from "./SectionHeading";

/** 1 დიდი + 2 პატარა ფოტო, ცენტრირებული სათაური და ღილაკი */
export function EditorialTriptych({ content, lang }: { content: SectionData; lang: Locale }) {
  const main = content.imageMain as string;
  const left = content.imageLeft as string;
  const right = content.imageRight as string;
  const cta = pick(content.cta, lang);
  return (
    <section className="container-x py-16 lg:py-24">
      <Reveal>
        <SectionHeading title={pick(content.title, lang)} subtitle={pick(content.subtitle, lang)} />
      </Reveal>
      <div className="mx-auto mt-12 max-w-5xl">
        {main ? (
          <Reveal className="relative aspect-[16/11] overflow-hidden rounded-[1.75rem] sm:aspect-[16/9]">
            <Image src={main} alt="" fill sizes="(max-width: 1024px) 100vw, 1024px" className="object-cover" />
          </Reveal>
        ) : null}
        <div className="mt-5 grid grid-cols-[1.35fr_1fr] gap-5">
          {left ? (
            <Reveal delay={80} className="relative aspect-[4/3] overflow-hidden rounded-[1.5rem]">
              <Image src={left} alt="" fill sizes="(max-width: 1024px) 60vw, 600px" className="object-cover" />
            </Reveal>
          ) : null}
          {right ? (
            <Reveal delay={160} className="relative aspect-[4/3] overflow-hidden rounded-[1.5rem]">
              <Image src={right} alt="" fill sizes="(max-width: 1024px) 40vw, 420px" className="object-cover" />
            </Reveal>
          ) : null}
        </div>
        {cta ? (
          <div className="mt-8 text-center">
            <Link href={localePath(lang, (content.ctaHref as string) || "/shop")} className="btn btn-primary">
              {cta}
            </Link>
          </div>
        ) : null}
      </div>
    </section>
  );
}

/** ტექსტი მარცხნივ, დიდი ფოტო მარჯვნივ */
export function EditorialSplit({ content, lang }: { content: SectionData; lang: Locale }) {
  const image = content.image as string;
  const cta = pick(content.cta, lang);
  return (
    <section className="container-x py-16 lg:py-24">
      <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
        <Reveal>
          <Headline text={pick(content.title, lang)} className="text-4xl sm:text-5xl lg:text-6xl" />
          <p className="mt-5 max-w-md text-[15px] leading-relaxed text-muted sm:text-base">{pick(content.subtitle, lang)}</p>
          {cta ? (
            <Link href={localePath(lang, (content.ctaHref as string) || "/shop")} className="btn btn-primary mt-8">
              {cta}
            </Link>
          ) : null}
        </Reveal>
        {image ? (
          <Reveal delay={100} className="relative aspect-[4/5] overflow-hidden rounded-[1.75rem] sm:aspect-[5/4] lg:aspect-[4/5]">
            <Image src={image} alt="" fill sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover" />
          </Reveal>
        ) : null}
      </div>
    </section>
  );
}
