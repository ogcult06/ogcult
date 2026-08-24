import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — OG CULT" },
      {
        name: "description",
        content:
          "Reach OG CULT for orders, sizing, wholesale, press or archive requests. We answer within two working days.",
      },
      { property: "og:title", content: "Contact — OG CULT" },
      { property: "og:description", content: "Orders, sizing, wholesale, press and archive requests." },
    ],
  }),
  component: Contact,
});

function Contact() {
  const [sent, setSent] = useState(false);

  return (
    <div className="px-5 pt-28 pb-24 md:px-10 md:pt-40">
      <p className="label">We answer in two working days</p>
      <h1 className="display-lg mt-4">Contact</h1>

      <div className="mt-16 grid grid-cols-1 gap-16 md:grid-cols-2">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setSent(true);
          }}
          className="space-y-8"
        >
          <div>
            <label htmlFor="name" className="label">
              Name
            </label>
            <input
              id="name"
              required
              className="mt-3 w-full border-b border-border bg-transparent pb-3 text-sm outline-none focus:border-foreground"
            />
          </div>
          <div>
            <label htmlFor="email" className="label">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              className="mt-3 w-full border-b border-border bg-transparent pb-3 text-sm outline-none focus:border-foreground"
            />
          </div>
          <div>
            <label htmlFor="message" className="label">
              Message
            </label>
            <textarea
              id="message"
              rows={5}
              required
              className="mt-3 w-full resize-none border-b border-border bg-transparent pb-3 text-sm outline-none focus:border-foreground"
            />
          </div>
          <button type="submit" className="btn-cult w-full md:w-auto">
            {sent ? "Message sent" : "Send message"}
          </button>
          {sent && (
            <p className="text-xs text-muted-foreground">
              Received. Someone from the studio will reply to you shortly.
            </p>
          )}
        </form>

        <div className="space-y-10">
          <div>
            <p className="label">Orders & sizing</p>
            <p className="mt-3 text-sm">service@ogcult.com</p>
          </div>
          <div>
            <p className="label">Wholesale & press</p>
            <p className="mt-3 text-sm">press@ogcult.com</p>
          </div>
          <div>
            <p className="label">Studio</p>
            <p className="mt-3 text-sm leading-relaxed">
              Unit 7, Blackthorn Yard
              <br />
              London E2
              <br />
              By appointment only
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
