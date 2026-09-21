/**
 * OG CULT catalogue.
 *
 * Products now live in the project's own database (Lovable Cloud). The data
 * shape below is unchanged from the previous storefront integration so every
 * existing page/component keeps working untouched.
 */
import { supabase } from "@/integrations/supabase/client";

export interface ShopifyVariant {
  id: string;
  title: string;
  price: { amount: string; currencyCode: string };
  availableForSale: boolean;
  quantityAvailable?: number | null;
  selectedOptions: Array<{ name: string; value: string }>;
}

export interface ShopifyProduct {
  node: {
    id: string;
    title: string;
    description: string;
    handle: string;
    productType: string;
    tags: string[];
    createdAt: string;
    availableForSale: boolean;
    compareAtPrice?: string | null;
    priceRange: { minVariantPrice: { amount: string; currencyCode: string } };
    images: { edges: Array<{ node: { url: string; altText: string | null } }> };
    variants: { edges: Array<{ node: ShopifyVariant }> };
    options: Array<{ name: string; values: string[] }>;
  };
}

type DbVariant = {
  id: string;
  size: string;
  price: number | string;
  currency: string;
  available: boolean;
  stock: number | null;
  position: number;
};

type DbProduct = {
  id: string;
  handle: string;
  title: string;
  description: string;
  product_type: string;
  tags: string[] | null;
  images: Array<{ url: string; altText: string | null }> | null;
  compare_at_price: number | string | null;
  sort_order: number;
  created_at: string;
  product_variants: DbVariant[] | null;
};

const PRODUCT_SELECT =
  "id, handle, title, description, product_type, tags, images, compare_at_price, sort_order, created_at, product_variants(id, size, price, currency, available, stock, position)";

function mapProduct(row: DbProduct): ShopifyProduct {
  const variants = [...(row.product_variants ?? [])].sort((a, b) => a.position - b.position);
  const currency = variants[0]?.currency ?? "INR";
  const prices = variants.map((v) => Number(v.price));
  const minPrice = prices.length ? Math.min(...prices) : 0;

  return {
    node: {
      id: row.id,
      title: row.title,
      description: row.description ?? "",
      handle: row.handle,
      productType: row.product_type ?? "",
      tags: row.tags ?? [],
      createdAt: row.created_at,
      availableForSale: variants.some((v) => v.available),
      compareAtPrice: row.compare_at_price != null ? String(row.compare_at_price) : null,
      priceRange: { minVariantPrice: { amount: String(minPrice), currencyCode: currency } },
      images: { edges: (row.images ?? []).map((img) => ({ node: img })) },
      variants: {
        edges: variants.map((v) => ({
          node: {
            id: v.id,
            title: v.size,
            price: { amount: String(Number(v.price)), currencyCode: v.currency },
            availableForSale: v.available,
            quantityAvailable: v.stock,
            selectedOptions: [{ name: "Size", value: v.size }],
          },
        })),
      },
      options: [{ name: "Size", values: sortSizes(variants.map((v) => v.size)) }],
    },
  };
}

export async function fetchProducts(_first = 50, query?: string): Promise<ShopifyProduct[]> {
  let request = supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .eq("active", true)
    .order("sort_order", { ascending: true });

  if (query) request = request.ilike("title", `%${query}%`);

  const { data, error } = await request;
  if (error) throw new Error(error.message);
  return ((data ?? []) as unknown as DbProduct[]).map(mapProduct);
}

export async function fetchProductByHandle(handle: string): Promise<ShopifyProduct | null> {
  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .eq("handle", handle)
    .eq("active", true)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data ? mapProduct(data as unknown as DbProduct) : null;
}

export const productsQueryOptions = (query?: string) => ({
  queryKey: ["catalog", "products", query ?? "all"] as const,
  queryFn: () => fetchProducts(50, query),
  staleTime: 60_000,
});

export const productQueryOptions = (handle: string) => ({
  queryKey: ["catalog", "product", handle] as const,
  queryFn: () => fetchProductByHandle(handle),
  staleTime: 60_000,
});

export function formatMoney(amount: string | number, currencyCode: string) {
  const value = typeof amount === "string" ? parseFloat(amount) : amount;
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currencyCode,
      maximumFractionDigits: value % 1 === 0 ? 0 : 2,
    }).format(value);
  } catch {
    return `${currencyCode} ${value.toFixed(2)}`;
  }
}

export function isTShirtProduct(product: ShopifyProduct["node"]) {
  return /t[- ]?shirt|\btee\b/i.test(
    `${product.productType} ${product.title} ${product.tags.join(" ")}`,
  );
}

export function sortProductsForDisplay<T extends { node: { handle: string; createdAt: string } }>(
  products: T[],
): T[] {
  // Order is stored per product in the database (sort_order) and already
  // applied by the query, so this keeps the incoming order.
  return [...products];
}

/** Size option values across variants, in a sensible clothing order when possible. */
const SIZE_ORDER = ["XXS", "XS", "S", "M", "L", "XL", "XXL", "XXXL", "2XL", "3XL"];

export function sortSizes(values: string[]) {
  return [...values].sort((a, b) => {
    const ia = SIZE_ORDER.indexOf(a.toUpperCase());
    const ib = SIZE_ORDER.indexOf(b.toUpperCase());
    if (ia !== -1 && ib !== -1) return ia - ib;
    if (ia !== -1) return -1;
    if (ib !== -1) return 1;
    return a.localeCompare(b, undefined, { numeric: true });
  });
}

export const LOW_STOCK_THRESHOLD = 4;

export function variantStockLabel(variant: ShopifyVariant | undefined) {
  if (!variant) return null;
  if (!variant.availableForSale) return "SOLD OUT";
  const qty = variant.quantityAvailable;
  if (qty != null && qty <= LOW_STOCK_THRESHOLD) return "LOW STOCK";
  return null;
}
