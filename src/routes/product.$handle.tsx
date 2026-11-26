import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useRef, useState } from "react";
import { Loader2, Minus, Plus } from "lucide-react";
import { toast } from "sonner";
import { useCartStore } from "@/stores/cartStore";
import { discountInfo, formatMoney, isTShirtProduct, productQueryOptions, sortSizes } from "@/lib/shopify";
import { useDragScroll } from "@/hooks/use-drag-scroll";

const SITE_URL = "https://ogcult.store";

export const Route = createFileRoute("/product/$handle")({
  loader: ({ params, context }) =>
    context.queryClient.ensureQueryData(productQueryOptions(params.handle)),
  head: ({ params, loaderData }) => {
    const node = loaderData?.node;
    const name =
      node?.title ??
      params.handle
        .split("-")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ");
    const url = `${SITE_URL}/product/${params.handle}`;
    const description =
      node?.description?.slice(0, 155) ||
      `${name} by OG CULT. Limited-run underground streetwear. Sizes, stock and secure checkout handled by our store.`;
    const image = node?.images.edges[0]?.node.url;

    const meta: Array<Record<string, string>> = [
      { title: `${name} — OG CULT` },
      { name: "description", content: description },
      { property: "og:title", content: `${name} — OG CULT` },
      { property: "og:description", content: description },
      { property: "og:type", content: "product" },
      { property: "og:url", content: url },
      { name: "twitter:card", content: "summary_large_image" },
    ];
    if (image?.startsWith("https://")) {
      meta.push({ property: "og:image", content: image });
      meta.push({ name: "twitter:image", content: image });
    }

    const scripts = node
      ? [
          {
            type: "application/ld+json",
            children: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Product",
              name: node.title,
              description: node.description || description,
              image: node.images.edges.map((e) => e.node.url),
              url,
              brand: { "@type": "Brand", name: "OG CULT" },
              offers: node.variants.edges.map((e) => ({
                "@type": "Offer",
                name: e.node.title,
                url,
                price: e.node.price.amount,
                priceCurrency: e.node.price.currencyCode,
                availability: e.node.availableForSale
                  ? "https://schema.org/InStock"
                  : "https://schema.org/OutOfStock",
              })),
            }),
          },
        ]
      : undefined;

    return {
      meta,
      links: [{ rel: "canonical", href: url }],
      ...(scripts ? { scripts } : {}),
    };
  },
  component: ProductPage,
});

/** Build a readable fabric line from Shopify product tags. */
function fabricFromTags(tags: string[] | undefined): string {
  if (!tags || tags.length === 0) {
    return "See product description for fabric details.";
  }
  const find = (re: RegExp) => tags.find((t) => re.test(t));
  const parts: string[] = [];
  const gsm = find(/^(\d+)-GSM$/i);
  if (gsm) parts.push(gsm.replace(/-/g, " "));
  const fabric = find(/FRENCH[- ]?TERRY|COTTON|POLYESTER|FLEECE|JERSEY|JERSEY-KNIT/i);
  if (fabric) parts.push(fabric.replace(/-/g, " ").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase()));
  const print = find(/DTF|SCREEN[- ]?PRINT|EMBROIDERY/i);
  if (print) parts.push(print.replace(/-/g, " "));
  const fit = find(/OVERSIZED|SLIM|REGULAR|BOXY/i);
  if (fit) parts.push(fit.replace(/-/g, " ").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase()) + " fit");
  return parts.length
    ? parts.join(" · ")
    : "See product description for fabric details.";
}

