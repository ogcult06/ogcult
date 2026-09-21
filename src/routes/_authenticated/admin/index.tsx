import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Loader2 } from "lucide-react";

import { adminWhoAmI, exportOrdersCsv, listOrders } from "@/lib/admin.functions";
import { ORDER_STATUSES, ORDER_STATUS_LABELS, PAYMENT_STATUS_LABELS } from "@/lib/order-utils";
import { formatMoney } from "@/lib/shopify";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/admin/")({
  head: () => ({
    meta: [
      { title: "Orders — OG CULT Admin" },
      { name: "description", content: "OG CULT order management dashboard." },
      { property: "og:title", content: "Orders — OG CULT Admin" },
      { property: "og:description", content: "OG CULT order management dashboard." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminOrdersPage,
});

const selectClass =
  "border border-border bg-transparent px-3 py-2 text-[0.7rem] uppercase text-foreground outline-none focus:border-foreground";

interface OrderRow {
  id: string;
  order_number: string;
  created_at: string;
  customer_name: string;
  customer_phone: string;
  city: string;
  state: string;
  total: number;
  currency: string;
  payment_method: string;
  payment_status: string;
  order_status: string;
}

function AdminOrdersPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [orderStatus, setOrderStatus] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");

  const { data: me } = useQuery({ queryKey: ["admin-me"], queryFn: () => adminWhoAmI() });

  const filters = { search, orderStatus, paymentStatus, paymentMethod };
  const { data: orders, isFetching } = useQuery({
    queryKey: ["admin-orders", filters],
    queryFn: () => listOrders({ data: filters }) as Promise<OrderRow[]>,
    enabled: me?.isAdmin === true,
  });

  const signOut = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/auth" });
  };

  const downloadCsv = async () => {
    const { csv } = await exportOrdersCsv();
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `ogcult-orders-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (me && !me.isAdmin) {
    return (
      <div className="px-5 pt-28 pb-24 md:px-10">
        <h1 className="display-lg">No access</h1>
        <p className="mt-6 text-sm text-muted-foreground">
          This account is not an administrator.
        </p>
        <button type="button" onClick={signOut} className="btn-ghost-cult mt-8">
          Sign out
        </button>
      </div>
    );
  }

  return (
    <div className="px-5 pt-28 pb-24 md:px-10 md:pt-32">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <h1 className="display-lg">Orders</h1>
        <div className="flex flex-wrap gap-3">
          <Link to="/admin/settings" className="btn-ghost-cult">
            Settings
          </Link>
          <button type="button" onClick={downloadCsv} className="btn-ghost-cult">
            Export CSV
          </button>
          <button type="button" onClick={signOut} className="btn-ghost-cult">
            Sign out
          </button>
        </div>
      </header>

      <div className="mt-8 flex flex-wrap gap-3 border-t border-border/60 pt-8">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Order number, name, phone, email"
          className="min-w-[220px] flex-1 border border-border bg-transparent px-4 py-2 text-sm outline-none focus:border-foreground"
        />
        <select className={selectClass} value={orderStatus} onChange={(e) => setOrderStatus(e.target.value)}>
          <option value="">All statuses</option>
          {ORDER_STATUSES.map((s) => (
            <option key={s} value={s} className="bg-background">
              {ORDER_STATUS_LABELS[s]}
            </option>
          ))}
        </select>
        <select
          className={selectClass}
          value={paymentStatus}
          onChange={(e) => setPaymentStatus(e.target.value)}
        >
          <option value="">All payments</option>
          {Object.keys(PAYMENT_STATUS_LABELS).map((s) => (
            <option key={s} value={s} className="bg-background">
              {PAYMENT_STATUS_LABELS[s]}
            </option>
          ))}
        </select>
        <select
          className={selectClass}
          value={paymentMethod}
          onChange={(e) => setPaymentMethod(e.target.value)}
        >
          <option value="">COD + Prepaid</option>
          <option value="cod" className="bg-background">
            COD
          </option>
          <option value="prepaid" className="bg-background">
            Prepaid
          </option>
        </select>
      </div>

      {isFetching ? (
        <Loader2 className="mt-10 h-4 w-4 animate-spin text-muted-foreground" />
      ) : null}

      <ul className="mt-8 border-t border-border/60">
        {(orders ?? []).map((o) => (
          <li key={o.id} className="border-b border-border/60">
            <Link
              to="/admin/orders/$id"
              params={{ id: o.id }}
              className="flex flex-wrap items-center gap-x-6 gap-y-2 py-4 transition-opacity hover:opacity-70"
            >
              <span className="w-24 text-xs uppercase">{o.order_number}</span>
              <span className="label w-32">
                {new Date(o.created_at).toLocaleDateString("en-IN", { dateStyle: "medium" })}
              </span>
              <span className="min-w-[140px] flex-1 truncate text-xs uppercase">
                {o.customer_name}
              </span>
              <span className="label w-28">{o.customer_phone}</span>
              <span className="label w-32 truncate">
                {o.city}, {o.state}
              </span>
              <span className="w-20 text-xs tabular-nums">
                {formatMoney(Number(o.total), o.currency)}
              </span>
              <span className="label w-20">{o.payment_method === "cod" ? "COD" : "Prepaid"}</span>
              <span className="label w-28">{PAYMENT_STATUS_LABELS[o.payment_status]}</span>
              <span className="w-40 text-[0.7rem] uppercase">
                {ORDER_STATUS_LABELS[o.order_status as never] ?? o.order_status}
              </span>
            </Link>
          </li>
        ))}
      </ul>

      {orders && orders.length === 0 && !isFetching ? (
        <p className="mt-10 text-sm text-muted-foreground">No orders match these filters.</p>
      ) : null}
    </div>
  );
}
