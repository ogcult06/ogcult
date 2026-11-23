import { Link } from "@tanstack/react-router";
import { useMemo, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useCartStore } from "@/stores/cartStore";
import {
  discountInfo,
  formatMoney,
  isTShirtProduct,
  sortSizes,
  variantStockLabel,
  type ShopifyProduct,
} from "@/lib/shopify";
import { useDragScroll } from "@/hooks/use-drag-scroll";

export function ProductCard({ product }: { product: ShopifyProduct }) {
  const p = product.node;
  const images = p.images.edges;
  const primary = images[0]?.node;
  const variants = p.variants.edges.map((e) => e.node);
  const addItem = useCartStore((s) => s.addItem);
  const openDrawer = useCartStore((s) => s.openDrawer);
  const isLoading = useCartStore((s) => s.isLoading);
  const [busySize, setBusySize] = useState<string | null>(null);

  const cardGalleryRef = useRef<HTMLDivElement>(null);
  const { dragHandlers, didDrag } = useDragScroll(cardGalleryRef);
  const [activeCardImg, setActiveCardImg] = useState(0);

  const scrollToCardImage = (i: number) => {
    const el = cardGalleryRef.current;
    if (!el) return;
    el.scrollTo({ left: i * el.clientWidth, behavior: "smooth" });
  };

  const handleCardScroll = () => {
    const el = cardGalleryRef.current;
    if (!el || el.clientWidth === 0) return;
    const i = Math.round(el.scrollLeft / el.clientWidth);
    setActiveCardImg(Math.min(Math.max(i, 0), images.length - 1));
  };

  const sizeOption = p.options.find((o) => /size/i.test(o.name));
  const quickSizes = useMemo(
    () => (sizeOption ? sortSizes(sizeOption.values) : []),
    [sizeOption],
  );

  const soldOut = !p.availableForSale;
  const discount = discountInfo(p);
  const currency = p.priceRange.minVariantPrice.currencyCode;

  const variantForSize = (size: string) =>
    variants.find((v) => v.selectedOptions.some((o) => /size/i.test(o.name) && o.value === size));

  const addVariant = async (variantId: string, size: string) => {
    const variant = variants.find((v) => v.id === variantId);
    if (!variant) return;
    setBusySize(size);
    await addItem({
      product,
      variantId: variant.id,
      variantTitle: variant.title,
      price: variant.price,
      quantity: 1,
      selectedOptions: variant.selectedOptions || [],
    });
    setBusySize(null);
    toast.success(`${p.title} added`, { description: variant.title });
    openDrawer();
  };

  return (
    <article className="group flex flex-col">
      <div className="relative">
        <Link
          to="/product/$handle"
          params={{ handle: p.handle }}
          className="block overflow-hidden bg-secondary"
          aria-label={p.title}
          onClick={(e) => {
            if (didDrag()) e.preventDefault();
          }}
        >
          <div
            ref={cardGalleryRef}
            onScroll={handleCardScroll}
            {...dragHandlers}
            className="flex aspect-[3/4] w-full cursor-grab snap-x snap-mandatory overflow-x-auto overscroll-x-contain touch-pan-x active:cursor-grabbing no-scrollbar"
          >
            {primary ? (
              images.map((img, i) => (
                <div
                  key={img.node.url}
                  className="relative h-full w-full shrink-0 snap-center overflow-hidden"
                >
                  <img
                    src={img.node.url}
                    alt={img.node.altText ?? (i === 0 ? p.title : `${p.title} — view ${i + 1}`)}
                    loading={i === 0 ? "eager" : "lazy"}
                    decoding="async"
                    draggable={false}
                    className="h-full w-full object-cover transition-transform duration-[1200ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.03]"
                  />
                </div>
              ))
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-muted">
                <span className="label">No image</span>
              </div>
            )}
          </div>

          {soldOut && (
            <span className="label !text-foreground absolute top-3 left-3 bg-background/90 px-2 py-1 leading-[1.4] whitespace-nowrap">
              Sold out
            </span>
          )}
          {discount && !soldOut && (
            <span className="discount-badge absolute top-3 left-3">-{discount.pct}%</span>
          )}
        </Link>

        {images.length > 1 && (
          <div className="mt-2.5 flex items-center justify-center gap-1.5">
            {images.map((img, i) => (
              <button
                key={img.node.url}
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  scrollToCardImage(i);
                }}
                aria-label={`View image ${i + 1}`}
                aria-current={i === activeCardImg}
                className={`h-[3px] transition-all duration-300 ${
                  i === activeCardImg ? "w-5 bg-foreground" : "w-2 bg-foreground/25"
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Title — centered */}
      <h3 className="mt-3 text-center text-[0.78rem] leading-tight tracking-[0.12em] uppercase">
        <Link to="/product/$handle" params={{ handle: p.handle }} className="hover:opacity-60">
          {p.title}
        </Link>
      </h3>

      {/* Inline quick-view size pills — centered */}
      {quickSizes.length > 1 && (
        <div className="mt-3 flex flex-wrap items-center justify-center gap-1.5">
          {quickSizes.map((s) => {
            const variant = variantForSize(s);
            const available = variant?.availableForSale ?? false;
            const isBusy = busySize === s;
            return (
              <button
                key={s}
                type="button"
                disabled={!available || isBusy}
                onClick={() => variant && addVariant(variant.id, s)}
                className="size-pill"
              >
                {isBusy ? <Loader2 className="h-3 w-3 animate-spin" /> : s}
              </button>
            );
          })}
        </div>
      )}

      {/* Pricing — centered */}
      <div className="mt-3 flex items-baseline justify-center gap-2">
        <span className="text-[0.8rem] font-semibold tracking-[0.06em] text-foreground">
          {formatMoney(p.priceRange.minVariantPrice.amount, currency)}
        </span>
        {discount ? (
          <span className="text-[0.75rem] tracking-[0.06em] text-muted-foreground line-through">
            {formatMoney(discount.compare, currency)}
          </span>
        ) : (
          isTShirtProduct(p) && (
            <span className="text-[0.75rem] tracking-[0.06em] text-muted-foreground line-through">
              {formatMoney(1999, currency)}
            </span>
          )
        )}
      </div>

      {variantStockLabel(variants.find((v) => v.availableForSale)) === "LOW STOCK" && (
        <p className="mt-2 text-center text-[0.6rem] tracking-[0.18em] uppercase text-muted-foreground">
          Low stock
        </p>
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
  const grid = `grid gap-x-1 gap-y-10 md:gap-x-1.5 md:gap-y-14 ${cols}`;

  if (isLoading) {
    return (
      <div className={grid}>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i}>
            <div className="aspect-[3/4] w-full animate-pulse bg-muted/60" />
            <div className="mx-auto mt-3 h-3 w-24 animate-pulse bg-muted/60" />
            <div className="mx-auto mt-2 h-3 w-16 animate-pulse bg-muted/40" />
          </div>
        ))}
      </div>
    );
  }

  if (products.length === 0 && emptyState === "placeholder") {
    return (
      <div className={grid}>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i}>
            <div className="relative aspect-[3/4] w-full overflow-hidden bg-muted/40">
              <span className="label absolute bottom-4 left-4">
                {String(i + 1).padStart(2, "0")}
              </span>
            </div>
            <div className="mt-3 flex items-baseline justify-center gap-4">
              <span className="text-[0.78rem] tracking-[0.12em] text-muted-foreground uppercase">
                Coming soon
              </span>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="border-t border-border py-20 text-center">
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
