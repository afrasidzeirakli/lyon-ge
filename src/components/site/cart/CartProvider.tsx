"use client";

import { createContext, useCallback, useContext, useMemo, useState, useSyncExternalStore, type ReactNode } from "react";

export type CartItem = {
  key: string;
  productId: number;
  slug: string;
  nameKa: string;
  nameEn: string;
  brand: string | null;
  image: string | null;
  size: string;
  colorKa: string | null;
  colorEn: string | null;
  qty: number;
  unitPrice: number; // თეთრებში, დამატების მომენტში
  maxQty: number;
};

type CartContextValue = {
  items: CartItem[];
  count: number;
  subtotal: number;
  hydrated: boolean;
  isOpen: boolean;
  open: () => void;
  close: () => void;
  add: (item: Omit<CartItem, "key">) => void;
  remove: (key: string) => void;
  setQty: (key: string, qty: number) => void;
  clear: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = "lyon_cart_v1";

export function makeCartKey(productId: number, size: string, colorEn: string | null): string {
  return `${productId}:${size}:${colorEn ?? ""}`;
}

// ---- გარე store (localStorage) — useSyncExternalStore-ით, hydration-ის შეცდომების გარეშე ----
const EMPTY: CartItem[] = [];
let items: CartItem[] = EMPTY;
let loaded = false;
const listeners = new Set<() => void>();

function load() {
  if (loaded) return;
  loaded = true;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as unknown;
      if (Array.isArray(parsed)) items = (parsed as CartItem[]).filter((i) => i && typeof i.productId === "number" && i.qty > 0);
    }
  } catch {
    items = EMPTY;
  }
}
function persist(next: CartItem[]) {
  items = next;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // ignore
  }
  for (const l of listeners) l();
}
function subscribe(listener: () => void) {
  listeners.add(listener);
  const onStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) {
      loaded = false;
      load();
      listener();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}
function getSnapshot() {
  load();
  return items;
}
function getServerSnapshot() {
  return EMPTY;
}
const noopSubscribe = () => () => {};

export function CartProvider({ children }: { children: ReactNode }) {
  const list = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const hydrated = useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false
  );
  const [isOpen, setIsOpen] = useState(false);

  const add = useCallback((item: Omit<CartItem, "key">) => {
    const key = makeCartKey(item.productId, item.size, item.colorEn);
    const prev = getSnapshot();
    const existing = prev.find((i) => i.key === key);
    const max = item.maxQty || 99;
    const next = existing
      ? prev.map((i) => (i.key === key ? { ...i, qty: Math.min(i.qty + item.qty, max), unitPrice: item.unitPrice, maxQty: item.maxQty } : i))
      : [...prev, { ...item, key, qty: Math.min(item.qty, max) }];
    persist(next);
    setIsOpen(true);
  }, []);

  const remove = useCallback((key: string) => persist(getSnapshot().filter((i) => i.key !== key)), []);
  const setQty = useCallback(
    (key: string, qty: number) => persist(getSnapshot().map((i) => (i.key === key ? { ...i, qty: Math.max(1, Math.min(qty, i.maxQty || 99)) } : i))),
    []
  );
  const clear = useCallback(() => persist(EMPTY), []);

  const value = useMemo<CartContextValue>(() => {
    const count = list.reduce((s, i) => s + i.qty, 0);
    const subtotal = list.reduce((s, i) => s + i.qty * i.unitPrice, 0);
    return {
      items: list,
      count,
      subtotal,
      hydrated,
      isOpen,
      open: () => setIsOpen(true),
      close: () => setIsOpen(false),
      add,
      remove,
      setQty,
      clear,
    };
  }, [list, hydrated, isOpen, add, remove, setQty, clear]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}
