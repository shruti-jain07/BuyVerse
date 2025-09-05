import { useCart } from "@/modules/checkout/hooks/use-cart";
import { Button } from "@/components/ui/button";
import { cn } from '@/lib/utils';
import Link from "next/link";
interface Props {
    tenantSlug: string;
    productId: string;
    variantId?: string;
    isPurchased?: boolean;
}
export const CartButton = ({ tenantSlug, productId, variantId, isPurchased }: Props) => {
    const cart = useCart(tenantSlug);
    if (isPurchased) {
        return (
            <Button
                variant="elevated"
                asChild
                className="flex-1 font-medium bg-white"
            >
                <Link href={`${process.env.NEXT_PUBLIC_APP_URL}/library/${productId}`}>
                    View in Library
                </Link>
            </Button>
        )
    }
    return (
        <Button
            variant="elevated"
            className={cn("flex-1 bg-[#EEF1DA]", cart.isProductInCart(productId, variantId) && "bg-white")}
            onClick={() => cart.toggleProduct(productId, variantId)}
        >
            {cart.isProductInCart(productId, variantId)
                ? "Remove from cart"
                : "Add to cart"
            }
        </Button>
    )
}