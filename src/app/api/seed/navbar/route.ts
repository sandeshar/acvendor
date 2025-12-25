import { NextResponse } from "next/server";
import { db } from "@/db";
import { navbarItems } from "@/db/navbarSchema";
import { serviceCategories, serviceSubcategories } from '@/db/serviceCategoriesSchema';
import { eq, and } from 'drizzle-orm';

export async function POST(request: Request) {
    try {
        // Always clean the navbar items before seeding
        await db.delete(navbarItems);

        // Seed default navbar items
        const defaultItems = [
            { label: 'Home', href: '/', order: 0, is_button: 0, is_active: 1 },
            { label: 'Products', href: '/products', order: 1, is_button: 0, is_active: 1, is_dropdown: 1 },
            { label: 'Brands', href: '/brands', order: 2, is_button: 0, is_active: 1 },
            { label: 'About Us', href: '/about', order: 3, is_button: 0, is_active: 1 },
            { label: 'FAQ', href: '/faq', order: 4, is_button: 0, is_active: 1 },
            { label: 'Support', href: '/support', order: 5, is_button: 0, is_active: 1 },
            { label: 'Cart', href: '/cart', order: 6, is_button: 1, is_active: 1 },
        ];

        // Insert defaults
        for (let i = 0; i < defaultItems.length; i++) {
            const item = defaultItems[i];
            await db.insert(navbarItems).values({ ...item, order: i });
        }

        // Attach service categories as dropdown children under Services.
        const categories = await db.select().from(serviceCategories);
        if (!categories || categories.length === 0) {
            return NextResponse.json({ message: 'No product categories found. Run /api/seed/services first' }, { status: 200 });
        }

        // Get the Products main nav ID
        const productNavRow = await db.select().from(navbarItems).where(eq(navbarItems.href, '/products')).limit(1);
        const productsId = productNavRow[0]?.id;
        if (!productsId) {
            return NextResponse.json({ error: 'Products nav item not found' }, { status: 500 });
        }

        // Insert each category under Products
        for (let i = 0; i < categories.length; i++) {
            const cat = categories[i];
            const subs = await db.select().from(serviceSubcategories).where(eq(serviceSubcategories.category_id, cat.id));
            const catHasSub = Array.isArray(subs) && subs.length > 0;

            const [existingChild] = await db.select().from(navbarItems).where(and(eq(navbarItems.href, `/services?category=${cat.slug}`), eq(navbarItems.parent_id, productsId))).limit(1);
            let catNavId = undefined as number | undefined;
            if (!existingChild) {
                await db.insert(navbarItems).values({
                    label: cat.name,
                    href: `/services?category=${cat.slug}`,
                    order: i,
                    parent_id: productsId,
                    is_button: 0,
                    is_active: 1,
                    is_dropdown: catHasSub ? 1 : 0,
                });
                const created = await db.select().from(navbarItems).where(and(eq(navbarItems.href, `/services?category=${cat.slug}`), eq(navbarItems.parent_id, productsId))).limit(1);
                catNavId = created[0]?.id;
            } else {
                catNavId = existingChild.id;
                // Update dropdown flag if it has subs
                if (catHasSub && existingChild.is_dropdown !== 1) {
                    await db.update(navbarItems).set({ is_dropdown: 1 }).where(eq(navbarItems.id, existingChild.id));
                }
            }

            if (catHasSub && catNavId) {
                const subsList = subs;
                for (let si = 0; si < subsList.length; si++) {
                    const sub = subsList[si];
                    const [existingSub] = await db.select().from(navbarItems).where(and(eq(navbarItems.href, `/services?category=${cat.slug}&subcategory=${sub.slug}`), eq(navbarItems.parent_id, catNavId))).limit(1);
                    if (!existingSub) {
                        await db.insert(navbarItems).values({
                            label: sub.name,
                            href: `/services?category=${cat.slug}&subcategory=${sub.slug}`,
                            order: si,
                            parent_id: catNavId,
                            is_button: 0,
                            is_active: 1,
                            is_dropdown: 0,
                        });
                    }
                }
            }
        }

        return NextResponse.json({ message: "Navbar items seeded successfully" });
    } catch (error) {
        console.error("Error seeding navbar items:", error);
        return NextResponse.json({ error: "Failed to seed navbar items" }, { status: 500 });
    }
}
