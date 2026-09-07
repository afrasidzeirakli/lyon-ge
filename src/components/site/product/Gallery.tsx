"use client";

import Image from "next/image";
import { useState } from "react";
import clsx from "clsx";

type Img = { id: number; url: string; alt: string | null };

export function Gallery({ images, name, badge }: { images: Img[]; name: string; badge?: string | null }) {
  const [active, setActive] = useState(0);
  const current = images[active] ?? images[0];

  if (!current) {
    return <div className="product-media grid aspect-[4/5] place-items-center rounded-[1.75rem] text-muted-2">LYON</div>;
  }

  return (
    <div className="flex flex-col gap-3 lg:flex-row-reverse lg:gap-4">
      <div className="product-media relative aspect-[4/5] flex-1 overflow-hidden rounded-[1.75rem] shadow-[var(--shadow-card)] sm:aspect-square lg:aspect-[4/5]">
        <Image key={current.id} src={current.url} alt={current.alt || name} fill priority sizes="(max-width: 1024px) 100vw, 55vw" className="animate-fade-in object-cover" />
        {badge ? <span className="badge absolute top-4 left-4 bg-ink text-white">{badge}</span> : null}
      </div>
      {images.length > 1 ? (
        <div className="no-scrollbar flex gap-2.5 overflow-x-auto lg:w-20 lg:flex-col lg:overflow-visible">
          {images.map((img, i) => (
            <button
              key={img.id}
              type="button"
              onClick={() => setActive(i)}
              aria-label={`${name} ${i + 1}`}
              aria-current={i === active}
              className={clsx("product-media relative h-20 w-16 shrink-0 overflow-hidden rounded-xl border-2 transition lg:h-24 lg:w-full", i === active ? "border-ink" : "border-transparent hover:border-ink/30")}
            >
              <Image src={img.url} alt="" fill sizes="96px" className="object-cover" />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
