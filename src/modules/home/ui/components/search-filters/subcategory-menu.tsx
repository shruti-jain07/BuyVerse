import { Category } from "@/payload-types";
import Link  from "next/link";
import { CategoriesGetManyOutput } from "@/modules/categories/types";


interface Props{
    category:CategoriesGetManyOutput[1];
    isOpen:boolean;
    
}
export const SubcategoryMenu=({
    category,
    isOpen,
    
}:Props)=>{
    if(!isOpen || !category.subcategories||category.subcategories.length===0)
        {
        return null;
    }
    const backgroundColor=category.color||"#FFFFFF";
    
    return(
    
        <div
        className="absolute z-[100]"
        style={{
            top:"100%",
            left:0,
        }}
        >
            {/**Arrow */}
            <div className="h-3 w-60"/>
            <div 
            style={{backgroundColor}}
            className="mt-1 w-60 text-black rounded-md overflow-hidden border shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]
            -translate-x-[2px] -translate-y-[2px]">
            
                {category.subcategories?.map((subcategory:Category)=>(
                    <Link 
                    key={subcategory.slug} 
                    href={`/${category.slug}/${subcategory.slug}`}
                    className="block w-full text-left p-4 hover:bg-black hover:text-white  justify-between items-center underline font-medium"
                    >
                        {subcategory.name}
                    </Link>
                ))}
            
        </div>
        </div>
    );
};

