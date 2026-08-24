import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { products, type Product } from "./products";

export type CartLine = { handle: string; size: string; qty: number };

type CartContext = {
  lines: CartLine[];
  add: (handle: string, size: string) => void;
  remove: (handle: string, size: string) => void;
  setQty: (handle: string, size: string, qty: number) => void;
  count: number;
  subtotal: number;
  detailed: { line: CartLine; product: Product }[];
};

const Ctx = createContext<CartContext | null>(null);
const KEY = "ogcult-cart";

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setLines(JSON.parse(raw));
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(lines));
    } catch {
      /* ignore */
    }
  }, [lines]);

  const value = useMemo<CartContext>(() => {
    const detailed = lines
      .map((line) => ({ line, product: products.find((p) => p.handle === line.handle) }))
      .filter((x): x is { line: CartLine; product: Product } => Boolean(x.product));

    return {
      lines,
      detailed,
      count: lines.reduce((n, l) => n + l.qty, 0),
      subtotal: detailed.reduce((n, { line, product }) => n + line.qty * product.price, 0),
      add: (handle, size) =>
        setLines((prev) => {
          const hit = prev.find((l) => l.handle === handle && l.size === size);
          return hit
            ? prev.map((l) => (l === hit ? { ...l, qty: l.qty + 1 } : l))
            : [...prev, { handle, size, qty: 1 }];
        }),
      remove: (handle, size) =>
        setLines((prev) => prev.filter((l) => !(l.handle === handle && l.size === size))),
      setQty: (handle, size, qty) =>
        setLines((prev) =>
          qty <= 0
            ? prev.filter((l) => !(l.handle === handle && l.size === size))
            : prev.map((l) => (l.handle === handle && l.size === size ? { ...l, qty } : l)),
        ),
    };
  }, [lines]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useCart() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}
