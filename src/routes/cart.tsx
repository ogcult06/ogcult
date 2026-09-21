import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2, Minus, Plus, X } from "lucide-react";
import { useCartStore } from "@/stores/cartStore";
import { formatMoney } from "@/lib/shopify";

export const Route = createFileRoute("/cart")({
  head: () => ({
    meta: [
      { title: "Your Bag — OG CULT" },
      {
        name: "description",
        content: "Review your OG CULT bag, adjust sizes and quantities, and continue to secure Shopify checkout.",
      },
      { property: "og:title", content: "Your Bag — OG CULT" },
      { property: "og:description", content: "Review your OG CULT bag before checkout." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
    links: [{ rel: "canonical", href: "/cart" }],
  }),
  component: CartPage,
});

function CartPage() {
  const items = useCartStore((s) => s.items);
  const cost = useCartStore((s) => s.cost);
  const isSyncing = useCartStore((s) => s.isSyncing);
  const pendingVariantIds = useCartStore((s) => s.pendingVariantIds);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const syncCart = useCartStore((s) => s.syncCart);
  const navigate = useNavigate();

  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    setHydrated(true);
    syncCart();
  }, [syncCart]);

  const currency = cost?.subtotalAmount?.currencyCode ?? items[0]?.price.currencyCode ?? "INR";
  const localSubtotal = items.reduce(
    (sum, i) => sum + parseFloat(i.price.amount) * i.quantity,
    0,
  );
  const subtotal = cost?.subtotalAmount ? parseFloat(cost.subtotalAmount.amount) : localSubtotal;
  const total = cost?.totalAmount ? parseFloat(cost.totalAmount.amount) : subtotal;
  const totalUnits = items.reduce((sum, i) => sum + i.quantity, 0);

  const checkout = () => {
    navigate({ to: "/checkout" });
  };

  if (!hydrated) {
    return (
      <div className="px-5 pt-28 pb-24 md:px-10 md:pt-36">
        <h1 className="display-lg">Bag</h1>
        <div className="mt-16 border-t border-border/60 pt-16">
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  return (
    <div className="px-5 pt-28 pb-32 md:px-10 md:pt-36 md:pb-24">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <h1 className="display-lg">Bag</h1>
        {items.length > 0 && (
          <span className="label">
            {totalUnits} {totalUnits === 1 ? "item" : "items"}
            {isSyncing ? " · syncing" : ""}
          </span>
        )}
      </header>

      {items.length === 0 ? (
        <div className="mt-16 border-t border-border/60 pt-16">
          <p className="text-sm text-muted-foreground">Your bag is empty.</p>
          <Link to="/shop" className="btn-cult mt-8">
            Shop the drop
          </Link>
        </div>
      ) : (
        <div className="mt-10 grid gap-14 md:mt-12 lg:grid-cols-[1.6fr_1fr]">
          <ul className="border-t border-border/60">
            {items.map((item) => {
              const image = item.product.node.images?.edges?.[0]?.node;
              const pending = pendingVariantIds.includes(item.variantId);
              return (
                <li
                  key={item.variantId}
                  className={`flex gap-4 border-b border-border/60 py-6 transition-opacity sm:gap-5 ${
                    pending ? "opacity-60" : ""
                  }`}
                >
                  <Link
                    to="/product/$handle"
                    params={{ handle: item.product.node.handle }}
                    className="w-20 shrink-0 bg-card sm:w-24 md:w-32"
                  >
                    {image && (
                      <img
                        src={image.url}
                        alt={image.altText ?? item.product.node.title}
                        loading="lazy"
                        className="aspect-[4/5] w-full object-cover"
                      />
                    )}
                  </Link>

                  <div className="flex min-w-0 flex-1 flex-col justify-between gap-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h2 className="truncate text-xs uppercase md:text-sm">
                          <Link
                            to="/product/$handle"
                            params={{ handle: item.product.node.handle }}
                          >
                            {item.product.node.title}
                          </Link>
                        </h2>
                        <p className="label mt-2">
                          {item.selectedOptions.map((o) => o.value).join(" · ") ||
                            item.variantTitle}
                        </p>
                        <p className="mt-1 text-[0.65rem] text-muted-foreground">
                          {formatMoney(parseFloat(item.price.amount), item.price.currencyCode)} each
                        </p>
                      </div>
                      <button
                        type="button"
                        aria-label={`Remove ${item.product.node.title}`}
                        onClick={() => removeItem(item.variantId)}
                        disabled={pending}
                        className="-mr-2 -mt-2 flex h-10 w-10 items-center justify-center text-muted-foreground transition-colors hover:text-foreground disabled:opacity-50"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center border border-border">
                        <button
                          type="button"
                          aria-label="Decrease quantity"
                          onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                          disabled={pending}
                          className="flex h-11 w-11 items-center justify-center disabled:opacity-40"
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <span
                          aria-live="polite"
                          className="flex h-11 w-10 items-center justify-center text-xs tabular-nums"
                        >
                          {pending ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            item.quantity
                          )}
                        </span>
                        <button
                          type="button"
                          aria-label="Increase quantity"
                          onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                          disabled={pending}
                          className="flex h-11 w-11 items-center justify-center disabled:opacity-40"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <span className="text-xs tabular-nums">
                        {formatMoney(
                          parseFloat(item.price.amount) * item.quantity,
                          item.price.currencyCode,
                        )}
                      </span>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>

          <aside className="h-fit border-t border-border/60 pt-6 lg:sticky lg:top-28">
            <h2 className="label !text-foreground">Summary</h2>
            <div className="mt-6 space-y-3">
              <div className="flex items-baseline justify-between">
                <span className="label">Subtotal</span>
                <span className="text-sm tabular-nums">{formatMoney(subtotal, currency)}</span>
              </div>
              {cost?.totalTaxAmount && parseFloat(cost.totalTaxAmount.amount) > 0 && (
                <div className="flex items-baseline justify-between">
                  <span className="label">Tax</span>
                  <span className="text-sm tabular-nums">
                    {formatMoney(parseFloat(cost.totalTaxAmount.amount), currency)}
                  </span>
                </div>
              )}
              <div className="flex items-baseline justify-between border-t border-border/60 pt-3">
                <span className="label !text-foreground">Total</span>
                <span className="text-sm tabular-nums">{formatMoney(total, currency)}</span>
              </div>
            </div>
            <p className="mt-3 text-[0.65rem] text-muted-foreground">
              Shipping and taxes finalised at checkout.
            </p>

            <div className="mt-8 hidden lg:block">
              <button
                type="button"
                onClick={checkout}
                disabled={isSyncing || pendingVariantIds.length > 0}
                className="btn-cult w-full"
              >
                {isSyncing ? <Loader2 className="h-4 w-4 animate-spin" /> : "Checkout"}
              </button>
              <Link to="/shop" className="btn-ghost-cult mt-3 w-full">
                Continue shopping
              </Link>
            </div>
            <Link to="/shop" className="btn-ghost-cult mt-8 w-full lg:hidden">
              Continue shopping
            </Link>
          </aside>

          {/* Mobile sticky checkout bar */}
          <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border/60 bg-background/95 px-5 py-4 backdrop-blur lg:hidden">
            <div className="mb-3 flex items-baseline justify-between">
              <span className="label">Total</span>
              <span className="text-sm tabular-nums">{formatMoney(total, currency)}</span>
            </div>
            <button
              type="button"
              onClick={checkout}
              disabled={isSyncing || pendingVariantIds.length > 0}
              className="btn-cult w-full"
            >
              {isSyncing ? <Loader2 className="h-4 w-4 animate-spin" /> : "Checkout"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
