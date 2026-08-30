import { useEffect, useState } from "react";

export type BasketItem = {
  id: string;
  title: string;
  storage_path: string;
};

const STORAGE_KEY = "dh-selectie";
const listeners = new Set<() => void>();
let items: BasketItem[] = [];
let hydrated = false;

function read(): BasketItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? (JSON.parse(raw) as BasketItem[]) : [];
    return Array.isArray(parsed)
      ? parsed.filter((item) => item && typeof item.id === "string").slice(0, 200)
      : [];
  } catch {
    return [];
  }
}

function persist() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    /* opslag vol of geblokkeerd — negeren */
  }
}

function emit() {
  for (const listener of listeners) listener();
}

function ensureHydrated() {
  if (hydrated || typeof window === "undefined") return;
  hydrated = true;
  items = read();
}

export function addToBasket(item: BasketItem) {
  ensureHydrated();
  if (items.some((existing) => existing.id === item.id)) return;
  items = [...items, item];
  persist();
  emit();
}

export function removeFromBasket(id: string) {
  ensureHydrated();
  items = items.filter((item) => item.id !== id);
  persist();
  emit();
}

export function toggleBasket(item: BasketItem) {
  ensureHydrated();
  if (items.some((existing) => existing.id === item.id)) removeFromBasket(item.id);
  else addToBasket(item);
}

export function clearBasket() {
  items = [];
  persist();
  emit();
}

/** Reactieve selectie; leeg tijdens SSR en de eerste render (geen hydration mismatch). */
export function useBasket(): BasketItem[] {
  const [snapshot, setSnapshot] = useState<BasketItem[]>([]);

  useEffect(() => {
    ensureHydrated();
    const sync = () => setSnapshot(items);
    sync();
    listeners.add(sync);
    window.addEventListener("storage", sync);
    return () => {
      listeners.delete(sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  return snapshot;
}
