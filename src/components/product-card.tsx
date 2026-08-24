import { Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useCartStore } from "@/stores/cartStore";
import { formatMoney, sortSizes, variantStockLabel, type ShopifyProduct } from "@/lib/shopify";

export function ProductCard({ product }: { product: ShopifyProduct }) {
  const p = product.node;
  const images = p.images.edges;
  const primary = images[0]?.node;
  const secondary = images[1]?.node;
  const variants = p.variants.edges.map((e) => e.node);
  const addItem = useCartStore((s) => s.addItem);
  const openDrawer = useCartStore((s) => s.openDrawer);
  const isLoading = useCartStore((s) => s.isLoading);
  const [quickAdd, setQuickAdd] = useState(false);
  const [busy, setBusy] = useState(false);

  const sizeOption = p.options.find((o) => /size/i.test(o.name));
  const quickSizes = useMemo(
    () => (sizeOption ? sortSizes(sizeOption.values) : []),
    [sizeOption],
  );

  const soldOut = !p.availableForSale;
  const lowStock = variants.some(
    (v) => v.availableForSale && v.quantityAvailable !== null && v.quantityAvailable <= 4,
  );

  const variantForSize = (size: string) =>
    variants.find((v) => v.selectedOptions.some((o) => /size/i.test(o.name) && o.value === size));

  const addVariant = async (variantId: string) => {
    const variant = variants.find((v) => v.id === variantId);
    if (!variant) return;
    setBusy(true);
    await addItem({
      product,
      variantId: variant.id,
      variantTitle: variant.title,
      price: variant.price,
      quantity: 1,
      selectedOptions: variant.selectedOptions || [],
    });
    setBusy(false);
    setQuickAdd(false);
    toast.success(`${p.title} added`, { description: variant.title });
    openDrawer();
  };

  return (
    <article className="group relative">
      <Link
        to="/product/$handle"
        params={{ handle: p.handle }}
        className="block overflow-hidden"
        aria-label={p.title}
      >
        <div className="relative aspect-[4/5] w-full overflow-hidden">
          {primary ? (
            <>
              <img
                src={primary.url}
                alt={primary.altText ?? p.title}
                loading="lazy"
                decoding="async"
                className={`absolute inset-0 h-full w-full object-cover transition-all duration-[1200ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04] ${
                  secondary ? "group-hover:opacity-0" : ""
                }`}
              />
              {secondary && (
                <img
                  src={secondary.url}
                  alt={secondary.altText ?? `${p.title} alternate view`}
                  loading="lazy"
                  decoding="async"
                  className="absolute inset-0 h-full w-full object-cover opacity-0 transition-all duration-[1200ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04] group-hover:opacity-100"
                />
              )}
            </>
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-muted">
              <span className="label">No image</span>
            </div>
          )}

          {soldOut && (
            <span className="label !text-foreground absolute top-4 left-4">Sold out</span>
          )}
          {!soldOut && lowStock && (
            <span className="label !text-foreground absolute top-4 left-4 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
              Low stock
            </span>
          )}
        </div>
      </Link>

      <div className="mt-5 flex items-baseline justify-between gap-4">
        <h3 className="truncate text-[0.72rem] tracking-[0.18em] uppercase">
          <Link to="/product/$handle" params={{ handle: p.handle }}>
            {p.title}
          </Link>
        </h3>
        <p className="shrink-0 text-[0.72rem] tracking-[0.14em] text-muted-foreground">
          {formatMoney(
            p.priceRange.minVariantPrice.amount,
            p.priceRange.minVariantPrice.currencyCode,
          )}
        </p>
      </div>

      {/* Secondary interaction stays hidden until hover / focus */}
      {!soldOut && (
        <div className="mt-2 opacity-0 transition-opacity duration-500 group-focus-within:opacity-100 group-hover:opacity-100 max-md:opacity-100">
          <button
            type="button"
            onClick={() => {
              if (quickSizes.length > 1) {
                setQuickAdd((v) => !v);
              } else {
                const only = variants.find((v) => v.availableForSale);
                if (only) void addVariant(only.id);
              }
            }}
            disabled={isLoading || busy}
            className="nav-link"
          >
            {busy ? <Loader2 className="h-3 w-3 animate-spin" /> : quickAdd ? "Close" : "Quick add"}
          </button>
        </div>
      )}

      {quickAdd && (
        <div className="mt-4 flex flex-wrap gap-1.5">
          {quickSizes.map((s) => {
            const variant = variantForSize(s);
            const available = variant?.availableForSale ?? false;
            return (
              <button
                key={s}
                type="button"
                disabled={!available || busy}
                onClick={() => variant && addVariant(variant.id)}
                className="border border-border px-3 py-2 text-[0.65rem] tracking-[0.2em] uppercase transition-colors hover:border-foreground disabled:opacity-25"
              >
                {s}
              </button>
            );
          })}
          {variantStockLabel(variants.find((v) => v.availableForSale)) === "LOW STOCK" && (
            <span className="label self-center">Low stock</span>
          )}
        </div>
      )}
    </article>
  );
}

export function ProductGrid({
  products,
  isLoading,
  columns = "four",
  emptyState = "message",
}: {
  products: ShopifyProduct[];
  isLoading?: boolean;
  columns?: "four" | "three";
  /** "placeholder" keeps the layout intact and shows quiet editorial slots instead of a message. */
  emptyState?: "message" | "placeholder";
}) {
  const cols =
    columns === "four"
      ? "grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
      : "grid-cols-2 md:grid-cols-3";
  const grid = `grid gap-x-5 gap-y-14 md:gap-x-8 md:gap-y-20 ${cols}`;

  if (isLoading) {
    return (
      <div className={grid}>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="aspect-[4/5] w-full animate-pulse bg-muted/60" />
        ))}
      </div>
    );
  }

  if (products.length === 0 && emptyState === "placeholder") {
    // Graceful, campaign-appropriate empty state. Disappears automatically
    // as soon as Shopify returns products.
    return (
      <div className={grid}>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i}>
            <div className="relative aspect-[4/5] w-full overflow-hidden bg-muted/40">
              <span className="label absolute bottom-4 left-4">
                {String(i + 1).padStart(2, "0")}
              </span>
            </div>
            <div className="mt-5 flex items-baseline justify-between gap-4">
              <span className="text-[0.72rem] tracking-[0.18em] text-muted-foreground uppercase">
                Coming soon
              </span>
              <span className="h-px w-8 self-center bg-border" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="border-t border-border/60 py-20 text-center">
        <p className="font-display text-3xl uppercase">Nothing here yet</p>
        <p className="mt-4 text-xs tracking-[0.18em] text-muted-foreground uppercase">
          New pieces land as soon as the next drop opens.
        </p>
      </div>
    );
  }

  return (
    <div className={grid}>
      {products.map((product) => (
        <ProductCard key={product.node.id} product={product} />
      ))}
    </div>
  );
}
