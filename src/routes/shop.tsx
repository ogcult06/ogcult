import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Reveal } from "@/components/reveal";
import { products, formatPrice } from "@/lib/products";

export const Route = createFileRoute("/shop")({
  head: () => ({
    meta: [
      { title: "Shop Vol. 01 Nightshift — OG CULT" },
      {
        name: "description",
        content:
          "Shop the OG CULT Nightshift collection: heavyweight hoodies, washed tees, wide cargos and archive leather. Limited runs, worldwide shipping.",
      },
      { property: "og:title", content: "Shop Vol. 01 Nightshift — OG CULT" },
      {
        property: "og:description",
        content: "Heavyweight hoodies, washed tees, wide cargos and archive leather. Limited runs.",
      },
    ],
  }),
  component: Shop,
});

const categories = ["All", "Outerwear", "Tops", "Bottoms"] as const;

function Shop() {
  const [filter, setFilter] = useState<(typeof categories)[number]>("All");
  const visible = filter === "All" ? products : products.filter((p) => p.category === filter);

  return (
    <div className="px-5 pt-28 pb-24 md:px-10 md:pt-40">
      <p className="label">{products.length} pieces / Vol. 01</p>
      <h1 className="display-lg mt-4">Shop</h1>

      <div className="mt-10 flex flex-wrap gap-3 border-y border-border/60 py-5">
        {categories.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setFilter(c)}
            className={`label transition-colors ${filter === c ? "!text-foreground" : "hover:!text-foreground"}`}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="mt-14 grid grid-cols-1 gap-x-6 gap-y-16 sm:grid-cols-2 lg:grid-cols-3">
        {visible.map((product, i) => (
          <Reveal key={product.handle} delay={(i % 3) * 100}>
            <Link to="/product/$handle" params={{ handle: product.handle }} className="group block">
              <div className="relative overflow-hidden bg-card">
                <img
                  src={product.image}
                  alt={product.title}
                  loading="lazy"
                  width={1024}
                  height={1280}
                  className="h-full w-full object-cover transition-transform duration-[1200ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105"
                />
                {product.soldOut && (
                  <span className="label !text-foreground absolute top-4 left-4 border border-border bg-background/80 px-3 py-1.5">
                    Sold out
                  </span>
                )}
              </div>
              <div className="mt-5 flex items-baseline justify-between border-t border-border/60 pt-4">
                <div>
                  <h2 className="text-base tracking-tight">{product.title}</h2>
                  <p className="label mt-2">{product.drop}</p>
                </div>
                <span className="text-xs text-muted-foreground">{formatPrice(product.price)}</span>
              </div>
            </Link>
          </Reveal>
        ))}
      </div>
    </div>
  );
}
