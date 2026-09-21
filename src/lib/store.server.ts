/** Server-only helpers for the OG CULT ordering system. */
import { createHmac, timingSafeEqual } from "crypto";

export interface StoreSettings {
  cod_charge: number;
  shipping_charge: number;
  free_shipping_threshold: number;
  store_email: string;
  support_email: string;
  support_phone: string;
  order_prefix: string;
  next_order_number: number;
  currency: string;
  prepaid_enabled: boolean;
  cod_enabled: boolean;
  processing_note: string;
}

export async function getAdmin() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin;
}

export async function loadSettings(): Promise<StoreSettings> {
  const admin = await getAdmin();
  const { data, error } = await admin.from("store_settings").select("*").eq("id", true).single();
  if (error || !data) throw new Error("Store settings unavailable");
  const s = data as unknown as Record<string, unknown>;
  return {
    cod_charge: Number(s["cod_charge"]),
    shipping_charge: Number(s["shipping_charge"]),
    free_shipping_threshold: Number(s["free_shipping_threshold"]),
    store_email: String(s["store_email"] ?? ""),
    support_email: String(s["support_email"] ?? ""),
    support_phone: String(s["support_phone"] ?? ""),
    order_prefix: String(s["order_prefix"] ?? "OG-"),
    next_order_number: Number(s["next_order_number"]),
    currency: String(s["currency"] ?? "INR"),
    prepaid_enabled: Boolean(s["prepaid_enabled"]),
    cod_enabled: Boolean(s["cod_enabled"]),
    processing_note: String(s["processing_note"] ?? ""),
  };
}

/* ------------------------------ Razorpay ------------------------------ */

export function razorpayKeys() {
  const keyId = process.env["RAZORPAY_KEY_ID"];
  const keySecret = process.env["RAZORPAY_KEY_SECRET"];
  return { keyId, keySecret, configured: Boolean(keyId && keySecret) };
}

export async function createRazorpayOrder(input: {
  amountInRupees: number;
  currency: string;
  receipt: string;
  notes?: Record<string, string>;
}) {
  const { keyId, keySecret, configured } = razorpayKeys();
  if (!configured) throw new Error("PAYMENT_GATEWAY_NOT_CONFIGURED");

  const response = await fetch("https://api.razorpay.com/v1/orders", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Basic ${btoa(`${keyId}:${keySecret}`)}`,
    },
    body: JSON.stringify({
      amount: Math.round(input.amountInRupees * 100),
      currency: input.currency,
      receipt: input.receipt,
      notes: input.notes ?? {},
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    console.error("Razorpay order create failed", response.status, text);
    throw new Error("PAYMENT_GATEWAY_ERROR");
  }

  return (await response.json()) as { id: string; amount: number; currency: string };
}

function safeEqualHex(a: string, b: string) {
  const bufA = Buffer.from(a, "utf8");
  const bufB = Buffer.from(b, "utf8");
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

/** Razorpay Checkout handler signature: HMAC(order_id|payment_id, key_secret). */
export function verifyCheckoutSignature(orderId: string, paymentId: string, signature: string) {
  const { keySecret, configured } = razorpayKeys();
  if (!configured) return false;
  const expected = createHmac("sha256", keySecret!).update(`${orderId}|${paymentId}`).digest("hex");
  return safeEqualHex(expected, signature);
}

/** Razorpay webhook signature: HMAC(raw body, webhook secret). */
export function verifyWebhookSignature(rawBody: string, signature: string) {
  const secret = process.env["RAZORPAY_WEBHOOK_SECRET"];
  if (!secret) return false;
  const expected = createHmac("sha256", secret).update(rawBody).digest("hex");
  return safeEqualHex(expected, signature);
}

/* ------------------------------ Email ------------------------------ */

/**
 * Sends the order-confirmation email exactly once per order.
 * Silently skips (and records nothing) while email sending is not configured yet.
 */
export async function sendOrderConfirmationOnce(orderId: string) {
  const admin = await getAdmin();
  const { data } = await admin
    .from("orders")
    .select("*, order_items(*)")
    .eq("id", orderId)
    .single();
  if (!data) return { sent: false, reason: "order_not_found" };
  const order = data as unknown as Record<string, unknown>;
  if (order["confirmation_email_sent_at"]) return { sent: false, reason: "already_sent" };

  try {
    const settings = await loadSettings();
    // The template registry only exists once app emails are set up for the
    // project; until then confirmation emails are skipped, not faked.
    const mod = await import("./email-templates/send-email").catch(() => null);
    if (!mod || typeof (mod as { sendTemplateEmail?: unknown }).sendTemplateEmail !== "function") {
      return { sent: false, reason: "email_not_configured" };
    }
    const sendTemplateEmail = (
      mod as unknown as {
        sendTemplateEmail: (
          template: string,
          to: string,
          opts: { templateData: Record<string, unknown>; idempotencyKey: string },
        ) => Promise<{ sent: boolean }>;
      }
    ).sendTemplateEmail;

    const result = await sendTemplateEmail("order-confirmation", String(order["customer_email"]), {
      templateData: {
        orderNumber: order["order_number"],
        orderDate: order["created_at"],
        customerName: order["customer_name"],
        items: order["order_items"],
        itemsTotal: order["items_total"],
        shippingCharge: order["shipping_charge"],
        codCharge: order["cod_charge"],
        total: order["total"],
        currency: order["currency"],
        paymentMethod: order["payment_method"],
        address: {
          line1: order["address_line1"],
          line2: order["address_line2"],
          landmark: order["landmark"],
          city: order["city"],
          state: order["state"],
          pincode: order["pincode"],
        },
        processingNote: settings.processing_note,
        supportEmail: settings.support_email,
        supportPhone: settings.support_phone,
      },
      idempotencyKey: `order-confirmation-${order["order_number"]}`,
    });

    if (result.sent) {
      await admin
        .from("orders")
        .update({ confirmation_email_sent_at: new Date().toISOString() })
        .eq("id", orderId);
    }
    return result;
  } catch (error) {
    console.error("Order confirmation email failed", error);
    return { sent: false, reason: "error" };
  }
}
