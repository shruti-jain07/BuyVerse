import Link from "next/link";
import Image from "next/image";
import { cn, formatCurrency } from "@/lib/utils";

interface Props {
  isLast?: boolean;
  imageUrl?: string | null;
  name: string;
  productUrl: string;
  tenantUrl: string;
  tenantName: string;
  variantName?: string;
  price: number;

  finalPrice: number;
  quantity?: number;
  onRemove: () => void;
}

export const CheckoutItem = ({
  isLast,
  imageUrl,
  name,
  productUrl,
  tenantUrl,
  tenantName,
  variantName,
  price,

  finalPrice,
  quantity = 1,
  onRemove
}: Props) => {
  return (
    <div
      className={cn(
        "grid grid-cols-[8.5rem_1fr_auto] gap-4 pr-4 border-b",
        isLast && "border-b-0"
      )}
    >
      {/* Image */}
      <div className="overflow-hidden border-r">
        <div className="relative aspect-square h-full">
          <Image
            src={imageUrl || "/images/placeholder.png"}
            alt={name}
            fill
            className="object-cover"
          />
        </div>
      </div>

      {/* Info */}
      <div className="py-4 flex flex-col justify-between">
        <div>
          <Link href={productUrl}>
            <h4 className="font-bold underline">{name}</h4>
          </Link>
          {variantName && (
            <p className="text-sm text-muted-foreground">{variantName}</p>
          )}
          <Link href={tenantUrl}>
            <p className="font-medium underline">{tenantName}</p>
          </Link>
        </div>
      </div>

      {/* Price + remove */}
      <div className="py-4 flex flex-col justify-between items-end">
        <div className="font-light">
          <p>Quantity-{quantity}</p>
          <p>Price-{formatCurrency(price)}</p>
        </div>
        <div className="font-medium">
          <p className="text-lg">Total {formatCurrency(finalPrice)}</p>
        </div>
        <button
          className="underline font-medium cursor-pointer"
          onClick={onRemove}
          type="button"
        >
          Remove
        </button>
      </div>
    </div>
  );
};
