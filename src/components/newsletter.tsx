import { useState } from "react";
import { toast } from "sonner";

export function Newsletter({ compact = false }: { compact?: boolean }) {
  const [email, setEmail] = useState("");

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        toast.success("You're on the list", { description: "First access to every OG CULT drop." });
        setEmail("");
      }}
      className={compact ? "" : "max-w-xl"}
    >
      {!compact && (
        <>
          <h2 className="display-lg">Join the cult</h2>
          <p className="mt-6 max-w-md text-sm leading-relaxed text-muted-foreground">
            Get first access to new drops, limited releases and OG CULT news.
          </p>
        </>
      )}
      <div className="mt-8 flex items-end gap-4">
        <div className="flex-1">
          <label htmlFor={compact ? "footer-email" : "news-email"} className="label">
            Email
          </label>
          <input
            id={compact ? "footer-email" : "news-email"}
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@domain.com"
            className="mt-3 w-full border-b border-border bg-transparent pb-3 text-sm outline-none placeholder:text-muted-foreground/50 focus:border-foreground"
          />
        </div>
        <button type="submit" className="btn-cult shrink-0 !px-7">
          Join
        </button>
      </div>
    </form>
  );
}
