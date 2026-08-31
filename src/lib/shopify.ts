import { toast } from "sonner";

export const SHOPIFY_API_VERSION = "2025-07";
export const SHOPIFY_STORE_PERMANENT_DOMAIN = "zbqxcr-pr.myshopify.com";
export const SHOPIFY_STOREFRONT_URL = `https://${SHOPIFY_STORE_PERMANENT_DOMAIN}/api/${SHOPIFY_API_VERSION}/graphql.json`;
export const SHOPIFY_STOREFRONT_TOKEN = "c1b208045cf6d6702aa84b0d1f25232a";

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
    priceRange: { minVariantPrice: { amount: string; currencyCode: string } };
    images: { edges: Array<{ node: { url: string; altText: string | null } }> };
    variants: { edges: Array<{ node: ShopifyVariant }> };
    options: Array<{ name: string; values: string[] }>;
  };
}

const PRODUCT_FIELDS = `
  id
  title
  description
  handle
  productType
  tags
  createdAt
  availableForSale
  priceRange { minVariantPrice { amount currencyCode } }
  images(first: 20) { edges { node { url altText } } }
  variants(first: 25) {
    edges {
      node {
        id
        title
        price { amount currencyCode }
        availableForSale
        selectedOptions { name value }
      }
    }
  }
  options { name values }
`;

export const STOREFRONT_QUERY = `
  query GetProducts($first: Int!, $query: String) {
    products(first: $first, query: $query) {
      edges { node { ${PRODUCT_FIELDS} } }
    }
  }
`;

export const PRODUCT_BY_HANDLE_QUERY = `
  query GetProduct($handle: String!) {
    product(handle: $handle) { ${PRODUCT_FIELDS} }
  }
`;

export async function storefrontApiRequest(query: string, variables: Record<string, unknown> = {}) {
  const response = await fetch(SHOPIFY_STOREFRONT_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Storefront-Access-Token": SHOPIFY_STOREFRONT_TOKEN,
    },
    body: JSON.stringify({ query, variables }),
  });

  if (response.status === 402) {
    toast.error("Shopify: Payment required", {
      description:
        "Shopify API access requires an active Shopify billing plan. Visit https://admin.shopify.com to upgrade.",
    });
    return;
  }

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data = await response.json();

  if (data.errors) {
    throw new Error(
      `Error calling Shopify: ${data.errors.map((e: { message: string }) => e.message).join(", ")}`,
    );
  }

  return data;
}

export async function fetchProducts(first = 50, query?: string): Promise<ShopifyProduct[]> {
  const data = await storefrontApiRequest(STOREFRONT_QUERY, { first, query: query ?? null });
  return data?.data?.products?.edges ?? [];
}

export async function fetchProductByHandle(handle: string): Promise<ShopifyProduct | null> {
  const data = await storefrontApiRequest(PRODUCT_BY_HANDLE_QUERY, { handle });
  const node = data?.data?.product;
  return node ? { node } : null;
}

export const productsQueryOptions = (query?: string) => ({
  queryKey: ["shopify", "products", query ?? "all"] as const,
  queryFn: () => fetchProducts(50, query),
  staleTime: 60_000,
});

export const productQueryOptions = (handle: string) => ({
  queryKey: ["shopify", "product", handle] as const,
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
  if (qty != null && qty <= LOW_STOCK_THRESHOLD) {
    return "LOW STOCK";
  }
  return null;
}
