import { createFileRoute } from "@tanstack/react-router";
import { Reveal } from "@/components/reveal";
import { policies } from "@/lib/site-content";

export const Route = createFileRoute("/shipping-returns")({
  head: () => ({
    meta: [
      { title: "Shipping & Returns — OG CULT" },
      {
        name: "description",
        content:
          "OG CULT shipping, processing, delivery, returns, exchanges and damaged item information.",
      },
      { property: "og:title", content: "Shipping & Returns — OG CULT" },
      {
        property: "og:description",
        content: "Shipping, delivery, returns and exchange information for OG CULT orders.",
      },
      { property: "og:url", content: "/shipping-returns" },
    ],
    links: [{ rel: "canonical", href: "/shipping-returns" }],
  }),
  component: ShippingPage,
});

function ShippingPage() {
  return (
    <div className="px-5 pt-28 pb-24 md:px-10 md:pt-36">
      <Reveal>
        <h1 className="display-lg max-w-[14ch]">Shipping &amp; returns</h1>
      </Reveal>
      <div className="mt-16 max-w-3xl border-t border-border/60">
        {policies.shipping.map((s) => (
          <section key={s.title} className="border-b border-border/60 py-8">
            <h2 className="label !text-foreground">{s.title}</h2>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{s.body}</p>
          </section>
        ))}
      </div>
    </div>
  );
}
