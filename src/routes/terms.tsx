import { createFileRoute } from "@tanstack/react-router";
import { policies } from "@/lib/site-content";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms of Service — OG CULT" },
      {
        name: "description",
        content: "Terms governing use of the OG CULT store and orders placed through it.",
      },
      { property: "og:title", content: "Terms of Service — OG CULT" },
      { property: "og:description", content: "Terms for using the OG CULT store." },
      { property: "og:url", content: "/terms" },
    ],
    links: [{ rel: "canonical", href: "/terms" }],
  }),
  component: TermsPage,
});

function TermsPage() {
  return (
    <div className="px-5 pt-28 pb-24 md:px-10 md:pt-36">
      <h1 className="display-lg">Terms</h1>
      <div className="mt-16 max-w-3xl border-t border-border/60">
        {policies.terms.map((s) => (
          <section key={s.title} className="border-b border-border/60 py-8">
            <h2 className="label !text-foreground">{s.title}</h2>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{s.body}</p>
          </section>
        ))}
      </div>
    </div>
  );
}
