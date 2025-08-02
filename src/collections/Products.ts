import type { CollectionConfig } from "payload";
export const Products: CollectionConfig = {
    slug: "products",
    fields: [
        {
            name: "name",
            type: "text",
            required: true,
        },
        {
            name: "description",
            type: "text",
        },
        {
            name: "price",
            type: "number",
            required: true
        },
        {
            name: "discountPrice",
            type: "number",
        },
        {
            name: "currency",
            type: "select",
            options: ["INR", "USD", "EUR"],
            defaultValue: "INR",
        },
        {
            name: "stock",
            type: "number",
            defaultValue: 0,
        },
        {
            name: "isAvailable",
            type: "checkbox",
            defaultValue: true,
        },
        {
            name: "category",
            type: "relationship",
            relationTo: "categories",
            hasMany: false,
        },
        {
            name: "image",
            type: "upload",
            relationTo: "media",
        },
        {
            name: "refundPolicy",
            type: "select",
            options: ["30-day", "14-day", "7-day", "3-day", "1-day", "No Refunds"],
            defaultValue: "14-day"
        }
    ]
}