import { useEffect, useState } from "react";
import { ShoppingBag } from "lucide-react";

type FloatingShopCtaProps = {
  onShopNow: () => void;
};

/**
 * iOS-26 style liquid-glass floating bar: a frosted pill fixed 16px above the
 * bottom of the screen. It materialises once the visitor scrolls past the front
 * banner, so it never competes with the banner's own CTA or its pagination dots.
 */
export function FloatingShopCta({ onShopNow }: FloatingShopCtaProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > window.innerHeight * 0.9);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <div
      aria-hidden={!visible}
      className={`fixed inset-x-0 bottom-4 z-40 flex justify-center px-4 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
        visible ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-8 opacity-0"
      }`}
    >
      <button
        type="button"
        tabIndex={visible ? 0 : -1}
        onClick={onShopNow}
        className="flex w-full max-w-[420px] items-center justify-center gap-3 rounded-full border border-white/70 bg-white/78 px-8 py-4 text-pitch shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_18px_44px_-14px_rgba(0,0,0,0.7)] backdrop-blur-[16px] transition-transform duration-200 ease-out hover:scale-[1.03] active:scale-[0.97] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pitch"
      >
        <ShoppingBag className="h-5 w-5" strokeWidth={2.2} aria-hidden />
        <span className="text-[0.95rem] font-bold uppercase tracking-[0.22em]">Shop Now</span>
      </button>
    </div>
  );
}
