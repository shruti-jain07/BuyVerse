import { useCartStore } from "../store/use-cart-store";
export const useCart=(tenantSlug:string)=>{
    const {
        getCartByTenant,
        addProduct,
        removeProduct,
        clearCart,
        clearAllCarts
    }=useCartStore();

    const items = getCartByTenant(tenantSlug);
    
    const toggleProduct = (productId: string, variantId?: string, price?: number, quantity?:number) => {
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
  };

    const isProductInCart = (productId: string, variantId?: string) => {
    return items.some(
      (item) =>
        item.productId === productId &&
        item.variantId === variantId
    );
  };

    const clearTenantCart=()=>{
        clearCart(tenantSlug);
    }

    return {
    items, // now returns CartItem[]
    addProduct: (item: { productId: string; variantId?: string; price?: number; quantity?: number }) =>
      addProduct(tenantSlug, item),
    removeProduct: (productId: string, variantId?: string) =>
      removeProduct(tenantSlug, productId, variantId),
    clearCart: clearTenantCart,
    clearAllCarts,
    toggleProduct,
    isProductInCart,
    totalItems: items.reduce((sum, item) => sum + (item.quantity ?? 1), 0),
  };
};