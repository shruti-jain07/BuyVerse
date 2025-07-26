
import { Categories } from "./categories";
import { SearchInput } from "./search-input";
interface Props{
    data:any;
}

export const SearchFilters=(
    {
    data,
    }:Props)=>(
    <div className="px-4 lg-12 py-8 border-b flex flex-col gap-4 w-full">
        <SearchInput />
        <Categories data={data} />
        
    </div>
)