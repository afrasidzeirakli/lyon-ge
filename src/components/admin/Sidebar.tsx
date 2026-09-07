"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Award, ExternalLink, FileText, Layers, LayoutDashboard, LogOut, Menu, Package, Percent, Settings, ShoppingCart, X } from "lucide-react";
import clsx from "clsx";
import { logout } from "@/app/(admin)/admin/login/actions";

const NAV = [
  { href: "/admin", label: "დაშბორდი", icon: LayoutDashboard, exact: true },
  { href: "/admin/orders", label: "შეკვეთები", icon: ShoppingCart },
  { href: "/admin/products", label: "პროდუქტები", icon: Package },
  { href: "/admin/categories", label: "კატეგორიები", icon: Layers },
  { href: "/admin/brands", label: "ბრენდები", icon: Award },
  { href: "/admin/promos", label: "აქციები & პრომო", icon: Percent },
  { href: "/admin/content", label: "საიტის კონტენტი", icon: FileText },
  { href: "/admin/settings", label: "პარამეტრები", icon: Settings },
];

export function Sidebar({ username, newOrders }: { username: string; newOrders: number }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const nav = (
    <nav className="flex flex-1 flex-col gap-1">
      {NAV.map((item) => {
        const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setOpen(false)}
            className={clsx(
              "flex items-center gap-3 rounded-xl px-3 py-2.5 text-[14px] font-medium transition",
              active ? "bg-ink text-white" : "text-ink-3 hover:bg-ink/5"
            )}
          >
            <item.icon className="h-[18px] w-[18px]" />
            <span className="flex-1">{item.label}</span>
            {item.href === "/admin/orders" && newOrders > 0 ? (
              <span className={clsx("grid h-5 min-w-5 place-items-center rounded-full px-1.5 text-[11px] font-semibold", active ? "bg-white text-ink" : "bg-accent text-white")}>{newOrders}</span>
            ) : null}
          </Link>
        );
      })}
    </nav>
  );

  const footer = (
    <div className="mt-auto space-y-1 border-t border-line pt-4">
      <a href="/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-[14px] text-ink-3 hover:bg-ink/5">
        <ExternalLink className="h-[18px] w-[18px]" /> საიტის ნახვა
      </a>
      <form action={logout}>
        <button type="submit" className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-[14px] text-ink-3 hover:bg-ink/5">
          <LogOut className="h-[18px] w-[18px]" /> გასვლა <span className="ml-auto text-[12px] text-muted">{username}</span>
        </button>
      </form>
    </div>
  );

  return (
    <>
      {/* მობილური ზედა ზოლი */}
      <div className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-line bg-white px-4 lg:hidden">
        <Link href="/admin" className="wordmark text-xl">
          LYON
        </Link>
        <button type="button" onClick={() => setOpen((v) => !v)} className="grid h-10 w-10 place-items-center rounded-full hover:bg-ink/5" aria-label="მენიუ">
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>
      {open ? (
        <div className="fixed inset-0 z-20 flex flex-col bg-white p-4 pt-16 lg:hidden">
          {nav}
          {footer}
        </div>
      ) : null}

      {/* დესკტოპის გვერდითი პანელი */}
      <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col border-r border-line bg-white p-4 lg:flex">
        <Link href="/admin" className="wordmark px-3 py-3 text-2xl">
          LYON
        </Link>
        <p className="mb-4 px-3 text-[11px] font-semibold tracking-[0.16em] text-muted uppercase">ადმინ პანელი</p>
        {nav}
        {footer}
      </aside>
    </>
  );
}
