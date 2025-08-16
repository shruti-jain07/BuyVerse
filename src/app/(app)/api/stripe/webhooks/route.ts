import { Stripe } from "stripe";
import { getPayload } from "payload";
import config from "@payload-config";
import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { ExpandedLineItem } from "@/modules/checkout/types";

export async function POST(req: Request) {
    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(
            await (await req.blob()).text(),
            req.headers.get("stripe-signature") as string,
            process.env.STRIPE_WEBHOOK_SECRET as string,
        )
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Unknown Error";
        if (!(error instanceof Error)) {
            console.log(error);
        }
        console.log(`❌Error Message:${errorMessage}`);
        return NextResponse.json(
            { message: `Webhook Error:${errorMessage}` },
            { status: 400 }
        )
    }
    console.log("✅Success:", event.id);

    const permittedEvents: string[] = [
        "checkout.session.completed",
    ]

    const payload = await getPayload({ config });

    if (permittedEvents.includes(event.type)) {
        let data;
        try {
            switch (event.type) {
                case "checkout.session.completed":
                    data = event.data.object as Stripe.Checkout.Session;
                    if (!data.metadata?.userId) {
                        throw new Error("User Id is Required");
                    }

                    const tenantSlug = data.metadata?.tenantSlug;
                    if (!tenantSlug) {
                        throw new Error("Tenant Slug is required in Stripe metadata");
                    }

                    const user = await payload.findByID({
                        collection: "users",
                        id: data.metadata.userId
                    })
                    if (!data.metadata?.userId) {
                        throw new Error("User Id is Required");
                    }

                    const expandedSession = await stripe.checkout.sessions.retrieve(
                        data.id,
                        {
                            expand: ["line_items.data.price.product"]
                        }
                    )

                    if (!expandedSession.line_items?.data || !expandedSession.line_items.data.length) {
                        throw new Error("No line items found")
                    }

                    const lineItems = expandedSession.line_items.data as ExpandedLineItem[]

                    await payload.create({
                        collection: "orders",
                        data: {
                            stripeCheckoutSessionId: data.id,
                            user: user.id,
                            tenantSlug,
                            status: "paid",
                            totalAmount: expandedSession.amount_total
                                ? expandedSession.amount_total / 100
                                : 0,
                            items: lineItems.map((item: any) => {
                                const product = item.price.product as Stripe.Product;
                                if (!product.metadata?.id) {
                                    throw new Error(`Stripe product is missing metadata.id for product: ${product.id}`);
                                }
                                return {
                                    productId: product.metadata.id,
                                    variantId: product.metadata?.variantId || null,
                                    name: product.name,
                                    variantLabel:product.metadata?.variantName|| null,
                                    quantity: item.quantity || 1,
                                    unitPrice: item.price.unit_amount
                                        ? item.price.unit_amount / 100
                                        : 0,
                                    finalPrice:
                                        (item.price.unit_amount
                                            ? item.price.unit_amount / 100
                                            : 0) * (item.quantity || 1),
                                };
                            }),
                        }
                    })
                    console.log(`✅ Order created for session: ${data.id}`);
                    break;
                default:
                    throw new Error(`Unhandled Event:${event.type}`)
            }
        } catch (error) {
            console.log(error)
            return NextResponse.json(
                { message: "Webhook Handler Failed" },
                { status: 500 }
            )
        }
    }
    return NextResponse.json({ message: "Received" }, { status: 200 })
}