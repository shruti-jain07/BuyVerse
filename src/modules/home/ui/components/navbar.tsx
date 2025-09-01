"use client"
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Poppins } from "next/font/google";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";
import { NavbarSidebar } from "./navbar-sidebar";
import { useState } from "react";
import { MenuIcon } from "lucide-react";
import { useTRPC } from "@/trpc/client";
import { useQuery } from "@tanstack/react-query";
const poppins = Poppins({
    subsets: ["latin"],
    weight: ["700"],
})

interface NavbarItemProps {
    href: string;
    children: React.ReactNode;
    isActive?: boolean;
};

const NavbarItem = ({
    href,
    children,
    isActive,
}: NavbarItemProps) => {
    return (
        <Button
            asChild
            variant="outline"
            className={cn("bg-transparent hover:bg-transparent rounded-full hover:border-primary border-transparent px-3.5 text-lg",
                isActive && "bg-black text-white hover:bg-black hover:text-white"
            )}
        >
            <Link href={href}>{children}</Link>
        </Button>
    )
}

const navbarItems = [
    { href: "/", children: "Home" },
    { href: "/about", children: "About" },
    { href: "/pricing", children: "Pricing" },
    
];


export const Navbar = () => {
    const pathname = usePathname();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const trpc = useTRPC();
    const session = useQuery(trpc.auth.session.queryOptions())
    return (
        <nav className="h-13 flex border-b justify-between font-medium bg-white">
            <Link href="/" className="pl-2 flex items-center gap-1">
                <Image src="/images/shopverse_logo.png" alt="ShopVerse Logo" width={50} height={90} className="rounded-full" />
                <span className={cn("text-3xl font-semibold", poppins.className)}>ShopVerse</span>
            </Link>
            <NavbarSidebar
                items={navbarItems}
                open={isSidebarOpen}
                onOpenChange={setIsSidebarOpen}
            />
            <div className="items-center gap-8 hidden lg:flex ml-auto ">
                {navbarItems.map((item) => (
                    <NavbarItem
                        key={item.href}
                        href={item.href}
                        isActive={pathname === item.href}
                    >
                        {item.children}
                    </NavbarItem>
                ))}
            </div>

            {session.data?.user ? (
                <div className="hidden lg:flex">
                    <Button
                        asChild
                        variant="secondary"
                        className=" border-l border-t-0 border-b-0 border-r-0 ml-5 px-12 h-full rounded-none
                bg-black text-white hover:bg-gray-600 hover:text-white transition-colors text-lg"
                    >
                        <Link href="/admin"
                        >
                            Dashboard
                        </Link>
                    </Button>
                </div>
            ) : (
                <div className="hidden lg:flex">
                    <Button
                        asChild
                        variant="secondary"
                        className="border-l border-t-0 border-b-0 border-r-0 px-12 ml-5 h-full rounded-none
                bg-white hover:bg-gray-600 hover:text-white transition-colors text-lg"
                    >
                        <Link prefetch href="/sign-in">
                            Log in
                        </Link>
                    </Button>
                    <Button
                        asChild
                        variant="secondary"
                        className="border-l border-t-0 border-b-0 border-r-0 px-12 h-full rounded-none
                bg-white hover:bg-gray-600 hover:text-white transition-colors text-lg"
                    >
                        <Link href="/sign-up"
                            prefetch>
                            Start Selling
                        </Link>
                    </Button>
                </div>
            )}

            <div className="flex lg:hidden items-center justify-center">
                <Button
                    variant="ghost"
                    className="size-12 border-transparent bg-white"
                    onClick={() => setIsSidebarOpen(true)}
                >
                    <MenuIcon />
                </Button>
            </div>
        </nav>
    );
};