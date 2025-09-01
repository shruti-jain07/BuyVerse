'use client';
import { Button } from "@/components/ui/button";
import { useProductFilters } from "../../hooks/use-product-filters"
import { cn } from "@/lib/utils";
export const ProductSort=()=>{
    const [filters,setFilters]=useProductFilters();
    return (
        <div className="flex items-center gap-2">
            <Button 
                size="sm"
                className={cn("rounded-full bg-white hover:bg-white",
                    filters.sort!=="Recommended"&&
                    "bg-transparent border-transparent hover:border-border hover:bg-transparent"
                )}
                variant="secondary"
                onClick={()=>setFilters({sort:"Recommended"})}
            >
                Recommended
            </Button>


            <Button 
                size="sm"
                className={cn("rounded-full bg-white hover:bg-white",
                    filters.sort!=="Trending"&&
                    "bg-transparent border-transparent hover:border-border hover:bg-transparent"
                )}
                variant="secondary"
                onClick={()=>setFilters({sort:"Trending"})}
            >
                Trending
            </Button>

            <Button 
                size="sm"
                className={cn("rounded-full bg-white hover:bg-white",
                    filters.sort!=="Fresh & Popular"&&
                    "bg-transparent border-transparent hover:border-border hover:bg-transparent"
                )}
                variant="secondary"
                onClick={()=>setFilters({sort:"Fresh & Popular"})}
            >
                Fresh & Popular
            </Button>
        </div>
    )
}