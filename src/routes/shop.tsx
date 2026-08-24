import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ProductGrid } from "@/components/product-card";
import { Reveal } from "@/components/reveal";
import { productsQueryOptions } from "@/lib/shopify";
import { shopFilters } from "@/lib/site-content";

type ShopSearch = { filter?: string };

export const Route = createFileRoute("/shop")({
  validateSearch: (search: Record<string, unknown>): ShopSearch => {
    const filter = typeof search.filter === "string" ? search.filter : undefined;
    return filter ? { filter } : {};
  },
  head: () => ({
    meta: [
      { title: "Shop the Collection — OG CULT" },
      {
        name: "description",
        content:
          "Shop OG CULT: heavyweight tees, hoodies and outerwear cut in limited runs. Sizes and stock update live from our store.",
      },
      { property: "og:title", content: "Shop the Collection — OG CULT" },
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
  const { filter } = Route.useSearch();
  const active = shopFilters.find((f) => f.label === filter) ?? shopFilters[0]!;
  const { data, isLoading } = useQuery(productsQueryOptions(active.query));

  return (
    <div className="px-5 pt-28 pb-24 md:px-10 md:pt-36">
      <Reveal>
        <h1 className="display-lg">Shop the collection</h1>
      </Reveal>

      <nav
        aria-label="Filter products"
        className="mt-10 flex flex-wrap gap-x-6 gap-y-3 border-b border-border/60 pb-5"
      >
        {shopFilters.map((f) => {
          const isActive = f.label === active.label;
          return (
            <Link
              key={f.label}
              to="/shop"
              search={f.label === "All" ? {} : { filter: f.label }}
              className={`label transition-colors hover:!text-foreground ${
                isActive ? "!text-foreground" : ""
              }`}
              aria-current={isActive ? "page" : undefined}
            >
              {f.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-12">
        <ProductGrid products={data ?? []} isLoading={isLoading} />
      </div>
    </div>
  );
}
