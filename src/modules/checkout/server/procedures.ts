import z from "zod"; 
import { baseProcedure, createTRPCRouter } from "@/trpc/init";
import { Media, Tenant } from "@/payload-types";
import { TRPCError } from "@trpc/server";

export const checkoutRouter = createTRPCRouter({
  getProducts: baseProcedure
    .input(
      z.object({
        items: z.array(
          z.object({
            productId: z.string(),
            variantId: z.string().optional(),
            quantity: z.number().optional(),
          })
        ),
      })
    )
    .query(async ({ ctx, input }) => {
      const productIds = Array.from(new Set(input.items.map((i) => i.productId)));

      const data = await ctx.payload.find({
        collection: "products",
        depth: 2,
        where: { id: { in: productIds } },
      });

      if (data.totalDocs !== productIds.length) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Products not found",
        });
      }

    console.log("Incoming cart items:", input.items);

      const enrichedDocs = input.items.map((cartItem) => {
        const doc = data.docs.find((d) => d.id === cartItem.productId);
        if (!doc) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Product not found" });
        }

        const variant = cartItem.variantId
          ? (doc.variants || []).find(
              (v: any) =>
                String(v.id) === String(cartItem.variantId) ||
                String(v._id) === String(cartItem.variantId)
            )
          : undefined;

        const unitPrice = Number(variant?.price ?? doc.price ?? 0);
        const quantity = Math.max(1,Math.floor(cartItem.quantity ?? 1));

        return {
          ...doc,
          image: doc.image as Media | null,
          tenant: doc.tenant as Tenant & { image: Media | null },
          variants: (doc.variants || []).map((v: any) => ({
            ...v,
            price: Number(v.price ?? doc.price ?? 0),
            name: v.name ?? v.label ?? "Variant",
          })),
          selectedVariant: variant
            ? { ...variant, 
              name: (variant as any).name ?? variant.label ?? "Variant",
              price: Number(variant.price ?? doc.price ?? 0) }
            : null,
          quantity,
          unitPrice,
          finalPrice: Math.round(unitPrice * quantity * 100) / 100
,
        };
      });

      return {
        docs: enrichedDocs,
        totalPrice: enrichedDocs.reduce(
          (acc, p) => acc + (Number(p.finalPrice) || 0),
          0
        ),
      };
    }),
});
