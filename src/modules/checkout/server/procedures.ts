import z from "zod";
import { baseProcedure, createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { Media, Tenant } from "@/payload-types";
import { TRPCError } from "@trpc/server";
import Stripe from "stripe";
import { CheckoutMetadata, ProductMetadata } from "../types";
import { stripe } from "@/lib/stripe";
import { generateTenantURL } from "@/lib/utils";
import { PLATFORM_FEE_PERCENTAGE } from "@/constants";

const getVariantId = (v: any) => String(v?.id ?? v?._id ?? "");
const toPaise = (amount: number | null | undefined) => {
  const n = Number(amount);
  if (!Number.isFinite(n) || n < 0) {
    throw new TRPCError({ code: "BAD_REQUEST", message: "Invalid price" });
  }
  return Math.round(n * 100); // INR -> paise
};
export const checkoutRouter = createTRPCRouter({

  verify: protectedProcedure
    .mutation(async ({ ctx }) => {
      const user = await ctx.payload.findByID({
        collection: "users",
        id: ctx.session.user.id,
        depth: 0
      })
      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found"
        })
      }

      const tenantId = user.tenants?.[0]?.tenant as string;
      const tenant = await ctx.payload.findByID({
        collection: "tenants",
        id: tenantId
      })

      if (!tenant) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Tenant not found"
        })
      }

      const accountLink = await stripe.accountLinks.create({
        account: tenant.stripeAccountId,
        refresh_url: `${process.env.NEXT_PUBLIC_APP_URL!}/admin`,
        return_url: `${process.env.NEXT_PUBLIC_APP_URL!}/admin`,
        type: "account_onboarding"
      })

      if (!accountLink.url) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Failed to create verification link"
        })
      }
      return { url: accountLink.url }
    }),

  purchase: protectedProcedure
    .input(
      z.object({
        items: z.array(
          z.object({
            productId: z.string().min(1),
            variantId: z.string().optional(),
            
          })
        ),
        tenantSlug: z.string().min(1),
      })
    )

    .mutation(async ({ ctx, input }) => {
      const productIds = Array.from(new Set(input.items.map(i => i.productId)));
      const products = await ctx.payload.find({
        collection: "products",
        depth: 2,
        where: {
          and: [
            {
              id: {
                in: productIds
              }
            },
            {
              "tenant.slug": {
                equals: input.tenantSlug
              }
            },
            {
              isArchived:{
                not_equals:true,
              }
            }
          ]
        }
      });

      if (products.totalDocs !== productIds.length) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Products not found" })
      }

      const tenantsData = await ctx.payload.find({
        collection: "tenants",
        limit: 1,
        pagination: false,
        where: {
          slug: {
            equals: input.tenantSlug,
          }
        }
      })

      const tenant = tenantsData.docs[0]

      if (!tenant) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Tenant not found"
        })
      }
      if (!tenant.stripeDetailsSubmitted) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Tenant not allowed to sell products"
        })
      }
      const productMap = new Map(products.docs.map((p: any) => [String(p.id), p]));

      const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] =
        input.items.map((item) => {
          const product: any = productMap.get(item.productId);
          if (!product) {
            throw new TRPCError({ code: "NOT_FOUND", message: "Product not found" });
          }

          const variant = item.variantId
            ? (product.variants ?? []).find((v: any) => getVariantId(v) === String(item.variantId))
            : null;

          if (item.variantId && !variant) {
            throw new TRPCError({ code: "NOT_FOUND", message: "Variant not found" });
          }

          const rawPrice = variant?.price ?? product.price;
          if (rawPrice == null) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: `Price missing for product ${product.id} variant ${item.variantId ?? "default"}`,
            });
          }

          return {
            
            price_data: {
              unit_amount: toPaise(rawPrice),
              currency: "INR",
              product_data: {
                name: variant
                  ? `${product.name} - ${variant.label ?? "Variant"}`
                  : product.name,
                metadata: {
                  stripeAccountId: String(tenant.stripeAccountId),
                  id: String(product.id),
                  name: String(product.name),
                  variantId: variant ? getVariantId(variant) : undefined,
                  variantName: variant?.label ?? "",

                  price: Number(rawPrice),
                } as ProductMetadata,
              },
            },
             quantity: 1,
          };
        });

      console.log("Creating checkout session for user:", ctx.session.user.id, "tenant:", input.tenantSlug);
        const totalAmount=products.docs.reduce(
          (acc,item)=>acc+item.price*100,
          0
        )
        const platformFeeAmount=Math.round(
          totalAmount*(PLATFORM_FEE_PERCENTAGE/100)
        );

        const domain=generateTenantURL(input.tenantSlug);
        
      const checkout = await stripe.checkout.sessions.create({
        customer_email: ctx.session.user.email,
        success_url: `${domain}/checkout?success=true`,
        cancel_url: `${domain}/checkout?cancel=true`,
        mode: "payment",
        line_items: lineItems,
        invoice_creation: {
          enabled: true,
        },
        metadata: {
          userId: String(ctx.session.user.id),
          tenantSlug:input.tenantSlug
          
        } as CheckoutMetadata,
        payment_intent_data:{
          application_fee_amount:platformFeeAmount,
        }
      },
      {
        stripeAccount:tenant.stripeAccountId
      });
      console.log("✅ Checkout session created:", checkout.id);
      console.log("🔍 Session metadata:", checkout.metadata);
      if (!checkout.url) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create checkout session"
        })
      }

      return { id: checkout.id,url: checkout.url }
    }),
  getProducts: baseProcedure
    .input(
      z.object({
        items: z.array(
          z.object({
            productId: z.string(),
            variantId: z.string().optional(),
           
          })
        ),
      })
    )
    .query(async ({ ctx, input }) => {
      const productIds = Array.from(new Set(input.items.map((i) => i.productId)));
      const data = await ctx.payload.find({
        collection: "products",
        depth: 2,
        where: { 
          and:[
            {
              id: { 
                    in: productIds 
                } ,
            },
            {
              isArchived:{
                not_equals:true
              }
            }
          ],
         
        },
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
        

        return {
          ...doc,
          image: doc.image as Media | null,
          tenant: doc.tenant as Tenant & { image: Media | null },
          variants: (doc.variants || []).map((v: any) => ({
            ...v,
            price: Number(v.price ?? doc.price ?? 0),
            name: v.label ?? "Variant",
          })),
          selectedVariant: variant
            ? {
              ...variant,
              name: (variant as any).name ?? variant.label ?? "Variant",
              price: Number(variant.price ?? doc.price ?? 0)
            }
            : null,
          
          unitPrice,
          finalPrice:unitPrice,

        };
      });
      const total = Math.round(
        enrichedDocs.reduce((acc, p) => acc + (Number(p.finalPrice) || 0), 0) * 100
      ) / 100;
      return {
        docs: enrichedDocs,
        total
      };
    }),
});
