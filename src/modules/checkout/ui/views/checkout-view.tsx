"use client";
import { useTRPC } from "@/trpc/client";
import { useQuery } from "@tanstack/react-query";
import { useCart } from "../../hooks/use-cart";
import { useEffect } from "react";
import { toast } from "sonner";
import { TRPCClientError } from "@trpc/client";
import { generateTenantURL } from "@/lib/utils";
import { CheckoutItem } from "../components/checkout-items";

interface Props {
  tenantSlug: string;
}

export const CheckoutView = ({ tenantSlug }: Props) => {
  const { items, removeProduct, clearAllCarts } = useCart(tenantSlug);
  const trpc = useTRPC();

  const { data, error } = useQuery(
    trpc.checkout.getProducts.queryOptions({
      items, 
      // now passing full cart items (productId, variantId, quantity)
      
    })
  );
  

  useEffect(() => {
    if (error instanceof TRPCClientError && error.data?.code === "NOT_FOUND") {
      console.log("Invalid Cart Found, Cart Cleared");
      clearAllCarts();
      toast.warning("Invalid Cart Found, Cart Cleared");
    }
  }, [error, clearAllCarts]);

  return (
    <div className="lg:pt-16 pt-4 px-4 lg:px-12">
      <div className="grid grid-cols-1 lg:grid-cols-7 gap-4 lg:gap-16">
        {/* Left column */}
        <div className="lg:col-span-4">
          <div className="border rounded-md overflow-hidden bg-white">
            {data?.docs.map((product, index) => (
              <CheckoutItem
              
                key={`${product.id}-${product.selectedVariant?.id ?? "base"}`}
                isLast={index === data.docs.length - 1}
                imageUrl={product.image?.url}
                name={product.name}
                productUrl={`${generateTenantURL(product.tenant.slug)}/products/${product.id}`}
                tenantUrl={generateTenantURL(product.tenant.slug)}
                tenantName={product.tenant.name}
                variantName={product.selectedVariant?.name}
                price={product.unitPrice}
                finalPrice={product.finalPrice}
                quantity={product.quantity}
                onRemove={() =>
                  removeProduct(product.id, product.selectedVariant?.id??undefined)
                }
              />
            ))}
          </div>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-3">
          {/* Example: a CheckoutSidebar can now use data.totalPrice directly */}
          {/* <CheckoutSidebar total={data?.totalPrice ?? 0} /> */}
        </div>
      </div>
    </div>
  );
};
