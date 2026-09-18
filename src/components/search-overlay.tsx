import { useEffect, useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { X } from "lucide-react";
import { formatMoney, isTShirtProduct, productsQueryOptions } from "@/lib/shopify";

export function SearchOverlay({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [term, setTerm] = useState("");
  const { data, isLoading } = useQuery({ ...productsQueryOptions(), enabled: open });

  useEffect(() => {
    if (!open) return;
    setTerm("");
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const results = useMemo(() => {
    const products = data ?? [];
    if (!term.trim()) return products.slice(0, 6);
    const q = term.toLowerCase();
    return products
      .filter(
        (p) =>
          p.node.title.toLowerCase().includes(q) ||
          p.node.productType?.toLowerCase().includes(q) ||
          p.node.tags?.some((t) => t.toLowerCase().includes(q)),
      )
      .slice(0, 8);
  }, [data, term]);

  return (
    <div
      className={`fixed inset-0 z-[80] transition-opacity duration-500 ${
        open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
      }`}
      aria-hidden={!open}
    >
      <div className="absolute inset-0 bg-background/95 backdrop-blur-xl" onClick={onClose} />
      <div className="relative mx-auto flex h-full max-w-4xl flex-col px-5 pt-6 md:px-8">
        <div className="flex items-center justify-between">
          <p className="label">Search</p>
          <button type="button" onClick={onClose} aria-label="Close search">
            <X className="h-4 w-4" />
          </button>
        </div>

        <label htmlFor="site-search" className="sr-only">
          Search products
        </label>
        <input
          id="site-search"
          autoFocus={open}
          value={term}
          onChange={(e) => setTerm(e.target.value)}
          placeholder="What are you looking for?"
          className="font-display mt-10 w-full border-b border-border bg-transparent pb-6 text-3xl uppercase outline-none placeholder:text-muted-foreground/40 focus:border-foreground md:text-5xl"
        />

        <div className="mt-8 flex-1 overflow-y-auto pb-16">
          {isLoading && <p className="label">Loading…</p>}
          {!isLoading && results.length === 0 && (
            <p className="label">No products found for "{term}"</p>
          )}
          <ul className="divide-y divide-border/60">
            {results.map((p) => {
              const image = p.node.images.edges[0]?.node;
              return (
                <li key={p.node.id}>
                  <Link
                    to="/product/$handle"
                    params={{ handle: p.node.handle }}
                    onClick={onClose}
                    className="group flex items-center gap-5 py-4"
                  >
                    <div className="w-16 shrink-0 bg-card">
                      {image && (
                        <img
                          src={image.url}
                          alt={image.altText ?? p.node.title}
                          loading="lazy"
                          className="aspect-[4/5] w-full object-cover"
                        />
                      )}
                    </div>
                    <span className="flex-1 text-sm uppercase transition-opacity group-hover:opacity-60">
                      {p.node.title}
                    </span>
                    <span className="flex items-baseline gap-2 text-[0.7rem] text-muted-foreground">
                      {isTShirtProduct(p.node) && (
                        <span className="opacity-55 line-through">
                          {formatMoney(1999, p.node.priceRange.minVariantPrice.currencyCode)}
                        </span>
                      )}
                      <span>
                        {formatMoney(
                          p.node.priceRange.minVariantPrice.amount,
                          p.node.priceRange.minVariantPrice.currencyCode,
                        )}
                      </span>
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
}
