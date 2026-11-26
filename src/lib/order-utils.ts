/** Shared, client-safe order helpers (validation, labels, totals). */

export const INDIAN_STATES = [
  "Andaman and Nicobar Islands",
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chandigarh",
  "Chhattisgarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jammu and Kashmir",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Ladakh",
  "Lakshadweep",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Puducherry",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
] as const;

export const ORDER_STATUSES = [
  "pending_payment",
  "confirmed",
  "processing",
  "ordered_from_supplier",
  "shipped",
  "delivered",
  "cancelled",
  "returned",
  "refunded",
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending_payment: "Pending Payment",
  confirmed: "Confirmed",
  processing: "Processing",
  ordered_from_supplier: "Ordered from Supplier",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
  returned: "Returned",
  refunded: "Refunded",
};

/** The forward-moving journey shown to customers on the tracking page. */
export const CUSTOMER_TIMELINE: OrderStatus[] = [
  "confirmed",
  "processing",
  "ordered_from_supplier",
  "shipped",
  "delivered",
];

export const PAYMENT_STATUS_LABELS: Record<string, string> = {
  pending: "Pending",
  paid: "Paid",
  failed: "Failed",
  refunded: "Refunded",
  cod_due: "COD — due on delivery",
  cod_collected: "COD — collected",
};

export function normalisePhone(value: string) {
  return value.replace(/[^\d]/g, "").replace(/^(0|91)(?=\d{10}$)/, "");
}

export function isValidIndianMobile(value: string) {
  return /^[6-9]\d{9}$/.test(normalisePhone(value));
}

export function isValidPincode(value: string) {
  return /^[1-9]\d{5}$/.test(value.trim());
}

export function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.trim());
}

export interface CheckoutCharges {
  codCharge: number;
  shippingCharge: number;
  freeShippingThreshold: number;
}

export function computeTotals(
  itemsTotal: number,
  paymentMethod: "prepaid" | "cod",
  charges: CheckoutCharges,
) {
  const shipping =
    charges.freeShippingThreshold > 0 && itemsTotal >= charges.freeShippingThreshold
      ? 0
      : charges.shippingCharge;
  const cod = paymentMethod === "cod" ? charges.codCharge : 0;
  return {
    itemsTotal,
    shipping,
    cod,
    total: Math.round((itemsTotal + shipping + cod) * 100) / 100,
  };
}

export function formatOrderAddress(order: {
  address_line1: string;
  address_line2?: string | null;
  landmark?: string | null;
  city: string;
  state: string;
  pincode: string;
}) {
  return [
    order.address_line1,
    order.address_line2 || null,
    order.landmark ? `Landmark: ${order.landmark}` : null,
    `${order.city}, ${order.state} ${order.pincode}`,
    "India",
  ]
    .filter(Boolean)
    .join("\n");
}

const CSV_FORMULA_PREFIX = /^[\t\r]|^\s*[=+\-@]/;

/** Neutralizes spreadsheet formula prefixes (=, +, -, @, tab, CR) and quotes a CSV cell. */
export function escapeCsvCell(value: unknown): string {
  const str = String(value ?? "");
  const safe = CSV_FORMULA_PREFIX.test(str) ? `'${str}` : str;
  return `"${safe.replace(/"/g, '""')}"`;
}
