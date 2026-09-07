import Image from "next/image";
import type { Locale } from "@/i18n/config";
import { pick, type SectionData } from "@/lib/content";
import { Reveal } from "../Reveal";

function Chip({ src }: { src: string }) {
  if (!src) return null;
  return (
    <span className="relative mx-[0.15em] inline-block h-[0.82em] w-[2.1em] translate-y-[0.06em] overflow-hidden rounded-full align-baseline shadow-[var(--shadow-card)]">
      <Image src={src} alt="" fill sizes="200px" className="object-cover" />
    </span>
  );
}

export function Statement({ content, lang }: { content: SectionData; lang: Locale }) {
  const l1 = pick(content.line1, lang);
  const l2 = pick(content.line2, lang);
  const l3 = pick(content.line3, lang);
  if (!l1 && !l2 && !l3) return null;
  return (
    <section className="container-x py-20 lg:py-28">
      <Reveal>
        <p className="mx-auto max-w-5xl text-center font-sans text-[8.5vw] leading-[1.12] font-medium tracking-[-0.02em] text-ink sm:text-5xl lg:text-[3.6rem]">
          <span>{l1}</span> <Chip src={content.chip1 as string} /> <span className="text-muted-2">{l2}</span> <Chip src={content.chip2 as string} />{" "}
          <span>{l3}</span> <Chip src={content.chip3 as string} />
        </p>
      </Reveal>
    </section>
  );
}
