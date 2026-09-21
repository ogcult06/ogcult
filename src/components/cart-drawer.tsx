import { useEffect } from "react";
import { Link } from "@tanstack/react-router";
import { Loader2, Minus, Plus, X } from "lucide-react";
import { useCartStore } from "@/stores/cartStore";
import { formatMoney } from "@/lib/shopify";

export function CartDrawer() {
  const { items, isDrawerOpen, closeDrawer, isLoading, isSyncing, updateQuantity, removeItem, syncCart } =
    useCartStore();

  useEffect(() => {
    if (isDrawerOpen) syncCart();
  }, [isDrawerOpen, syncCart]);

  useEffect(() => {
    if (!isDrawerOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeDrawer();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isDrawerOpen, closeDrawer]);

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
  const currency = items[0]?.price.currencyCode ?? "INR";
  const subtotal = items.reduce((sum, i) => sum + parseFloat(i.price.amount) * i.quantity, 0);

  return (
    <div
      className={`fixed inset-0 z-[70] ${isDrawerOpen ? "pointer-events-auto" : "pointer-events-none"}`}
      aria-hidden={!isDrawerOpen}
    >
      <div
        onClick={closeDrawer}
        className={`absolute inset-0 bg-background/80 backdrop-blur-sm transition-opacity duration-500 ${
          isDrawerOpen ? "opacity-100" : "opacity-0"
        }`}
      />
      <aside
        role="dialog"
        aria-label="Cart"
        className={`absolute inset-y-0 right-0 flex w-full max-w-md flex-col border-l border-border bg-background transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          isDrawerOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <header className="flex items-center justify-between border-b border-border px-5 py-5">
          <p className="label !text-foreground">Bag [{totalItems}]</p>
          <button type="button" onClick={closeDrawer} aria-label="Close cart">
            <X className="h-4 w-4" />
          </button>
        </header>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-6 px-6 text-center">
            <p className="font-display text-4xl uppercase">Empty</p>
            <Link to="/shop" onClick={closeDrawer} className="btn-cult">
              Shop the drop
            </Link>
          </div>
        ) : (
          <>
            <ul className="flex-1 overflow-y-auto px-5">
              {items.map((item) => {
                const image = item.product.node.images?.edges?.[0]?.node;
                return (
                  <li key={item.variantId} className="flex gap-4 border-b border-border/60 py-5">
                    <div className="w-20 shrink-0 bg-card">
                      {image && (
                        <img
                          src={image.url}
                          alt={image.altText ?? item.product.node.title}
                          loading="lazy"
                          className="aspect-[4/5] h-full w-full object-cover"
                        />
                      )}
                    </div>
                    <div className="flex flex-1 flex-col justify-between">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate text-[0.75rem] uppercase">
                            {item.product.node.title}
                          </p>
                          <p className="label mt-1.5">
                            {item.selectedOptions.map((o) => o.value).join(" · ") ||
                              item.variantTitle}
                          </p>
                        </div>
                        <span className="shrink-0 text-[0.7rem] text-muted-foreground">
                          {formatMoney(
                            parseFloat(item.price.amount) * item.quantity,
                            item.price.currencyCode,
                          )}
                        </span>
                      </div>
                      <div className="mt-3 flex items-center justify-between">
                        <div className="flex items-center border border-border">
                          <button
                            type="button"
                            aria-label="Decrease quantity"
                            onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                            className="px-2.5 py-2"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="px-3 text-[0.7rem]">{item.quantity}</span>
                          <button
                            type="button"
                            aria-label="Increase quantity"
                            onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                            className="px-2.5 py-2"
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

            <footer className="border-t border-border px-5 py-6">
              <div className="flex items-baseline justify-between">
                <span className="label">Subtotal</span>
                <span className="text-sm">{formatMoney(subtotal, currency)}</span>
              </div>
              <p className="mt-2 text-[0.65rem] text-muted-foreground">
                Shipping and COD charges calculated at checkout.
              </p>
              <Link to="/checkout" onClick={closeDrawer} className="btn-cult mt-5 w-full">
                {isLoading || isSyncing ? <Loader2 className="h-4 w-4 animate-spin" /> : "Checkout"}
              </Link>
              <button type="button" onClick={closeDrawer} className="btn-ghost-cult mt-3 w-full">
                Continue shopping
              </button>
            </footer>
          </>
        )}
      </aside>
    </div>
  );
}
