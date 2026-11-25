import { Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Search, ShoppingBag, User, Menu, X, ChevronRight, Truck, CreditCard, Headphones, ShieldCheck } from "lucide-react";
import { useCartStore } from "@/stores/cartStore";
import { SearchOverlay } from "@/components/search-overlay";
import { Newsletter } from "@/components/newsletter";
import { brand } from "@/lib/site-content";

const navItems = [
  { to: "/", label: "Home", search: {} },
  { to: "/shop", label: "Shop All", search: {} },
  { to: "/shop", label: "Hoodies", search: { filter: "Hoodies" } },
  { to: "/shop", label: "Sweatshirts", search: { filter: "Sweatshirts" } },
  { to: "/shop", label: "T-Shirts", search: { filter: "T-Shirts" } },
  { to: "/shop", label: "Sweatpants", search: { filter: "Sweatpants" } },
  { to: "/shop", label: "Caps", search: { filter: "Caps" } },
  { to: "/shop", label: "Collections", search: { filter: "Collections" } },
] as const;

export function SiteHeader() {
  const count = useCartStore((s) => s.items.reduce((sum, i) => sum + i.quantity, 0));
  const openDrawer = useCartStore((s) => s.openDrawer);
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const handleSignOut = async () => {
    const { supabase } = await import("@/integrations/supabase/client");
    await supabase.auth.signOut();
    navigate({ to: "/" });
  };

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          scrolled || menuOpen
            ? "border-b border-border/70 bg-background/95 backdrop-blur-xl"
            : "border-b border-transparent bg-gradient-to-b from-background/60 to-transparent"
        }`}
      >
        <div
          className={`grid grid-cols-[auto_1fr_auto] items-center px-5 transition-[padding] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] md:px-10 ${
            scrolled ? "py-3.5 md:py-4" : "py-5 md:py-7"
          }`}
        >
          {/* Left: Hamburger + Wordmark */}
          <div className="flex items-center gap-6">
            <button
              type="button"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((v) => !v)}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-transparent transition-colors hover:bg-accent md:hidden"
            >
              {menuOpen ? (
                <X className="h-5 w-5" strokeWidth={2.5} />
              ) : (
                <Menu className="h-5 w-5" strokeWidth={2.5} />
              )}
            </button>
            <Link
              to="/"
              aria-label={`${brand.name} — home`}
              className="font-logo !text-foreground text-2xl leading-none tracking-[0.18em] uppercase transition-opacity duration-500 hover:opacity-70"
            >
              {brand.name}
            </Link>
          </div>

          {/* Center: Empty on desktop, logo on mobile (hidden when menu open) */}
          <div className="hidden md:block" />

          {/* Right: Search, Account, Cart */}
          <div className="flex items-center justify-end gap-3 md:gap-5">
            {/* Search Trigger */}
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              aria-label="Search"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-transparent transition-colors hover:bg-accent md:hidden"
            >
              <Search className="h-5 w-5" strokeWidth={2} />
            </button>
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              aria-label="Search"
              className="hidden md:flex items-center gap-2 rounded-full border border-border/60 bg-background/50 px-4 py-2 text-[0.65rem] tracking-[0.2em] uppercase transition-all duration-300 hover:border-foreground hover:bg-background"
            >
              <Search className="h-4 w-4" strokeWidth={2} />
              <span>Search</span>
            </button>

            {/* Account */}
            <Link
              to="/contact"
              aria-label="Account"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-transparent transition-colors hover:bg-accent"
            >
              <User className="h-5 w-5" strokeWidth={2} />
            </Link>

            {/* Cart */}
            <button
              type="button"
              onClick={openDrawer}
              aria-label={`Open cart, ${count} items`}
              className="relative flex h-10 w-10 items-center justify-center rounded-full bg-transparent transition-colors hover:bg-accent"
            >
              <ShoppingBag className="h-5 w-5" strokeWidth={2} />
              {count > 0 && (
                <span
                  className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center text-[0.55rem] font-medium leading-none bg-blood text-bone rounded-full"
                >
                  {count > 99 ? "99+" : count}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Slide-out Navigation Drawer */}
      <div
        className={`fixed inset-0 z-[60] flex flex-col transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          menuOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
        aria-hidden={!menuOpen}
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-background/95 backdrop-blur-xl"
          onClick={() => setMenuOpen(false)}
        />

        {/* Drawer Content */}
        <aside
          className="relative flex flex-col w-full max-w-sm border-r border-border bg-background p-6 pt-20"
        >
          {/* Close Button */}
          <button
            type="button"
            onClick={() => setMenuOpen(false)}
            aria-label="Close menu"
            className="absolute top-6 right-6 flex h-10 w-10 items-center justify-center rounded-full bg-transparent transition-colors hover:bg-accent"
          >
            <X className="h-5 w-5" strokeWidth={2.5} />
          </button>

          {/* Navigation Links */}
          <nav aria-label="Main navigation" className="flex-1 flex flex-col gap-1">
            {navItems.map((item) => (
              <Link
                key={item.label}
                to={item.to}
                search={item.search}
                onClick={() => setMenuOpen(false)}
                className="group flex items-center gap-4 px-2 py-4 font-display text-2xl uppercase text-foreground transition-colors hover:opacity-60"
              >
                {item.label}
                <ChevronRight className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity" strokeWidth={2} />
              </Link>
            ))}

            {/* Account Link */}
            <Link
              to="/contact"
              onClick={() => setMenuOpen(false)}
              className="group flex items-center gap-4 px-2 py-4 font-display text-2xl uppercase text-foreground transition-colors hover:opacity-60"
            >
              Account
              <ChevronRight className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity" strokeWidth={2} />
            </Link>

            {/* Sign Out (if authenticated) - placeholder for future auth state */}
          </nav>

          {/* Social Links */}
          <div className="mt-8 flex gap-6 border-t border-border/60 pt-6">
            {brand.socials.map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noreferrer"
                className="label transition-colors hover:!text-foreground"
              >
                {s.label}
              </a>
            ))}
          </div>
        </aside>
      </div>

      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}

