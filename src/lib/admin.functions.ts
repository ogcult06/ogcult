import { createServerFn } from "@tanstack/react-start";
import type { SupabaseClient } from "@supabase/supabase-js";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { Database } from "@/integrations/supabase/types";

import type { OrderStatus } from "./order-utils";

type AuthContext = { supabase: SupabaseClient<Database>; userId: string };

async function isAdmin(context: AuthContext) {
  const { data, error } = await context.supabase.rpc("has_role", {
    _user_id: context.userId,
    _role: "admin",
  });
  return !error && data === true;
}

async function assertAdmin(context: AuthContext) {
  if (!(await isAdmin(context))) throw new Error("Forbidden");
}

const ORDER_LIST_FIELDS =
  "id, order_number, created_at, customer_name, customer_phone, customer_email, city, state, total, currency, payment_method, payment_status, order_status, tracking_number";

export const adminWhoAmI = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    return { isAdmin: await isAdmin(context as AuthContext), userId: context.userId };
  });

export const listOrders = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (data: {
      search?: string;
      orderStatus?: string;
      paymentStatus?: string;
      paymentMethod?: string;
      limit?: number;
    }) => data,
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context as AuthContext);
    const { getAdmin } = await import("./store.server");
    const admin = await getAdmin();

    let query = admin
      .from("orders")
      .select(ORDER_LIST_FIELDS)
      .order("created_at", { ascending: false })
      .limit(Math.min(data.limit ?? 200, 500));

    const search = data.search?.trim();
    if (search) {
      const digits = search.replace(/[^\d]/g, "");
      const parts = [
        `order_number.ilike.%${search}%`,
        `customer_name.ilike.%${search}%`,
        `customer_email.ilike.%${search}%`,
      ];
      if (digits.length >= 4) parts.push(`customer_phone.ilike.%${digits}%`);
      query = query.or(parts.join(","));
    }
    if (data.orderStatus) query = query.eq("order_status", data.orderStatus as never);
    if (data.paymentStatus) query = query.eq("payment_status", data.paymentStatus as never);
    if (data.paymentMethod) query = query.eq("payment_method", data.paymentMethod as never);

    const { data: rows, error } = await query;
    if (error) throw new Error(error.message);
    return rows ?? [];
  });

export const getAdminOrder = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { id: string }) => data)
  .handler(async ({ data, context }) => {
    await assertAdmin(context as AuthContext);
    const { getAdmin } = await import("./store.server");
    const admin = await getAdmin();
    const { data: order, error } = await admin
      .from("orders")
      .select("*, order_items(*), order_status_history(*), payments(*)")
      .eq("id", data.id)
      .single();
    if (error) throw new Error(error.message);
    return order;
  });

export const updateOrder = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (data: {
      id: string;
      orderStatus?: OrderStatus;
      paymentStatus?: string;
      trackingNumber?: string;
      trackingCourier?: string;
      supplierReference?: string;
      adminNotes?: string;
      fulfillmentStatus?: string;
      statusNote?: string;
    }) => data,
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context as AuthContext);
    const { getAdmin } = await import("./store.server");
    const admin = await getAdmin();

    const patch: Record<string, unknown> = {};
    if (data.orderStatus) patch["order_status"] = data.orderStatus;
    if (data.paymentStatus) patch["payment_status"] = data.paymentStatus;
    if (data.trackingNumber !== undefined) patch["tracking_number"] = data.trackingNumber || null;
    if (data.trackingCourier !== undefined) patch["tracking_courier"] = data.trackingCourier || null;
    if (data.supplierReference !== undefined)
      patch["supplier_reference"] = data.supplierReference || null;
    if (data.adminNotes !== undefined) patch["admin_notes"] = data.adminNotes;
    if (data.fulfillmentStatus) patch["fulfillment_status"] = data.fulfillmentStatus;
    if (data.orderStatus === "shipped") patch["fulfillment_status"] = "fulfilled";

    const { error } = await admin.from("orders").update(patch as never).eq("id", data.id);
    if (error) throw new Error(error.message);

    if (data.orderStatus) {
      await admin.from("order_status_history").insert({
        order_id: data.id,
        status: data.orderStatus,
        note: data.statusNote ?? "Updated from admin dashboard",
        changed_by: context.userId,
      });
    }
    return { ok: true };
  });

export const getSettings = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context as AuthContext);
    const { getAdmin, razorpayKeys } = await import("./store.server");
    const admin = await getAdmin();
    const { data, error } = await admin.from("store_settings").select("*").eq("id", true).single();
    if (error) throw new Error(error.message);
    return {
      settings: data,
      gateway: { razorpayConfigured: razorpayKeys().configured },
      emailConfigured: Boolean(process.env["LOVABLE_API_KEY"]),
    };
  });

export const saveSettings = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: Record<string, unknown>) => data)
  .handler(async ({ data, context }) => {
    await assertAdmin(context as AuthContext);
    const { getAdmin } = await import("./store.server");
    const admin = await getAdmin();

    const allowed = [
      "cod_charge",
      "shipping_charge",
      "free_shipping_threshold",
      "store_email",
      "support_email",
      "support_phone",
      "order_prefix",
      "next_order_number",
      "prepaid_enabled",
      "cod_enabled",
      "processing_note",
    ];
    const patch: Record<string, unknown> = {};
    for (const key of allowed) if (key in data) patch[key] = data[key];

    const { error } = await admin.from("store_settings").update(patch as never).eq("id", true);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const exportOrdersCsv = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context as AuthContext);
    const { getAdmin } = await import("./store.server");
    const admin = await getAdmin();
    const { data, error } = await admin
      .from("orders")
      .select("*, order_items(product_title, size, quantity, unit_price)")
      .order("created_at", { ascending: false })
      .limit(2000);
    if (error) throw new Error(error.message);

    const headers = [
      "Order Number",
      "Date",
      "Name",
      "Phone",
      "Email",
      "Address",
      "Landmark",
      "City",
      "State",
      "PIN",
      "Items",
      "Items Total",
      "Shipping",
      "COD Charge",
      "Discount",
      "Total",
      "Payment Method",
      "Payment Status",
      "Order Status",
      "Payment Reference",
      "Tracking",
      "Supplier Ref",
      "Customer Notes",
      "Admin Notes",
    ];

    const escape = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
    const rows = (data ?? []).map((raw) => {
      const o = raw as unknown as Record<string, unknown>;
      const items = (o["order_items"] as Array<Record<string, unknown>> | null) ?? [];
      return [
        o["order_number"],
        o["created_at"],
        o["customer_name"],
        o["customer_phone"],
        o["customer_email"],
        `${o["address_line1"]}, ${o["address_line2"]}`,
        o["landmark"],
        o["city"],
        o["state"],
        o["pincode"],
        items.map((i) => `${i["product_title"]} (${i["size"]}) x${i["quantity"]}`).join(" | "),
        o["items_total"],
        o["shipping_charge"],
        o["cod_charge"],
        o["discount"],
        o["total"],
        o["payment_method"],
        o["payment_status"],
        o["order_status"],
        o["payment_reference"],
        o["tracking_number"],
        o["supplier_reference"],
        o["customer_notes"],
        o["admin_notes"],
      ]
        .map(escape)
        .join(",");
    });

    return { csv: [headers.map(escape).join(","), ...rows].join("\n") };
  });
