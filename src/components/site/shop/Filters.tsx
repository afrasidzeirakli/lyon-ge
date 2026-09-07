"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useRef, useState, useTransition } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import clsx from "clsx";
import type { Dictionary } from "@/i18n/dictionaries";
import { PRODUCT_TYPES } from "@/i18n/dictionaries";
import type { Locale } from "@/i18n/config";

type Option = { value: string; label: string };
type Props = {
  lang?: Locale;
  dict: Dictionary;
  categories: Option[];
  brands: Option[];
  sizes: string[];
};

function useUrlState() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [, startTransition] = useTransition();

  const set = (patch: Record<string, string | null>) => {
    const next = new URLSearchParams(params.toString());
    for (const [k, v] of Object.entries(patch)) {
      if (v == null || v === "") next.delete(k);
      else next.set(k, v);
    }
    next.delete("page");
    const qs = next.toString();
    startTransition(() => router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false }));
  };
  const list = (key: string) => (params.get(key) ?? "").split(",").filter(Boolean);
  const toggle = (key: string, value: string) => {
    const cur = list(key);
    const next = cur.includes(value) ? cur.filter((v) => v !== value) : [...cur, value];
    set({ [key]: next.join(",") });
  };
  return { params, set, list, toggle, pathname, router };
}

export function Filters({ dict, categories, brands, sizes }: Props) {
  const t = dict.shop;
  const { params, set, list, toggle, pathname, router } = useUrlState();
  const [open, setOpen] = useState(false);
  const minRef = useRef<HTMLInputElement>(null);
  const maxRef = useRef<HTMLInputElement>(null);
  const priceKey = `${params.get("min") ?? ""}-${params.get("max") ?? ""}`;

  const activeCount =
    (params.get("category") ? 1 : 0) + list("brand").length + list("type").length + list("size").length + (params.get("min") || params.get("max") ? 1 : 0) + (params.get("sale") ? 1 : 0) + (params.get("new") ? 1 : 0);

  const applyPrice = () => {
    const min = (minRef.current?.value ?? "").replace(/[^\d]/g, "");
    const max = (maxRef.current?.value ?? "").replace(/[^\d]/g, "");
    if (min === (params.get("min") ?? "") && max === (params.get("max") ?? "")) return;
    set({ min: min || null, max: max || null });
  };
  const clearAll = () => {
    const q = params.get("q");
    router.push(q ? `${pathname}?q=${encodeURIComponent(q)}` : pathname, { scroll: false });
  };

  const types = PRODUCT_TYPES.map((v) => ({ value: v, label: (dict.types as Record<string, string>)[v] ?? v }));
  const category = params.get("category") ?? "";

  const Panel = (
    <div className="space-y-7">
      <Group title={t.category}>
        <ul className="space-y-1.5">
          <li>
            <Radio checked={!category} onChange={() => set({ category: null })} label={t.all} />
          </li>
          {categories.map((c) => (
            <li key={c.value}>
              <Radio checked={category === c.value} onChange={() => set({ category: c.value })} label={c.label} />
            </li>
          ))}
        </ul>
      </Group>

      <Group title={t.type}>
        <ul className="space-y-1.5">
          {types.map((o) => (
            <li key={o.value}>
              <Check checked={list("type").includes(o.value)} onChange={() => toggle("type", o.value)} label={o.label} />
            </li>
          ))}
        </ul>
      </Group>

      {brands.length > 0 ? (
        <Group title={t.brand}>
          <ul className="space-y-1.5">
            {brands.map((o) => (
              <li key={o.value}>
                <Check checked={list("brand").includes(o.value)} onChange={() => toggle("brand", o.value)} label={o.label} />
              </li>
            ))}
          </ul>
        </Group>
      ) : null}

      {sizes.length > 0 ? (
        <Group title={t.size}>
          <div className="flex flex-wrap gap-2">
            {sizes.map((s) => {
              const active = list("size").includes(s);
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => toggle("size", s)}
                  className={clsx("h-9 min-w-11 rounded-full border px-3 text-[13px] tabular-nums transition", active ? "border-ink bg-ink text-white" : "border-line bg-paper hover:border-ink")}
                >
                  {s}
                </button>
              );
            })}
          </div>
        </Group>
      ) : null}

      <Group title={t.price}>
        <div key={priceKey} className="flex items-center gap-2">
          <input ref={minRef} inputMode="numeric" defaultValue={params.get("min") ?? ""} onBlur={applyPrice} onKeyDown={(e) => e.key === "Enter" && applyPrice()} placeholder={t.priceFrom} className="field h-10 rounded-full px-4 text-sm" aria-label={t.priceFrom} />
          <span className="text-muted">–</span>
          <input ref={maxRef} inputMode="numeric" defaultValue={params.get("max") ?? ""} onBlur={applyPrice} onKeyDown={(e) => e.key === "Enter" && applyPrice()} placeholder={t.priceTo} className="field h-10 rounded-full px-4 text-sm" aria-label={t.priceTo} />
          <span className="text-sm text-muted">₾</span>
        </div>
      </Group>

      <Group title={dict.common.sale}>
        <ul className="space-y-1.5">
          <li>
            <Check checked={params.get("sale") === "1"} onChange={() => set({ sale: params.get("sale") === "1" ? null : "1" })} label={t.onlySale} />
          </li>
          <li>
            <Check checked={params.get("new") === "1"} onChange={() => set({ new: params.get("new") === "1" ? null : "1" })} label={t.onlyNew} />
          </li>
        </ul>
      </Group>

      {activeCount > 0 ? (
        <button type="button" onClick={clearAll} className="inline-flex items-center gap-1.5 text-sm font-medium underline underline-offset-4 hover:text-muted">
          <X className="h-3.5 w-3.5" /> {t.clear} ({activeCount})
        </button>
      ) : null}
    </div>
  );

  return (
    <>
      <button type="button" onClick={() => setOpen((v) => !v)} className="btn btn-outline btn-sm lg:hidden" aria-expanded={open}>
        <SlidersHorizontal className="h-4 w-4" /> {t.filters}
        {activeCount > 0 ? <span className="ml-1 grid h-5 min-w-5 place-items-center rounded-full bg-ink px-1 text-[11px] text-white">{activeCount}</span> : null}
      </button>
      <div className={clsx("mt-4 rounded-2xl border border-line bg-paper p-5 lg:hidden", open ? "block" : "hidden")}>{Panel}</div>
      <aside className="sticky top-24 hidden lg:block">{Panel}</aside>
    </>
  );
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="mb-3 text-[12px] font-semibold tracking-[0.16em] text-muted uppercase">{title}</h3>
      {children}
    </div>
  );
}

