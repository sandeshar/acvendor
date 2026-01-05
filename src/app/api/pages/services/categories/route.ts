import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/db";
import { ServiceCategories } from "@/db/serviceCategoriesSchema";

export async function GET(request: NextRequest) {
    try {
        await connectDB();
        const brand = request.nextUrl.searchParams.get('brand');
        // Include both brand-specific categories and global (empty-brand) categories so brand pages show shared categories too
        const categories = brand ? await ServiceCategories.find({ $or: [{ brand: brand }, { brand: '' }] }).lean() : await ServiceCategories.find().lean();
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
        const { name, slug, description, icon, brand } = body;

        if (!name || !slug) {
            return NextResponse.json({ error: "Name and slug are required" }, { status: 400 });
        }

        const result = await ServiceCategories.create({
            name,
            slug,
            brand: brand || '',
            description: description || null,
            icon: icon || null,
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
        const { id, name, slug, description, icon, brand } = body;

        if (!id) {
            return NextResponse.json({ error: "ID is required" }, { status: 400 });
        }

        await ServiceCategories.findByIdAndUpdate(id, {
            name,
            slug,
            brand: brand || '',
            description: description || null,
            icon: icon || null,
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
