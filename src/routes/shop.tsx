import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { ProductGrid } from "@/components/product-card";
import { Reveal } from "@/components/reveal";
import {
  isTShirtProduct,
  productsQueryOptions,
  sortProductsForDisplay,
  type ShopifyProduct,
} from "@/lib/shopify";

function matchesCategoryFilter(product: ShopifyProduct["node"], filter: string) {
  const key = filter.toLowerCase();
  const haystack = `${product.productType} ${product.title} ${product.tags.join(" ")}`;
  if (key === "t-shirts" || key === "t-shirt" || key === "tees") return isTShirtProduct(product);
  if (key === "hoodies" || key === "hoodie") return /hoodie/i.test(haystack);
  if (key === "joggers" || key === "jogger" || key === "sweatpants") {
    return /jogger|sweatpant|track\s*pant|cargo/i.test(haystack);
  }
  if (key === "sweatshirts" || key === "sweatshirt") return /sweatshirt|crewneck/i.test(haystack);
  if (key === "new drop") return product.tags.some((t) => /new/i.test(t));
  return haystack.toLowerCase().includes(key);
}

export const Route = createFileRoute("/shop")({
  validateSearch: (search: Record<string, unknown>): { filter?: string } => {
    const raw = search["filter"];
    return typeof raw === "string" && raw.trim() ? { filter: raw.trim() } : {};
  },
  head: () => ({
    meta: [
      { title: "Shop the OG Collection — OG CULT" },
      {
        name: "description",
        content:
          "Shop OG CULT: heavyweight tees, hoodies and outerwear cut in limited runs. Sizes and stock update live from our store.",
      },
      { property: "og:title", content: "Shop the OG Collection — OG CULT" },
      {
        property: "og:description",
        content: "Heavyweight streetwear in limited runs. Shop the OG CULT collection.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:url", content: "/shop" },
    ],
    links: [{ rel: "canonical", href: "/shop" }],
  }),
  component: ShopPage,
});

function ShopPage() {
  const { filter } = Route.useSearch();
  const { data, isLoading } = useQuery(productsQueryOptions());

  const products = useMemo(() => {
    const ordered = sortProductsForDisplay(data ?? []);
    if (!filter) return ordered;
    return ordered.filter((p) => matchesCategoryFilter(p.node, filter));
  }, [data, filter]);

  return (
    <div className="px-5 pt-28 pb-24 md:px-10 md:pt-36">
      <Reveal className="flex flex-wrap items-end justify-between gap-4">
        <h1 className="display-lg">{filter ?? "Shop the OG collection"}</h1>
        {filter && (
          <Link to="/shop" className="nav-link">
            View all
          </Link>
        )}
      </Reveal>

      <div className="mt-12">
        <ProductGrid products={products} isLoading={isLoading} />
      </div>
    </div>
  );
}
