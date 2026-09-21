import { createServerFn } from "@tanstack/react-start";

import {
  computeTotals,
  isValidEmail,
  isValidIndianMobile,
  isValidPincode,
  normalisePhone,
} from "./order-utils";

export interface TrackedOrder {
  order_number: string;
  created_at: string;
  order_status: string;
  payment_status: string;
  payment_method: string;
  total: number;
  currency: string;
  tracking_number: string | null;
  tracking_courier: string | null;
  customer_name: string;
  city: string;
  state: string;
  order_items: Array<{
    product_title: string;
    size: string;
    quantity: number;
    image_url: string | null;
  }>;
}

export interface CheckoutLineInput {
  variantId: string;
  quantity: number;
}

export interface CheckoutInput {
  items: CheckoutLineInput[];
  paymentMethod: "prepaid" | "cod";
  customer: {
    name: string;
    phone: string;
    email: string;
    addressLine1: string;
    addressLine2: string;
    landmark: string;
    city: string;
    state: string;
    pincode: string;
    notes: string;
  };
}

function validateCheckout(input: CheckoutInput) {
  const c = input.customer;
  const errors: string[] = [];
  if (!input.items?.length) errors.push("Your bag is empty.");
  if (input.items?.some((i) => !i.variantId || i.quantity < 1 || i.quantity > 10))
    errors.push("Invalid quantity.");
  if (!c?.name?.trim() || c.name.trim().length < 2) errors.push("Enter your full name.");
  if (!isValidIndianMobile(c?.phone ?? "")) errors.push("Enter a valid 10-digit Indian mobile number.");
  if (!isValidEmail(c?.email ?? "")) errors.push("Enter a valid email address.");
  if (!c?.addressLine1?.trim()) errors.push("Enter your house/flat number.");
  if (!c?.addressLine2?.trim()) errors.push("Enter your street/area.");
  if (!c?.city?.trim()) errors.push("Enter your city.");
  if (!c?.state?.trim()) errors.push("Select your state.");
  if (!isValidPincode(c?.pincode ?? "")) errors.push("Enter a valid 6-digit PIN code.");
  if (input.paymentMethod !== "prepaid" && input.paymentMethod !== "cod")
    errors.push("Choose a payment method.");
  return errors;
}

/** Public charges + payment availability for the checkout screen. */
export const getCheckoutConfig = createServerFn({ method: "GET" }).handler(async () => {
  const { loadSettings, razorpayKeys } = await import("./store.server");
  const s = await loadSettings();
  const { configured } = razorpayKeys();
  return {
    codCharge: s.cod_charge,
    shippingCharge: s.shipping_charge,
    freeShippingThreshold: s.free_shipping_threshold,
    currency: s.currency,
    codEnabled: s.cod_enabled,
    prepaidEnabled: s.prepaid_enabled && configured,
    supportEmail: s.support_email,
    supportPhone: s.support_phone,
    processingNote: s.processing_note,
  };
});

/**
 * Creates the order. Prices, charges and totals are always recalculated on the
 * server from the database — never trusted from the browser.
 *
 * COD  -> order is CONFIRMED immediately.
 * Prepaid -> order is PENDING PAYMENT until the gateway confirms the payment.
 */