export function SiteFooter() {
  const policies = [
    {
      title: "Free Shipping",
      icon: Truck,
      content:
        "Free shipping across India on all orders. Orders placed before 2 PM IST ship the same day and dispatch within 24 hours.",
    },
    {
      title: "Cash on Delivery",
      icon: CreditCard,
      content:
        "Pay in cash at your doorstep. Available on all orders — no advance payment required. Please keep exact change ready.",
    },
    {
      title: "Priority Support",
      icon: Headphones,
      content:
        "Our support team responds within 2 hours on business days. Reach us at support@ogcult.store for any order queries.",
    },
    {
      title: "OG Cult's Promise",
      icon: ShieldCheck,
      content:
        "Every piece is built in limited runs. If you're not satisfied, easy replacements or full refunds within 30 days.",
    },
  ];

  return (
    <footer className="bg-white px-5 pb-10 pt-16 md:px-10">
      {/* Policy Tabs */}
      <div className="border-b border-gray-100">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {policies.map((p) => (
            <div key={p.title} className="flex flex-col items-center gap-2 text-center">
              <p.icon className="h-6 w-6 text-[#111111]" strokeWidth={1.5} />
              <p className="text-sm font-semibold text-[#111111]">{p.title}</p>
              <p className="text-xs leading-relaxed text-gray-500">{p.content}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 4-Column Footer */}
      <div className="mt-12 grid gap-10 md:grid-cols-4">
        {/* OG CULT */}
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-[#111111]">OG CULT</p>
          <ul className="mt-5 space-y-3">
            <li>
              <Link to="/about" className="text-sm text-gray-500 transition-colors hover:text-[#111111]">
                About
              </Link>
            </li>
            <li>
              <Link to="/size-guide" className="text-sm text-gray-500 transition-colors hover:text-[#111111]">
                Sizing Guide
              </Link>
            </li>
            <li>
              <Link to="/shop" className="text-sm text-gray-500 transition-colors hover:text-[#111111]">
                Shop All
              </Link>
            </li>
          </ul>
        </div>

        {/* Social */}
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-[#111111]">Social</p>
          <ul className="mt-5 space-y-3">
            <li>
              <a
                href={brand.socials[0]?.href ?? "https://instagram.com"}
                target="_blank"
                rel="noreferrer"
                className="text-sm text-gray-500 transition-colors hover:text-[#111111]"
              >
                Instagram
              </a>
            </li>
          </ul>
        </div>

        {/* Legal */}
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-[#111111]">Legal</p>
          <ul className="mt-5 space-y-3">
            <li>
              <Link to="/privacy" className="text-sm text-gray-500 transition-colors hover:text-[#111111]">
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link to="/shipping-returns" className="text-sm text-gray-500 transition-colors hover:text-[#111111]">
                Cancellation & Refund
              </Link>
            </li>
            <li>
              <Link to="/shipping-returns" className="text-sm text-gray-500 transition-colors hover:text-[#111111]">
                Shipping & Exchange
              </Link>
            </li>
            <li>
              <Link to="/terms" className="text-sm text-gray-500 transition-colors hover:text-[#111111]">
                Terms & Conditions
              </Link>
            </li>
          </ul>
        </div>

        {/* Contact */}
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-[#111111]">Contact Us</p>
          <ul className="mt-5 space-y-3">
            <li>
              <a
                href="mailto:support@ogcult.store"
                className="text-sm text-gray-500 transition-colors hover:text-[#111111]"
              >
                support@ogcult.store
              </a>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-gray-100 pt-6 md:flex-row">
        <p className="text-xs text-gray-500">
          © 2026 OG CULT, All Rights Reserved
        </p>
        <div className="flex gap-6">
          <Link to="/privacy" className="text-xs text-gray-500 transition-colors hover:text-[#111111]">
            Privacy
          </Link>
          <Link to="/terms" className="text-xs text-gray-500 transition-colors hover:text-[#111111]">
            Terms
          </Link>
        </div>
      </div>
    </footer>
  );
}