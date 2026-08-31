import { createFileRoute, Link } from "@tanstack/react-router";
import { Reveal } from "@/components/reveal";
import { about, imagery } from "@/lib/site-content";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "This is OG CULT — Brand Story" },
      {
        name: "description",
        content:
          "The story behind OG CULT: a refusal, not a trend. Read about the idea, the culture, the clothes and the people.",
      },
      { property: "og:title", content: "This is OG CULT — Brand Story" },
      {
        property: "og:description",
        content: "The idea, the culture, the clothes and the people behind OG CULT.",
      },
      { property: "og:type", content: "article" },
      { property: "og:url", content: "/about" },
    ],
    links: [{ rel: "canonical", href: "/about" }],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <div className="pt-28 pb-24 md:pt-36">
      <div className="px-5 md:px-10">
        <Reveal>
          <h1 className="display-lg max-w-[16ch]">{about.headline}</h1>
          <p className="mt-8 max-w-md text-sm leading-relaxed text-muted-foreground">
            {about.intro}
          </p>
        </Reveal>
      </div>

      <Reveal className="mt-16">
        <img
          src={imagery.aboutPrimary}
          alt="OG CULT campaign — placeholder editorial image"
          loading="lazy"
          className="h-[60svh] w-full object-cover md:h-[80svh]"
        />
      </Reveal>

      <div className="mt-20 grid gap-14 px-5 md:grid-cols-2 md:gap-20 md:px-10">
        {about.sections.map((s, i) => (
          <Reveal key={s.title} delay={i * 60}>
            <h2 className="font-display text-3xl uppercase md:text-5xl">{s.title}</h2>
            <p className="mt-6 max-w-prose text-sm leading-relaxed text-muted-foreground">
              {s.body}
            </p>
          </Reveal>
        ))}
      </div>

      <Reveal className="mt-20 px-5 md:px-10">
        <img
          src={imagery.aboutSecondary}
          alt="OG CULT garment detail — placeholder editorial image"
          loading="lazy"
          className="aspect-[16/10] w-full object-cover"
        />
      </Reveal>

      <div className="mt-20 px-5 md:px-10">
        <Link to="/shop" className="btn-cult">
          Shop the OG collection
        </Link>
      </div>
    </div>
  );
}
