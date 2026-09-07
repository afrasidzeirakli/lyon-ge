"use client";

import { useEffect, useRef, type ReactNode } from "react";
import clsx from "clsx";

type Props = {
  children: ReactNode;
  className?: string;
  delay?: number; // ms
  as?: "div" | "section" | "li" | "span";
};

/** ელემენტი ეკრანზე გამოჩენისას რბილად ამოდის ქვემოდან. */
export function Reveal({ children, className, delay = 0, as = "div" }: Props) {
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      el.classList.add("is-visible");
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            el.classList.add("is-visible");
            io.disconnect();
          }
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
    );
    io.observe(el);
    // დაზღვევა: თუ observer რაიმე მიზეზით არ გააქტიურდა (ბეჭდვა, ძველი ბრაუზერი), კონტენტი მაინც გამოჩნდეს
    const fallback = window.setTimeout(() => el.classList.add("is-visible"), 3000);
    return () => {
      io.disconnect();
      window.clearTimeout(fallback);
    };
  }, []);

  const Tag = as as "div";
  return (
    <Tag ref={ref as React.RefObject<HTMLDivElement>} className={clsx("reveal", className)} style={delay ? { transitionDelay: `${delay}ms` } : undefined}>
      {children}
    </Tag>
  );
}
