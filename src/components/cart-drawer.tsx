import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Loader2, Minus, Plus, X, Truck, CreditCard, Headphones, ShieldCheck, ChevronDown, ChevronUp, Tag } from "lucide-react";
import { useCartStore } from "@/stores/cartStore";
import { formatMoney } from "@/lib/shopify";

export function CartDrawer() {
  const { items, isDrawerOpen, closeDrawer, isLoading, isSyncing, updateQuantity, removeItem, syncCart } =
    useCartStore();
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
  const subtotal = items.reduce((sum, i) => sum + parseFloat(i.price.amount) * i.quantity, 0);

  // Calculate MRP and savings from compareAtPrice
  const totalMRP = items.reduce((sum, i) => {
    const compareAt = i.product.node.compareAtPrice;
    const mrp = compareAt ? parseFloat(compareAt) : parseFloat(i.price.amount);
    return sum + mrp * i.quantity;
  }, 0);
  const totalSavings = totalMRP - subtotal;

  const handleApplyPromo = () => {
    if (promoCode.trim().toUpperCase() === "FREESHIP" || promoCode.trim().toUpperCase() === "WELCOME10") {
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
        className={`absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-500 ${
          isDrawerOpen ? "opacity-100" : "opacity-0"
        }`}
      />
      <aside
        role="dialog"
        aria-label="Cart"
        className={`absolute inset-y-0 right-0 flex w-full max-w-md flex-col bg-white transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          isDrawerOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <header className="flex items-center justify-between border-b border-gray-200 px-5 py-5">
          <h2 className="text-lg font-semibold text-[#111111]">
            Bag <span className="text-gray-500">({totalItems})</span>
          </h2>
          <button
            type="button"
            onClick={closeDrawer}
            aria-label="Close cart"
            className="flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:bg-gray-100"
          >
            <X className="h-5 w-5 text-[#111111]" strokeWidth={2} />
          </button>
        </header>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-6 px-6 text-center">
            <p className="text-2xl font-medium text-[#111111]">Your bag is empty</p>
            <Link
              to="/shop"
              onClick={closeDrawer}
              className="bg-[#111111] px-8 py-3 text-sm font-medium text-white transition-opacity hover:opacity-80"
            >
              Shop the drop
            </Link>
          </div>
        ) : (
          <>
            {/* Urgency & Shipping Strip */}
            <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50 px-5 py-3">
              <div className="flex items-center gap-2">
                <Truck className="h-4 w-4 text-[#111111]" strokeWidth={1.5} />
                <span className="text-xs text-[#111111]">
                  Ships by Tomorrow <span className="text-gray-500">•</span> Free Shipping Across India
                </span>
              </div>
              {promoApplied && (
                <span className="bg-green-100 px-2 py-1 text-[0.6rem] font-semibold uppercase tracking-wide text-green-700">
                  FREESHIP Applied
                </span>
              )}
            </div>

            {/* Cart Items */}
            <ul className="flex-1 overflow-y-auto px-5">
              {items.map((item) => {
                const image = item.product.node.images?.edges?.[0]?.node;
                const compareAt = item.product.node.compareAtPrice;
                const price = parseFloat(item.price.amount);
                const mrp = compareAt ? parseFloat(compareAt) : price;
                const discount = mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0;

                return (
                  <li key={item.variantId} className="flex gap-4 border-b border-gray-100 py-5">
                    <div className="w-20 shrink-0 bg-gray-50">
                      {image && (
                        <img
                          src={image.url}
                          alt={image.altText ?? item.product.node.title}
                          loading="lazy"
                          className="aspect-[3/4] h-full w-full object-cover"
                        />
                      )}
                    </div>
                    <div className="flex flex-1 flex-col justify-between">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-[#111111]">
                            {item.product.node.title}
                          </p>
                          <p className="mt-1 text-xs text-gray-500">
                            {item.selectedOptions.map((o) => o.value).join(" · ") || item.variantTitle}
                          </p>
                          <div className="mt-2 flex items-center gap-2">
                            <span className="text-sm font-semibold text-[#111111]">
                              {formatMoney(price, item.price.currencyCode)}
                            </span>
                            {discount > 0 && (
                              <>
                                <span className="text-xs text-gray-400 line-through">
                                  {formatMoney(mrp, item.price.currencyCode)}
                                </span>
                                <span className="text-xs font-medium text-green-600">-{discount}%</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="mt-3 flex items-center justify-between">
                        <div className="flex items-center border border-gray-200">
                          <button
                            type="button"
                            aria-label="Decrease quantity"
                            onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                            className="px-2.5 py-2 transition-colors hover:bg-gray-50"
                          >
                            <Minus className="h-3 w-3 text-[#111111]" />
                          </button>
                          <span className="px-3 text-xs text-[#111111]">{item.quantity}</span>
                          <button
                            type="button"
                            aria-label="Increase quantity"
                            onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                            className="px-2.5 py-2 transition-colors hover:bg-gray-50"
                          >
                            <Plus className="h-3 w-3 text-[#111111]" />
                          </button>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeItem(item.variantId)}
                          className="text-xs text-gray-500 underline transition-colors hover:text-[#111111]"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>

            {/* Footer Section */}
            <footer className="border-t border-gray-200 bg-white px-5 py-5">
              {/* Promo Code Collapsible */}
              <div className="mb-4">
                <button
                  type="button"
                  onClick={() => setPromoOpen((v) => !v)}
                  className="flex w-full items-center justify-between text-sm text-[#111111]"
                >
                  <span className="flex items-center gap-2">
                    <Tag className="h-4 w-4" strokeWidth={1.5} />
                    Got a gift card / promo code?
                  </span>
                  {promoOpen ? (
                    <ChevronUp className="h-4 w-4 text-gray-500" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-gray-500" />
                  )}
                </button>
                {promoOpen && (
                  <div className="mt-3 flex gap-2">
                    <input
                      type="text"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                      placeholder="Enter code"
                      className="flex-1 border border-gray-200 px-3 py-2 text-sm text-[#111111] outline-none placeholder:text-gray-400 focus:border-[#111111]"
                    />
                    <button
                      type="button"
                      onClick={handleApplyPromo}
                      className="bg-[#111111] px-4 py-2 text-xs font-medium text-white transition-opacity hover:opacity-80"
                    >
                      Apply
                    </button>
                  </div>
                )}
              </div>

              {/* Price Breakdown */}
              <div className="space-y-2 border-t border-gray-100 pt-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Total MRP</span>
                  <span className="text-[#111111]">{formatMoney(totalMRP, currency)}</span>
                </div>
                {totalSavings > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Total savings</span>
                    <span className="text-green-600">-{formatMoney(totalSavings, currency)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Subtotal</span>
                  <span className="text-[#111111]">{formatMoney(subtotal, currency)}</span>
                </div>
                <div className="flex justify-between border-t border-gray-100 pt-2 text-sm font-semibold">
                  <span className="text-[#111111]">Total charges</span>
                  <span className="text-[#111111]">
                    {formatMoney(subtotal, currency)}
                    <span className="ml-1 text-xs font-normal text-gray-500">(Incl. of all taxes)</span>
                  </span>
                </div>
              </div>

              {/* Trust Strip */}
              <div className="mt-4 grid grid-cols-4 gap-2 border-t border-gray-100 pt-4">
                <div className="flex flex-col items-center gap-1 text-center">
                  <Truck className="h-5 w-5 text-[#111111]" strokeWidth={1.5} />
                  <span className="text-[0.6rem] leading-tight text-gray-500">Free shipping</span>
                </div>
                <div className="flex flex-col items-center gap-1 text-center">
                  <CreditCard className="h-5 w-5 text-[#111111]" strokeWidth={1.5} />
                  <span className="text-[0.6rem] leading-tight text-gray-500">Cash on delivery</span>
                </div>
                <div className="flex flex-col items-center gap-1 text-center">
                  <Headphones className="h-5 w-5 text-[#111111]" strokeWidth={1.5} />
                  <span className="text-[0.6rem] leading-tight text-gray-500">Priority support</span>
                </div>
                <div className="flex flex-col items-center gap-1 text-center">
                  <ShieldCheck className="h-5 w-5 text-[#111111]" strokeWidth={1.5} />
                  <span className="text-[0.6rem] leading-tight text-gray-500">OG Cult's promise</span>
                </div>
              </div>

              {/* Checkout Button */}
              <Link
                to="/checkout"
                onClick={closeDrawer}
                className="mt-5 flex w-full items-center justify-center bg-[#111111] py-4 text-sm font-semibold text-white transition-opacity hover:opacity-80"
              >
                {isLoading || isSyncing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Checkout"
                )}
              </Link>
              <button
                type="button"
                onClick={closeDrawer}
                className="mt-3 w-full py-2 text-center text-xs text-gray-500 underline transition-colors hover:text-[#111111]"
              >
                Continue shopping
              </button>
            </footer>
          </>
        )}
      </aside>
    </div>
  );
}