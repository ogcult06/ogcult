import { createFileRoute, Link } from "@tanstack/react-router";
import { useCart } from "@/lib/cart";
import { formatPrice } from "@/lib/products";

export const Route = createFileRoute("/cart")({
  head: () => ({
    meta: [
      { title: "Your Bag — OG CULT" },
      {
        name: "description",
        content: "Review your OG CULT bag and check out. Limited runs, worldwide shipping.",
      },
      { property: "og:title", content: "Your Bag — OG CULT" },
      { property: "og:description", content: "Review your OG CULT bag and check out." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Cart,
});

function Cart() {
  const { detailed, setQty, remove, subtotal, count } = useCart();

  return (
    <div className="px-5 pt-28 pb-24 md:px-10 md:pt-40">
      <p className="label">{count} item{count === 1 ? "" : "s"}</p>
      <h1 className="display-lg mt-4">Bag</h1>

      {detailed.length === 0 ? (
        <div className="mt-16 border-t border-border/60 pt-10">
          <p className="text-sm text-muted-foreground">Your bag is empty.</p>
          <Link to="/shop" className="btn-cult mt-8">
            Shop Vol. 01
          </Link>
        </div>
      ) : (
        <div className="mt-14 grid grid-cols-1 gap-14 lg:grid-cols-[1.6fr_1fr]">
          <ul className="border-t border-border/60">
            {detailed.map(({ line, product }) => (
              <li
                key={`${line.handle}-${line.size}`}
                className="flex gap-5 border-b border-border/60 py-6"
              >
                <Link
                  to="/product/$handle"
                  params={{ handle: product.handle }}
                  className="w-24 shrink-0 bg-card md:w-32"
                >
                  <img
                    src={product.image}
                    alt={product.title}
                    loading="lazy"
                    width={1024}
                    height={1280}
                    className="h-full w-full object-cover"
                  />
                </Link>
                <div className="flex flex-1 flex-col justify-between">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h2 className="text-sm tracking-tight">{product.title}</h2>
                      <p className="label mt-2">Size {line.size}</p>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {formatPrice(product.price * line.qty)}
                    </span>
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center border border-border">
                      <button
                        type="button"
                        aria-label="Decrease quantity"
                        onClick={() => setQty(line.handle, line.size, line.qty - 1)}
                        className="px-3 py-2 text-xs"
                      >
                        –
                      </button>
                      <span className="px-3 text-xs">{line.qty}</span>
                      <button
                        type="button"
                        aria-label="Increase quantity"
                        onClick={() => setQty(line.handle, line.size, line.qty + 1)}
                        className="px-3 py-2 text-xs"
                      >
                        +
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => remove(line.handle, line.size)}
                      className="label transition-colors hover:!text-foreground"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>

          <aside className="h-fit border border-border p-6 md:p-8">
            <p className="label">Summary</p>
            <div className="mt-6 flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            <div className="mt-3 flex justify-between text-sm">
              <span className="text-muted-foreground">Shipping</span>
              <span className="text-muted-foreground">Calculated at checkout</span>
            </div>
            <button type="button" className="btn-cult mt-8 w-full">
              Checkout
            </button>
            <p className="mt-5 text-xs leading-relaxed text-muted-foreground">
              Taxes and duties are calculated at checkout. Limited pieces are not reserved until
              payment clears.
            </p>
          </aside>
        </div>
      )}
    </div>
  );
}
