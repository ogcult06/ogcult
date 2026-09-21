import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Loader2 } from "lucide-react";

import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Admin Sign In — OG CULT" },
      { name: "description", content: "OG CULT store administration sign in." },
      { property: "og:title", content: "Admin Sign In — OG CULT" },
      { property: "og:description", content: "OG CULT store administration sign in." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AuthPage,
});

const inputClass =
  "w-full border border-border bg-transparent px-4 py-3 text-sm text-foreground outline-none transition-colors focus:border-foreground";

function AuthPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (signInError) {
      setError(signInError.message);
      return;
    }
    navigate({ to: "/admin" });
  };

  return (
    <div className="flex min-h-[80vh] items-center px-5 pt-28 pb-24 md:px-10">
      <form onSubmit={submit} className="w-full max-w-sm">
        <p className="label">OG CULT</p>
        <h1 className="display-lg mt-3">Admin</h1>
        <label className="mt-10 block">
          <span className="label">Email</span>
          <input
            className={`${inputClass} mt-2`}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
          />
        </label>
        <label className="mt-5 block">
          <span className="label">Password</span>
          <input
            className={`${inputClass} mt-2`}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
          />
        </label>
        <button type="submit" disabled={loading} className="btn-cult mt-8 w-full">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Sign in"}
        </button>
        {error ? <p className="mt-4 text-[0.7rem] text-destructive">{error}</p> : null}
      </form>
    </div>
  );
}
