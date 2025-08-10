import { useCart } from "@/modules/checkout/hooks/use-cart";
import { Button } from "@/components/ui/button";
import {cn} from '@/lib/utils';
interface Props {
    tenantSlug: string;
    productId:string;
}
export const CartButton = ({ tenantSlug,productId }: Props) => {
    const cart = useCart(tenantSlug);
    return (
        <Button
            variant="elevated"
            className={cn("flex-1 bg-[#EEF1DA]",cart.isProductInCart(productId)&&"bg-white")}
            onClick={()=>cart.toggleProduct(productId)}
        >
           {cart.isProductInCart(productId)
            ?"Remove from cart"
            :"Add to cart"
           }
        </Button>
    )
}