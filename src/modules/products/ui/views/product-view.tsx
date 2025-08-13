"use client";
import { useTRPC } from "@/trpc/client";
import Image from "next/image";
import { useSuspenseQuery } from "@tanstack/react-query";
import { formatCurrency, generateTenantURL } from "@/lib/utils";
import Link from "next/link";
import { StarRating } from "@/components/star-rating";
import { Button } from "@/components/ui/button";
import { LinkIcon, StarIcon } from "lucide-react";
import { Fragment, useState } from "react";
import { Progress } from "@/components/ui/progress";
import { VariantSelector, Variant } from "@/modules/products/ui/components/variant-selector";
//import { CartButton } from "../components/cart-button";
import dynamic from "next/dynamic";
import { useCart } from "@/modules/checkout/hooks/use-cart";
const CartButton = dynamic(
    () => import("../components/cart-button").then(
        (mod) => mod.CartButton,

    ),
    {
        ssr: false,
        loading: () => <Button disabled className="flex-1 bg-[##EEF1DA] text-black" ></Button>
    },
)
interface Props {
    productId: string;
    tenantSlug: string;
    variantId?: string;
    quantity?:number;
};

export const ProductView = ({ productId, tenantSlug, variantId }: Props) => {
    const cart = useCart(tenantSlug);
    const trpc = useTRPC();
    const { data } = useSuspenseQuery(trpc.products.getOne.queryOptions({ id: productId }))
    const [selectedVariant, setSelectedVariant] = useState<any | null>(null);
    const mappedVariants: Variant[] = (data?.variants || []).map((v) => ({
        id: v.id ?? "", // fallback if id is null
        price: v.price ?? data.price ?? 0,
        options: (v.options || []).map((opt: any) => ({
            label: typeof opt === "string" ? opt : opt.label,
            attribute: opt.attribute ? { name: opt.attribute.name } : undefined,
        })),
    }));
    const [quantity, setQuantity] = useState(1); // default quantity is 1

    return (
        <div className="px-4 lg:px-12 py-10">
            <div className="border rounded-sm bg-white overflow-hidden">
                <div className="relative aspect-[3.9] border-b">
                    <Image
                        src={data.image?.url || "/images/.png"}
                        alt={data.name}
                        fill
                        className="object-cover"
                    />
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-6">
                    <div className="col-span-4">
                        <div className="p-6 ">
                            <h1 className="text-4xl font-medium">{data.name}</h1>
                        </div>
                        <div className="border-y flex">
                            <div className="px-6 py-4 flex items-center justify-center border-r">
                                <div className="px-2 py-1 border bg-[#EEF1DA] w-fit">
                                    <p className="text-base font-medium">
                                        {selectedVariant
                                            ? formatCurrency(selectedVariant.price ?? data.price)
                                            : formatCurrency(data.price)}
                                    </p>
                                </div>

                            </div>

                            <div className="px-6 py-4 flex items-center justify-center lg:border-r">
                                <Link href={generateTenantURL(tenantSlug)}
                                    className="flex items-center gap-2"
                                >
                                    {data.tenant.image?.url && (
                                        <Image
                                            src={data.tenant.image.url}
                                            alt={data.tenant.name}
                                            width={50}
                                            height={50}
                                            className="rounded-full border shrink-0 size-[50px]"
                                        />
                                    )}
                                    <p className="text-xl underline font-medium">{data.tenant.name}</p>
                                </Link>

                            </div>
                            <div className="hidden lg:flex px-6 py-4 items-center justify-center">
                                <div className="flex items-center gap-1">
                                    <StarRating
                                        rating={4}
                                        iconClassName="size-4"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="block lg:hidden px-6 py-4 items-center justify-center border-b">
                            <div className="flex items-center gap-1">
                                <StarRating
                                    rating={4}
                                    iconClassName="size-4"
                                />
                                <p className="text-base font-medium">{5} Rating</p>
                            </div>
                        </div>

                        <div className="p-6">
                            {data.description ? (
                                <p>{data.description}</p>
                            ) : (
                                <p className="font-medium text-muted-foreground italic">No Description Provided.</p>
                            )}
                        </div>

                        <div className="border-t border-black my-6 mt-6 px-6 py-4 space-y-4">

                            <h3 className="text-xl font-semibold">Choose Your Variant</h3>
                            <VariantSelector
                                variants={mappedVariants}
                                onVariantChange={(variant) => setSelectedVariant(variant)}
                            />

                        </div>



                    </div>

                    <div className="col-span-2 ">
                        <div className="border-t lg:border-t-0 lg:border-l h-full">
                            <div className="flex flex-col gap-4 p-6 border-b">
                                <div className="flex items-center gap-2">
                                    <span>Quantity</span>
                                    <button
                                        className="px-2 py-1 border rounded"
                                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                    >
                                        -
                                    </button>
                                    <input
                                        type="number"
                                        min={1}
                                        value={quantity}
                                        onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
                                        className="w-12 text-center border rounded"
                                    />
                                    <button
                                        className="px-2 py-1 border rounded"
                                        onClick={() => setQuantity(quantity + 1)}
                                    >
                                        +
                                    </button>
                                </div>
                                <div className="flex flex-row items-center gap-2">
                                    <CartButton
                                        productId={productId}
                                        tenantSlug={tenantSlug}
                                        variantId={selectedVariant?.id}
                                        quantity={quantity}
                                    />
                                    <Button
                                        className="size-12"
                                        variant="elevated"
                                        onClick={() => { }}
                                        disabled={false}
                                    >
                                        <LinkIcon />
                                    </Button>
                                </div>
                                <p className="text-center font-medium">
                                    {data.refundPolicy === "No Refunds"
                                        ? "No Refunds"
                                        : `${data.refundPolicy} money back guarantee`
                                    }
                                </p>
                            </div>

                            <div className="p-6 ">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-xl font-medium">Ratings</h3>
                                    <div className="flex items-center gap-x-1 font-medium">
                                        <StarIcon className="size-4 fill-black" />
                                        <p>({5})</p>
                                        <p className="text-base ">{5} ratings</p>
                                    </div>
                                </div>

                                <div
                                    className="grid grid-cols-[auto_1fr_auto] gap-3 mt-4"
                                >
                                    {[5, 4, 3, 2, 1].map((stars) => (
                                        <Fragment key={stars}>
                                            <div className="font-medium">{stars} {stars === 1 ? "star" : "stars"}</div>
                                            <Progress
                                                value={0}
                                                className="h-[1lh]"
                                            />
                                            <div className="font-medium">
                                                {0}%
                                            </div>

                                        </Fragment>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

