import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/db";
import { ServiceSubcategories, ServiceCategories } from "@/db/serviceCategoriesSchema";

export async function GET(request: NextRequest) {
    try {
        await connectDB();
        const category = request.nextUrl.searchParams.get('category') || request.nextUrl.searchParams.get('brand');
        if (category) {
            // fetch categories with this brand/category OR global categories, then return subcategories for those categories
            const cats = await ServiceCategories.find({ $or: [{ brand: category }, { brand: '' }] }).lean();
            const catIds = cats.map((c: any) => c._id).filter(Boolean);
            if (catIds.length) {
                const subs = await ServiceSubcategories.find({ category_id: { $in: catIds } }).lean();
                const formatted = subs.map((s: any) => ({ ...s, id: s._id.toString(), category_id: s.category_id?.toString() }));
                return NextResponse.json(formatted);
            }
            return NextResponse.json([]);
        }

        const subcategories = await ServiceSubcategories.find().lean();
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
        const { category_id, name, slug, description, ac_type } = body;

        if (!category_id || !name || !slug) {
            return NextResponse.json({ error: "Category ID, name, and slug are required" }, { status: 400 });
        }

        const result = await ServiceSubcategories.create({
            category_id,
            name,
            ac_type: ac_type || null,
            slug,
            description: description || null,
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
        const { id, category_id, name, slug, description, ac_type } = body;

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
