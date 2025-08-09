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
            name: "tags",
            type: "relationship",
            relationTo: "tags",
            hasMany: true,
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
        },
        {
            name: "variants",
            type: "array",
            fields: [
                {
          name: "label", 
          type: "text",
          required: true,
          admin: {
        description: "Display label like 'Red / Large'",
      },
        },
                {
                    name: "options",
                    type: "relationship",
                    relationTo: "variant-options",
                    hasMany: true,
                },
                {
                    name: "price",
                    type: "number",
                },
                {
                    name: "stock",
                    type: "number",
                },
                
               
            ],
        },
    ],

    hooks: {
  beforeValidate: [
    async ({ data }) => {
      if (data?.variants && Array.isArray(data.variants)) {
        data.variants = data.variants.map((variant: any) => {
          // Filter out invalid options safely
          variant.options = (variant.options || []).filter((opt: any) => {
            if (!opt) return false;
            if (typeof opt === "string") return true; // ID case
            return !!opt.label; // populated object case
          });

          // Normalize label
          if (variant.label) {
            variant.label = variant.label.trim();
          }

          // Fallback price
          if (variant.price == null || variant.price === "") {
            variant.price = data.price;
          }

          return variant;
        });
      }
      return data;
    },
  ],
},

};



