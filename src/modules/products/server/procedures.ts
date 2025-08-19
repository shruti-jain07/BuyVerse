import z from 'zod';
import type { Sort, Where } from 'payload';
import { baseProcedure, createTRPCRouter } from "@/trpc/init";
import { Category, Media, Tenant } from '@/payload-types';
import { sortValues } from '../search-params';
import { DEFAULT_LIMIT } from '@/constants';
import {headers as getHeaders} from "next/headers";
export const productsRouter = createTRPCRouter({
   getOne: baseProcedure
  .input(z.object({ id: z.string() }))
  .query(async ({ ctx, input }) => {
    try {
      const headers = await getHeaders(); // keep as Headers object
      const session = await ctx.payload.auth({ headers });

      const product = await ctx.payload.findByID({
        collection: "products",
        id: input.id,
        depth: 2,
        select:{
                    content:false
                }
      });

      if (!product) throw new Error("Product not found");

      let isPurchased = false;
      if (session.user) {
        const ordersData = await ctx.payload.find({
          collection: "orders",
          pagination: false,
          limit: 1,
          where: {
            and: [
              { "items.productId": { equals: input.id } },
              { "user.id": { equals: session.user.id } }
            ]
          }
        })
        isPurchased = !!ordersData.docs?.[0];
      }
      const reviews=await ctx.payload.find({
        collection:"reviews",
        pagination:false,
        where:{
            product:{
                equals:input.id
            }
        }
      })
      const reviewRating=
            reviews.docs.length>0
            ? reviews.docs.reduce((acc,review)=>acc+review.rating,0)/reviews.totalDocs
            :0;
      const ratingDistribution:Record<number,number>={
        5:0,
        4:0,
        3:0,
        2:0,
        1:0,
      }
      if(reviews.totalDocs>0){
        reviews.docs.forEach((review)=>{
            const rating=review.rating;
            if(rating>=1 && rating<=5){
                ratingDistribution[rating]=(ratingDistribution[rating]||0)+1
            }
        })
        Object.keys(ratingDistribution).forEach((key)=>{
            const rating=Number(key);
            const count=ratingDistribution[rating]||0;
            ratingDistribution[rating]=Math.round(
                (count/reviews.totalDocs)*100
            )
        })
      }
      return {
        ...product,
        isPurchased,
        reviewRating,
        reviewCount:reviews.totalDocs,
        ratingDistribution,
        image: product.image as Media | null,
        tenant: product.tenant as Tenant & { image: Media | null },
        variants: (product.variants || []).map((v) => ({
          ...v,
          price: v.price ?? product.price ?? 0,
        })),
      };
    } catch (err: any) {
      console.error("getOne error:", err);
      throw new Error(err?.message || "Unknown server error in getOne");
    }
  }),

    getMany: baseProcedure
        .input(z.object({
            cursor: z.number().default(1),
            limit: z.number().default(DEFAULT_LIMIT),
            category: z.string().nullable().optional(),
            minPrice: z.string().nullable().optional(),
            maxPrice: z.string().nullable().optional(),
            tags: z.array(z.string()).nullable().optional(),
            sort: z.enum(sortValues).nullable().optional(),
            tenantSlug: z.string().nullable().optional(),
        })
        )
        //tags
        .query(async ({ ctx, input }) => {
            const where: Where = {};
            let sort: Sort = "-createdAt";
            if (input.sort === "Recommended") {
                sort = "-createdAt"
            }
            if (input.sort === "Trending") {
                sort = "-updatedAt"
            }
            if (input.sort === "Fresh & Popular") {
                sort = "-createdAt"
            }
            //price
            if (input.minPrice && input.maxPrice) {
                where.price = {
                    greater_than_equal: input.minPrice,
                    less_than_equal: input.maxPrice
                }
            } else if (input.minPrice) {
                where.price = {
                    greater_than_equal: input.minPrice
                }
            } else if (input.maxPrice) {
                where.price = {
                    less_than_equal: input.maxPrice
                }
            }

            {/**tags */ }
            if (input.tags && input.tags.length > 0) {
                where["tags.name"] = {
                    in: input.tags,
                }
            }
            {/**tenant */ }
            if (input.tenantSlug) {
                where["tenant.slug"] = {
                    equals: input.tenantSlug
                }
            }

            //category
            if (input.category) {
                const categoriesData = await ctx.payload.find({
                    collection: "categories",
                    limit: 1,
                    depth: 1,
                    pagination: false,
                    where: {
                        slug: {
                            equals: input.category,
                        }
                    }
                })

                const formattedData = categoriesData.docs.map((doc) => ({
                    ...doc,
                    subcategories: (doc.subcategories?.docs ?? []).map((doc) => ({
                        //since i setted up depth:1 so it will 100% be a type of category so ...doc as category is ok to use
                        ...doc as Category,
                        subcategories: undefined,
                    }))
                }));

                const subcategoriesSlugs = [];
                const parentCategory = formattedData[0];
                if (parentCategory) {
                    subcategoriesSlugs.push(
                        ...parentCategory.subcategories.map((subcategory) => subcategory.slug)
                    )

                    where["category.slug"] = {
                        in: [parentCategory.slug, ...subcategoriesSlugs],
                    }
                }

            }
            {/**data */ }
            const data = await ctx.payload.find({
                collection: 'products',
                depth: 2,
                where,
                sort,
                page: input.cursor,
                limit: input.limit,
                select:{
                    content:false
                }
            });
            const dataWithSummarizedReviews=await Promise.all(
                data.docs.map(async(doc)=>{
                    const reviewsData=await ctx.payload.find({
                        collection:"reviews",
                        pagination:false,
                        where:{
                            product:{
                                equals:doc.id
                            }
                        }
                    })
                    return{
                        ...doc,
                        reviewCount:reviewsData.totalDocs,
                        reviewRating:reviewsData.docs.length===0
                        ? 0
                        :reviewsData.docs.reduce((acc,review)=>acc+review.rating,0)/reviewsData.totalDocs
                    }
                })
            )

            return {
                ...data,
                docs: dataWithSummarizedReviews.map((doc) => ({
                    ...doc,
                    image: doc.image as Media | null,
                    tenant: doc.tenant as Tenant & { image: Media | null },
                    variants: (doc.variants || []).map(v => ({
                        ...v,
                        price: v.price ?? doc.price ?? 0
                    }))
                }))
            };
        }),
});