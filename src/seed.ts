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
    name: "Ebooks & Writing",
    slug: "ebooks-writing",
    color: "#4CAF50",
    subcategories: [
      { name: "Fiction", slug: "fiction" },
      { name: "Non-fiction", slug: "non-fiction" },
      { name: "Guides & Tutorials", slug: "guides-tutorials" },
    ],
  },
  {
    name: "Courses & Learning",
    slug: "courses-learning",
    color: "#FF9800",
    subcategories: [
      { name: "Programming", slug: "programming" },
      { name: "Design & Creativity", slug: "design-creativity" },
      { name: "Business & Marketing", slug: "business-marketing" },
    ],
  },
  {
    name: "Music & Audio",
    slug: "music-audio",
    color: "#3F51B5",
    subcategories: [
      { name: "Beats & Instrumentals", slug: "beats-instrumentals" },
      { name: "Podcasts", slug: "podcasts" },
      { name: "Sound Effects", slug: "sound-effects" },
    ],
  },
  {
    name: "Design Assets",
    slug: "design-assets",
    color: "#E91E63",
    subcategories: [
      { name: "Graphics & Illustrations", slug: "graphics-illustrations" },
      { name: "UI Kits & Templates", slug: "ui-kits-templates" },
      { name: "Fonts & Icons", slug: "fonts-icons" },
    ],
  },
  {
    name: "Software & Tools",
    slug: "software-tools",
    color: "#009688",
    subcategories: [
      { name: "Apps & Plugins", slug: "apps-plugins" },
      { name: "Scripts & Code", slug: "scripts-code" },
      { name: "Automation Tools", slug: "automation-tools" },
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
  console.log("Seeding Completed Successfully");
  process.exit(0);
} catch (error) {
  console.error("error during Seeding:", error);
  process.exit(1);
}