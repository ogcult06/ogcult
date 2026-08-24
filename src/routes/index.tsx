import { createFileRoute, Link } from "@tanstack/react-router";
import hero from "@/assets/hero.jpg";
import editorial from "@/assets/editorial.jpg";
import { Reveal } from "@/components/reveal";
import { products, formatPrice } from "@/lib/products";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "OG CULT — Underground Luxury Streetwear" },
      {
        name: "description",
        content:
          "OG CULT is a dark luxury streetwear label. Heavyweight cut-and-sew, limited runs, shipped worldwide. Vol. 01 Nightshift is live.",
      },
      { property: "og:title", content: "OG CULT — Underground Luxury Streetwear" },
      {
        property: "og:description",
        content: "Dark luxury streetwear in limited runs. Vol. 01 Nightshift is live.",
      },
    ],
  }),
  component: Home,
});

function Home() {
  return (
    <div>
      <section className="relative min-h-[100svh] w-full overflow-hidden">
        <img
          src={hero}
          alt="Figure in oversized black techwear under a single light in an underground garage"
          width={1600}
          height={1920}
          className="absolute inset-0 h-full w-full object-cover object-center opacity-80"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/85 via-background/25 to-background" />
        <div className="relative flex min-h-[100svh] flex-col justify-end px-5 pb-12 md:px-10 md:pb-16">
          <p className="label mb-6">Vol. 01 — Nightshift</p>
          <h1 className="display-xl">
            OG
            <br />
            Cult
          </h1>
          <div className="mt-8 flex flex-col gap-6 border-t border-border/60 pt-8 md:flex-row md:items-end md:justify-between">
            <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
              Cut heavy. Dyed black. Made in runs small enough to disappear. Worn by people who were
              never asking permission.
            </p>
            <Link to="/shop" className="btn-cult self-start">
              Enter the drop
            </Link>
          </div>
        </div>
      </section>

      <div className="overflow-hidden border-y border-border/60 py-5">
        <div className="marquee-track">
          {[0, 1].map((k) => (
            <span key={k} className="label !text-foreground/70 pr-10">
              {"Nightshift Vol. 01 — Limited to 200 pieces — Worldwide shipping — ".repeat(3)}
            </span>
          ))}
        </div>
      </div>

      <section className="px-5 py-20 md:px-10 md:py-32">
        <Reveal>
          <p className="label">Selected pieces</p>
          <h2 className="display-lg mt-4 max-w-3xl">The uniform</h2>
        </Reveal>

        <div className="mt-14 grid grid-cols-1 gap-x-6 gap-y-16 sm:grid-cols-2 lg:grid-cols-3">
          {products.slice(0, 3).map((product, i) => (
            <Reveal key={product.handle} delay={i * 110}>
              <Link
                to="/product/$handle"
                params={{ handle: product.handle }}
                className="group block"
              >
                <div className="overflow-hidden bg-card">
                  <img
                    src={product.image}
                    alt={product.title}
                    loading="lazy"
                    width={1024}
                    height={1280}
                    className="h-full w-full object-cover transition-transform duration-[1200ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105"
                  />
                </div>
                <div className="mt-5 flex items-baseline justify-between border-t border-border/60 pt-4">
                  <h3 className="text-base tracking-tight">{product.title}</h3>
                  <span className="text-xs text-muted-foreground">{formatPrice(product.price)}</span>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="relative">
        <img
          src={editorial}
          alt="Two figures in oversized black streetwear on a rain-soaked night street"
          loading="lazy"
          width={1600}
          height={1008}
          className="h-[70svh] w-full object-cover md:h-[90svh]"
        />
        <div className="absolute inset-0 bg-background/40" />
        <div className="absolute inset-0 flex items-center justify-center px-5">
          <Reveal className="text-center">
            <h2 className="display-lg">Dressed for the dark</h2>
            <p className="label mt-6">Campaign — shot on 35mm, 04:00</p>
          </Reveal>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-10 px-5 py-20 md:grid-cols-2 md:px-10 md:py-32">
        <Reveal>
          <h2 className="display-lg">Not for everyone</h2>
        </Reveal>
        <Reveal delay={120} className="space-y-6 self-end">
          <p className="text-sm leading-relaxed text-muted-foreground">
            OG CULT started as a private group chat trading fits nobody else understood. It became a
            label with one rule: nothing goes out unless it would survive a decade of nights.
          </p>
          <Link to="/about" className="btn-ghost-cult">
            The doctrine
          </Link>
        </Reveal>
      </section>
    </div>
  );
}
