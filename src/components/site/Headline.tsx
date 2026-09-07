import clsx from "clsx";
import type { ReactNode } from "react";
import { toMtavruli } from "@/lib/georgian";

type Props = {
  text: string;
  as?: "h1" | "h2" | "h3" | "p";
  className?: string;
  accentClassName?: string;
  id?: string;
};

/**
 * ორტონიანი სათაური: ტექსტში *სიტყვა* ვარსკვლავებით -> ნაცრისფერი აქცენტი.
 * მაგ.: "კომფორტი *ყოველ* ნაბიჯში". ქართული ასოები მთავრულად იწერება (OBSIDIAN-ის სტილი).
 */
export function Headline({ text, as = "h2", className, accentClassName = "text-muted-2", id }: Props) {
  const Tag = as;
  const parts = toMtavruli(text).split(/(\*[^*]+\*)/g).filter(Boolean);
  const nodes: ReactNode[] = parts.map((part, i) => {
    if (part.startsWith("*") && part.endsWith("*") && part.length > 2) {
      return (
        <span key={i} className={accentClassName}>
          {part.slice(1, -1)}
        </span>
      );
    }
    return <span key={i}>{part}</span>;
  });
  return (
    <Tag id={id} className={clsx("display", className)}>
      {nodes}
    </Tag>
  );
}

/** ტექსტში \n -> <br/> */
export function Lines({ text }: { text: string }) {
  const lines = text.split(/\r?\n/);
  return (
    <>
      {lines.map((l, i) => (
        <span key={i}>
          {l}
          {i < lines.length - 1 ? <br /> : null}
        </span>
      ))}
    </>
  );
}
