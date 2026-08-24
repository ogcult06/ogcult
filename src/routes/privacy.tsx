import { createFileRoute } from "@tanstack/react-router";
import { policies } from "@/lib/site-content";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — OG CULT" },
      {
        name: "description",
        content: "How OG CULT collects, uses and protects customer data.",
      },
      { property: "og:title", content: "Privacy Policy — OG CULT" },
      { property: "og:description", content: "How OG CULT handles customer data." },
      { property: "og:url", content: "/privacy" },
    ],
    links: [{ rel: "canonical", href: "/privacy" }],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <div className="px-5 pt-28 pb-24 md:px-10 md:pt-36">
      <h1 className="display-lg">Privacy</h1>
      <div className="mt-16 max-w-3xl border-t border-border/60">
        {policies.privacy.map((s) => (
          <section key={s.title} className="border-b border-border/60 py-8">
            <h2 className="label !text-foreground">{s.title}</h2>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{s.body}</p>
          </section>
        ))}
      </div>
    </div>
  );
}
