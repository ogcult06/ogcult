import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronRight } from "lucide-react";
import { ProductGrid } from "@/components/product-card";
import { Newsletter } from "@/components/newsletter";
import { productsQueryOptions } from "@/lib/shopify";
import { brand, home, imagery, trustPoints } from "@/lib/site-content";
import { Reveal } from "@/components/reveal";
import catHoodies from "@/assets/cat-hoodies.png";
import catTshirts from "@/assets/p-the-og-tees.jpg";
import catJoggers from "@/assets/cat-joggers.png";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Streetwear For The Originals" },
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
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
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

const heroSlides = [
  {
    image: imagery.hero,
    alt: "OG CULT campaign — figure in an underground car park at night",
    kicker: "Vol. 01 — Nightshift",
    headline: "Wear / Become OG",
    sub: "Black Label Drop",
  },
  {
    image: imagery.editorial,
    alt: "OG CULT editorial campaign — figures on a rain-soaked street at night",
    kicker: "Limited Run",
    headline: "Not Made For Everyone",
    sub: "Underground Luxury",
  },
];

type SortKey = "best" | "price-asc" | "price-desc";

const sortLabels: { key: SortKey; label: string }[] = [
  { key: "best", label: "Best match" },
  { key: "price-asc", label: "Price: low to high" },
  { key: "price-desc", label: "Price: high to low" },
];

const categoryTiles = {
  hoodies: {
    label: "Hoodies",
    image: catHoodies,
    alt: "OG CULT oversized heavyweight hoodies",
    search: { filter: "Hoodies" },
  },
  tshirts: {
    label: "T-Shirts",
    image: catTshirts,
    alt: "OG CULT oversized heavyweight t-shirts",
    search: { filter: "T-Shirts" },
  },
  joggers: {
    label: "Joggers",
    image: catJoggers,
    alt: "OG CULT heavyweight relaxed joggers",
    search: { filter: "Joggers" },
  },
} as const;

