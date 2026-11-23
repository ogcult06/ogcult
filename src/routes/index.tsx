import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { Reveal } from "@/components/reveal";
import { ProductGrid } from "@/components/product-card";
import { Newsletter } from "@/components/newsletter";
import { productsQueryOptions, sortProductsForDisplay } from "@/lib/shopify";
import { brand, home, imagery, trustPoints } from "@/lib/site-content";

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
    headline: "Wear Become OG",
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

function HomePage() {
  const { data, isLoading } = useQuery(productsQueryOptions());
  const featured = sortProductsForDisplay(data ?? []);
  const editorial = useParallax(0.2);
  const [slide, setSlide] = useState(0);
  
    const currentSlide = heroSlides[slide] ?? heroSlides[0]!;
  const nextSlide = () => setSlide((s) => (s + 1) % heroSlides.length);
  const prevSlide = () => setSlide((s) => (s - 1 + heroSlides.length) % heroSlides.length);

  return (
    <>
      {/* HERO CAROUSEL */}
      <section className="relative h-[100svh] min-h-[560px] w-full overflow-hidden bg-background">
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
              {/* Cinematic mood, but the campaign image stays readable */}
              <div className="absolute inset-0 bg-background/20" />
              {/* Gradient scrim behind the copy for legibility */}
              <div className="absolute inset-x-0 bottom-0 h-[72%] bg-gradient-to-t from-background via-background/75 to-transparent" />
            </div>
          ))}
        </div>

        {/* Content — asymmetric, left-aligned */}
        <div className="relative z-10 flex h-full flex-col justify-end px-5 pb-16 md:px-10 md:pb-24">
          <div className="max-w-4xl">
            <p className="label">{currentSlide.kicker}</p>
            <h1 className="display-hero mt-6 flex items-center gap-4 md:gap-6">
              <span className="flex flex-col items-end text-right leading-[0.95] text-[0.62em]">
                <span>Wear</span>
                <span>Become</span>
              </span>
              <span aria-hidden className="h-[1.15em] w-[3px] shrink-0 bg-foreground/70 md:w-[4px]" />
              <span>OG</span>
            </h1>
            <p className="mt-4 font-display text-2xl uppercase tracking-tight text-foreground/80 md:text-3xl">
              {currentSlide.sub}
            </p>
          </div>
        </div>

        {/* Accent callout — bottom-right, links to /shop */}
        <Link
          to="/shop"
          className="absolute bottom-16 right-5 z-10 flex flex-col items-end text-right md:bottom-24 md:right-10"
        >
          <span className="label !text-foreground/70">New Season</span>
          <span className="mt-2 font-display text-3xl uppercase leading-none text-blood md:text-5xl">
            Limited Drop
          </span>
          <span className="mt-3 h-px w-16 bg-blood md:w-24" />
        </Link>

        {/* Carousel arrows */}
        <button
          type="button"
          onClick={prevSlide}
          aria-label="Previous slide"
          className="absolute top-1/2 left-5 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center border border-foreground/20 bg-background/40 text-foreground backdrop-blur transition-all duration-300 hover:border-foreground hover:bg-background md:left-10"
        >
          ‹
        </button>
        <button
          type="button"
          onClick={nextSlide}
          aria-label="Next slide"
          className="absolute top-1/2 right-5 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center border border-foreground/20 bg-background/40 text-foreground backdrop-blur transition-all duration-300 hover:border-foreground hover:bg-background md:right-10"
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
                i === slide ? "w-6 bg-foreground" : "w-2 bg-foreground/25"
              }`}
            />
          ))}
        </div>
      </section>

      {/* MARQUEE */}
      <div className="overflow-hidden border-b border-border/60 py-4">
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

      {/* HERO → PRODUCTS TRANSITION + NEW DROP */}
      <section className="px-5 pt-32 pb-24 md:px-10 md:pt-56 md:pb-32">
        <Reveal className="max-w-4xl">
          <span className="block h-px w-14 bg-border" />
          <h2 className="display-md mt-10">{home.dropTitle}</h2>
          <p className="mt-7 max-w-md text-sm leading-relaxed tracking-[0.06em] text-muted-foreground uppercase">
            {home.dropSub}
          </p>
        </Reveal>
        <Reveal className="mt-20 md:mt-28" delay={80}>
          <ProductGrid products={featured} isLoading={isLoading} emptyState="placeholder" />
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
