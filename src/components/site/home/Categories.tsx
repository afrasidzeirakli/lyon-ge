import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { localePath, type Locale } from "@/i18n/config";
import { pick, type SectionData } from "@/lib/content";
import { Reveal } from "../Reveal";
import { SectionHeading } from "./SectionHeading";

export function Categories({ content, lang }: { content: SectionData; lang: Locale }) {
  const cards = [1, 2, 3, 4]
    .map((i) => ({
      title: pick(content[`c${i}Title`], lang),
      href: (content[`c${i}Href`] as string) || "/shop",
      image: content[`c${i}Image`] as string,
    }))
    .filter((c) => c.title && c.image);
  if (cards.length === 0) return null;

  return (
    <section className="container-x py-16 lg:py-24">
      <Reveal>
        <SectionHeading title={pick(content.title, lang)} subtitle={pick(content.subtitle, lang)} />
      </Reveal>
      <div className="mt-12 grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-5">
        {cards.map((c, i) => (
          <Reveal key={c.href + i} delay={i * 70}>
            <Link href={localePath(lang, c.href)} className="group block">
              <div className="relative aspect-[3/4] overflow-hidden rounded-[1.5rem]">
                <Image src={c.image} alt={c.title} fill sizes="(max-width: 1024px) 50vw, 25vw" className="object-cover transition-transform duration-[1100ms] ease-[var(--ease-out-expo)] group-hover:scale-[1.05]" />
                <span className="absolute top-3 right-3 grid h-9 w-9 place-items-center rounded-full bg-white/90 text-ink opacity-0 transition group-hover:opacity-100">
                  <ArrowUpRight className="h-4 w-4" />
                </span>
              </div>
              <p className="mt-3 text-[15px] font-medium group-hover:underline group-hover:underline-offset-4">{c.title}</p>
            </Link>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
