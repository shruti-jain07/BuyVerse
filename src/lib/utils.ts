import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
export function generateTenantURL(tenantSlug: string) {
  const isDevelopment=process.env.NODE_ENV==="development";
  const isSubdomainRoutingEnabled=process.env.NEXT_PUBLIC_ENABLE_SUBDOMAIN_ROUTING==="true";
  //in development or in subdomainroutingenabled mode,using normal routing
  if(isDevelopment||!isSubdomainRoutingEnabled){
   return `${process.env.NEXT_PUBLIC_APP_URL}/tenants/${tenantSlug}`
  }
  const protocol="https";
  const domain=process.env.NEXT_PUBLIC_ROOT_DOMAIN!;
  //in production using subdomain routing
  return `${protocol}://${tenantSlug}.${domain}`
}

export function formatCurrency(value: number | string) {
  {
    return new Intl.NumberFormat("hi-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0
    }).format(Number(value))
  }
}