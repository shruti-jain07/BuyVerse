import { Stripe } from "stripe";
import { getPayload } from "payload";
import config from "@payload-config";
import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";


export async function POST(req: Request) {
    let event: Stripe.Event;


    try {
        console.log("🔔 Stripe webhook received");
        const body = await req.text();
        event = stripe.webhooks.constructEvent(
            body,
            req.headers.get("stripe-signature") as string,
            process.env.STRIPE_WEBHOOK_SECRET as string,
        );
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Unknown Error";
        console.log(`❌ Error verifying webhook: ${errorMessage}`);
        return NextResponse.json(
            { message: `Webhook Error: ${errorMessage}` },
            { status: 400 }
        );
    }


    console.log("✅ Verified event:", event.id, "type:", event.type);
    const permittedEvents: string[] = [
        "checkout.session.completed",
        "account.updated",
    ];


    const payload = await getPayload({ config });


    if (permittedEvents.includes(event.type)) {
        console.log(`⚡ Handling permitted event: ${event.type}`);
        try {
            switch (event.type) {
                case "checkout.session.completed": {
                    const session = event.data.object as Stripe.Checkout.Session;

                    // ✅ Use stripeAccount: event.account for connected accounts
                    const expandedSession = await stripe.checkout.sessions.retrieve(
                        session.id,
                        {
                            expand: ["line_items.data.price.product"],
                        },
                        
                            event.account ? { stripeAccount: event.account } : undefined// crucial!
                        
                    );

                    const lineItems = expandedSession.line_items?.data ?? [];

                    console.log("🔍 Metadata received from Stripe:", session.metadata);
                    const userId = session.metadata?.userId;
                    const tenantSlug = session.metadata?.tenantSlug;

                    if (!userId) throw new Error("User Id is required");
                    if (!tenantSlug) throw new Error("Tenant Slug is required in Stripe metadata");

                    const user = await payload.findByID({
                        collection: "users",
                        id: userId,
                    });

                    if (!lineItems.length) throw new Error("No line items found");

                    await payload.create({
                        collection: "orders",
                        data: {
                            stripeCheckoutSessionId: session.id,
                            stripeAccountId:event.account,
                            user: user.id,
                            tenantSlug: String(tenantSlug),
                            status: "paid",
                            totalAmount: session.amount_total ? session.amount_total / 100 : 0,
                            items: lineItems.map((item) => {
                                if (!item.price || !item.price.product) {
                                    throw new Error("Line item is missing price or product");
                                }
                                const product = item.price.product as Stripe.Product;
                                if (!product.metadata?.id) {
                                    throw new Error(
                                        `Stripe product is missing metadata.id for product: ${product.id}`
                                    );
                                }
                                return {
                                    productId: product.metadata.id,
                                    variantId: product.metadata?.variantId || null,
                                    name: product.name,
                                    variantLabel: product.metadata?.variantName || null,
                                    
                                    unitPrice: item.price.unit_amount
                                        ? Math.round(item.price.unit_amount) / 100
                                        : 0,
                                    finalPrice:
                                        item.price.unit_amount ? Math.round(item.price.unit_amount) / 100 : 0
                                        
                                };
                            }),
                        },
                    });

                    console.log(`✅ Order created for session: ${session.id}`);
                    break;
                }
                case "account.updated": {
                    const account = event.data.object as Stripe.Account;
                    await payload.update({
                        collection: "tenants",
                        where: {
                            stripeAccountId: {
                                equals: account.id,
                            },
                        },
                        data: {
                            stripeDetailsSubmitted: account.details_submitted,
                        },
                    });
                    console.log(`✅ Tenant updated for account: ${account.id}`);
                    break;
                }


                default:
                    throw new Error(`Unhandled Event: ${event.type}`);
            }
        } catch (error) {
            console.error("❌ Webhook handler failed:", error);
            return NextResponse.json(
                { message: "Webhook Handler Failed" },
                { status: 500 }
            );
        }
    }


    return NextResponse.json({ message: "Received" }, { status: 200 });
}
