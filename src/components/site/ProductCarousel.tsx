"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import clsx from "clsx";

type Props = {
  children: ReactNode;
  labels: { prev: string; next: string };
  className?: string;
};

/** ჰორიზონტალური სქროლი ისრებით. შვილები (ბარათები) სერვერზე რენდერდება. */
export function ProductCarousel({ children, labels, className }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(true);

  const update = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    setCanPrev(el.scrollLeft > 4);
    setCanNext(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }, []);

  useEffect(() => {
    update();
    const el = ref.current;
    if (!el) return;
    el.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      el.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [update]);

  const scrollBy = (dir: 1 | -1) => {
    const el = ref.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>("[data-card]");
    const step = card ? card.offsetWidth + 24 : el.clientWidth * 0.8;
    el.scrollBy({ left: dir * step * 2, behavior: "smooth" });
  };

  return (
    <div className={clsx("relative", className)}>
      <div ref={ref} className="no-scrollbar -mx-5 flex snap-x snap-mandatory gap-5 overflow-x-auto px-5 pb-2 sm:-mx-8 sm:gap-6 sm:px-8 lg:-mx-12 lg:px-12">
        {children}
      </div>
      <div className="mt-8 flex items-center justify-center gap-3">
        <button
          type="button"
          onClick={() => scrollBy(-1)}
          disabled={!canPrev}
          aria-label={labels.prev}
          className="grid h-11 w-11 place-items-center rounded-full border border-ink/15 text-ink transition hover:bg-ink hover:text-white disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-ink"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => scrollBy(1)}
          disabled={!canNext}
          aria-label={labels.next}
          className="grid h-11 w-11 place-items-center rounded-full bg-ink text-white transition hover:bg-ink-3 disabled:opacity-30"
        >
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
