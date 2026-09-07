"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { Menu, Phone, Search, ShoppingBag, X } from "lucide-react";
import clsx from "clsx";
import { localePath, stripLocale, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { telLink } from "@/lib/settings";
import { toMtavruli } from "@/lib/georgian";
import { Logo, type LogoAssets } from "./Logo";
import { LangSwitch } from "./LangSwitch";
import { useCart } from "./cart/CartProvider";

type NavItem = { label: string; href: string; match: { path: string; category?: string; sale?: boolean } };

type Props = { lang: Locale; dict: Dictionary; assets: LogoAssets; phone: string };

function subscribeScroll(cb: () => void) {
  window.addEventListener("scroll", cb, { passive: true });
  return () => window.removeEventListener("scroll", cb);
}

export function Header({ lang, dict, assets, phone }: Props) {
  const pathname = usePathname() || "/";
  const isHome = stripLocale(pathname) === "/";
  const scrolled = useSyncExternalStore(
    subscribeScroll,
    () => window.scrollY > 24,
    () => false
  );
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const cart = useCart();

  // გვერდის შეცვლისას მენიუ და ძებნა იხურება (state-ის კორექცია რენდერისას, effect-ის გარეშე)
  const [prevPath, setPrevPath] = useState(pathname);
  if (prevPath !== pathname) {
    setPrevPath(pathname);
    setMenuOpen(false);
    setSearchOpen(false);
  }

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const overlay = isHome && !scrolled && !menuOpen && !searchOpen;
  const tone: "light" | "dark" = overlay ? "light" : "dark";

  const nav: NavItem[] = [
    { label: dict.nav.shop, href: localePath(lang, "/shop"), match: { path: "/shop" } },
    { label: dict.nav.men, href: localePath(lang, "/shop?category=men"), match: { path: "/shop", category: "men" } },
    { label: dict.nav.women, href: localePath(lang, "/shop?category=women"), match: { path: "/shop", category: "women" } },
    { label: dict.nav.kids, href: localePath(lang, "/shop?category=kids"), match: { path: "/shop", category: "kids" } },
    { label: dict.nav.sale, href: localePath(lang, "/shop?sale=1"), match: { path: "/shop", sale: true } },
  ];

  return (
    <>
      <header
        className={clsx(
          "fixed inset-x-0 top-0 z-50 transition-[background-color,box-shadow,color] duration-500",
          overlay ? "bg-transparent text-white" : "bg-cream/85 text-ink shadow-[0_1px_0_0_var(--color-line)] backdrop-blur-xl"
        )}
      >
        <div className="container-x flex h-[72px] items-center justify-between gap-4">
          <div className="flex items-center gap-3 lg:w-[220px]">
            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              aria-label={menuOpen ? dict.nav.close : dict.nav.menu}
              aria-expanded={menuOpen}
              className={clsx("grid h-10 w-10 place-items-center rounded-full transition lg:hidden", overlay ? "hover:bg-white/15" : "hover:bg-ink/5")}
            >
              {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
            <Logo lang={lang} assets={assets} variant={tone} />
          </div>

          <Suspense fallback={<div className="hidden lg:block" />}>
            <DesktopNav items={nav} overlay={overlay} />
          </Suspense>

          <div className="flex items-center justify-end gap-1.5 lg:w-[220px]">
            <button
              type="button"
              onClick={() => setSearchOpen((v) => !v)}
              aria-label={dict.nav.search}
              className={clsx("grid h-10 w-10 place-items-center rounded-full transition", overlay ? "hover:bg-white/15" : "hover:bg-ink/5")}
            >
              <Search className="h-5 w-5" />
            </button>
            {phone ? (
              <a
                href={telLink(phone)}
                aria-label={dict.nav.call}
                className={clsx("hidden h-10 w-10 place-items-center rounded-full transition sm:grid", overlay ? "hover:bg-white/15" : "hover:bg-ink/5")}
              >
                <Phone className="h-5 w-5" />
              </a>
            ) : null}
            <Suspense fallback={null}>
              <LangSwitch lang={lang} tone={tone} className="hidden sm:inline-flex" />
            </Suspense>
            <button
              type="button"
              onClick={cart.open}
              aria-label={dict.nav.cart}
              className={clsx("relative grid h-10 w-10 place-items-center rounded-full transition", overlay ? "hover:bg-white/15" : "hover:bg-ink/5")}
            >
              <ShoppingBag className="h-5 w-5" />
              {cart.hydrated && cart.count > 0 ? (
                <span className={clsx("absolute -top-0.5 -right-0.5 grid h-5 min-w-5 place-items-center rounded-full px-1 text-[11px] font-semibold tabular-nums", overlay ? "bg-white text-ink" : "bg-ink text-white")}>
                  {cart.count}
                </span>
              ) : null}
            </button>
          </div>
        </div>

        <SearchBar lang={lang} dict={dict} open={searchOpen} onClose={() => setSearchOpen(false)} />
      </header>

      {/* მობილური მენიუ */}
      <div
        className={clsx(
          "fixed inset-0 z-40 flex flex-col bg-cream pt-[72px] transition-opacity duration-300 lg:hidden",
          menuOpen ? "opacity-100" : "pointer-events-none opacity-0"
        )}
        aria-hidden={!menuOpen}
      >
        <nav className="container-x flex flex-1 flex-col gap-1 pt-6">
          {nav.map((item, i) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMenuOpen(false)}
              className={clsx("display border-b border-line py-4 text-4xl transition-transform duration-500 ease-[var(--ease-out-expo)]", menuOpen ? "translate-y-0" : "translate-y-4")}
              style={{ transitionDelay: `${i * 40}ms` }}
            >
              {toMtavruli(item.label)}
            </Link>
          ))}
          <div className="mt-6 flex items-center gap-3">
            {phone ? (
              <a href={telLink(phone)} className="btn btn-outline">
                <Phone className="h-4 w-4" /> {phone}
              </a>
            ) : null}
            <Suspense fallback={null}>
              <LangSwitch lang={lang} className="h-12 px-5" />
            </Suspense>
          </div>
        </nav>
      </div>

      {/* ადგილი ფიქსირებული ჰედერისთვის (მთავარზე ჰერო თვითონ იჭერს) */}
      {!isHome ? <div className="h-[72px]" /> : null}
    </>
  );
}