function Check({ checked, onChange, label }: { checked: boolean; onChange: () => void; label: string }) {
  return (
    <label className="flex cursor-pointer items-center gap-2.5 text-[14px]">
      <input type="checkbox" checked={checked} onChange={onChange} className="peer sr-only" />
      <span className="grid h-4.5 w-4.5 place-items-center rounded-[5px] border border-ink/25 bg-paper transition peer-checked:border-ink peer-checked:bg-ink">
        {checked ? <span className="h-2 w-2 rounded-[2px] bg-white" /> : null}
      </span>
      {label}
    </label>
  );
}

function Radio({ checked, onChange, label }: { checked: boolean; onChange: () => void; label: string }) {
  return (
    <label className="flex cursor-pointer items-center gap-2.5 text-[14px]">
      <input type="radio" checked={checked} onChange={onChange} className="sr-only" />
      <span className={clsx("grid h-4.5 w-4.5 place-items-center rounded-full border transition", checked ? "border-ink" : "border-ink/25")}>
        {checked ? <span className="h-2 w-2 rounded-full bg-ink" /> : null}
      </span>
      {label}
    </label>
  );
}

export function SortSelect({ dict }: { dict: Dictionary }) {
  const { params, set } = useUrlState();
  const t = dict.shop;
  return (
    <label className="inline-flex items-center gap-2 text-sm">
      <span className="text-muted">{t.sort}:</span>
      <select value={params.get("sort") ?? "newest"} onChange={(e) => set({ sort: e.target.value === "newest" ? null : e.target.value })} className="h-10 rounded-full border border-line bg-paper pr-8 pl-4 text-sm outline-none focus:border-ink">
        <option value="newest">{t.sortNewest}</option>
        <option value="popular">{t.sortPopular}</option>
        <option value="price-asc">{t.sortPriceAsc}</option>
        <option value="price-desc">{t.sortPriceDesc}</option>
      </select>
    </label>
  );
}
