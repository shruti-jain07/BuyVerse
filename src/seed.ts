import configPromise from '@payload-config'
import { getPayload } from 'payload'
const categories=[
    {
        name:"All",
        slug:"all",
    }
]
const seed =async() => {
  const payload = await getPayload({
     config: configPromise,
   })
 for(const category of categories){
    const parentCategory=await payload.create({
        collection:"categories",
        data:{
        name:category.name,
        slug:category.slug,
        color:category.color,
        parent:null,
    }
    }),
    for (const subCategory of category.subcategories||[]){
        await payload.create({
            collection:"categories",
            data:{
                name:subCategory.name,
                slug:subCategory.slug,
                parent:parentCategory.id,
            },
        })
    }
 }
}
try{
await seed();
console.log("Sedding Completed Successfully");
process.exit(0);
}catch (error){
    console.error("error during Seeding:",error);
    process.exit(1);
}