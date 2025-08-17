import Link from "next/link"
import { ArrowLeftIcon } from "lucide-react"
import { ProductList, ProductListLoading } from "../components/product-list"
import { Suspense } from "react"
export const LibraryView = () => {
    return(
    <div className="min-h-screen bg-white">
        <nav className="p-4 bg-[#EEF1DA] w-full border-b">
            <Link prefetch href="/" className="flex items-center gap-2">
                <ArrowLeftIcon className="size-4"/>
                <span className="text font-medium">Continue Shopping</span>
            </Link>
        </nav>
        <header className="bg-[#EEF1DA py-8 border-b">
            <div className="min-w-(--breakpoint-xl) mx-auto px-2 lg:px-12 flex flex-col gap-y-2">
                <h1 className="text-[30px] font-medium">Library</h1>
                <p className="text-base font-medium">Your Purchases and review</p>
            </div>
        </header>
        <section className="max-w-(--breakpoint-xl) mx-auto px-4 lg:px-12 py-10">
            <Suspense fallback={<ProductListLoading/>}>
            <ProductList/>
            </Suspense>
        </section>
    </div>
    )
}
