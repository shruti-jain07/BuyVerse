import { useCart } from "@/modules/checkout/hooks/use-cart";
import { Button } from "@/components/ui/button";
import {cn} from '@/lib/utils';
interface Props {
    tenantSlug: string;
    productId:string;
    variantId?: string;
    quantity?:number;
}
export const CartButton = ({ tenantSlug,productId,variantId,quantity}: Props) => {
    const cart = useCart(tenantSlug);
    return (
        <Button
            variant="elevated"
            className={cn("flex-1 bg-[#EEF1DA]",cart.isProductInCart(productId,variantId)&&"bg-white")}
            onClick={() => cart.toggleProduct(productId, variantId, undefined, quantity)}
        >
           {cart.isProductInCart(productId,variantId)
            ?"Remove from cart"
            :"Add to cart"
           }
        </Button>
    )
}