function DesktopNav({ items, overlay }: { items: NavItem[]; overlay: boolean }) {
  const pathname = usePathname() || "/";
  const params = useSearchParams();
  const base = stripLocale(pathname);
  const category = params.get("category");
  const sale = params.get("sale") === "1";
  const anyFilter = !!category || sale;

  return (
    <nav
      className={clsx(
        "hidden items-center rounded-full p-1 transition-colors duration-500 lg:flex",
        overlay ? "border border-white/15 bg-white/10 backdrop-blur-md" : "border border-ink/5 bg-ink/[0.04]"
      )}
    >
      {items.map((item) => {
        const m = item.match;
        const active =
          base === m.path &&
          (m.category ? category === m.category : m.sale ? sale : !anyFilter);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={clsx(
              "rounded-full px-4 py-2 text-[13px] font-medium transition-colors duration-300",
              active ? (overlay ? "bg-white text-ink" : "bg-ink text-white") : overlay ? "text-white/85 hover:text-white" : "text-ink/70 hover:text-ink"
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

function SearchBar({ lang, dict, open, onClose }: { lang: Locale; dict: Dictionary; open: boolean; onClose: () => void }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [q, setQ] = useState("");

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 50);
  }, [open]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const query = q.trim();
    router.push(localePath(lang, query ? `/shop?q=${encodeURIComponent(query)}` : "/shop"));
    onClose();
  };

  return (
    <div className={clsx("grid transition-[grid-template-rows] duration-400 ease-[var(--ease-out-expo)]", open ? "grid-rows-[1fr]" : "grid-rows-[0fr]")}>
      <div className="overflow-hidden">
        <form onSubmit={submit} className="container-x flex items-center gap-3 pb-4 text-ink">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-muted" />
            <input
              ref={inputRef}
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={dict.shop.searchPlaceholder}
              className="field h-12 rounded-full bg-paper pl-11"
              aria-label={dict.nav.search}
            />
          </div>
          <button type="submit" className="btn btn-primary">
            {dict.nav.search}
          </button>
          <button type="button" onClick={onClose} aria-label={dict.nav.close} className="grid h-10 w-10 place-items-center rounded-full hover:bg-ink/5">
            <X className="h-5 w-5" />
          </button>
        </form>
      </div>
    </div>
  );
}
