import { ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";

type FloatingShopCtaProps = {
  onShopNow: () => void;
};

export function FloatingShopCta({ onShopNow }: FloatingShopCtaProps) {
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-4 z-40 flex justify-center px-4">
      <Button
        type="button"
        variant="ghost"
        onClick={onShopNow}
        className="floating-shop-pill pointer-events-auto h-[76px] w-[min(72vw,320px)] flex-col gap-1.5 rounded-full border px-8 py-3 text-glass-foreground backdrop-blur-[16px] transition-transform duration-200 hover:scale-[1.02] active:scale-[0.97] motion-reduce:transition-none motion-reduce:hover:scale-100 motion-reduce:active:scale-100 [&_svg]:size-6"
      >
        <ShoppingBag strokeWidth={2.2} aria-hidden />
        <span className="text-sm font-bold tracking-normal">Shop Now</span>
      </Button>
    </div>
  );
}