export const createOrder = createServerFn({ method: "POST" })
  .inputValidator((data: CheckoutInput) => data)
  .handler(async ({ data }) => {
    const errors = validateCheckout(data);
    if (errors.length) return { ok: false as const, errors };

    const { getAdmin, loadSettings, createRazorpayOrder } = await import("./store.server");
    const admin = await getAdmin();
    const settings = await loadSettings();

    if (data.paymentMethod === "cod" && !settings.cod_enabled)
      return { ok: false as const, errors: ["Cash on Delivery is currently unavailable."] };

    const variantIds = data.items.map((i) => i.variantId);
    const { data: variantRows, error: variantError } = await admin
      .from("product_variants")
      .select("id, size, price, currency, available, product_id, products(id, title, handle, images)")
      .in("id", variantIds);

    if (variantError) return { ok: false as const, errors: ["Could not load products."] };

    const variants = (variantRows ?? []) as unknown as Array<{
      id: string;
      size: string;
      price: number | string;
      currency: string;
      available: boolean;
      product_id: string;
      products: {
        id: string;
        title: string;
        handle: string;
        images: Array<{ url: string }> | null;
      } | null;
    }>;

    if (variants.length !== new Set(variantIds).size)
      return { ok: false as const, errors: ["Some items are no longer available."] };

    const lines = data.items.map((line) => {
      const variant = variants.find((v) => v.id === line.variantId)!;
      const unitPrice = Number(variant.price);
      return {
        variant,
        quantity: line.quantity,
        unitPrice,
        lineTotal: Math.round(unitPrice * line.quantity * 100) / 100,
      };
    });

    const unavailable = lines.filter((l) => !l.variant.available);
    if (unavailable.length)
      return {
        ok: false as const,
        errors: unavailable.map(
          (l) => `${l.variant.products?.title ?? "Item"} (${l.variant.size}) is sold out.`,
        ),
      };

    const itemsTotal = Math.round(lines.reduce((s, l) => s + l.lineTotal, 0) * 100) / 100;
    const totals = computeTotals(itemsTotal, data.paymentMethod, {
      codCharge: settings.cod_charge,
      shippingCharge: settings.shipping_charge,
      freeShippingThreshold: settings.free_shipping_threshold,
    });

    const { data: numberRow, error: numberError } = await admin.rpc("next_order_number");
    if (numberError || !numberRow)
      return { ok: false as const, errors: ["Could not generate an order number."] };
    const orderNumber = String(numberRow);

    const isCod = data.paymentMethod === "cod";
    const c = data.customer;

    const { data: inserted, error: insertError } = await admin
      .from("orders")
      .insert({
        order_number: orderNumber,
        customer_name: c.name.trim(),
        customer_phone: normalisePhone(c.phone),
        customer_email: c.email.trim().toLowerCase(),
        address_line1: c.addressLine1.trim(),
        address_line2: c.addressLine2.trim(),
        landmark: c.landmark?.trim() ?? "",
        city: c.city.trim(),
        state: c.state.trim(),
        pincode: c.pincode.trim(),
        items_total: itemsTotal,
        shipping_charge: totals.shipping,
        cod_charge: totals.cod,
        total: totals.total,
        currency: settings.currency,
        payment_method: data.paymentMethod,
        payment_status: isCod ? "cod_due" : "pending",
        order_status: isCod ? "confirmed" : "pending_payment",
        confirmed_at: isCod ? new Date().toISOString() : null,
        customer_notes: c.notes?.trim() ?? "",
      })
      .select("id, order_number, public_token, total, currency")
      .single();

    if (insertError || !inserted) {
      console.error("Order insert failed", insertError);
      return { ok: false as const, errors: ["Could not place your order. Please try again."] };
    }

    const order = inserted as unknown as {
      id: string;
      order_number: string;
      public_token: string;
      total: number;
      currency: string;
    };

    await admin.from("order_items").insert(
      lines.map((l) => ({
        order_id: order.id,
        product_id: l.variant.products?.id ?? null,
        variant_id: l.variant.id,
        product_title: l.variant.products?.title ?? "OG CULT item",
        product_handle: l.variant.products?.handle ?? "",
        image_url: l.variant.products?.images?.[0]?.url ?? null,
        size: l.variant.size,
        quantity: l.quantity,
        unit_price: l.unitPrice,
        line_total: l.lineTotal,
      })),
    );

    await admin.from("order_status_history").insert({
      order_id: order.id,
      status: isCod ? "confirmed" : "pending_payment",
      note: isCod ? "COD order placed" : "Awaiting online payment",
    });

    if (isCod) {
      const { sendOrderConfirmationOnce } = await import("./store.server");
      await sendOrderConfirmationOnce(order.id);
      return {
        ok: true as const,
        orderNumber: order.order_number,
        token: order.public_token,
        paymentMethod: "cod" as const,
      };
    }

    try {
      const rzp = await createRazorpayOrder({
        amountInRupees: Number(order.total),
        currency: order.currency,
        receipt: order.order_number,
        notes: { order_number: order.order_number },
      });

      await admin
        .from("orders")
        .update({ gateway_order_id: rzp.id })
        .eq("id", order.id);
      await admin.from("payments").insert({
        order_id: order.id,
        gateway_order_id: rzp.id,
        amount: Number(order.total),
        currency: order.currency,
        status: "created",
      });

      const { razorpayKeys } = await import("./store.server");
      return {
        ok: true as const,
        orderNumber: order.order_number,
        token: order.public_token,
        paymentMethod: "prepaid" as const,
        razorpay: {
          keyId: razorpayKeys().keyId!,
          orderId: rzp.id,
          amount: rzp.amount,
          currency: rzp.currency,
        },
      };
    } catch (error) {
      console.error("Razorpay order failed", error);
      return {
        ok: false as const,
        errors: [
          "Online payment is not available right now. Please choose Cash on Delivery or try again later.",
        ],
      };
    }
  });

