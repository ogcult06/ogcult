import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";

import { getOrderByToken } from "@/lib/orders.functions";
import { formatMoney } from "@/lib/shopify";

export const Route = createFileRoute("/order-confirmed")({
  validateSearch: (search: Record<string, unknown>) => ({
    number: String(search["number"] ?? ""),
    token: String(search["token"] ?? ""),
  }),
  head: () => ({
    meta: [
      { title: "Order Confirmed — OG CULT" },
      { name: "description", content: "Your OG CULT order is confirmed." },
      { property: "og:title", content: "Order Confirmed — OG CULT" },
      { property: "og:description", content: "Your OG CULT order is confirmed." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: OrderConfirmedPage,
});

interface OrderItem {
  product_title: string;
  size: string;
  quantity: number;
  image_url: string | null;
  unit_price: number;
  line_total: number;
}

function OrderConfirmedPage() {
  const { number, token } = Route.useSearch();

  const { data, isLoading } = useQuery({
    queryKey: ["order-confirmation", number, token],
    queryFn: () => getOrderByToken({ data: { orderNumber: number, token } }),
    enabled: Boolean(number && token),
  });

  if (isLoading) {
    return (
      <div className="px-5 pt-28 pb-24 md:px-10 md:pt-36">
        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="px-5 pt-28 pb-24 md:px-10 md:pt-36">
        <h1 className="display-lg">Order not found</h1>
        <p className="mt-6 text-sm text-muted-foreground">
          This confirmation link is not valid. You can check your order status any time.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link to="/track" className="btn-cult">
            Track an order
          </Link>
          <Link to="/shop" className="btn-ghost-cult">
            Continue shopping
          </Link>
        </div>
      </div>
    );
  }

  const order = data.order as unknown as Record<string, unknown>;
  const items = (order["order_items"] as OrderItem[] | null) ?? [];
  const currency = String(order["currency"] ?? "INR");
  const isCod = order["payment_method"] === "cod";

  return (
    <div className="px-5 pt-28 pb-24 md:px-10 md:pt-36">
      <p className="label">Thank you for your order</p>
      <h1 className="display-lg mt-4">Order confirmed</h1>
      <p className="mt-6 max-w-xl text-sm leading-relaxed text-muted-foreground">
        We have received your order and will begin processing it shortly. A confirmation has been
        sent to {String(order["customer_email"])}.
      </p>

      <div className="mt-10 grid gap-12 border-t border-border/60 pt-10 lg:grid-cols-[1.4fr_1fr]">
        <div>
          <div className="flex flex-wrap gap-x-12 gap-y-6">
            <div>
              <p className="label">Order number</p>
              <p className="mt-2 font-display text-3xl uppercase">{String(order["order_number"])}</p>
            </div>
            <div>
              <p className="label">Order date</p>
              <p className="mt-2 text-sm">
                {new Date(String(order["created_at"])).toLocaleString("en-IN", {
                  dateStyle: "medium",
                  timeStyle: "short",
                })}
              </p>
            </div>
            <div>
              <p className="label">Payment</p>
              <p className="mt-2 text-sm uppercase">
                {isCod ? "Cash on Delivery" : "Paid online"}
              </p>
            </div>
          </div>

          <ul className="mt-10 border-t border-border/60">
            {items.map((item, i) => (
              <li key={i} className="flex gap-4 border-b border-border/60 py-5">
                <div className="w-20 shrink-0 bg-card">
                  {item.image_url && (
                    <img
                      src={item.image_url}
                      alt={item.product_title}
                      className="aspect-[4/5] w-full object-contain"
                    />
                  )}
                </div>
                <div className="flex flex-1 items-start justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase leading-tight">{item.product_title}</p>
                    <p className="label mt-2">
                      Size {item.size} · Qty {item.quantity}
                    </p>
                  </div>
                  <span className="text-xs tabular-nums">
                    {formatMoney(Number(item.line_total), currency)}
                  </span>
                </div>
              </li>
            ))}
          </ul>

          <div className="mt-8 space-y-3">
            <div className="flex items-baseline justify-between">
              <span className="label">Subtotal</span>
              <span className="text-sm tabular-nums">
                {formatMoney(Number(order["items_total"]), currency)}
              </span>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="label">Shipping</span>
              <span className="text-sm tabular-nums">
                {Number(order["shipping_charge"]) === 0
                  ? "Free"
                  : formatMoney(Number(order["shipping_charge"]), currency)}
              </span>
            </div>
            {Number(order["cod_charge"]) > 0 && (
              <div className="flex items-baseline justify-between">
                <span className="label">COD charge</span>
                <span className="text-sm tabular-nums">
                  {formatMoney(Number(order["cod_charge"]), currency)}
                </span>
              </div>
            )}
            <div className="flex items-baseline justify-between border-t border-border/60 pt-3">
              <span className="label !text-foreground">Total</span>
              <span className="text-sm tabular-nums">
                {formatMoney(Number(order["total"]), currency)}
              </span>
            </div>
          </div>

          <div className="mt-10 flex flex-wrap gap-3">
            <Link to="/shop" className="btn-cult">
              Continue shopping
            </Link>
            <Link to="/track" className="btn-ghost-cult">
              Track this order
            </Link>
          </div>
        </div>

        <aside className="h-fit">
          <p className="label !text-foreground">Shipping to</p>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
            {String(order["customer_name"])}
            <br />
            {String(order["address_line1"])}
            <br />
            {String(order["address_line2"])}
            {order["landmark"] ? (
              <>
                <br />
                Landmark: {String(order["landmark"])}
              </>
            ) : null}
            <br />
            {String(order["city"])}, {String(order["state"])} {String(order["pincode"])}
            <br />
            India
          </p>

          <p className="label !text-foreground mt-10">What happens next</p>
          <p className="mt-4 text-[0.75rem] leading-relaxed text-muted-foreground">
            {data.support.processingNote}
          </p>

          <p className="label !text-foreground mt-10">Need help</p>
          <p className="mt-4 text-[0.75rem] leading-relaxed text-muted-foreground">
            {data.support.email ? (
              <a href={`mailto:${data.support.email}`} className="hover:text-foreground">
                {data.support.email}
              </a>
            ) : null}
            {data.support.phone ? (
              <>
                <br />
                {data.support.phone}
              </>
            ) : null}
          </p>
        </aside>
      </div>
    </div>
  );
}
