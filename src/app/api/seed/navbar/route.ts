import { NextResponse } from "next/server";
import { connectDB } from "@/db";
import { NavbarItems } from "@/db/navbarSchema";
import { ServiceCategories, ServiceSubcategories } from '@/db/serviceCategoriesSchema';

export async function POST(request: Request) {
    try {
        await connectDB();

        // Always clean the navbar items before seeding
        await NavbarItems.deleteMany({});

        // Seed default navbar items
        const defaultItems = [
            { label: 'Home', href: '/', order: 0, is_button: 0, is_active: 1 },
            { label: 'Services', href: '/services', order: 1, is_button: 0, is_active: 1, is_dropdown: 1 },
            { label: 'Shop', href: '/shop', order: 2, is_button: 0, is_active: 1 },
            { label: 'Midea AC', href: '/midea-ac', order: 3, is_button: 0, is_active: 1 },
            { label: 'About Us', href: '/about', order: 4, is_button: 0, is_active: 1 },
            { label: 'FAQ', href: '/faq', order: 5, is_button: 0, is_active: 1 },
            { label: 'Contact', href: '/contact', order: 6, is_button: 0, is_active: 1 },
            { label: 'Cart', href: '/cart', order: 7, is_button: 1, is_active: 1 },
        ];

        // Insert defaults
        for (let i = 0; i < defaultItems.length; i++) {
            const item = defaultItems[i];
            await NavbarItems.create({ ...item, order: i });
        }

        // Attach service categories as dropdown children under Services.
        let categories = await ServiceCategories.find().lean();
        if (!categories || categories.length === 0) {
            // If no categories exist, create a minimal default category so navbar seeding can proceed
            try {
                const created = await ServiceCategories.create({
                    name: 'AC Products',
                    slug: 'ac-products',
                    description: 'Split, window, inverter, and commercial AC units plus spare parts and accessories.',
                    icon: 'ac_unit',
                    thumbnail: '',
                    display_order: 1,
                    is_active: 1,
                    meta_title: 'AC Products',
                    meta_description: 'Shop air conditioners, parts, and installation services from trusted brands.',
                });
                categories = [created];
            } catch (e) {
                return NextResponse.json({ message: 'No product categories found. Run /api/seed/services first' }, { status: 200 });
            }
        }

        // Get the Services main nav ID
        const servicesNavRow = await NavbarItems.findOne({ href: '/services' }).lean();
        const servicesId = servicesNavRow?._id;
        if (!servicesId) {
            return NextResponse.json({ error: 'Services nav item not found' }, { status: 500 });
        }

        // Insert each category under Services
        for (let i = 0; i < categories.length; i++) {
            const cat = categories[i];
            const subs = await ServiceSubcategories.find({ category_id: cat._id }).lean();
            const catHasSub = Array.isArray(subs) && subs.length > 0;

            // Defensive lookup for existing child (catch casting errors when matching ObjectId parent)
            let existingChild: any = null;
            try {
                existingChild = await NavbarItems.findOne({ href: `/services/category/${cat.slug}`, parent_id: servicesId }).lean();
            } catch (err: any) {
                console.error('Navbar seeder: cast error finding child by parent_id', { err: err?.message || err, catSlug: cat.slug, servicesId });
                try {
                    existingChild = await NavbarItems.findOne({ href: `/services/category/${cat.slug}`, parent_id: String(servicesId) }).lean();
                } catch (err2: any) {
                    console.error('Navbar seeder fallback find by string parent_id failed', err2?.message || err2);
                    existingChild = await NavbarItems.findOne({ href: `/services/category/${cat.slug}` }).lean();
                }
            }

            let catNavId = undefined as any;
            if (!existingChild) {
                const created = await NavbarItems.create({
                    label: cat.name,
                    href: `/services/category/${cat.slug}`,
                    order: i,
                    parent_id: servicesId,
                    is_button: 0,
                    is_active: 1,
                    is_dropdown: catHasSub ? 1 : 0,
                });
                catNavId = created._id;
            } else {
                catNavId = existingChild._id;
                // Update dropdown flag if it has subs
                if (catHasSub && existingChild.is_dropdown !== 1) {
                    await NavbarItems.findByIdAndUpdate(existingChild._id, { is_dropdown: 1 });
                }
            }

            if (catHasSub && catNavId) {
                const subsList = subs;
                for (let si = 0; si < subsList.length; si++) {
                    const sub = subsList[si];
                    let existingSub: any = null;
                    try {
                        existingSub = await NavbarItems.findOne({ href: `/services/category/${cat.slug}/${sub.slug}`, parent_id: catNavId }).lean();
                    } catch (err: any) {
                        console.error('Navbar seeder: cast error finding subchild', { err: err?.message || err, catSlug: cat.slug, subSlug: sub.slug, catNavId });
                        try {
                            existingSub = await NavbarItems.findOne({ href: `/services/category/${cat.slug}/${sub.slug}`, parent_id: String(catNavId) }).lean();
                        } catch (err2: any) {
                            console.error('Navbar seeder fallback for sub failed', err2?.message || err2);
                            existingSub = await NavbarItems.findOne({ href: `/services/category/${cat.slug}/${sub.slug}` }).lean();
                        }
                    }

                    if (!existingSub) {
                        await NavbarItems.create({
                            label: sub.name,
                            href: `/services/category/${cat.slug}/${sub.slug}`,
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
