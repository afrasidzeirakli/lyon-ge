import Image from "next/image";
import Link from "next/link";
import { Star } from "lucide-react";
import { localePath, type Locale } from "@/i18n/config";
import { pick, type SectionData } from "@/lib/content";
import { Headline } from "../Headline";
import { Reveal } from "../Reveal";

function Quote({ name, role, text, delay }: { name: string; role: string; text: string; delay: number }) {
  if (!text) return null;
  return (
    <Reveal delay={delay} className="card p-6">
      <p className="font-semibold">{name}</p>
      <div className="mt-1.5 flex gap-0.5 text-accent" aria-label="5/5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star key={i} className="h-3.5 w-3.5 fill-current" />
        ))}
      </div>
      <p className="mt-3 text-[14px] leading-relaxed text-ink-3">“{text}”</p>
      {role ? <p className="mt-4 text-[12px] font-medium tracking-wider text-muted uppercase">{role}</p> : null}
    </Reveal>
  );
}

export function Testimonials({ content, lang }: { content: SectionData; lang: Locale }) {
  const image = content.image as string;
  const stat = pick(content.stat, lang);
  const cta = pick(content.cta, lang);
  return (
    <section className="container-x py-16 lg:py-24">
      <div className="grid items-start gap-10 lg:grid-cols-2 lg:gap-16">
        <div>
          <Reveal>
            <Headline text={pick(content.title, lang)} className="text-4xl sm:text-5xl lg:text-6xl" />
            <p className="mt-5 max-w-md text-[15px] leading-relaxed text-muted sm:text-base">{pick(content.subtitle, lang)}</p>
            <div className="mt-6 flex flex-wrap items-center gap-4">
              {stat ? (
                <span className="inline-flex items-center gap-2 rounded-full bg-paper py-1.5 pr-4 pl-1.5 text-[13px] font-medium shadow-[var(--shadow-card)]">
                  <span className="flex -space-x-2">
                    {["#F2B5A7", "#C6F53B", "#2F55D4", "#E8B830"].map((c) => (
                      <span key={c} className="h-6 w-6 rounded-full border-2 border-paper" style={{ backgroundColor: c }} />
                    ))}
                  </span>
                  {stat}
                </span>
              ) : null}
              {cta ? (
                <Link href={localePath(lang, (content.ctaHref as string) || "/shop")} className="btn btn-primary btn-sm">
                  {cta}
                </Link>
              ) : null}
            </div>
          </Reveal>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <Quote name={content.t1Name as string} role={pick(content.t1Role, lang)} text={pick(content.t1Text, lang)} delay={80} />
            <Quote name={content.t2Name as string} role={pick(content.t2Role, lang)} text={pick(content.t2Text, lang)} delay={160} />
          </div>
        </div>
        {image ? (
          <Reveal delay={120} className="relative aspect-[4/5] overflow-hidden rounded-[1.75rem] lg:aspect-[5/6]">
            <Image src={image} alt="" fill sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover" />
          </Reveal>
        ) : null}
      </div>
    </section>
  );
}
