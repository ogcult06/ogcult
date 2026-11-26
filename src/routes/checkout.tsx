import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { useCartStore } from "@/stores/cartStore";
import { formatMoney } from "@/lib/shopify";
import { createOrder, getCheckoutConfig, verifyPayment } from "@/lib/orders.functions";
import {
  INDIAN_STATES,
  computeTotals,
  isValidEmail,
  isValidIndianMobile,
  isValidPincode,
} from "@/lib/order-utils";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Checkout — OG CULT" },
      {
        name: "description",
        content:
          "Complete your OG CULT order with secure online payment or Cash on Delivery across India.",
      },
      { property: "og:title", content: "Checkout — OG CULT" },
      { property: "og:description", content: "Secure checkout for OG CULT orders." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: CheckoutPage,
});

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => { open: () => void };
  }
}

function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

const inputClass =
  "w-full border border-border bg-transparent px-4 py-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-foreground";

function Field({
  label,
  children,
  error,
  optional,
}: {
  label: string;
  children: React.ReactNode;
  error?: string | undefined;
  optional?: boolean | undefined;
}) {
  return (
    <label className="block">
      <span className="label">
        {label}
        {optional ? " (optional)" : ""}
      </span>
      <div className="mt-2">{children}</div>
      {error ? <span className="mt-1 block text-[0.65rem] text-destructive">{error}</span> : null}
    </label>
  );
}

