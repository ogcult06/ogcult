import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { ShopifyProduct } from "@/lib/shopify";

export interface CartItem {
  lineId: string | null;
  product: ShopifyProduct;
  variantId: string;
  variantTitle: string;
  price: { amount: string; currencyCode: string };
  quantity: number;
  selectedOptions: Array<{ name: string; value: string }>;
}

export interface CartCost {
  subtotalAmount: { amount: string; currencyCode: string } | null;
  totalAmount: { amount: string; currencyCode: string } | null;
  totalTaxAmount: { amount: string; currencyCode: string } | null;
}

interface CartStore {
  items: CartItem[];
  cost: CartCost | null;
  isLoading: boolean;
  isSyncing: boolean;
  isDrawerOpen: boolean;
  pendingVariantIds: string[];
  openDrawer: () => void;
  closeDrawer: () => void;
  addItem: (item: Omit<CartItem, "lineId">) => Promise<void>;
  updateQuantity: (variantId: string, quantity: number) => Promise<void>;
  removeItem: (variantId: string) => Promise<void>;
  clearCart: () => void;
  syncCart: () => Promise<void>;
  subtotal: () => number;
  currency: () => string;
}

const MAX_QTY_PER_LINE = 10;

function recalculate(items: CartItem[]): CartCost | null {
  if (items.length === 0) return null;
  const currencyCode = items[0]!.price.currencyCode;
  const subtotal = items.reduce((sum, i) => sum + parseFloat(i.price.amount) * i.quantity, 0);
  return {
    subtotalAmount: { amount: String(subtotal), currencyCode },
    totalAmount: { amount: String(subtotal), currencyCode },
    totalTaxAmount: null,
  };
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      cost: null,
      isLoading: false,
      isSyncing: false,
      isDrawerOpen: false,
      pendingVariantIds: [],

      openDrawer: () => set({ isDrawerOpen: true }),
      closeDrawer: () => set({ isDrawerOpen: false }),

      addItem: async (item) => {
        const { items } = get();
        const existing = items.find((i) => i.variantId === item.variantId);
        const next = existing
          ? items.map((i) =>
              i.variantId === item.variantId
                ? { ...i, quantity: Math.min(MAX_QTY_PER_LINE, i.quantity + item.quantity) }
                : i,
            )
          : [...items, { ...item, lineId: item.variantId }];
        set({ items: next, cost: recalculate(next) });
      },

      updateQuantity: async (variantId, quantity) => {
        if (quantity <= 0) {
          await get().removeItem(variantId);
          return;
        }
        const next = get().items.map((i) =>
          i.variantId === variantId ? { ...i, quantity: Math.min(MAX_QTY_PER_LINE, quantity) } : i,
        );
        set({ items: next, cost: recalculate(next) });
      },

      removeItem: async (variantId) => {
        const next = get().items.filter((i) => i.variantId !== variantId);
        set({ items: next, cost: recalculate(next) });
      },

      clearCart: () => set({ items: [], cost: null, pendingVariantIds: [] }),

      // Kept for compatibility with existing components; recomputes local totals.
      syncCart: async () => {
        set({ cost: recalculate(get().items) });
      },

      subtotal: () =>
        get().items.reduce((sum, i) => sum + parseFloat(i.price.amount) * i.quantity, 0),
      currency: () => get().items[0]?.price.currencyCode ?? "INR",
    }),
    {
      name: "ogcult-cart",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ items: state.items }),
    },
  ),
);
