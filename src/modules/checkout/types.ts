import type Stripe from "stripe";
export type ProductMetadata={
    stripeAccountId:string;
    id:string;
    name:string;
    variantId?:string;
    variantName?:string;
    price:number;//string because Stripe metadata is strings
}
export type CheckoutMetadata={
    userId:string;
}
export type ExpandedLineItem=Stripe.LineItem & {
    price:Stripe.Price & {
        product:Stripe.Product & {
            metadata:ProductMetadata,
        };
    };
};