function HomePage() {
  const { data, isLoading } = useQuery(productsQueryOptions());
  const [slide, setSlide] = useState(0);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [onSaleOnly, setOnSaleOnly] = useState(false);
  const [sort, setSort] = useState<SortKey>("best");
  const [sortOpen, setSortOpen] = useState(false);

  const currentSlide = heroSlides[slide] ?? heroSlides[0]!;
  const nextSlide = () => setSlide((s) => (s + 1) % heroSlides.length);
  const prevSlide = () => setSlide((s) => (s - 1 + heroSlides.length) % heroSlides.length);

  const editorial = useParallax(0.2);

  const products = useMemo(() => {
    let list = [...(data ?? [])];
    if (inStockOnly) list = list.filter((p) => p.node.availableForSale);
    if (onSaleOnly) list = list.filter((p) => p.node.compareAtPrice && parseFloat(p.node.compareAtPrice) > parseFloat(p.node.priceRange.minVariantPrice.amount));
    if (sort === "price-asc") {
      list.sort((a, b) => parseFloat(a.node.priceRange.minVariantPrice.amount) - parseFloat(b.node.priceRange.minVariantPrice.amount));
    } else if (sort === "price-desc") {
      list.sort((a, b) => parseFloat(b.node.priceRange.minVariantPrice.amount) - parseFloat(a.node.priceRange.minVariantPrice.amount));
    }
    return list;
  }, [data, inStockOnly, onSaleOnly, sort]);

  const activeSortLabel = sortLabels.find((s) => s.key === sort)?.label ?? "Best match";

  return (
    <>
      {/* ───────────────────────── HERO ───────────────────────── */}
      <section className="relative h-[100svh] min-h-[560px] w-full overflow-hidden bg-foreground">
        {/* Slides */}
        <div className="absolute inset-0">
          {heroSlides.map((s, i) => (
            <div
              key={s.image}
              className={`absolute inset-0 transition-opacity duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                i === slide ? "opacity-100" : "opacity-0"
              }`}
            >
              <img
                src={s.image}
                alt={s.alt}
                className="h-full w-full object-cover object-center"
              />
              <div className="absolute inset-0 bg-foreground/25" />
              <div className="absolute inset-x-0 bottom-0 h-[70%] bg-gradient-to-t from-foreground via-foreground/60 to-transparent" />
            </div>
          ))}
        </div>

        {/* Asymmetric headline — bottom-left */}
        <div className="relative z-10 flex h-full flex-col justify-end px-5 pb-16 md:px-10 md:pb-24">
          <div className="max-w-4xl">
            <p className="label !text-bone/80">{currentSlide.kicker}</p>
            <h1 className="display-hero mt-5 flex items-center gap-4 text-bone md:gap-6">
              <span className="flex flex-col items-end text-right leading-[0.95] text-[0.62em]">
                <span>OG CULT</span>
              </span>
              <span aria-hidden className="h-[1.15em] w-[3px] shrink-0 bg-bone/70 md:w-[4px]" />
              <span>{currentSlide.headline}</span>
            </h1>
            <p className="mt-4 font-display text-2xl uppercase tracking-tight text-bone/80 md:text-3xl">
              {currentSlide.sub}
            </p>
          </div>
        </div>

        {/* Accent callout — bottom-right, links to /shop */}
        <Link
          to="/shop"
          className="absolute bottom-16 right-5 z-10 flex flex-col items-end text-right text-bone md:bottom-24 md:right-10"
        >
          <span className="label !text-bone/70">New Drop</span>
          <span className="mt-2 flex items-center gap-3 font-display text-3xl uppercase leading-none md:text-5xl">
            Shop Now
            <span aria-hidden className="text-bone/70">•</span>
          </span>
          <span className="mt-3 h-px w-16 bg-bone md:w-24" />
        </Link>

        {/* Carousel arrows */}
        <button
          type="button"
          onClick={prevSlide}
          aria-label="Previous slide"
          className="absolute top-1/2 left-5 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center border border-bone/30 bg-foreground/30 text-bone backdrop-blur transition-all duration-300 hover:border-bone hover:bg-foreground/50 md:left-10"
        >
          ‹
        </button>
        <button
          type="button"
          onClick={nextSlide}
          aria-label="Next slide"
          className="absolute top-1/2 right-5 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center border border-bone/30 bg-foreground/30 text-bone backdrop-blur transition-all duration-300 hover:border-bone hover:bg-foreground/50 md:right-10"
        >
          ›
        </button>

        {/* Slide indicators */}
        <div className="absolute bottom-16 left-5 z-10 flex gap-2 md:bottom-24 md:left-10">
          {heroSlides.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setSlide(i)}
              aria-label={`Go to slide ${i + 1}`}
              aria-current={i === slide}
              className={`h-1 transition-all duration-300 ${
                i === slide ? "w-6 bg-bone" : "w-2 bg-bone/30"
              }`}
            />
          ))}
        </div>
      </section>

      {/* ─────────────────── CATEGORY BENTO SECTION ─────────────────── */}
      <section aria-label="Shop by category" className="w-full bg-foreground">
        <div className="grid w-full grid-cols-2 grid-rows-2 gap-0 md:h-[min(86svh,840px)] md:min-h-[540px]">
          {/* Left Top — Hoodies */}
          <Link
            to="/shop"
            search={categoryTiles.hoodies.search}
            className="group relative aspect-[5/6] overflow-hidden bg-foreground md:aspect-auto md:h-full"
          >
            <img
              src={categoryTiles.hoodies.image}
              alt={categoryTiles.hoodies.alt}
              loading="eager"
              className="absolute inset-0 h-full w-full object-cover object-[50%_20%] transition-transform duration-[1200ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105"
            />
            <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-foreground/80 via-foreground/25 to-transparent" />
            <div className="absolute bottom-4 left-4 flex items-center gap-1.5 text-bone md:bottom-7 md:left-7 md:gap-2">
              <span className="font-sans text-[1.65rem] font-semibold leading-none tracking-[-0.02em] sm:text-3xl md:text-4xl">
                {categoryTiles.hoodies.label}
              </span>
              <ChevronRight
                aria-hidden
                className="h-5 w-5 shrink-0 stroke-[2.2] transition-transform duration-300 group-hover:translate-x-1 md:h-7 md:w-7"
              />
            </div>
          </Link>

          {/* Right Tall — Joggers */}
          <Link
            to="/shop"
            search={categoryTiles.joggers.search}
            className="group relative col-start-2 row-span-2 row-start-1 overflow-hidden bg-foreground"
          >
            <img
              src={categoryTiles.joggers.image}
              alt={categoryTiles.joggers.alt}
              loading="eager"
              className="absolute inset-0 h-full w-full object-cover object-[50%_58%] transition-transform duration-[1200ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105"
            />
            <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-foreground/80 via-foreground/25 to-transparent" />
            <div className="absolute bottom-4 left-4 flex items-center gap-1.5 text-bone md:bottom-7 md:left-7 md:gap-2">
              <span className="font-sans text-[1.65rem] font-semibold leading-none tracking-[-0.02em] sm:text-3xl md:text-4xl">
                {categoryTiles.joggers.label}
              </span>
              <ChevronRight
                aria-hidden
                className="h-5 w-5 shrink-0 stroke-[2.2] transition-transform duration-300 group-hover:translate-x-1 md:h-7 md:w-7"
              />
            </div>
          </Link>

          {/* Left Bottom — T-Shirts */}
          <Link
            to="/shop"
            search={categoryTiles.tshirts.search}
            className="group relative aspect-[5/6] overflow-hidden bg-foreground md:aspect-auto md:h-full"
          >
            <img
              src={categoryTiles.tshirts.image}
              alt={categoryTiles.tshirts.alt}
              loading="eager"
              className="absolute inset-0 h-full w-full object-cover object-[50%_28%] transition-transform duration-[1200ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105"
            />
            <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-foreground/80 via-foreground/25 to-transparent" />
            <div className="absolute bottom-4 left-4 flex items-center gap-1.5 text-bone md:bottom-7 md:left-7 md:gap-2">
              <span className="font-sans text-[1.65rem] font-semibold leading-none tracking-[-0.02em] sm:text-3xl md:text-4xl">
                {categoryTiles.tshirts.label}
              </span>
              <ChevronRight
                aria-hidden
                className="h-5 w-5 shrink-0 stroke-[2.2] transition-transform duration-300 group-hover:translate-x-1 md:h-7 md:w-7"
              />
            </div>
          </Link>
        </div>
      </section>

      {/* ───────────────────── PRODUCT SHOWCASE ───────────────────── */}
      <section className="bg-background px-5 pt-16 pb-20 md:px-10 md:pt-24 md:pb-28">
        <Reveal className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="block h-px w-10 bg-border" />
            <h2 className="display-md mt-6">{home.dropTitle}</h2>
            <p className="mt-5 max-w-md text-sm leading-relaxed tracking-[0.06em] text-muted-foreground uppercase">
              {home.dropSub}
            </p>
          </div>
        </Reveal>

        {/* Filter | Sort bar */}
        <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-y border-border py-4">
          {/* Filters */}
          <div className="flex flex-wrap items-center gap-4">
            <label className="flex cursor-pointer items-center gap-2 text-[0.65rem] tracking-[0.16em] uppercase text-muted-foreground transition-colors hover:text-foreground">
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(e) => setInStockOnly(e.target.checked)}
                className="h-3.5 w-3.5 accent-foreground"
              />
              In stock only
            </label>
            <span className="h-3 w-px bg-border" />
            <label className="flex cursor-pointer items-center gap-2 text-[0.65rem] tracking-[0.16em] uppercase text-muted-foreground transition-colors hover:text-foreground">
              <input
                type="checkbox"
                checked={onSaleOnly}
                onChange={(e) => setOnSaleOnly(e.target.checked)}
                className="h-3.5 w-3.5 accent-foreground"
              />
              On sale
            </label>
          </div>

          {/* Sort */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setSortOpen((v) => !v)}
              className="flex items-center gap-2 text-[0.65rem] tracking-[0.16em] uppercase text-muted-foreground transition-colors hover:text-foreground"
            >
              Sort: <span className="text-foreground">{activeSortLabel}</span>
              <span className={`transition-transform duration-300 ${sortOpen ? "rotate-180" : ""}`}>▾</span>
            </button>
            {sortOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setSortOpen(false)} />
                <div className="absolute right-0 top-full z-20 mt-2 w-56 border border-border bg-popover py-1 shadow-lg">
                  {sortLabels.map((s) => (
                    <button
                      key={s.key}
                      type="button"
                      onClick={() => {
                        setSort(s.key);
                        setSortOpen(false);
                      }}
                      className={`block w-full px-4 py-2.5 text-left text-[0.65rem] tracking-[0.14em] uppercase transition-colors hover:bg-secondary ${
                        sort === s.key ? "text-foreground" : "text-muted-foreground"
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Grid */}
        <div className="mt-10">
          <ProductGrid products={products} isLoading={isLoading} emptyState="placeholder" />
        </div>
      </section>

      {/* ───────────────────── EDITORIAL CAMPAIGN ───────────────────── */}
      <section className="relative flex h-[85svh] min-h-[460px] items-center justify-center overflow-hidden bg-foreground">
        <div ref={editorial.ref} className="absolute inset-0">
          <img
            src={imagery.editorial}
            alt="OG CULT editorial campaign — figures on a rain-soaked street at night"
            loading="lazy"
            className="h-[120%] w-full object-cover"
            style={{ transform: `translate3d(0, ${editorial.offset}px, 0)` }}
          />
          <div className="absolute inset-0 bg-foreground/55" />
        </div>
        <Reveal className="relative px-5 text-center text-bone">
          <h2 className="display-lg max-w-[14ch]">{home.editorialHeadline}</h2>
          <Link to="/shop" className="btn-ghost-cult mt-10 !border-bone/40 !text-bone hover:!border-bone hover:!bg-bone/10">
            Explore the collection
          </Link>
        </Reveal>
      </section>

      {/* ───────────────────── TRUST ───────────────────── */}
      <section className="grid gap-8 border-b border-border px-5 py-14 md:grid-cols-3 md:px-10">
        {trustPoints.map((t) => (
          <div key={t.title}>
            <p className="label !text-foreground">{t.title}</p>
            <p className="mt-3 text-xs leading-relaxed text-muted-foreground">{t.body}</p>
          </div>
        ))}
      </section>

      {/* ───────────────────── INSTAGRAM ───────────────────── */}
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

      {/* ───────────────────── NEWSLETTER ───────────────────── */}
      <section className="border-t border-border px-5 py-20 md:px-10 md:py-28">
        <Newsletter />
      </section>
    </>
  );
}
