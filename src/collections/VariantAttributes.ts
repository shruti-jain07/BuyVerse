import { isSuperAdmin } from "@/lib/access";
import type { CollectionConfig } from "payload";

export const VariantAttributes: CollectionConfig = {
  slug: "variant-attributes",
  access: {
            read: () => true,
            
        },
  admin: {
    useAsTitle: "name",
    
  },
  timestamps: true,
  fields: [
    {
      name: "name",
      type: "text",
      required: true,
    },
    {
      name: "slug",
      type: "text",
      required: true,
      index: true,
      admin: {
        description: "Unique key like 'size', 'color'. Used in code/programming.",
      },
    },
    {
      name: "tenant",
      type: "relationship",
      relationTo: "tenants",
      required: true,
      index: true,
    },
    {
      name: "isRequired",
      type: "checkbox",
      defaultValue: false,
      admin: {
        description: "Should this be a required attribute when adding variants?",
      },
    },
  ],
 hooks: {
    beforeValidate: [
      async ({ data = {}, req, operation, originalDoc }) => {
        if (operation === "create" || operation === "update") {
          // Normalize slug
          if (data.slug) {
            data.slug = data.slug.trim().toLowerCase().replace(/\s+/g, "-");
          }

          // Check uniqueness only if slug or tenant changed
          const slugChanged = !originalDoc || data.slug !== originalDoc.slug;
          const tenantChanged = !originalDoc || data.tenant !== originalDoc.tenant;

          if (slugChanged || tenantChanged) {
            const existing = await req.payload.find({
              collection: "variant-attributes",
              where: {
                slug: { equals: data.slug },
                tenant: { equals: data.tenant },
              },
            });

            if (existing.docs.length > 0) {
              const found = existing.docs[0] as any;
              const currentId = data.id || originalDoc?.id;
              if (!(operation === "update" && found.id === currentId)) {
                throw new Error(`Slug "${data.slug}" already exists for this tenant.`);
              }
            }
          }
        }
        return data;
      },
    ],
  },
};
