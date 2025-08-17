import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware"

interface CartItem {
  productId: string;
  variantId?: string;
  price?: number;
  quantity?: number;
}

interface TenantCart {
  items: CartItem[];
}
interface CartState {
  tenantCarts: Record<string, TenantCart>;
  addProduct: (tenantSlug: string, item: CartItem) => void;
  removeProduct: (tenantSlug: string, productId: string, variantId?: string) => void;
  clearCart: (tenantSlug: string) => void;
  clearAllCarts: () => void;
  
}
export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      tenantCarts: {},
      addProduct: (tenantSlug, item) =>
        set((state) => {
          const existingItems = state.tenantCarts[tenantSlug]?.items || [];
          const itemIndex = existingItems.findIndex(
            (cartItem) =>
              cartItem.productId === item.productId &&
              cartItem.variantId === item.variantId
          );

          let newItems;

          if (itemIndex !== -1) {
            const existingItem = existingItems[itemIndex];
            if (!existingItem) {
              console.error("existingItem is undefined even though itemIndex != -1");
              // fallback to just add new item
              newItems = [...existingItems, item];
            } else {
              newItems = [...existingItems];
              newItems[itemIndex] = {
                productId: existingItem.productId,
                variantId: existingItem.variantId,
                price: existingItem.price,
                quantity: (existingItem.quantity ?? 1) + (item.quantity ?? 1),
              };
            }
          } else {
            newItems = [...existingItems, item];
          }

          return {
            tenantCarts: {
              ...state.tenantCarts,
              [tenantSlug]: {
                ...state.tenantCarts[tenantSlug],
                items: newItems,
              },
            },
          };
        }),

      removeProduct: (tenantSlug, productId, variantId) =>
        set((state) => ({
          tenantCarts: {
            ...state.tenantCarts,
            [tenantSlug]: {
              items: (state.tenantCarts[tenantSlug]?.items || []).filter(
                (cartItem) =>
                  !(cartItem.productId === productId && cartItem.variantId === variantId)

              ),
            }
          }
        })),

      clearCart: (tenantSlug) =>
        set((state) => ({
          tenantCarts: {
            ...state.tenantCarts,
            [tenantSlug]: {
              items: [],
            }
          }
        })),

      clearAllCarts: () =>
        set({
          tenantCarts: {},
        }),

  
    }),
    {
      name: "buyverse-cart",
      storage: createJSONStorage(() => localStorage),
    }
  )
);