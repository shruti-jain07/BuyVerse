import { use, useCallback } from "react";
import { useCartStore } from "../store/use-cart-store";
import {useShallow} from "zustand/react/shallow"
export const useCart = (tenantSlug: string) => {

  const addProduct = useCartStore((state) => state.addProduct);
  const removeProduct = useCartStore((state) => state.removeProduct);
  const clearCart = useCartStore((state) => state.clearCart);
  const clearAllCarts = useCartStore((state) => state.clearAllCarts);

  const items = useCartStore(useShallow((state)=>state.tenantCarts[tenantSlug]?.items||[]));

  const toggleProduct = useCallback((productId: string, variantId?: string, price?: number, quantity?: number) => {
    const exists = items.some(
      (item) =>
        item.productId === productId &&
        item.variantId === variantId
    );
    if (exists) {
      removeProduct(tenantSlug, productId, variantId);
    } else {
      addProduct(tenantSlug, { productId, variantId, price, quantity });
    }
  },[addProduct,removeProduct,items,tenantSlug]);

  const isProductInCart = useCallback((productId: string, variantId?: string) => {
    return items.some(
      (item) =>
        item.productId === productId &&
        item.variantId === variantId
    );
  },[items]);

  const clearTenantCart = useCallback(() => {
    clearCart(tenantSlug);
  },[tenantSlug,clearCart])

  const handleAddProduct = useCallback(
  (item: { productId: string; variantId?: string; price?: number; quantity?: number }) => {
    addProduct(tenantSlug, item);
  },
  [addProduct, tenantSlug]
);

const handleRemoveProduct = useCallback(
  (productId: string, variantId?: string) => {
    removeProduct(tenantSlug, productId, variantId);
  },
  [removeProduct, tenantSlug]
);

  return {
    items, // now returns CartItem[]
    addProduct: handleAddProduct,
    removeProduct: handleRemoveProduct,
    clearCart: clearTenantCart,
    clearAllCarts,
    toggleProduct,
    isProductInCart,
    totalItems: items.reduce((sum, item) => sum + (item.quantity ?? 1), 0),
  };
};