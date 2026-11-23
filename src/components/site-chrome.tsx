import { Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Search, ShoppingBag, User, Menu, X, ChevronRight } from "lucide-react";
import { useCartStore } from "@/stores/cartStore";
import { SearchOverlay } from "@/components/search-overlay";
import { Newsletter } from "@/components/newsletter";
import { brand } from "@/lib/site-content";

type DrawerTab = "Menswear" | "Womenswear";

const drawerCategories = [
  { label: "Shop All", to: "/shop", search: {} },
  { label: "Oversized Hoodies", to: "/shop", search: { filter: "Hoodies" } },
  { label: "Oversized Sweatshirts", to: "/shop", search: { filter: "Sweatshirts" } },
  { label: "Oversized T-Shirts", to: "/shop", search: { filter: "T-Shirts" } },
  { label: "Sweatpants", to: "/shop", search: { filter: "Sweatpants" } },
  { label: "Caps", to: "/shop", search: { filter: "Caps" } },
] as const;

const collections = [
  { label: "Vol. 01 — Nightshift", to: "/shop", search: { filter: "New Drop" } },
  { label: "Black Label", to: "/shop", search: {} },
] as const;

export function SiteHeader() {
  const count = useCartStore((s) => s.items.reduce((sum, i) => sum + i.quantity, 0));
  const openDrawer = useCartStore((s) => s.openDrawer);
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [drawerTab, setDrawerTab] = useState<DrawerTab>("Menswear");

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

  // Transparent over the hero, crisp solid white once scrolled.
  const onDark = !scrolled && !menuOpen;

  const handleSignOut = async () => {
    const { supabase } = await import("@/integrations/supabase/client");
    await supabase.auth.signOut();
    navigate({ to: "/" });
  };

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          scrolled || menuOpen
            ? "border-b border-border bg-background/95 backdrop-blur-xl"
            : "border-b border-transparent bg-transparent"
        }`}
        style={
          onDark
            ? { color: "var(--color-bone)" }
            : { color: "var(--color-foreground)" }
        }
      >
        <div
          className={`grid grid-cols-[auto_1fr_auto] items-center px-5 transition-[padding] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] md:px-10 ${
            scrolled ? "py-3.5 md:py-4" : "py-5 md:py-6"
          }`}
        >
          {/* Left: Hamburger + Wordmark */}
          <div className="flex items-center gap-5">
            <button
              type="button"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((v) => !v)}
              className="flex h-9 w-9 items-center justify-center transition-opacity hover:opacity-60"
            >
              {menuOpen ? (
                <X className="h-[1.15rem] w-[1.15rem]" strokeWidth={2} />
              ) : (
                <Menu className="h-[1.15rem] w-[1.15rem]" strokeWidth={2} />
              )}
            </button>
            <Link
              to="/"
              aria-label={`${brand.name} — home`}
              className="font-logo text-xl leading-none tracking-[0.16em] uppercase transition-opacity duration-500 hover:opacity-70"
            >
              {brand.name}
            </Link>
          </div>

          {/* Center spacer */}
          <div className="hidden md:block" />

          {/* Right: Search, Account, Cart */}
          <div className="flex items-center justify-end gap-3 md:gap-4">
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              aria-label="Search"
              className="flex h-9 w-9 items-center justify-center transition-opacity hover:opacity-60 md:hidden"
            >
              <Search className="h-[1.15rem] w-[1.15rem]" strokeWidth={2} />
            </button>
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              aria-label="Search"
              className={`hidden md:flex items-center gap-2 rounded-full px-4 py-2 text-[0.65rem] tracking-[0.18em] uppercase transition-all duration-300 ${
                onDark
                  ? "border border-current/25 bg-current/10 backdrop-blur hover:bg-current/20"
                  : "border border-border bg-secondary hover:bg-accent"
              }`}
            >
              <Search className="h-3.5 w-3.5" strokeWidth={2} />
              <span>Search</span>
            </button>

            <Link
              to="/contact"
              aria-label="Account"
              className="flex h-9 w-9 items-center justify-center transition-opacity hover:opacity-60"
            >
              <User className="h-[1.15rem] w-[1.15rem]" strokeWidth={2} />
            </Link>

            <button
              type="button"
              onClick={openDrawer}
              aria-label={`Open cart, ${count} items`}
              className="relative flex h-9 items-center gap-1.5 px-1 transition-opacity hover:opacity-60"
            >
              <ShoppingBag className="h-[1.15rem] w-[1.15rem]" strokeWidth={2} />
              <span className="text-[0.65rem] tracking-[0.18em] uppercase">
                Bag {count}
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Slide-out Navigation Drawer */}
      <div
        className={`fixed inset-0 z-[60] transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          menuOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
        aria-hidden={!menuOpen}
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-foreground/30 backdrop-blur-sm"
          onClick={() => setMenuOpen(false)}
        />

        {/* Drawer panel */}
        <aside
          className={`absolute left-0 top-0 flex h-full w-full max-w-[420px] flex-col border-r border-border bg-background text-foreground transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
            menuOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          {/* Top bar */}
          <div className="flex items-center justify-between px-6 pt-6">
            <span className="label !text-foreground">Menu</span>
            <button
              type="button"
              onClick={() => setMenuOpen(false)}
              aria-label="Close menu"
              className="flex h-9 w-9 items-center justify-center transition-opacity hover:opacity-60"
            >
              <X className="h-5 w-5" strokeWidth={2} />
            </button>
          </div>

          {/* Tabs */}
          <div className="mt-6 flex gap-1 border-b border-border px-6">
            {(["Menswear", "Womenswear"] as DrawerTab[]).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setDrawerTab(tab)}
                className={`relative pb-3 text-[0.7rem] tracking-[0.2em] uppercase transition-colors ${
                  drawerTab === tab
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab}
                {drawerTab === tab && (
                  <span className="absolute inset-x-0 -bottom-px h-px bg-foreground" />
                )}
              </button>
            ))}
          </div>

          {/* Categories */}
          <nav
            aria-label={`${drawerTab} navigation`}
            className="flex-1 flex flex-col gap-0 overflow-y-auto px-6 py-6"
          >
            {drawerCategories.map((item) => (
              <Link
                key={item.label}
                to={item.to}
                search={item.search}
                onClick={() => setMenuOpen(false)}
                className="group flex items-center justify-between border-b border-border/60 py-4 font-display text-2xl uppercase text-foreground transition-colors hover:text-muted-foreground"
              >
                {item.label}
                <ChevronRight
                  className="h-4 w-4 -translate-x-2 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100"
                  strokeWidth={2}
                />
              </Link>
            ))}

            {/* Collections */}
            <p className="label mt-8 mb-3">Collections</p>
            {collections.map((item) => (
              <Link
                key={item.label}
                to={item.to}
                search={item.search}
                onClick={() => setMenuOpen(false)}
                className="group flex items-center justify-between border-b border-border/60 py-4 text-[0.85rem] tracking-[0.14em] uppercase text-foreground transition-colors hover:text-muted-foreground"
              >
                {item.label}
                <ChevronRight
                  className="h-4 w-4 -translate-x-2 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100"
                  strokeWidth={2}
                />
              </Link>
            ))}
          </nav>

          {/* Footer links */}
          <div className="border-t border-border px-6 py-5">
            <div className="flex items-center gap-5">
              <Link
                to="/contact"
                onClick={() => setMenuOpen(false)}
                className="label transition-colors hover:!text-foreground"
              >
                Account
              </Link>
              <Link
                to="/about"
                onClick={() => setMenuOpen(false)}
                className="label transition-colors hover:!text-foreground"
              >
                About
              </Link>
              <Link
                to="/contact"
                onClick={() => setMenuOpen(false)}
                className="label transition-colors hover:!text-foreground"
              >
                Contact
              </Link>
            </div>
            <div className="mt-4 flex gap-5">
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
          </div>
        </aside>
      </div>

      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-border px-5 pt-16 pb-10 md:px-10">
      <div className="grid gap-12 md:grid-cols-[1.2fr_1fr]">
        <div className="grid grid-cols-2 gap-10">
          <div>
            <p className="label">Shop</p>
            <ul className="mt-5 space-y-3">
              <li>
                <Link to="/shop" className="text-xs uppercase hover:opacity-60">
                  Shop
                </Link>
              </li>
              <li>
                <Link
                  to="/shop"
                  search={{ filter: "New Drop" }}
                  className="text-xs uppercase hover:opacity-60"
                >
                  New Drop
                </Link>
              </li>
              <li>
                <Link to="/size-guide" className="text-xs uppercase hover:opacity-60">
                  Size Guide
                </Link>
              </li>
              <li>
                <Link to="/shipping-returns" className="text-xs uppercase hover:opacity-60">
                  Shipping & Returns
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <p className="label">Brand</p>
            <ul className="mt-5 space-y-3">
              <li>
                <Link to="/about" className="text-xs uppercase hover:opacity-60">
                  About
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-xs uppercase hover:opacity-60">
                  Contact
                </Link>
              </li>
              {brand.socials.map((s) => (
                <li key={s.label}>
                  <a
                    href={s.href}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs uppercase hover:opacity-60"
                  >
                    {s.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="hidden md:block">
          <Newsletter compact />
        </div>
      </div>

      <p aria-hidden="true" className="display-xl mt-16 text-muted-foreground/15">
        OG Cult
      </p>

      <div className="mt-8 flex flex-col gap-4 border-t border-border pt-6 md:flex-row md:items-center md:justify-between">
        <p className="label">© {new Date().getFullYear()} OG Cult</p>
        <div className="flex gap-6">
          <Link to="/privacy" className="label transition-colors hover:!text-foreground">
            Privacy
          </Link>
          <Link to="/terms" className="label transition-colors hover:!text-foreground">
            Terms
          </Link>
        </div>
      </div>
    </footer>
  );
}
