import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/db";
import { ServiceCategories } from "@/db/serviceCategoriesSchema";

export async function GET(request: NextRequest) {
    try {
        await connectDB();
        // If `slug` is passed, return a single category by slug (useful for metadata lookup on frontend)
        const slug = request.nextUrl.searchParams.get('slug');
        if (slug) {
            const cat = await ServiceCategories.findOne({ slug }).lean();
            if (!cat) return NextResponse.json(null);
            return NextResponse.json({ ...cat, id: cat._id.toString() });
        }

        const categories = await ServiceCategories.find().sort({ name: 1 }).lean();
        const formatted = categories.map((c: any) => ({ ...c, id: c._id.toString() }));
        return NextResponse.json(formatted);
    } catch (error) {
        console.error("Error fetching service categories:", error);
        return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        await connectDB();
        const body = await request.json();
        const { name, slug, description, icon, meta_title, meta_description, thumbnail } = body;

        if (!name || !slug) {
            return NextResponse.json({ error: "Name and slug are required" }, { status: 400 });
        }

        const result = await ServiceCategories.create({
            name,
            slug,
            brand: '',
            description: description || null,
            icon: icon || null,
            thumbnail: thumbnail || null,
            meta_title: meta_title || null,
            meta_description: meta_description || null,
        });

        return NextResponse.json({ id: result._id, message: "Category created successfully" });
    } catch (error) {
        console.error("Error creating category:", error);
        return NextResponse.json({ error: "Failed to create category" }, { status: 500 });
    }
}

export async function PUT(request: NextRequest) {
    try {
        await connectDB();
        const body = await request.json();
        const { id, name, slug, description, icon, meta_title, meta_description, thumbnail } = body;

        if (!id) {
            return NextResponse.json({ error: "ID is required" }, { status: 400 });
        }

        await ServiceCategories.findByIdAndUpdate(id, {
            name,
            slug,
            brand: '',
            description: description || null,
            icon: icon || null,
            thumbnail: thumbnail || null,
            meta_title: meta_title || null,
            meta_description: meta_description || null,
            updatedAt: new Date(),
        }, { new: true });

        return NextResponse.json({ message: "Category updated successfully" });
    } catch (error) {
        console.error("Error updating category:", error);
        return NextResponse.json({ error: "Failed to update category" }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest) {
    try {
        await connectDB();
        const body = await request.json();
        const { id } = body;

        if (!id) {
            return NextResponse.json({ error: "ID is required" }, { status: 400 });
        }

        await ServiceCategories.findByIdAndDelete(id);
        return NextResponse.json({ message: "Category deleted successfully" });
    } catch (error) {
        console.error("Error deleting category:", error);
        return NextResponse.json({ error: "Failed to delete category" }, { status: 500 });
    }
}
