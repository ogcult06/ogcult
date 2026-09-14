import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ProductGrid } from "@/components/product-card";
import { Reveal } from "@/components/reveal";
import { productsQueryOptions, sortProductsForDisplay } from "@/lib/shopify";

export const Route = createFileRoute("/shop")({
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
      { property: "og:url", content: "/shop" },
    ],
    links: [{ rel: "canonical", href: "/shop" }],
  }),
  component: ShopPage,
});

function ShopPage() {
  const { data, isLoading } = useQuery(productsQueryOptions());

  return (
    <div className="px-5 pt-28 pb-24 md:px-10 md:pt-36">
      <Reveal>
        <h1 className="display-lg">Shop the OG collection</h1>
      </Reveal>

      <div className="mt-12">
        <ProductGrid products={sortProductsForDisplay(data ?? [])} isLoading={isLoading} />
      </div>
    </div>
  );
}
