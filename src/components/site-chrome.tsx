import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Search, ShoppingBag, User } from "lucide-react";
import { useCartStore } from "@/stores/cartStore";
import { SearchOverlay } from "@/components/search-overlay";
import { Newsletter } from "@/components/newsletter";
import { brand } from "@/lib/site-content";

const primaryNav = [
  { to: "/shop", label: "Shop", search: {} },
  { to: "/shop", label: "New Drop", search: { filter: "New Drop" } },
  { to: "/about", label: "About", search: {} },
] as const;

export function SiteHeader() {
  const count = useCartStore((s) => s.items.reduce((sum, i) => sum + i.quantity, 0));
  const openDrawer = useCartStore((s) => s.openDrawer);
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

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
          scrolled || menuOpen
            ? "border-b border-border/70 bg-background/70 backdrop-blur-xl"
            : "border-b border-transparent bg-transparent"
        }`}
      >
        <div className="grid grid-cols-3 items-center px-5 py-4 md:px-10">
          {/* Left */}
          <div className="flex items-center gap-8">
            <button
              type="button"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((v) => !v)}
              className="label !text-foreground md:hidden"
            >
              {menuOpen ? "Close" : "Menu"}
            </button>
            <Link
              to="/"
              className="font-display hidden text-lg tracking-[0.28em] uppercase md:block"
            >
              {brand.name}
            </Link>
          </div>

          {/* Center */}
          <nav aria-label="Main" className="hidden justify-center gap-10 md:flex">
            {primaryNav.map((item) => (
              <Link
                key={item.label}
                to={item.to}
                search={item.search}
                className="label transition-colors hover:!text-foreground"
                activeProps={{ className: "label !text-foreground" }}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <Link
            to="/"
            className="font-display justify-self-center text-base tracking-[0.28em] uppercase md:hidden"
          >
            {brand.name}
          </Link>

          {/* Right */}
          <div className="flex items-center justify-end gap-5 md:gap-7">
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              aria-label="Search"
              className="hidden md:block"
            >
              <Search className="h-4 w-4" />
            </button>
            <Link to="/contact" aria-label="Account" className="hidden md:block">
              <User className="h-4 w-4" />
            </Link>
            <button
              type="button"
              onClick={openDrawer}
              aria-label={`Open cart, ${count} items`}
              className="label !text-foreground flex items-center gap-2"
            >
              <ShoppingBag className="h-4 w-4 md:hidden" />
              <span className="hidden md:inline">Cart</span>
              <span>[{count}]</span>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile full-screen nav */}
      <div
        className={`fixed inset-0 z-40 flex flex-col bg-background px-5 pt-24 pb-10 transition-all duration-500 md:hidden ${
          menuOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
        aria-hidden={!menuOpen}
      >
        <nav aria-label="Mobile" className="flex flex-col gap-5">
          {primaryNav.map((item) => (
            <Link
              key={item.label}
              to={item.to}
              search={item.search}
              onClick={() => setMenuOpen(false)}
              className="font-display text-5xl uppercase"
            >
              {item.label}
            </Link>
          ))}
          <Link
            to="/contact"
            onClick={() => setMenuOpen(false)}
            className="font-display text-5xl uppercase"
          >
            Contact
          </Link>
        </nav>
        <button
          type="button"
          onClick={() => {
            setMenuOpen(false);
            setSearchOpen(true);
          }}
          className="label mt-10 self-start !text-foreground"
        >
          Search
        </button>
        <div className="mt-auto flex gap-6">
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

      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-border/60 px-5 pt-16 pb-10 md:px-10">
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
                  Shipping &amp; Returns
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
        <Newsletter compact />
      </div>

      <p aria-hidden="true" className="display-xl mt-16 text-muted-foreground/15">
        OG Cult
      </p>

      <div className="mt-8 flex flex-col gap-4 border-t border-border/60 pt-6 md:flex-row md:items-center md:justify-between">
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