function CheckoutPage() {
  const navigate = useNavigate();
  const items = useCartStore((s) => s.items);
  const clearCart = useCartStore((s) => s.clearCart);

  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);

  const { data: config } = useQuery({
    queryKey: ["checkout-config"],
    queryFn: () => getCheckoutConfig(),
    staleTime: 60_000,
  });

  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    addressLine1: "",
    addressLine2: "",
    landmark: "",
    city: "",
    state: "",
    pincode: "",
    notes: "",
  });
  const [paymentMethod, setPaymentMethod] = useState<"prepaid" | "cod">("cod");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!config) return;
    if (!config.codEnabled && config.prepaidEnabled) setPaymentMethod("prepaid");
    if (config.codEnabled && !config.prepaidEnabled) setPaymentMethod("cod");
  }, [config]);

  const currency = items[0]?.price.currencyCode ?? config?.currency ?? "INR";
  const itemsTotal = useMemo(
    () => items.reduce((sum, i) => sum + parseFloat(i.price.amount) * i.quantity, 0),
    [items],
  );
  const totals = computeTotals(itemsTotal, paymentMethod, {
    codCharge: config?.codCharge ?? 0,
    shippingCharge: config?.shippingCharge ?? 0,
    freeShippingThreshold: config?.freeShippingThreshold ?? 0,
  });

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const validate = () => {
    const next: Record<string, string> = {};
    if (form.name.trim().length < 2) next["name"] = "Enter your full name";
    if (!isValidIndianMobile(form.phone)) next["phone"] = "Enter a valid 10-digit mobile number";
    if (!isValidEmail(form.email)) next["email"] = "Enter a valid email address";
    if (!form.addressLine1.trim()) next["addressLine1"] = "Required";
    if (!form.addressLine2.trim()) next["addressLine2"] = "Required";
    if (!form.city.trim()) next["city"] = "Required";
    if (!form.state.trim()) next["state"] = "Select your state";
    if (!isValidPincode(form.pincode)) next["pincode"] = "Enter a valid 6-digit PIN code";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const goToConfirmation = (orderNumber: string, token: string) => {
    clearCart();
    navigate({ to: "/order-confirmed", search: { number: orderNumber, token } });
  };

  const submit = async () => {
    if (!validate()) {
      toast.error("Please check the highlighted fields");
      return;
    }
    setSubmitting(true);
    try {
      const result = await createOrder({
        data: {
          items: items.map((i) => ({ variantId: i.variantId, quantity: i.quantity })),
          paymentMethod,
          customer: { ...form },
        },
      });

      if (!result.ok) {
        result.errors.forEach((e) => toast.error(e));
        return;
      }

      if (result.paymentMethod === "cod") {
        goToConfirmation(result.orderNumber, result.token);
        return;
      }

      const rzp = result.razorpay!;
      const ready = await loadRazorpayScript();
      if (!ready || !window.Razorpay) {
        toast.error("Could not open the payment window. Please try again.");
        return;
      }

      const checkout = new window.Razorpay({
        key: rzp.keyId,
        order_id: rzp.orderId,
        amount: rzp.amount,
        currency: rzp.currency,
        name: "OG CULT",
        description: `Order ${result.orderNumber}`,
        prefill: { name: form.name, email: form.email, contact: form.phone },
        theme: { color: "#000000" },
        handler: async (response: {
          razorpay_order_id: string;
          razorpay_payment_id: string;
          razorpay_signature: string;
        }) => {
          const verified = await verifyPayment({
            data: {
              orderNumber: result.orderNumber,
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            },
          });
          if (verified.ok) {
            goToConfirmation(verified.orderNumber, result.token);
          } else {
            toast.error(verified.error ?? "We could not confirm your payment yet.", {
              description: `Order ${result.orderNumber}. If money was debited it will be confirmed automatically or refunded.`,
            });
          }
        },
        modal: {
          ondismiss: () =>
            toast.message("Payment cancelled", {
              description: `Order ${result.orderNumber} is saved as pending payment.`,
            }),
        },
      } as Record<string, unknown>);
      checkout.open();
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong placing your order. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!hydrated) {
    return (
      <div className="px-5 pt-28 pb-24 md:px-10 md:pt-36">
        <h1 className="display-lg">Checkout</h1>
        <Loader2 className="mt-16 h-4 w-4 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="px-5 pt-28 pb-24 md:px-10 md:pt-36">
        <h1 className="display-lg">Checkout</h1>
        <div className="mt-16 border-t border-border/60 pt-16">
          <p className="text-sm text-muted-foreground">Your bag is empty.</p>
          <Link to="/shop" className="btn-cult mt-8">
            Shop the drop
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="px-5 pt-28 pb-40 md:px-10 md:pt-36 md:pb-24">
      <h1 className="display-lg">Checkout</h1>

      <div className="mt-10 grid gap-14 md:mt-12 lg:grid-cols-[1.4fr_1fr]">
        {/* Details */}
        <div className="border-t border-border/60 pt-8">
          <h2 className="label !text-foreground">Delivery details</h2>
          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Field label="Full name" error={errors["name"]}>
                <input className={inputClass} value={form.name} onChange={set("name")} autoComplete="name" />
              </Field>
            </div>
            <Field label="Mobile number" error={errors["phone"]}>
              <input
                className={inputClass}
                value={form.phone}
                onChange={set("phone")}
                inputMode="numeric"
                placeholder="10-digit number"
                autoComplete="tel"
              />
            </Field>
            <Field label="Email address" error={errors["email"]}>
              <input
                className={inputClass}
                value={form.email}
                onChange={set("email")}
                type="email"
                autoComplete="email"
              />
            </Field>
            <Field label="House / Flat number" error={errors["addressLine1"]}>
              <input className={inputClass} value={form.addressLine1} onChange={set("addressLine1")} />
            </Field>
            <Field label="Street / Area" error={errors["addressLine2"]}>
              <input className={inputClass} value={form.addressLine2} onChange={set("addressLine2")} />
            </Field>
            <Field label="Landmark" optional>
              <input className={inputClass} value={form.landmark} onChange={set("landmark")} />
            </Field>
            <Field label="City" error={errors["city"]}>
              <input className={inputClass} value={form.city} onChange={set("city")} />
            </Field>
            <Field label="State" error={errors["state"]}>
              <select className={inputClass} value={form.state} onChange={set("state")}>
                <option value="">Select state</option>
                {INDIAN_STATES.map((s) => (
                  <option key={s} value={s} className="bg-background">
                    {s}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="PIN code" error={errors["pincode"]}>
              <input
                className={inputClass}
                value={form.pincode}
                onChange={set("pincode")}
                inputMode="numeric"
                maxLength={6}
              />
            </Field>
            <div className="sm:col-span-2">
              <Field label="Order notes" optional>
                <textarea
                  className={`${inputClass} min-h-[88px]`}
                  value={form.notes}
                  onChange={set("notes")}
                />
              </Field>
            </div>
          </div>

          <h2 className="label !text-foreground mt-12">Payment</h2>
          <div className="mt-5 space-y-3">
            {config?.prepaidEnabled !== false && (
              <button
                type="button"
                onClick={() => setPaymentMethod("prepaid")}
                disabled={!config?.prepaidEnabled}
                className={`flex w-full items-start justify-between border px-4 py-4 text-left transition-colors disabled:opacity-40 ${
                  paymentMethod === "prepaid" ? "border-foreground" : "border-border"
                }`}
              >
                <span>
                  <span className="text-xs uppercase">Pay online (Prepaid)</span>
                  <span className="mt-1 block text-[0.65rem] text-muted-foreground">
                    UPI, cards, netbanking, wallets — secured by Razorpay.
                  </span>
                </span>
                <span className="text-xs">{formatMoney(itemsTotal, currency)}</span>
              </button>
            )}
            {config?.codEnabled !== false && (
              <button
                type="button"
                onClick={() => setPaymentMethod("cod")}
                className={`flex w-full items-start justify-between border px-4 py-4 text-left transition-colors ${
                  paymentMethod === "cod" ? "border-foreground" : "border-border"
                }`}
              >
                <span>
                  <span className="text-xs uppercase">Cash on Delivery</span>
                  <span className="mt-1 block text-[0.65rem] text-muted-foreground">
                    Extra {formatMoney(config?.codCharge ?? 0, currency)} COD handling charge.
                  </span>
                </span>
                <span className="text-xs">
                  +{formatMoney(config?.codCharge ?? 0, currency)}
                </span>
              </button>
            )}
            {config && !config.prepaidEnabled && (
              <p className="text-[0.65rem] text-muted-foreground">
                Online payment is not available right now.
              </p>
            )}
          </div>
        </div>

        {/* Summary */}
        <aside className="h-fit border-t border-border/60 pt-8 lg:sticky lg:top-28">
          <h2 className="label !text-foreground">Your order</h2>
          <ul className="mt-6 space-y-5">
            {items.map((item) => {
              const image = item.product.node.images?.edges?.[0]?.node;
              return (
                <li key={item.variantId} className="flex gap-4">
                  <div className="w-16 shrink-0 bg-card">
                    {image && (
                      <img
                        src={image.url}
                        alt={image.altText ?? item.product.node.title}
                        className="aspect-square w-full object-contain"
                      />
                    )}
                  </div>
                  <div className="flex min-w-0 flex-1 justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-[0.7rem] uppercase leading-tight">
                        {item.product.node.title}
                      </p>
                      <p className="label mt-1.5">
                        Size {item.variantTitle} · Qty {item.quantity}
                      </p>
                      <p className="mt-1 text-[0.65rem] text-muted-foreground">
                        {formatMoney(parseFloat(item.price.amount), item.price.currencyCode)} each
                      </p>
                    </div>
                    <span className="shrink-0 text-[0.7rem] tabular-nums">
                      {formatMoney(parseFloat(item.price.amount) * item.quantity, currency)}
                    </span>
                  </div>
                </li>
              );
            })}
          </ul>

          <div className="mt-8 space-y-3 border-t border-border/60 pt-6">
            <div className="flex items-baseline justify-between">
              <span className="label">Subtotal</span>
              <span className="text-sm tabular-nums">{formatMoney(totals.itemsTotal, currency)}</span>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="label">Shipping</span>
              <span className="text-sm tabular-nums">
                {totals.shipping === 0 ? "Free" : formatMoney(totals.shipping, currency)}
              </span>
            </div>
            {paymentMethod === "cod" && (
              <div className="flex items-baseline justify-between">
                <span className="label">COD charge</span>
                <span className="text-sm tabular-nums">{formatMoney(totals.cod, currency)}</span>
              </div>
            )}
            <div className="flex items-baseline justify-between border-t border-border/60 pt-3">
              <span className="label !text-foreground">Total</span>
              <span className="text-sm tabular-nums">{formatMoney(totals.total, currency)}</span>
            </div>
          </div>

          <div className="mt-8 hidden lg:block">
            <button type="button" onClick={submit} disabled={submitting} className="btn-cult w-full">
              {submitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : paymentMethod === "cod" ? (
                "Place COD order"
              ) : (
                `Pay ${formatMoney(totals.total, currency)}`
              )}
            </button>
            <Link to="/cart" className="btn-ghost-cult mt-3 w-full">
              Back to bag
            </Link>
          </div>
          {config?.processingNote ? (
            <p className="mt-6 text-[0.65rem] leading-relaxed text-muted-foreground">
              {config.processingNote}
            </p>
          ) : null}
        </aside>
      </div>

      {/* Mobile sticky bar */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border/60 bg-background/95 px-5 py-4 backdrop-blur lg:hidden">
        <div className="mb-3 flex items-baseline justify-between">
          <span className="label">Total</span>
          <span className="text-sm tabular-nums">{formatMoney(totals.total, currency)}</span>
        </div>
        <button type="button" onClick={submit} disabled={submitting} className="btn-cult w-full">
          {submitting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : paymentMethod === "cod" ? (
            "Place COD order"
          ) : (
            "Pay now"
          )}
        </button>
      </div>
    </div>
  );
}
