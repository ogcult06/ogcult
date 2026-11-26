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
      className="fixed inset-0 z-[70] flex items-center justify-center bg-pitch/35 p-4 backdrop-blur-md animate-in fade-in duration-300"
      onClick={dismiss}
    >
      <div
        className="relative w-full max-w-[17.5rem] overflow-hidden border border-bone/10 bg-pitch/35 text-bone shadow-[0_24px_70px_-24px_rgba(0,0,0,0.9)] backdrop-blur-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={dismiss}
          aria-label="Close promotion"
          className="absolute top-2.5 right-2.5 z-20 flex h-8 w-8 items-center justify-center bg-pitch/55 text-bone/75 transition-colors hover:bg-pitch/80 hover:text-bone"
        >
          <X className="h-3.5 w-3.5" />
        </button>

        <div className="relative aspect-[4/5] w-full overflow-hidden">
          <img
            src={slide.image}
            alt={slide.alt}
            className="h-full w-full object-cover object-center opacity-50"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-pitch/50 via-pitch/5 to-pitch/75" />

          <div className="absolute inset-0 flex flex-col items-center justify-between px-4 py-6 text-center">
            <div className="pt-1">
              <p className="promo-brand text-xl text-bone sm:text-2xl">{slide.titleTop}</p>
            </div>

            <div className="flex flex-col items-center">
              <p className="promo-discount text-3xl text-crimson sm:text-4xl">{slide.discount}</p>
              <p className="mt-1.5 font-sans text-[0.6rem] font-medium tracking-[0.28em] text-bone/85 uppercase">
                {slide.subtitle}
              </p>
              <button
                type="button"
                onClick={handleShop}
                className="mt-4 bg-bone px-7 py-2.5 font-sans text-[0.62rem] font-semibold tracking-[0.26em] text-pitch uppercase transition-colors hover:bg-crimson hover:text-bone"
              >
                {slide.ctaLabel}
              </button>
              <button
                type="button"
                onClick={dismiss}
                className="mt-2.5 font-sans text-[0.55rem] tracking-[0.2em] text-bone/50 uppercase transition-colors hover:text-bone"
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
