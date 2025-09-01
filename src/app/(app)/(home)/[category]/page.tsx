import type { SearchParams } from "nuqs/server";
import { getQueryClient, trpc } from "@/trpc/server";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { loadProductFilters } from "@/modules/products/search-params";
import { ProductListView } from "@/modules/products/ui/views/product-list-view";
import { DEFAULT_LIMIT } from "@/constants";
import { ProductSort } from "@/modules/products/ui/components/product-sort";
interface Props {
  params: Promise<{
    category: string;
  }>,
  searchParams:Promise<SearchParams>;
}
const Page = async ({ params,searchParams }: Props) => {
  const { category } = await params;
  const filters=await loadProductFilters(searchParams)
  console.log(JSON.stringify(filters),"This is from RSC")
  const queryClient = getQueryClient();
  void queryClient.prefetchInfiniteQuery(trpc.products.getMany.infiniteQueryOptions({
    ...filters,
    category,
    limit:DEFAULT_LIMIT
  }));
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      {/*<ProductSort/>*/}
      <ProductListView category={category}/>
    </HydrationBoundary>
  )
}

export default Page;