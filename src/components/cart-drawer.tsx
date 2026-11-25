import { useEffect, useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  Loader2,
  Minus,
  Plus,
  X,
  Truck,
  Banknote,
  Headphones,
  ShieldCheck,
  ChevronDown,
  Tag,
  Check,
} from "lucide-react";
import { useCartStore } from "@/stores/cartStore";
import { discountInfo, formatMoney } from "@/lib/shopify";

const FREE_SHIP_THRESHOLD = 0; // Free shipping across India, always
const COD_CHARGE = 0; // No extra COD charge
const SHIPPING_CHARGE = 0;

const trustItems = [
  { icon: Truck, label: "Free shipping" },
  { icon: Banknote, label: "Cash on delivery" },
  { icon: Headphones, label: "Priority support" },
  { icon: ShieldCheck, label: "OG Cult's promise" },
];

export function CartDrawer() {
  const {
    items,
    isDrawerOpen,
    closeDrawer,
    isLoading,
    isSyncing,
    updateQuantity,
    removeItem,
    syncCart,
  } = useCartStore();

  const [promoOpen, setPromoOpen] = useState(false);
  const [promoCode, setPromoCode] = useState("");
  const [promoApplied, setPromoApplied] = useState(false);

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

  const totals = useMemo(() => {
    let mrp = 0;
    let savings = 0;
    for (const item of items) {
      const qty = item.quantity;
      const price = parseFloat(item.price.amount);
      const info = discountInfo(item.product.node);
      if (info) {
        mrp += info.compare * qty;
        savings += (info.compare - price) * qty;
      } else {
        mrp += price * qty;
      }
    }
    const subtotal = mrp - savings;
    const shipping = items.length > 0 ? SHIPPING_CHARGE : 0;
    const cod = 0;
    const total = subtotal + shipping + cod;
    return { mrp, savings, subtotal, shipping, cod, total };
  }, [items]);

  const applyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    if (promoCode.trim().toUpperCase() === "FREESHIP") {
      setPromoApplied(true);
    }
  };

  return (
    <div
      className={`fixed inset-0 z-[70] ${isDrawerOpen ? "pointer-events-auto" : "pointer-events-none"}`}
      aria-hidden={!isDrawerOpen}
    >
      <div
        onClick={closeDrawer}
        className={`absolute inset-0 bg-foreground/30 backdrop-blur-sm transition-opacity duration-500 ${
          isDrawerOpen ? "opacity-100" : "opacity-0"
        }`}
      />
      <aside
        role="dialog"
        aria-label="Shopping bag"
        className={`absolute inset-y-0 right-0 flex w-full max-w-md flex-col border-l border-border bg-background transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          isDrawerOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <header className="flex items-center justify-between border-b border-border px-5 py-4">
          <p className="font-display text-xl uppercase tracking-tight">
            Bag ({totalItems})
          </p>
          <button
            type="button"
            onClick={closeDrawer}
            aria-label="Close cart"
            className="flex h-8 w-8 items-center justify-center transition-opacity hover:opacity-60"
          >
            <X className="h-5 w-5" strokeWidth={2} />
          </button>
        </header>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-6 px-6 text-center">
            <div>
              <p className="font-display text-4xl uppercase">Your bag is empty</p>
              <p className="mt-3 text-xs tracking-[0.14em] text-muted-foreground uppercase">
                Add something from the latest drop.
              </p>
            </div>
            <Link to="/shop" onClick={closeDrawer} className="btn-cult">
              Shop the drop
            </Link>
          </div>
        ) : (
          <>
            {/* Urgency & shipping strip */}
            <div className="border-b border-border bg-secondary px-5 py-3">
              <div className="flex items-center justify-between gap-3">
                <p className="flex items-center gap-2 text-[0.65rem] tracking-[0.12em] uppercase text-foreground">
                  <Truck className="h-3.5 w-3.5" strokeWidth={2} />
                  Ships by Tomorrow • Free Shipping Across India
                </p>
                {promoApplied && (
                  <span className="flex shrink-0 items-center gap-1 rounded-full bg-success px-2 py-0.5 text-[0.55rem] font-semibold tracking-[0.1em] uppercase text-success-foreground">
                    <Check className="h-3 w-3" strokeWidth={3} />
                    FREESHIP
                  </span>
                )}
              </div>
            </div>

            {/* Cart items */}
            <ul className="flex-1 overflow-y-auto px-5">
              {items.map((item) => {
                const image = item.product.node.images?.edges?.[0]?.node;
                const sizeLabel =
                  item.selectedOptions.find((o) => /size/i.test(o.name))?.value ??
                  item.variantTitle;
                const linePrice = parseFloat(item.price.amount) * item.quantity;
                const info = discountInfo(item.product.node);
                return (
                  <li key={item.variantId} className="flex gap-4 border-b border-border/60 py-5">
                    <Link
                      to="/product/$handle"
                      params={{ handle: item.product.node.handle }}
                      onClick={closeDrawer}
                      className="w-20 shrink-0 overflow-hidden bg-secondary"
                    >
                      {image && (
                        <img
                          src={image.url}
                          alt={image.altText ?? item.product.node.title}
                          loading="lazy"
                          className="aspect-[3/4] h-full w-full object-cover"
                        />
                      )}
                    </Link>
                    <div className="flex flex-1 flex-col justify-between">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <Link
                            to="/product/$handle"
                            params={{ handle: item.product.node.handle }}
                            onClick={closeDrawer}
                            className="block truncate text-[0.8rem] font-medium uppercase tracking-[0.06em] hover:opacity-60"
                          >
                            {item.product.node.title}
                          </Link>
                          <p className="mt-1 text-[0.65rem] tracking-[0.14em] text-muted-foreground uppercase">
                            Size: {sizeLabel}
                          </p>
                          <div className="mt-2 flex items-center gap-2">
                            <span className="text-sm font-semibold text-foreground">
                              {formatMoney(parseFloat(item.price.amount), item.price.currencyCode)}
                            </span>
                            {info && info.compare > parseFloat(item.price.amount) && (
                              <>
                                <span className="text-xs text-muted-foreground line-through">
                                  {formatMoney(info.compare, item.price.currencyCode)}
                                </span>
                                <span className="text-xs font-medium text-success">
                                  -{Math.round(((info.compare - parseFloat(item.price.amount)) / info.compare) * 100)}%
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                        <span className="shrink-0 text-[0.78rem] font-semibold">
                          {formatMoney(linePrice, item.price.currencyCode)}
                        </span>
                      </div>
                      <div className="mt-3 flex items-center justify-between">
                        {/* Quantity stepper */}
                        <div className="flex items-center border border-border">
                          <button
                            type="button"
                            aria-label="Decrease quantity"
                            onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                            className="flex h-8 w-8 items-center justify-center transition-colors hover:bg-secondary"
                          >
                            <Minus className="h-3 w-3" strokeWidth={2} />
                          </button>
                          <span className="w-8 text-center text-[0.75rem]">{item.quantity}</span>
                          <button
                            type="button"
                            aria-label="Increase quantity"
                            onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                            className="flex h-8 w-8 items-center justify-center transition-colors hover:bg-secondary"
                          >
                            <Plus className="h-3 w-3" strokeWidth={2} />
                          </button>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeItem(item.variantId)}
                          className="text-[0.62rem] tracking-[0.16em] uppercase text-muted-foreground transition-colors hover:text-foreground"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>

            {/* Footer: promo, breakdown, trust, checkout */}
            <footer className="border-t border-border">
              {/* Collapsible promo */}
              <div className="border-b border-border">
                <button
                  type="button"
                  onClick={() => setPromoOpen((v) => !v)}
                  className="flex w-full items-center justify-between px-5 py-3.5 text-[0.68rem] tracking-[0.14em] uppercase text-muted-foreground transition-colors hover:text-foreground"
                >
                  <span className="flex items-center gap-2">
                    <Tag className="h-3.5 w-3.5" strokeWidth={2} />
                    Got a gift card / promo code?
                  </span>
                  <ChevronDown
                    className={`h-4 w-4 transition-transform duration-300 ${promoOpen ? "rotate-180" : ""}`}
                    strokeWidth={2}
                  />
                </button>
                {promoOpen && (
                  <form
                    onSubmit={applyPromo}
                    className="flex items-center gap-2 px-5 pb-4"
                  >
                    <input
                      type="text"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                      placeholder="Enter code (try FREESHIP)"
                      className="flex-1 border border-border bg-background px-3 py-2.5 text-[0.75rem] outline-none placeholder:text-muted-foreground/60 focus:border-foreground"
                    />
                    <button
                      type="submit"
                      className="border border-foreground bg-foreground px-4 py-2.5 text-[0.65rem] tracking-[0.16em] uppercase text-background transition-opacity hover:opacity-80"
                    >
                      Apply
                    </button>
                  </form>
                )}
                {promoApplied && (
                  <p className="flex items-center gap-1.5 px-5 pb-3 text-[0.62rem] tracking-[0.12em] uppercase text-success">
                    <Check className="h-3 w-3" strokeWidth={3} />
                    FREESHIP applied — free shipping unlocked
                  </p>
                )}
              </div>

              {/* Itemized price breakdown */}
              <div className="space-y-2 px-5 py-4">
                <Row label="Total MRP" value={formatMoney(totals.mrp, currency)} muted />
                {totals.savings > 0 && (
                  <Row
                    label="Total savings"
                    value={`− ${formatMoney(totals.savings, currency)}`}
                    success
                  />
                )}
                <Row label="Subtotal" value={formatMoney(totals.subtotal, currency)} />
                <Row
                  label="Total charges"
                  value={formatMoney(totals.shipping + totals.cod, currency)}
                  muted
                />
                <p className="text-[0.58rem] tracking-[0.1em] uppercase text-muted-foreground">
                  Incl. of all taxes
                </p>
              </div>

              {/* Trust strip */}
              <div className="grid grid-cols-4 border-y border-border">
                {trustItems.map((t) => (
                  <div
                    key={t.label}
                    className="flex flex-col items-center gap-1.5 px-1 py-3.5 text-center"
                  >
                    <t.icon className="h-4 w-4 text-foreground" strokeWidth={1.75} />
                    <span className="text-[0.52rem] leading-tight tracking-[0.08em] uppercase text-muted-foreground">
                      {t.label}
                    </span>
                  </div>
                ))}
              </div>

              {/* Checkout */}
              <div className="p-5">
                <Link
                  to="/checkout"
                  onClick={closeDrawer}
                  className="flex w-full items-center justify-center gap-2 bg-foreground py-4 text-[0.72rem] font-semibold tracking-[0.2em] uppercase text-background transition-opacity hover:opacity-85"
                >
                  {isLoading || isSyncing ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>Checkout • {formatMoney(totals.total, currency)}</>
                  )}
                </Link>
                <button
                  type="button"
                  onClick={closeDrawer}
                  className="mt-2 w-full py-2.5 text-[0.62rem] tracking-[0.16em] uppercase text-muted-foreground transition-colors hover:text-foreground"
                >
                  Continue shopping
                </button>
              </div>
            </footer>
          </>
        )}
      </aside>
    </div>
  );
}

function Row({
  label,
  value,
  muted,
  success,
}: {
  label: string;
  value: string;
  muted?: boolean;
  success?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between">
      <span
        className={`text-[0.72rem] tracking-[0.1em] uppercase ${
          muted ? "text-muted-foreground" : "text-foreground"
        }`}
      >
        {label}
      </span>
      <span
        className={`text-[0.78rem] font-medium ${
          success ? "text-success" : muted ? "text-muted-foreground" : "text-foreground"
        }`}
      >
        {value}
      </span>
    </div>
  );
}