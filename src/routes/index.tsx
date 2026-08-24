import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { Reveal } from "@/components/reveal";
import { ProductGrid } from "@/components/product-card";
import { Newsletter } from "@/components/newsletter";
import { productsQueryOptions } from "@/lib/shopify";
import { brand, home, imagery, trustPoints } from "@/lib/site-content";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "OG CULT — Underground Luxury Streetwear" },
      {
        name: "description",
        content:
          "OG CULT is premium underground streetwear cut in limited runs. Built for the ones who don't follow. Vol. 01 Nightshift is live.",
      },
      { property: "og:title", content: "OG CULT — Underground Luxury Streetwear" },
      {
        property: "og:description",
        content: "Premium underground streetwear in limited runs. Shop Vol. 01 Nightshift.",
      },
      { property: "og:url", content: "/" },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
  component: HomePage,
});

function useParallax(strength = 0.18) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let frame = 0;
    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        const el = ref.current;
        if (!el) return;
        const rect = el.getBoundingClientRect();
        if (rect.bottom < 0 || rect.top > window.innerHeight) return;
        const progress = (rect.top + rect.height / 2 - window.innerHeight / 2) / window.innerHeight;
        setOffset(progress * strength * 100);
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [strength]);

  return { ref, offset };
}

function HomePage() {
  const { data, isLoading } = useQuery(productsQueryOptions());
  const featured = (data ?? []).slice(0, 4);
  const hero = useParallax(0.12);
  const editorial = useParallax(0.2);

  return (
    <>
      {/* HERO */}
      <section className="relative flex h-[100svh] min-h-[560px] items-end overflow-hidden">
        <div ref={hero.ref} className="absolute inset-0">
          <img
            src={imagery.hero}
            alt="OG CULT campaign — figure in an underground car park at night"
            className="h-[115%] w-full object-cover object-center"
            style={{ transform: `translate3d(0, ${hero.offset}px, 0) scale(1.02)` }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-background/40" />
        </div>

        <div className="relative w-full px-5 pb-14 md:px-10 md:pb-20">
          <p className="label">{home.heroSub}</p>
          <h1 className="display-lg mt-6 max-w-[16ch]">{home.heroHeadline}</h1>
          <div className="mt-10 flex flex-wrap gap-3">
            <Link to="/shop" className="btn-cult">
              Shop the drop
            </Link>
            <Link to="/about" className="btn-ghost-cult">
              Explore OG Cult
            </Link>
          </div>
          <div className="mt-14 flex items-center gap-4">
            <span className="label">Scroll</span>
            <span className="h-px w-16 origin-left animate-pulse bg-border" />
          </div>
        </div>
      </section>

      {/* MARQUEE */}
      <div className="overflow-hidden border-y border-border/60 py-4">
        <div className="marquee-track">
          {[0, 1].map((dup) => (
            <span key={dup} className="flex shrink-0">
              {home.marquee.map((m) => (
                <span key={`${dup}-${m}`} className="label mx-6">
                  {m} —
                </span>
              ))}
            </span>
          ))}
        </div>
      </div>

      {/* NEW DROP */}
      <section className="px-5 py-20 md:px-10 md:py-28">
        <Reveal className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <h2 className="display-lg">{home.dropTitle}</h2>
            <p className="mt-5 text-sm text-muted-foreground">{home.dropSub}</p>
          </div>
          <Link to="/shop" className="label transition-colors hover:!text-foreground">
            View all
          </Link>
        </Reveal>
        <Reveal className="mt-12" delay={80}>
          <ProductGrid products={featured} isLoading={isLoading} />
        </Reveal>
      </section>

      {/* EDITORIAL CAMPAIGN */}
      <section className="relative flex h-[85svh] min-h-[460px] items-center justify-center overflow-hidden">
        <div ref={editorial.ref} className="absolute inset-0">
          <img
            src={imagery.editorial}
            alt="OG CULT editorial campaign — figures on a rain-soaked street at night"
            loading="lazy"
            className="h-[120%] w-full object-cover"
            style={{ transform: `translate3d(0, ${editorial.offset}px, 0)` }}
          />
          <div className="absolute inset-0 bg-background/55" />
        </div>
        <Reveal className="relative px-5 text-center">
          <h2 className="display-lg max-w-[14ch]">{home.editorialHeadline}</h2>
          <Link to="/shop" className="btn-ghost-cult mt-10">
            Explore the collection
          </Link>
        </Reveal>
      </section>

      {/* TRUST */}
      <section className="grid gap-8 border-b border-border/60 px-5 py-14 md:grid-cols-3 md:px-10">
        {trustPoints.map((t) => (
          <div key={t.title}>
            <p className="label !text-foreground">{t.title}</p>
            <p className="mt-3 text-xs leading-relaxed text-muted-foreground">{t.body}</p>
          </div>
        ))}
      </section>

      {/* INSTAGRAM */}
      <section className="px-5 py-20 md:px-10 md:py-28">
        <Reveal className="flex flex-wrap items-end justify-between gap-4">
          <h2 className="display-lg">Follow the cult</h2>
          <a
            href={brand.socials[0]?.href ?? "https://instagram.com"}
            target="_blank"
            rel="noreferrer"
            className="label transition-colors hover:!text-foreground"
          >
            {brand.instagramHandle}
          </a>
        </Reveal>
        <div className="mt-10 grid grid-cols-2 gap-2 md:grid-cols-3 md:gap-3">
          {imagery.instagram.map((src, i) => (
            <a
              key={src}
              href={brand.socials[0]?.href ?? "https://instagram.com"}
              target="_blank"
              rel="noreferrer"
              className="group relative block overflow-hidden"
            >
              <img
                src={src}
                alt={`OG CULT social post ${i + 1} — placeholder campaign image`}
                loading="lazy"
                className="aspect-square w-full object-cover transition-transform duration-[1200ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105"
              />
            </a>
          ))}
        </div>
      </section>

      {/* NEWSLETTER */}
      <section className="border-t border-border/60 px-5 py-20 md:px-10 md:py-28">
        <Newsletter />
      </section>
    </>
  );
}