/** Verifies the gateway signature server-side, then marks the order paid. */
export const verifyPayment = createServerFn({ method: "POST" })
  .inputValidator(
    (data: {
      orderNumber: string;
      razorpayOrderId: string;
      razorpayPaymentId: string;
      razorpaySignature: string;
    }) => data,
  )
  .handler(async ({ data }) => {
    const { getAdmin, verifyCheckoutSignature, sendOrderConfirmationOnce } = await import(
      "./store.server"
    );
    const admin = await getAdmin();

    const { data: row } = await admin
      .from("orders")
      .select("id, order_number, public_token, gateway_order_id, payment_status")
      .eq("order_number", data.orderNumber)
      .single();

    if (!row) return { ok: false as const, error: "Order not found." };
    const order = row as unknown as {
      id: string;
      order_number: string;
      public_token: string;
      gateway_order_id: string | null;
      payment_status: string;
    };

    if (order.payment_status === "paid")
      return { ok: true as const, token: order.public_token, orderNumber: order.order_number };

    if (!order.gateway_order_id || order.gateway_order_id !== data.razorpayOrderId)
      return { ok: false as const, error: "Payment could not be matched to this order." };

    const valid = verifyCheckoutSignature(
      data.razorpayOrderId,
      data.razorpayPaymentId,
      data.razorpaySignature,
    );
    if (!valid) {
      await admin.from("payments").insert({
        order_id: order.id,
        gateway_order_id: data.razorpayOrderId,
        gateway_payment_id: data.razorpayPaymentId,
        amount: 0,
        status: "signature_invalid",
      });
      return { ok: false as const, error: "Payment verification failed." };
    }

    await admin
      .from("orders")
      .update({
        payment_status: "paid",
        order_status: "confirmed",
        gateway_payment_id: data.razorpayPaymentId,
        gateway_signature: data.razorpaySignature,
        payment_reference: data.razorpayPaymentId,
        confirmed_at: new Date().toISOString(),
      })
      .eq("id", order.id);

    await admin.from("order_status_history").insert({
      order_id: order.id,
      status: "confirmed",
      note: `Payment verified (${data.razorpayPaymentId})`,
    });
    await admin.from("payments").insert({
      order_id: order.id,
      gateway_order_id: data.razorpayOrderId,
      gateway_payment_id: data.razorpayPaymentId,
      amount: 0,
      status: "verified",
    });

    await sendOrderConfirmationOnce(order.id);

    return { ok: true as const, token: order.public_token, orderNumber: order.order_number };
  });

const ORDER_PUBLIC_FIELDS =
  "order_number, created_at, customer_name, customer_email, customer_phone, address_line1, address_line2, landmark, city, state, pincode, items_total, shipping_charge, cod_charge, discount, total, currency, payment_method, payment_status, order_status, tracking_number, tracking_courier, order_items(product_title, product_handle, image_url, size, quantity, unit_price, line_total)";

/** Confirmation page read — requires the one-time token issued at checkout. */
export const getOrderByToken = createServerFn({ method: "GET" })
  .inputValidator((data: { orderNumber: string; token: string }) => data)
  .handler(async ({ data }) => {
    if (!data.orderNumber || !data.token) return null;
    const { getAdmin, loadSettings } = await import("./store.server");
    const admin = await getAdmin();
    const { data: row } = await admin
      .from("orders")
      .select(ORDER_PUBLIC_FIELDS)
      .eq("order_number", data.orderNumber)
      .eq("public_token", data.token)
      .maybeSingle();
    if (!row) return null;
    const settings = await loadSettings();
    return {
      order: row,
      support: {
        email: settings.support_email,
        phone: settings.support_phone,
        processingNote: settings.processing_note,
      },
    };
  });

/** Customer tracking — order number plus the phone or email on the order. */
export const trackOrder = createServerFn({ method: "POST" })
  .inputValidator((data: { orderNumber: string; contact: string }) => data)
  .handler(async ({ data }) => {
    const orderNumber = (data.orderNumber ?? "").trim().toUpperCase();
    const contact = (data.contact ?? "").trim();
    if (!orderNumber || !contact) return { ok: false as const, error: "Enter your details." };

    const { getAdmin } = await import("./store.server");
    const admin = await getAdmin();
    const { data: row } = await admin
      .from("orders")
      .select(
        "order_number, created_at, order_status, payment_status, payment_method, total, currency, tracking_number, tracking_courier, customer_name, customer_email, customer_phone, city, state, order_items(product_title, size, quantity, image_url)",
      )
      .eq("order_number", orderNumber)
      .maybeSingle();

    if (!row) return { ok: false as const, error: "No order found with those details." };
    const order = row as unknown as Record<string, unknown>;

    const matches =
      normalisePhone(contact) === String(order["customer_phone"]) ||
      contact.toLowerCase() === String(order["customer_email"]).toLowerCase();
    if (!matches) return { ok: false as const, error: "No order found with those details." };

    delete order["customer_email"];
    delete order["customer_phone"];
    return { ok: true as const, order: JSON.parse(JSON.stringify(order)) as TrackedOrder };
  });