function ProductPage() {
  const { handle } = Route.useParams();
  const { data, isLoading } = useQuery(productQueryOptions(handle));
  const addItem = useCartStore((s) => s.addItem);
  const openDrawer = useCartStore((s) => s.openDrawer);
  const cartLoading = useCartStore((s) => s.isLoading);

  const galleryRef = useRef<HTMLDivElement>(null);
  const { dragHandlers, didDrag } = useDragScroll(galleryRef);
  const [activeImage, setActiveImage] = useState(0);
  const [zoom, setZoom] = useState(false);
  // Zoom is a desktop-only affordance — on touch a tap made the image look cropped.
  const [canZoom, setCanZoom] = useState(false);
  useEffect(() => {
    setCanZoom(window.matchMedia("(hover: hover) and (pointer: fine)").matches);
  }, []);
  const [size, setSize] = useState<string | null>(null);
  const [color, setColor] = useState<string | null>(null);
  const [qty, setQty] = useState(1);

  const p = data?.node;
  const variants = useMemo(() => p?.variants.edges.map((e) => e.node) ?? [], [p]);
  const images = p?.images.edges ?? [];

  const scrollToImage = (i: number) => {
    const el = galleryRef.current;
    if (!el) return;
    el.scrollTo({ left: i * el.clientWidth, behavior: "smooth" });
    setActiveImage(i);
    setZoom(false);
  };

  const handleGalleryScroll = () => {
    const el = galleryRef.current;
    if (!el || el.clientWidth === 0) return;
    const i = Math.round(el.scrollLeft / el.clientWidth);
    setActiveImage((prev) => {
      if (i !== prev) setZoom(false);
      return Math.min(Math.max(i, 0), images.length - 1);
    });
  };

  const sizeOption = p?.options.find((o) => /size/i.test(o.name));
  const colorOption = p?.options.find((o) => /colou?r/i.test(o.name));
  const sizes = sizeOption ? sortSizes(sizeOption.values) : [];
  const colors = colorOption?.values ?? [];

  const activeColor = color ?? colors[0] ?? null;

  const matchVariant = (s: string | null) =>
    variants.find((v) => {
      const okSize = s ? v.selectedOptions.some((o) => /size/i.test(o.name) && o.value === s) : true;
      const okColor = activeColor
        ? v.selectedOptions.some((o) => /colou?r/i.test(o.name) && o.value === activeColor)
        : true;
      return okSize && okColor;
    });

  const selectedVariant = sizes.length > 0 ? (size ? matchVariant(size) : undefined) : variants[0];
  const requiresSize = sizes.length > 1;

  const handleAdd = async () => {
    if (!p) return;
    if (requiresSize && !size) {
      toast.error("Select a size first");
      return;
    }
    const variant = selectedVariant;
    if (!variant) return;
    await addItem({
      product: { node: p },
      variantId: variant.id,
      variantTitle: variant.title,
      price: variant.price,
      quantity: qty,
      selectedOptions: variant.selectedOptions || [],
    });
    toast.success("Added to cart", { description: `${p.title} · ${variant.title}` });
    openDrawer();
  };

  const handleBuyNow = async () => {
    if (requiresSize && !size) {
      toast.error("Select a size first");
      return;
    }
    await handleAdd();
    window.location.href = "/checkout";
  };

  if (isLoading) {
    return (
      <div className="px-5 pt-28 pb-24 md:px-10 md:pt-36">
        <div className="grid gap-8 lg:grid-cols-2">
          <div className="aspect-[4/5] w-full animate-pulse bg-card" />
          <div className="space-y-4">
            <div className="h-10 w-2/3 animate-pulse bg-card" />
            <div className="h-4 w-1/4 animate-pulse bg-card" />
          </div>
        </div>
      </div>
    );
  }

  if (!p) {
    return (
      <div className="flex min-h-[70svh] flex-col items-center justify-center gap-6 px-5 text-center">
        <h1 className="display-lg">Not found</h1>
        <p className="text-sm text-muted-foreground">This piece is no longer available.</p>
        <Link to="/shop" className="btn-cult">
          Back to shop
        </Link>
      </div>
    );
  }

  const price = selectedVariant?.price ?? p.priceRange.minVariantPrice;
  const soldOut = !p.availableForSale;
  const comparePrice = discountInfo(p)?.compare ?? (isTShirtProduct(p) ? 1999 : null);

  return (
    <div className="pt-20 pb-28 md:pt-28">
      <div className="grid lg:grid-cols-2">
        {/* GALLERY */}
        <div className="min-w-0 lg:sticky lg:top-24 lg:self-start">
          {/* swipeable main gallery */}
          <div className="group relative">
            <div
              ref={galleryRef}
              onScroll={handleGalleryScroll}
              {...dragHandlers}
              className="flex aspect-[4/5] w-full cursor-grab snap-x snap-mandatory overflow-x-auto overscroll-x-contain bg-card touch-pan-x active:cursor-grabbing [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
              {images.map((img, i) => (
                <div
                  key={img.node.url}
                  className="relative h-full w-full min-w-0 shrink-0 basis-full snap-center overflow-hidden"
                  onClick={() => {
                    if (didDrag() || !canZoom) return;
                    setZoom((v) => !v);
                  }}
                  role="button"
                  tabIndex={0}
                  aria-label="Toggle image zoom"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && canZoom) setZoom((v) => !v);
                    if (e.key === "ArrowRight") scrollToImage(Math.min(i + 1, images.length - 1));
                    if (e.key === "ArrowLeft") scrollToImage(Math.max(i - 1, 0));
                  }}
                >
                  <img
                    src={img.node.url}
                    alt={img.node.altText ?? `${p.title} — view ${i + 1}`}
                    loading={i === 0 ? "eager" : "lazy"}
                    draggable={false}
                    className={`h-full w-full object-contain transition-transform duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${
                      canZoom && zoom && i === activeImage
                        ? "scale-[1.8] cursor-zoom-out"
                        : canZoom
                          ? "cursor-zoom-in"
                          : ""
                    }`}
                  />

                </div>
              ))}
            </div>

            {images.length > 1 && (
              <>
                <button
                  type="button"
                  aria-label="Previous image"
                  onClick={() => scrollToImage(Math.max(activeImage - 1, 0))}
                  className="absolute top-1/2 left-3 hidden h-11 w-11 -translate-y-1/2 items-center justify-center border border-foreground/20 bg-background/60 text-foreground backdrop-blur transition-opacity md:flex md:opacity-0 md:group-hover:opacity-100"
                >
                  ‹
                </button>
                <button
                  type="button"
                  aria-label="Next image"
                  onClick={() => scrollToImage(Math.min(activeImage + 1, images.length - 1))}
                  className="absolute top-1/2 right-3 hidden h-11 w-11 -translate-y-1/2 items-center justify-center border border-foreground/20 bg-background/60 text-foreground backdrop-blur transition-opacity md:flex md:opacity-0 md:group-hover:opacity-100"
                >
                  ›
                </button>
              </>
            )}
          </div>

          {/* progress dots */}
          {images.length > 1 && (
            <div className="mt-3 flex items-center justify-center gap-2">
              {images.map((img, i) => (
                <button
                  key={img.node.url}
                  type="button"
                  onClick={() => scrollToImage(i)}
                  aria-label={`View image ${i + 1}`}
                  aria-current={i === activeImage}
                  className={`h-1 transition-all duration-300 ${
                    i === activeImage ? "w-6 bg-foreground" : "w-2 bg-foreground/25"
                  }`}
                />
              ))}
            </div>
          )}

          {/* thumbnail strip */}
          {images.length > 1 && (
            <div className="mt-2 flex gap-2 overflow-x-auto px-2 lg:px-0">
              {images.map((img, i) => (
                <button
                  key={img.node.url}
                  type="button"
                  onClick={() => scrollToImage(i)}
                  aria-label={`View image ${i + 1}`}
                  aria-current={i === activeImage}
                  className={`w-20 shrink-0 border transition-colors ${
                    i === activeImage ? "border-foreground" : "border-transparent"
                  }`}
                >
                  <img
                    src={img.node.url}
                    alt={img.node.altText ?? `${p.title} thumbnail ${i + 1}`}
                    loading="lazy"
                    draggable={false}
                    className="aspect-[4/5] w-full bg-card object-contain"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* INFO */}
        <div className="px-5 pt-10 md:px-10 lg:pt-4">
          <h1 className="font-display text-4xl uppercase md:text-6xl">{p.title}</h1>
          <p className="mt-4 flex items-baseline gap-3 text-sm text-muted-foreground">
            {comparePrice !== null && (
              <span className="opacity-55 line-through">{formatMoney(comparePrice, price.currencyCode)}</span>
            )}
            <span>{formatMoney(price.amount, price.currencyCode)}</span>
          </p>

          {p.description && (
            <p className="mt-8 max-w-prose text-sm leading-relaxed text-muted-foreground">
              {p.description}
            </p>
          )}

          {colors.length > 0 && (
            <div className="mt-10">
              <p className="label">Color</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {colors.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className={`border px-4 py-2.5 text-[0.65rem] tracking-[0.2em] uppercase transition-colors ${
                      c === activeColor ? "border-foreground" : "border-border hover:border-foreground/60"
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
          )}

          {sizes.length > 0 && (
            <div className="mt-10">
              <div className="flex items-center justify-between">
                <p className="label">Size</p>
                <Link to="/size-guide" className="label transition-colors hover:!text-foreground">
                  Size guide
                </Link>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {sizes.map((s) => {
                  const variant = matchVariant(s);
                  const available = variant?.availableForSale ?? false;
                  return (
                    <button
                      key={s}
                      type="button"
                      disabled={!available}
                      onClick={() => setSize(s)}
                      aria-pressed={size === s}
                      className={`relative border px-5 py-3 text-[0.65rem] tracking-[0.2em] uppercase transition-colors ${
                        size === s ? "border-foreground bg-secondary" : "border-border"
                      } ${available ? "hover:border-foreground" : "cursor-not-allowed text-muted-foreground/40 line-through"}`}
                    >
                      {s}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="mt-10">
            <p className="label">Quantity</p>
            <div className="mt-4 flex w-fit items-center border border-border">
              <button
                type="button"
                aria-label="Decrease quantity"
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                className="px-4 py-3"
              >
                <Minus className="h-3 w-3" />
              </button>
              <span className="px-4 text-xs">{qty}</span>
              <button
                type="button"
                aria-label="Increase quantity"
                onClick={() => setQty((q) => q + 1)}
                className="px-4 py-3"
              >
                <Plus className="h-3 w-3" />
              </button>
            </div>
          </div>

          <div className="mt-10 hidden flex-col gap-3 md:flex">
            <button
              type="button"
              onClick={handleAdd}
              disabled={soldOut || cartLoading}
              className="btn-cult w-full"
            >
              {cartLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : soldOut ? (
                "Sold out"
              ) : (
                "Add to cart"
              )}
            </button>
            <button
              type="button"
              onClick={handleBuyNow}
              disabled={soldOut || cartLoading}
              className="btn-ghost-cult w-full"
            >
              Buy now
            </button>
          </div>

          <dl className="mt-14 border-t border-border/60">
            {[
              {
                t: "Product details",
                d: p.description || "[Add product details in your store's product description.]",
              },
              { t: "Fabric", d: fabricFromTags(p.tags) },
              { t: "Shipping", d: "Rates and delivery windows are shown at checkout." },
              { t: "Returns", d: "See shipping & returns for the current policy." },
            ].map((row) => (
              <div key={row.t} className="border-b border-border/60 py-5">
                <dt className="label !text-foreground">{row.t}</dt>
                <dd className="mt-3 text-xs leading-relaxed text-muted-foreground">{row.d}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      {/* MOBILE STICKY PURCHASE */}
      <div className="fixed inset-x-0 bottom-2 z-40 flex gap-2 border-t border-border bg-background/90 px-4 py-3 backdrop-blur-xl md:hidden">
        <div className="flex flex-col justify-center pr-2">
          <span className="label">{size ?? (requiresSize ? "Pick size" : "One size")}</span>
          <span className="flex items-baseline gap-2 text-xs">
            {comparePrice !== null && (
              <span className="text-muted-foreground line-through">
                {formatMoney(comparePrice, price.currencyCode)}
              </span>
            )}
            <span>{formatMoney(price.amount, price.currencyCode)}</span>
          </span>
        </div>
        <button
          type="button"
          onClick={handleAdd}
          disabled={soldOut || cartLoading}
          className="btn-cult flex-1 !px-4"
        >
          {cartLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : soldOut ? (
            "Sold out"
          ) : (
            "Add to cart"
          )}
        </button>
      </div>
    </div>
  );
}
