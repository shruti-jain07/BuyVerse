"use client";
import Link from "next/link"
import { ArrowLeftIcon } from "lucide-react"
import {useSuspenseQuery} from "@tanstack/react-query"
import { useTRPC } from "@/trpc/client"
import { ReviewSidebar } from "../components/review-sidebar";
interface Props{
    productId:string;
}
export const ProductView = ({productId}:Props) => {
    const trpc = useTRPC();
    const {data}=useSuspenseQuery(trpc.library.getOne.queryOptions({
        productId,
    }))
    return(
        
    <div className="min-h-screen bg-white">
        <nav className="p-4 bg-[#EEF1DA] w-full border-b">
            <Link prefetch href="/library" className="flex items-center gap-2">
                <ArrowLeftIcon className="size-4"/>
                <span className="text font-medium">Back to Library</span>
            </Link>
        </nav>
        <header className="bg-[#EEF1DA py-8 border-b">
            <div className="min-w-(--breakpoint-xl) mx-auto px-2 lg:px-12">
                <h1 className="text-[30px] font-medium">{data.name}</h1>
            </div>
        </header>
        <section className="max-w-(--breakpoint-xl) mx-auto px-4 lg:px-12 py-10">
            <div className="grid grid-cols-1 lg:grid-cols-7 gap-4 lg:gap-16">
                <div className="lg:col-span-2">
                    <div className="p-4 bg-white rounded-md border gap-4">
                        <ReviewSidebar productId={productId}/> 
                    </div>
                </div>
                <div className="lg:col-span-5">
                    <p className="font-medium italic text-muted-foreground">No Special Content</p>
                </div>
            </div>
        </section>
    </div>
    )
}
