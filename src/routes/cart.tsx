import { createFileRoute, Link } from "@tanstack/react-router";
import { Loader2, Minus, Plus } from "lucide-react";
import { useCartStore } from "@/stores/cartStore";
import { formatMoney } from "@/lib/shopify";

export const Route = createFileRoute("/cart")({
  head: () => ({
    meta: [
      { title: "Your Bag — OG CULT" },
      {
        name: "description",
        content: "Review your OG CULT bag and continue to secure checkout.",
      },
      { property: "og:title", content: "Your Bag — OG CULT" },
      { property: "og:description", content: "Review your OG CULT bag before checkout." },
      { property: "og:url", content: "/cart" },
      { name: "robots", content: "noindex" },
    ],
    links: [{ rel: "canonical", href: "/cart" }],
  }),
  component: CartPage,
});

function CartPage() {
  const { items, isLoading, isSyncing, updateQuantity, removeItem, getCheckoutUrl } =
    useCartStore();
  const currency = items[0]?.price.currencyCode ?? "USD";
  const subtotal = items.reduce((sum, i) => sum + parseFloat(i.price.amount) * i.quantity, 0);

  const checkout = () => {
    const url = getCheckoutUrl();
    if (url) window.open(url, "_blank");
  };

  return (
    <div className="px-5 pt-28 pb-24 md:px-10 md:pt-36">
      <h1 className="display-lg">Bag</h1>

      {items.length === 0 ? (
        <div className="mt-16 border-t border-border/60 pt-16">
          <p className="text-sm text-muted-foreground">Your bag is empty.</p>
          <Link to="/shop" className="btn-cult mt-8">
            Shop the drop
          </Link>
        </div>
      ) : (
        <div className="mt-12 grid gap-14 lg:grid-cols-[1.6fr_1fr]">
          <ul className="border-t border-border/60">
            {items.map((item) => {
              const image = item.product.node.images?.edges?.[0]?.node;
              return (
                <li key={item.variantId} className="flex gap-5 border-b border-border/60 py-6">
                  <Link
                    to="/product/$handle"
                    params={{ handle: item.product.node.handle }}
                    className="w-24 shrink-0 bg-card md:w-32"
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
                  <div className="flex flex-1 flex-col justify-between">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h2 className="text-xs uppercase md:text-sm">
                          <Link to="/product/$handle" params={{ handle: item.product.node.handle }}>
                            {item.product.node.title}
                          </Link>
                        </h2>
                        <p className="label mt-2">
                          {item.selectedOptions.map((o) => o.value).join(" · ") ||
                            item.variantTitle}
                        </p>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {formatMoney(
                          parseFloat(item.price.amount) * item.quantity,
                          item.price.currencyCode,
                        )}
                      </span>
                    </div>
                    <div className="mt-4 flex items-center justify-between">
                      <div className="flex items-center border border-border">
                        <button
                          type="button"
                          aria-label="Decrease quantity"
                          onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                          className="px-3 py-2"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="px-3 text-[0.7rem]">{item.quantity}</span>
                        <button
                          type="button"
                          aria-label="Increase quantity"
                          onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                          className="px-3 py-2"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeItem(item.variantId)}
                        className="label transition-colors hover:!text-foreground"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>

          <aside className="h-fit border-t border-border/60 pt-6 lg:sticky lg:top-28">
            <h2 className="label !text-foreground">Summary</h2>
            <div className="mt-6 flex items-baseline justify-between">
              <span className="label">Subtotal</span>
              <span className="text-sm">{formatMoney(subtotal, currency)}</span>
            </div>
            <p className="mt-3 text-[0.65rem] text-muted-foreground">
              Shipping and taxes calculated at checkout.
            </p>
            <button
              type="button"
              onClick={checkout}
              disabled={isLoading || isSyncing}
              className="btn-cult mt-8 w-full"
            >
              {isLoading || isSyncing ? <Loader2 className="h-4 w-4 animate-spin" /> : "Checkout"}
            </button>
            <Link to="/shop" className="btn-ghost-cult mt-3 w-full">
              Continue shopping
            </Link>
          </aside>
        </div>
      )}
    </div>
  );
}
