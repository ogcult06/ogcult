import { createFileRoute, Link } from "@tanstack/react-router";
import editorial from "@/assets/editorial.jpg";
import { Reveal } from "@/components/reveal";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "The Doctrine — OG CULT" },
      {
        name: "description",
        content:
          "OG CULT is an underground luxury streetwear label built on heavyweight fabric, small runs and zero explanation. Read the doctrine.",
      },
      { property: "og:title", content: "The Doctrine — OG CULT" },
      {
        property: "og:description",
        content: "An underground luxury label built on heavyweight fabric and small runs.",
      },
    ],
  }),
  component: About,
});

const pillars = [
  {
    n: "01",
    t: "Fabric first",
    d: "620gsm loopback, compact jersey, distressed lambskin. If it doesn't feel expensive in the hand, it never leaves the studio.",
  },
  {
    n: "02",
    t: "Small runs",
    d: "Between 90 and 200 pieces per style. No restocks, no reorders. Sold out means gone.",
  },
  {
    n: "03",
    t: "No explanation",
    d: "No logos begging to be read across the room. The people who know, know.",
  },
];

function About() {
  return (
    <div className="pt-28 md:pt-40">
      <section className="px-5 md:px-10">
        <p className="label">Est. 2019 — Nowhere in particular</p>
        <h1 className="display-lg mt-4 max-w-4xl">Born in the back of the night</h1>
        <p className="mt-10 max-w-xl text-sm leading-relaxed text-muted-foreground">
          OG CULT began with four people, a borrowed sewing machine and a refusal to wear anything
          that looked like it was designed by committee. We make black clothing for people who move
          after midnight — heavy, oversized, quietly expensive.
        </p>
      </section>

      <img
        src={editorial}
        alt="OG CULT campaign shot on a rain-soaked street at night"
        loading="lazy"
        width={1600}
        height={1008}
        className="mt-16 h-[55svh] w-full object-cover md:h-[80svh]"
      />

      <section className="px-5 py-20 md:px-10 md:py-32">
        <div className="grid grid-cols-1 gap-14 md:grid-cols-3">
          {pillars.map((p, i) => (
            <Reveal key={p.n} delay={i * 110}>
              <p className="font-display text-5xl text-muted-foreground/30">{p.n}</p>
              <h2 className="mt-5 text-2xl">{p.t}</h2>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{p.d}</p>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="border-t border-border/60 px-5 py-20 md:px-10 md:py-28">
        <Reveal>
          <h2 className="display-lg max-w-3xl">Join the congregation</h2>
          <div className="mt-10 flex flex-wrap gap-4">
            <Link to="/shop" className="btn-cult">
              Shop Vol. 01
            </Link>
            <Link to="/contact" className="btn-ghost-cult">
              Talk to us
            </Link>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
