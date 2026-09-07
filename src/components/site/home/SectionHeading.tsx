import clsx from "clsx";
import { Headline } from "../Headline";

type Props = { title: string; subtitle?: string; align?: "center" | "left"; className?: string; size?: "md" | "lg" };

export function SectionHeading({ title, subtitle, align = "center", className, size = "lg" }: Props) {
  return (
    <div className={clsx(align === "center" ? "mx-auto max-w-2xl text-center" : "max-w-2xl text-left", className)}>
      <Headline text={title} className={clsx(size === "lg" ? "text-4xl sm:text-5xl lg:text-6xl" : "text-3xl sm:text-4xl")} />
      {subtitle ? <p className="mt-4 text-[15px] leading-relaxed text-muted sm:text-base">{subtitle}</p> : null}
    </div>
  );
}
