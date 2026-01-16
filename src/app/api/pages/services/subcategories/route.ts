import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/db";
import { ServiceSubcategories, ServiceCategories } from "@/db/serviceCategoriesSchema";

export async function GET(request: NextRequest) {
    try {
        await connectDB();
        const searchParams = request.nextUrl.searchParams;
        const slug = searchParams.get('slug');
        const category = searchParams.get('category');
        const isAdmin = searchParams.get('admin') === '1';

        if (slug) {
            const query: any = { slug };
            if (!isAdmin) query.is_active = 1;
            const sub = await ServiceSubcategories.findOne(query).lean();
            if (sub) {
                return NextResponse.json({ ...sub, id: sub._id.toString(), category_id: sub.category_id?.toString() });
            }
            return NextResponse.json(null);
        }

        if (category) {
            // Find the category by slug
            const cat = await ServiceCategories.findOne({ slug: category }).lean();
            if (cat) {
                const query: any = { category_id: cat._id };
                if (!isAdmin) query.is_active = 1;

                const subs = await ServiceSubcategories.find(query).sort({ display_order: 1, name: 1 }).lean();
                const formatted = subs.map((s: any) => ({ ...s, id: s._id.toString(), category_id: s.category_id?.toString() }));
                return NextResponse.json(formatted);
            }
            return NextResponse.json([]);
        }

        const query: any = {};
        if (!isAdmin) query.is_active = 1;

        const subcategories = await ServiceSubcategories.find(query).sort({ display_order: 1, name: 1 }).lean();
        const formatted = subcategories.map((s: any) => ({ ...s, id: s._id.toString(), category_id: s.category_id?.toString() }));
        return NextResponse.json(formatted);
    } catch (error) {
        console.error("Error fetching service subcategories:", error);
        return NextResponse.json({ error: "Failed to fetch subcategories" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        await connectDB();
        const body = await request.json();
        const { category_id, name, slug, description, ac_type, meta_title, meta_description, display_order, is_active } = body;

        if (!category_id || !name || !slug) {
            return NextResponse.json({ error: "Category ID, name, and slug are required" }, { status: 400 });
        }

        const result = await ServiceSubcategories.create({
            category_id,
            name,
            ac_type: ac_type || null,
            slug,
            description: description || null,
            meta_title: meta_title || '',
            meta_description: meta_description || '',
            display_order: Number(display_order) || 0,
            is_active: is_active !== undefined ? Number(is_active) : 1,
        });

        return NextResponse.json({ id: result._id, message: "Subcategory created successfully" });
    } catch (error) {
        console.error("Error creating subcategory:", error);
        return NextResponse.json({ error: "Failed to create subcategory" }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        await connectDB();
        const body = await request.json();
        const { id, category_id, name, slug, description, ac_type, meta_title, meta_description, display_order, is_active } = body;

        if (!id) {
            return NextResponse.json({ error: "ID is required" }, { status: 400 });
        }

        await ServiceSubcategories.findByIdAndUpdate(
            id,
            {
                category_id,
                name,
                ac_type: ac_type || null,
                slug,
                description: description || null,
                meta_title: meta_title || '',
                meta_description: meta_description || '',
                display_order: Number(display_order) || 0,
                is_active: is_active !== undefined ? Number(is_active) : 1,
                updatedAt: new Date(),
            },
            { new: true }
        );

        return NextResponse.json({ message: "Subcategory updated successfully" });
    } catch (error) {
        console.error("Error updating subcategory:", error);
        return NextResponse.json({ error: "Failed to update subcategory" }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        await connectDB();
        const body = await request.json();
        const { id } = body;

        if (!id) {
            return NextResponse.json({ error: "ID is required" }, { status: 400 });
        }

        await ServiceSubcategories.findByIdAndDelete(id);
        return NextResponse.json({ message: "Subcategory deleted successfully" });
    } catch (error) {
        console.error("Error deleting subcategory:", error);
        return NextResponse.json({ error: "Failed to delete subcategory" }, { status: 500 });
    }
}
