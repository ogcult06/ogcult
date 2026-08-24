import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { useCart } from "@/lib/cart";

const nav = [
  { to: "/shop", label: "Shop" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
] as const;

export function SiteHeader() {
  const { count } = useCart();
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-border/60 bg-background/70 backdrop-blur-xl">
      <div className="flex items-center justify-between px-5 py-4 md:px-10">
        <button
          type="button"
          aria-label="Menu"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="label !text-foreground md:hidden"
        >
          {open ? "Close" : "Menu"}
        </button>

        <nav className="hidden gap-10 md:flex">
          {nav.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="label transition-colors hover:!text-foreground"
              activeProps={{ className: "label !text-foreground" }}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <Link to="/" className="font-display text-xl tracking-[0.3em] uppercase md:text-2xl">
          OG Cult
        </Link>

        <Link to="/cart" className="label !text-foreground">
          Cart [{count}]
        </Link>
      </div>

      {open && (
        <nav className="flex flex-col gap-6 border-t border-border/60 px-5 py-8 md:hidden">
          {nav.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setOpen(false)}
              className="font-display text-4xl uppercase"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-border/60 px-5 pt-16 pb-10 md:px-10">
      <p className="display-lg text-muted-foreground/25">No gods</p>
      <div className="mt-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <p className="label max-w-xs leading-relaxed">
          OG Cult — Vol. 01 Nightshift. Made in limited runs. Shipped worldwide.
        </p>
        <div className="flex gap-6">
          <Link to="/shop" className="label transition-colors hover:!text-foreground">
            Shop
          </Link>
          <Link to="/about" className="label transition-colors hover:!text-foreground">
            About
          </Link>
          <Link to="/contact" className="label transition-colors hover:!text-foreground">
            Contact
          </Link>
        </div>
      </div>
      <p className="label mt-10">© {new Date().getFullYear()} OG Cult</p>
    </footer>
  );
}
