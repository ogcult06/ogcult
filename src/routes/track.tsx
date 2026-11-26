import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Check, Loader2 } from "lucide-react";

import { trackOrder, type TrackedOrder } from "@/lib/orders.functions";
import { CUSTOMER_TIMELINE, ORDER_STATUS_LABELS, type OrderStatus } from "@/lib/order-utils";
import { formatMoney } from "@/lib/shopify";

export const Route = createFileRoute("/track")({
  head: () => ({
    meta: [
      { title: "Track Your Order — OG CULT" },
      {
        name: "description",
        content:
          "Check the status of your OG CULT order using your order number and the mobile number or email you ordered with.",
      },
      { property: "og:title", content: "Track Your Order — OG CULT" },
      { property: "og:description", content: "Check your OG CULT order status." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: TrackPage,
});

const inputClass =
  "w-full border border-border bg-transparent px-4 py-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-foreground";

function TrackPage() {
  const [orderNumber, setOrderNumber] = useState("");
  const [contact, setContact] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [order, setOrder] = useState<TrackedOrder | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setOrder(null);
    try {
      const result = await trackOrder({ data: { orderNumber, contact } });
      if (result.ok) setOrder(result.order);
      else setError(result.error ?? "No order found with those details.");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const status = (order?.order_status ?? "") as OrderStatus;
  const cancelled = ["cancelled", "returned", "refunded"].includes(status);
  const currentIndex = CUSTOMER_TIMELINE.indexOf(status);

  return (
    <div className="px-5 pt-28 pb-24 md:px-10 md:pt-36">
      <h1 className="display-lg">Track order</h1>
      <p className="mt-6 max-w-lg text-sm leading-relaxed text-muted-foreground">
        Enter your order number and the mobile number or email you ordered with.
      </p>

      <form onSubmit={submit} className="mt-10 max-w-md border-t border-border/60 pt-8">
        <label className="block">
          <span className="label">Order number</span>
          <input
            className={`${inputClass} mt-2`}
            value={orderNumber}
            onChange={(e) => setOrderNumber(e.target.value)}
            placeholder="OG-1001"
          />
        </label>
        <label className="mt-5 block">
          <span className="label">Mobile number or email</span>
          <input
            className={`${inputClass} mt-2`}
            value={contact}
            onChange={(e) => setContact(e.target.value)}
          />
        </label>
        <button type="submit" disabled={loading} className="btn-cult mt-7 w-full">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Check status"}
        </button>
        {error ? <p className="mt-4 text-[0.7rem] text-destructive">{error}</p> : null}
      </form>

      {order ? (
        <div className="mt-14 max-w-xl border-t border-border/60 pt-10">
          <p className="label">Order</p>
          <p className="mt-2 font-display text-3xl uppercase">{order.order_number}</p>
          <p className="label mt-3">
            {new Date(order.created_at).toLocaleDateString("en-IN", { dateStyle: "medium" })} ·{" "}
            {formatMoney(Number(order.total), order.currency)} ·{" "}
            {order.payment_method === "cod" ? "Cash on Delivery" : "Prepaid"}
          </p>

          {cancelled ? (
            <p className="mt-8 text-sm uppercase">{ORDER_STATUS_LABELS[status]}</p>
          ) : (
            <ol className="mt-8 space-y-4">
              {CUSTOMER_TIMELINE.map((step, i) => {
                const done = currentIndex >= i;
                return (
                  <li key={step} className="flex items-center gap-3">
                    <span
                      className={`flex h-5 w-5 items-center justify-center border ${
                        done ? "border-foreground" : "border-border"
                      }`}
                    >
                      {done ? <Check className="h-3 w-3" /> : null}
                    </span>
                    <span
                      className={`text-xs uppercase ${done ? "" : "text-muted-foreground"}`}
                    >
                      {ORDER_STATUS_LABELS[step]}
                    </span>
                  </li>
                );
              })}
            </ol>
          )}

          {order.tracking_number ? (
            <p className="mt-8 text-[0.75rem] text-muted-foreground">
              Tracking: {order.tracking_courier ? `${order.tracking_courier} · ` : ""}
              {order.tracking_number}
            </p>
          ) : null}

          <ul className="mt-10 border-t border-border/60">
            {order.order_items.map((item, i) => (
              <li key={i} className="flex items-center gap-4 border-b border-border/60 py-4">
                <div className="w-14 shrink-0 bg-card">
                  {item.image_url && (
                    <img
                      src={item.image_url}
                      alt={item.product_title}
                      className="aspect-square w-full object-contain"
                    />
                  )}
                </div>
                <p className="text-[0.7rem] uppercase leading-tight">
                  {item.product_title} · {item.size} · Qty {item.quantity}
                </p>
              </li>
            ))}
          </ul>

          <Link to="/shop" className="btn-ghost-cult mt-10">
            Continue shopping
          </Link>
        </div>
      ) : null}
    </div>
  );
}
