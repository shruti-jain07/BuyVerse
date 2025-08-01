import { dehydrate, HydrationBoundary } from '@tanstack/react-query'
import { getQueryClient, trpc } from '@/trpc/server';
import { Navbar } from "@/modules/home/ui/components/navbar";
import { Footer } from "@/modules/home/ui/components/footer";
import { SearchFilters, SearchFiltersLoading } from "@/modules/home/ui/components/search-filters";
import { Suspense } from 'react';
interface Props{
    children:React.ReactNode
}
const Layout = async({children}:Props) => {
  const queryClient=getQueryClient()
  void queryClient.prefetchQuery(
    trpc.categories.getMany.queryOptions()
  )
  return (
    <div className="flex flex-col min-h-screen">
        <Navbar/>
        <HydrationBoundary state={dehydrate(queryClient)}>
          <Suspense fallback={<SearchFiltersLoading/>}>
            <SearchFilters />
          </Suspense>
        </HydrationBoundary>
        <div className="flex-1 bg-[#FFFFFF]">
           {children}
        </div>
     
      <Footer/>
    </div>
  )
}

export default Layout;
