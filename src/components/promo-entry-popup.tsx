import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { promoHeroSlides } from "@/lib/site-content";

const STORAGE_KEY = "ogcult-promo-popup-dismissed";

export function PromoEntryPopup({ onShopNow }: { onShopNow: () => void }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    try {
      if (sessionStorage.getItem(STORAGE_KEY) === "1") return;
    } catch {
      // Ignore storage access errors
    }
    const timer = window.setTimeout(() => setOpen(true), 900);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") dismiss();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  const dismiss = () => {
    setOpen(false);
    try {
      sessionStorage.setItem(STORAGE_KEY, "1");
    } catch {
      // Ignore storage access errors
    }
  };

  const handleShop = () => {
    dismiss();
    onShopNow();
  };

  if (!open) return null;

  const slide = promoHeroSlides[0];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${slide.titleTop} — ${slide.discount}`}
      className="fixed inset-0 z-[70] flex items-center justify-center bg-pitch/80 p-4 backdrop-blur-sm animate-in fade-in duration-300"
      onClick={dismiss}
    >
      <div
        className="relative w-full max-w-md overflow-hidden border border-bone/15 bg-pitch text-bone shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={dismiss}
          aria-label="Close promotion"
          className="absolute top-3.5 right-3.5 z-20 flex h-9 w-9 items-center justify-center bg-pitch/70 text-bone/80 transition-colors hover:bg-pitch hover:text-bone"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="relative aspect-[4/5] w-full overflow-hidden bg-pitch">
          <img
            src={slide.image}
            alt={slide.alt}
            className="h-full w-full object-cover object-center opacity-85"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-pitch/80 via-pitch/20 to-pitch" />

          <div className="absolute inset-0 flex flex-col items-center justify-between px-6 py-8 text-center">
            <div className="pt-2">
              <p className="promo-grunge text-2xl text-bone sm:text-3xl">{slide.titleTop}</p>
            </div>

            <div className="flex flex-col items-center">
              <p className="promo-discount text-4xl text-crimson sm:text-5xl">{slide.discount}</p>
              <p className="mt-2 font-sans text-xs font-medium tracking-[0.3em] text-bone uppercase">
                {slide.subtitle}
              </p>
              <button
                type="button"
                onClick={handleShop}
                className="mt-6 bg-bone px-9 py-3.5 font-sans text-[0.7rem] font-semibold tracking-[0.28em] text-pitch uppercase transition-colors hover:bg-crimson hover:text-bone"
              >
                {slide.ctaLabel}
              </button>
              <button
                type="button"
                onClick={dismiss}
                className="mt-3 font-sans text-[0.62rem] tracking-[0.22em] text-bone/55 uppercase transition-colors hover:text-bone"
              >
                Continue browsing
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}