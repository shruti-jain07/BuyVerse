import type { CollectionConfig } from "payload";
import { isSuperAdmin } from "@/lib/access";

export const VariantOptions: CollectionConfig = {
  slug: "variant-options",
  access: {
          read: () => true,
          
      },
  admin: {
    useAsTitle: "label",
    
  },
  fields: [
    {
      name: "label",
      type: "text",
      required: true,
    },
    {
      name: "attribute",
      type: "relationship",
      relationTo: "variant-attributes",
      required: true,
    },
    {
      name: "tenant",
      type: "relationship",
      relationTo: "tenants",
      required: true,
    },
  ],
  hooks: {
    beforeValidate: [
  async ({ data = {}, req, operation, originalDoc }) => {
    if (operation === "create" || operation === "update") {
      if (data.label) {
        data.label = data.label.trim();
      }

      const labelChanged = !originalDoc || data.label !== originalDoc.label;
      const attributeChanged = !originalDoc || data.attribute !== originalDoc.attribute;
      const tenantChanged = !originalDoc || data.tenant !== originalDoc.tenant;

      if (labelChanged || attributeChanged || tenantChanged) {
        const existing = await req.payload.find({
          collection: "variant-options",
          where: {
            label: { equals: data.label },
            attribute: { equals: data.attribute },
            tenant: { equals: data.tenant },
          },
        });

        if (existing.docs.length > 0) {
          const found = existing.docs[0] as any;
          const currentId = data.id || originalDoc?.id;
          if (!(operation === "update" && found.id === currentId)) {
            throw new Error(
              `Label "${data.label}" already exists for this attribute and tenant.`
            );
          }
        }
      }
    }
    return data;
      },
    ],
  },
};
