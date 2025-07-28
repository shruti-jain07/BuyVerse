import { baseProcedure, createTRPCRouter } from "@/trpc/init";
import { Category } from '@/payload-types';
export const categoriesRouter=createTRPCRouter({
    getMany:baseProcedure.query(async({ctx})=>{
       
{/**data */}
              const data = await ctx.payload.find({
                collection: 'categories',
                depth:1,//subcategories count
                pagination:false,
                where:{
                parent:{
                exists:false,
                    },
                },
                sort:"name"
            });
{/**Formatted data */}

            const formattedData=data.docs.map((doc)=>({
                ...doc,
                subcategories:(doc.subcategories?.docs ?? []).map((doc)=>({
                  //since i setted up depth:1 so it will 100% be a type of category so ...doc as category is ok to use
                  ...doc as Category,
                 subcategories:undefined,
                }))
              }));
              console.log({
                data,
                formattedData,
            })
        return formattedData;
    }),    
});