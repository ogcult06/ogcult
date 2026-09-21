import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { getAdminOrder, updateOrder } from "@/lib/admin.functions";
import {
  ORDER_STATUSES,
  ORDER_STATUS_LABELS,
  PAYMENT_STATUS_LABELS,
  formatOrderAddress,
  type OrderStatus,
} from "@/lib/order-utils";
import { formatMoney } from "@/lib/shopify";

export const Route = createFileRoute("/_authenticated/admin/orders/$id")({
  head: () => ({
    meta: [
      { title: "Order — OG CULT Admin" },
      { name: "description", content: "OG CULT order detail." },
      { property: "og:title", content: "Order — OG CULT Admin" },
      { property: "og:description", content: "OG CULT order detail." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminOrderDetail,
});

const inputClass =
  "w-full border border-border bg-transparent px-4 py-2.5 text-sm text-foreground outline-none focus:border-foreground";

interface Item {
  product_title: string;
  size: string;
  quantity: number;
  unit_price: number;
  line_total: number;
  image_url: string | null;
}

function AdminOrderDetail() {
  const { id } = Route.useParams();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["admin-order", id],
    queryFn: () => getAdminOrder({ data: { id } }),
  });

  const order = data as unknown as Record<string, unknown> | undefined;
  const items = (order?.["order_items"] as Item[] | undefined) ?? [];
  const history =
    (order?.["order_status_history"] as Array<Record<string, unknown>> | undefined) ?? [];

  const [tracking, setTracking] = useState("");
  const [courier, setCourier] = useState("");
  const [supplierRef, setSupplierRef] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!order) return;
    setTracking(String(order["tracking_number"] ?? ""));
    setCourier(String(order["tracking_courier"] ?? ""));
    setSupplierRef(String(order["supplier_reference"] ?? ""));
    setNotes(String(order["admin_notes"] ?? ""));
  }, [order]);

  const save = async (patch: Parameters<typeof updateOrder>[0] extends never ? never : Record<string, unknown>) => {
    setSaving(true);
    try {
      await updateOrder({ data: { id, ...patch } as never });
      await queryClient.invalidateQueries({ queryKey: ["admin-order", id] });
      await queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
      toast.success("Order updated");
    } catch (error) {
      console.error(error);
      toast.error("Could not update the order");
    } finally {
      setSaving(false);
    }
  };

  const copyDetails = async () => {
    if (!order) return;
    const text = [
      `Customer: ${order["customer_name"]}`,
      `Phone: ${order["customer_phone"]}`,
      ...items.map(
        (i) => `Product: ${i.product_title}\nSize: ${i.size}\nQuantity: ${i.quantity}`,
      ),
      `Shipping Address: ${order["address_line1"]}, ${order["address_line2"]}${
        order["landmark"] ? `, ${order["landmark"]}` : ""
      }`,
      `City: ${order["city"]}`,
      `State: ${order["state"]}`,
      `PIN: ${order["pincode"]}`,
    ].join("\n");
    await navigator.clipboard.writeText(text);
    toast.success("Order details copied");
  };

  const copyAddress = async () => {
    if (!order) return;
    await navigator.clipboard.writeText(
      formatOrderAddress(order as never),
    );
    toast.success("Address copied");
  };

  if (isLoading || !order) {
    return (
      <div className="px-5 pt-28 pb-24 md:px-10">
        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const currency = String(order["currency"] ?? "INR");

  return (
    <div className="px-5 pt-28 pb-24 md:px-10 md:pt-32">
      <Link to="/admin" className="label hover:!text-foreground">
        ← All orders
      </Link>

      <header className="mt-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="display-lg">{String(order["order_number"])}</h1>
          <p className="label mt-3">
            {new Date(String(order["created_at"])).toLocaleString("en-IN", {
              dateStyle: "medium",
              timeStyle: "short",
            })}{" "}
            · {order["payment_method"] === "cod" ? "COD" : "Prepaid"} ·{" "}
            {PAYMENT_STATUS_LABELS[String(order["payment_status"])]}
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button type="button" onClick={copyDetails} className="btn-cult">
            Copy order details
          </button>
          <button
            type="button"
            onClick={() => save({ orderStatus: "ordered_from_supplier" as OrderStatus })}
            disabled={saving}
            className="btn-ghost-cult"
          >
            Mark as ordered from supplier
          </button>
        </div>
      </header>

      <div className="mt-10 grid gap-12 border-t border-border/60 pt-10 lg:grid-cols-[1.4fr_1fr]">
        <div>
          <h2 className="label !text-foreground">Items</h2>
          <ul className="mt-5 border-t border-border/60">
            {items.map((item, i) => (
              <li key={i} className="flex items-center gap-4 border-b border-border/60 py-4">
                <div className="w-16 shrink-0 bg-card">
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

          <div className="mt-6 space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="label">Items</span>
              <span className="tabular-nums">
                {formatMoney(Number(order["items_total"]), currency)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="label">Shipping</span>
              <span className="tabular-nums">
                {formatMoney(Number(order["shipping_charge"]), currency)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="label">COD charge</span>
              <span className="tabular-nums">
                {formatMoney(Number(order["cod_charge"]), currency)}
              </span>
            </div>
            <div className="flex justify-between border-t border-border/60 pt-2">
              <span className="label !text-foreground">Total</span>
              <span className="tabular-nums">{formatMoney(Number(order["total"]), currency)}</span>
            </div>
          </div>

          <h2 className="label !text-foreground mt-12">Fulfilment</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="label">Order status</span>
              <select
                className={`${inputClass} mt-2`}
                value={String(order["order_status"])}
                onChange={(e) => save({ orderStatus: e.target.value as OrderStatus })}
              >
                {ORDER_STATUSES.map((s) => (
                  <option key={s} value={s} className="bg-background">
                    {ORDER_STATUS_LABELS[s]}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="label">Payment status</span>
              <select
                className={`${inputClass} mt-2`}
                value={String(order["payment_status"])}
                onChange={(e) => save({ paymentStatus: e.target.value })}
              >
                {Object.keys(PAYMENT_STATUS_LABELS).map((s) => (
                  <option key={s} value={s} className="bg-background">
                    {PAYMENT_STATUS_LABELS[s]}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="label">Courier</span>
              <input
                className={`${inputClass} mt-2`}
                value={courier}
                onChange={(e) => setCourier(e.target.value)}
              />
            </label>
            <label className="block">
              <span className="label">Tracking number</span>
              <input
                className={`${inputClass} mt-2`}
                value={tracking}
                onChange={(e) => setTracking(e.target.value)}
              />
            </label>
            <label className="block sm:col-span-2">
              <span className="label">Supplier order reference</span>
              <input
                className={`${inputClass} mt-2`}
                value={supplierRef}
                onChange={(e) => setSupplierRef(e.target.value)}
              />
            </label>
            <label className="block sm:col-span-2">
              <span className="label">Internal notes</span>
              <textarea
                className={`${inputClass} mt-2 min-h-[100px]`}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </label>
          </div>
          <button
            type="button"
            disabled={saving}
            onClick={() =>
              save({
                trackingNumber: tracking,
                trackingCourier: courier,
                supplierReference: supplierRef,
                adminNotes: notes,
              })
            }
            className="btn-cult mt-6"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save changes"}
          </button>
        </div>

        <aside>
          <div className="flex items-center justify-between gap-3">
            <h2 className="label !text-foreground">Shipping address</h2>
            <button type="button" onClick={copyAddress} className="label hover:!text-foreground">
              Copy
            </button>
          </div>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
            {String(order["customer_name"])}
            <br />
            {String(order["customer_phone"])}
            <br />
            {String(order["customer_email"])}
            <br />
            <br />
            {String(order["address_line1"])}, {String(order["address_line2"])}
            {order["landmark"] ? `, ${String(order["landmark"])}` : ""}
            <br />
            {String(order["city"])}, {String(order["state"])} {String(order["pincode"])}
          </p>

          {order["customer_notes"] ? (
            <>
              <h2 className="label !text-foreground mt-10">Customer notes</h2>
              <p className="mt-3 text-[0.75rem] text-muted-foreground">
                {String(order["customer_notes"])}
              </p>
            </>
          ) : null}

          {order["payment_reference"] ? (
            <>
              <h2 className="label !text-foreground mt-10">Payment reference</h2>
              <p className="mt-3 text-[0.75rem] text-muted-foreground">
                {String(order["payment_reference"])}
              </p>
            </>
          ) : null}

          <h2 className="label !text-foreground mt-10">History</h2>
          <ul className="mt-4 space-y-3">
            {history.map((h, i) => (
              <li key={i} className="text-[0.7rem] text-muted-foreground">
                <span className="uppercase text-foreground">
                  {ORDER_STATUS_LABELS[String(h["status"]) as never] ?? String(h["status"])}
                </span>{" "}
                · {new Date(String(h["created_at"])).toLocaleString("en-IN")}
                {h["note"] ? <div>{String(h["note"])}</div> : null}
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </div>
  );
}
