import { createFileRoute } from "@tanstack/react-router";
import { Reveal } from "@/components/reveal";
import { sizeGuide } from "@/lib/site-content";

export const Route = createFileRoute("/size-guide")({
  head: () => ({
    meta: [
      { title: "Size Guide — OG CULT" },
      {
        name: "description",
        content:
          "OG CULT size guide: chest, length, shoulder and sleeve measurements for XS–XXL, plus how to measure correctly.",
      },
      { property: "og:title", content: "Size Guide — OG CULT" },
      {
        property: "og:description",
        content: "Chest, length, shoulder and sleeve measurements for every OG CULT size.",
      },
      { property: "og:url", content: "/size-guide" },
    ],
    links: [{ rel: "canonical", href: "/size-guide" }],
  }),
  component: SizeGuidePage,
});

function SizeGuidePage() {
  return (
    <div className="px-5 pt-28 pb-24 md:px-10 md:pt-36">
      <Reveal>
        <h1 className="display-lg">Size guide</h1>
        <p className="mt-8 max-w-md text-sm leading-relaxed text-muted-foreground">
          All measurements in centimetres. Our cuts run boxy — size down for a closer fit.
        </p>
      </Reveal>

      <div className="mt-14 overflow-x-auto">
        <table className="w-full min-w-[520px] border-collapse text-left">
          <caption className="sr-only">OG CULT garment measurements in centimetres</caption>
          <thead>
            <tr className="border-y border-border">
              {sizeGuide.columns.map((c) => (
                <th key={c} scope="col" className="label !text-foreground py-4 pr-6">
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sizeGuide.rows.map((row) => (
              <tr key={row[0]} className="border-b border-border/60">
                {row.map((cell, i) => (
                  <td
                    key={`${row[0]}-${i}`}
                    className={`py-4 pr-6 text-xs ${i === 0 ? "uppercase" : "text-muted-foreground"}`}
                  >
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-6 text-[0.65rem] leading-relaxed text-muted-foreground">{sizeGuide.note}</p>

      <section className="mt-20">
        <h2 className="font-display text-3xl uppercase md:text-5xl">How to measure</h2>
        <div className="mt-10 grid gap-10 md:grid-cols-2">
          {sizeGuide.howToMeasure.map((m, i) => (
            <div key={m.title} className="flex gap-6 border-t border-border/60 pt-6">
              <span className="label shrink-0">{String(i + 1).padStart(2, "0")}</span>
              <div>
                <h3 className="text-xs uppercase">{m.title}</h3>
                <p className="mt-3 text-xs leading-relaxed text-muted-foreground">{m.body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
