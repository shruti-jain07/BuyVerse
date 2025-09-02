import { ProductView, ProductViewSkeleton } from "@/modules/library/ui/views/product-view";
import { getQueryClient, trpc } from "@/trpc/server"
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { Suspense } from "react";
export const dynamic = "force-dynamic";
interface Props{
  params:Promise<{
    productId:string;
  }>
}
const page = async ({params}:Props) => {
  const {productId}=await params;
  const queryClient = getQueryClient();
  void queryClient.prefetchQuery(trpc.library.getOne.queryOptions({
    productId,
  }))
  void queryClient.prefetchQuery(trpc.reviews.getOne.queryOptions({
    productId,
  }))
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense fallback={<ProductViewSkeleton/>}>
      <ProductView productId={productId}/>
      </Suspense>
    </HydrationBoundary>
  )
}

export default page


