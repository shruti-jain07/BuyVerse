import { isSuperAdmin } from "@/lib/access";
import type { CollectionConfig } from "payload";


export const Orders: CollectionConfig = {
    slug: "orders",
    access: {
        read: ({ req }) => isSuperAdmin(req.user),
        create: ({ req }) => isSuperAdmin(req.user),
        update: ({ req }) => isSuperAdmin(req.user),
        delete: ({ req }) => isSuperAdmin(req.user),
    },
    admin: {
        useAsTitle: "stripeCheckoutSessionId",
    },

    fields:
        [
            {
                name: "user",
                type: "relationship",
                relationTo: "users",
                required: true,
                hasMany: false
            },
            {
                name: "tenantSlug",
                type: "text",
                required: true,
                admin: {
                    readOnly: true,
                },
            },
            {
                name: "items",
                type: "array",
                required: true,
                fields: [
                    {
                        name: "productId",
                        type: "text",
                        required: true,
                    },
                    {
                        name: "variantId",
                        type: "text",
                        required: false, // optional
                    },
                    {
                        name: "name",
                        type: "text",
                        required: true,
                    },
                    {
                        name: "variantLabel",
                        type: "text",
                        required: false,
                    },
                    {
                        name: "quantity",
                        type: "number",
                        required: true,
                        defaultValue: 1,
                    },
                    {
                        name: "unitPrice",
                        type: "number",
                        required: true,
                        admin: {
                            description: "Price per item at the time of purchase",
                        },
                    },
                    {
                        name: "finalPrice",
                        type: "number",
                        required: true,
                    },
                ],
            },
            {
                name: "totalAmount",
                type: "number",
                required: true,
            },
            {
                name: "status",
                type: "select",
                options: [
                    { label: "Pending", value: "pending" },
                    { label: "Paid", value: "paid" },
                    { label: "Failed", value: "failed" },
                    { label: "Canceled", value: "canceled" },
                ],
                defaultValue: "pending",
                required: true,
            },
            {
                name: "stripeCheckoutSessionId",
                type: "text",
                required: true,
                admin:{
                    description:"Stripe Checkout Session associated with the order"
                }
            },
             {
                name: "stripeAccountId",
                type: "text",
                admin:{
                    description:"Stripe account associated with the order"
                }
            },
            {
                name: "createdAt",
                type: "date",
                defaultValue: () => new Date().toISOString(),
                admin: {
                    readOnly: true,
                },
            },
        ]
}