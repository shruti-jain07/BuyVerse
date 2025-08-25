import configPromise from '@payload-config';
import { getPayload } from 'payload';
import { stripe } from './lib/stripe';
const categories = [
  {
    name: "All",
    slug: "all",
    color: "#FFFFFF",
    subcategories: [],
  },
  {
    name: "Home & Living",
    slug: "home-living",
    color: "#4CAF50",
    subcategories: [
      { name: "Furniture", slug: "furniture" },
      { name: "Decor & Lighting", slug: "decor-lighting" },
      { name: "Kitchen Essentials", slug: "kitchen-essentials" },
    ],
  },
  {
    name: "Books & Stationery",
    slug: "books-stationery",
    color: "#FF9800",
    subcategories: [
      { name: "Fiction", slug: "fiction" },
      { name: "Academic & Exam Prep", slug: "academic-exam-prep" },
      { name: "Office Supplies", slug: "office-supplies" },
    ],
  },
  {
    name: "Sports & Outdoors",
    slug: "sports-outdoors",
    color: "#3F51B5",
    subcategories: [
      { name: "Fitness Equipment", slug: "fitness-equipment" },
      { name: "Camping & Hiking", slug: "camping-hiking" },
      { name: "Cycling Gear", slug: "cycling-gear" },
    ],
  },
]
const seed = async () => {
  const payload = await getPayload({
    config: configPromise,
  })
  const adminAccount = await stripe.accounts.create({
    type: "express",
  })
  const adminTenant = await payload.create({
    collection: "tenants",
    data: {
      name: "admin",
      slug: "admin",
      stripeAccountId: adminAccount.id,
    }
  })

  await payload.create({
    collection: "users",
    data: {
      email: "admin@gmail.com",
      password: "demo",
      roles: ["super-admin"],
      username: "admin",
      tenants: [
        {
          tenant: adminTenant.id,
        }
      ]
    }
  })
  for (const category of categories) {
    const parentCategory = await payload.create({
      collection: "categories",
      data: {
        name: category.name,
        slug: category.slug,
        color: category.color,
        parent: null,
      }
    })
    for (const subCategory of category.subcategories || []) {
      await payload.create({
        collection: "categories",
        data: {
          name: subCategory.name,
          slug: subCategory.slug,
          parent: parentCategory.id,
        },
      })
    }
  }
}
try {
  await seed();
  console.log("Sedding Completed Successfully");
  process.exit(0);
} catch (error) {
  console.error("error during Seeding:", error);
  process.exit(1);
}