import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { Reveal } from "@/components/reveal";
import { useCart } from "@/lib/cart";
import { getProduct, products, formatPrice } from "@/lib/products";

export const Route = createFileRoute("/product/$handle")({
  loader: ({ params }) => {
    const product = getProduct(params.handle);
    if (!product) throw notFound();
    return { product };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: "Unavailable — OG CULT" }, { name: "robots", content: "noindex" }] };
    }
    const { product } = loaderData;
    const title = `${product.title} — OG CULT`;
    return {
      meta: [
        { title },
        { name: "description", content: product.description.slice(0, 155) },
        { property: "og:title", content: title },
        { property: "og:description", content: product.description.slice(0, 155) },
      ],
    };
  },
  component: ProductPage,
});

function ProductPage() {
  const { product } = Route.useLoaderData();
  const { add } = useCart();
  const [size, setSize] = useState<string | null>(null);
  const [added, setAdded] = useState(false);

  const others = products.filter((p) => p.handle !== product.handle).slice(0, 3);

  return (
    <div className="pt-20">
      <div className="grid grid-cols-1 md:grid-cols-2">
        <div className="bg-card">
          <img
            src={product.image}
            alt={product.title}
            width={1024}
            height={1280}
            className="h-full w-full object-cover"
          />
        </div>

        <div className="flex flex-col justify-center px-5 py-14 md:px-12 md:py-20">
          <p className="label">{product.drop}</p>
          <h1 className="mt-4 text-4xl md:text-6xl">{product.title}</h1>
          <p className="mt-5 text-sm text-muted-foreground">{formatPrice(product.price)}</p>
          <p className="mt-8 max-w-md text-sm leading-relaxed text-muted-foreground">
            {product.description}
          </p>

          <div className="mt-10">
            <p className="label">Size</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {product.sizes.map((s) => (
                <button
                  key={s}
                  type="button"
                  disabled={product.soldOut}
                  onClick={() => {
                    setSize(s);
                    setAdded(false);
                  }}
                  className={`border px-5 py-3 text-xs tracking-[0.2em] uppercase transition-colors disabled:opacity-30 ${
                    size === s
                      ? "border-foreground bg-foreground text-background"
                      : "border-border hover:border-foreground"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <button
            type="button"
            disabled={product.soldOut || !size}
            onClick={() => {
              if (!size) return;
              add(product.handle, size);
              setAdded(true);
            }}
            className="btn-cult mt-10 w-full md:w-auto"
          >
            {product.soldOut ? "Sold out" : added ? "Added to bag" : size ? "Add to bag" : "Select a size"}
          </button>

          {added && (
            <Link to="/cart" className="label mt-5 !text-foreground underline">
              Go to bag
            </Link>
          )}

          <ul className="mt-12 space-y-3 border-t border-border/60 pt-8">
            {product.details.map((d) => (
              <li key={d} className="text-xs tracking-wide text-muted-foreground">
                — {d}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <section className="px-5 py-20 md:px-10 md:py-28">
        <Reveal>
          <h2 className="display-lg">More</h2>
        </Reveal>
        <div className="mt-12 grid grid-cols-1 gap-x-6 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
          {others.map((p, i) => (
            <Reveal key={p.handle} delay={i * 100}>
              <Link to="/product/$handle" params={{ handle: p.handle }} className="group block">
                <div className="overflow-hidden bg-card">
                  <img
                    src={p.image}
                    alt={p.title}
                    loading="lazy"
                    width={1024}
                    height={1280}
                    className="h-full w-full object-cover transition-transform duration-[1200ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105"
                  />
                </div>
                <div className="mt-5 flex items-baseline justify-between border-t border-border/60 pt-4">
                  <h3 className="text-base tracking-tight">{p.title}</h3>
                  <span className="text-xs text-muted-foreground">{formatPrice(p.price)}</span>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>
    </div>
  );
}
