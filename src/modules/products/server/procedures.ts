import z from 'zod';
import type { Sort, Where } from 'payload';
import { baseProcedure, createTRPCRouter } from "@/trpc/init";
import { Category } from '@/payload-types';
import { sortValues } from '../search-params';

export const productsRouter = createTRPCRouter({
    getMany: baseProcedure
        .input(z.object({
            category: z.string().nullable().optional(),
            minPrice: z.string().nullable().optional(),
            maxPrice: z.string().nullable().optional(),
            tags:z.array(z.string()).nullable().optional(),
            sort:z.enum(sortValues).nullable().optional(),

        })
        )
        .query(async ({ ctx, input }) => {
            const where: Where = {};
           let sort:Sort="-createdAt";
           if(input.sort==="Recommended"){
            
            sort="-createdAt"
           }
           if(input.sort==="Trending"){
            sort="-updatedAt"
           }
           if(input.sort==="Fresh & Popular"){
            sort="-createdAt"
           }
           
            if(input.minPrice && input.maxPrice){
                where.price={
                    greater_than_equal:input.minPrice,
                    less_than_equal:input.maxPrice
                }
            } else if(input.minPrice){
                where.price={
                    greater_than_equal:input.minPrice
                }
            } else if(input.maxPrice){
                where.price={
                    less_than_equal:input.maxPrice
                }
            }

            {/**tags */}
            if(input.tags && input.tags.length>0)
            {
                where["tags.name"]={
                    in:input.tags,
                }
            }
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
                depth: 1,
                where,
                sort,
            });
            await new Promise((resolve) => setTimeout(resolve, 2000))
            return data;
        }),
});