import { NextResponse } from "next/server";
import { db } from "@/db";
import { serviceSubcategories } from "@/db/serviceCategoriesSchema";
import { eq } from "drizzle-orm";

export async function GET() {
    try {
        const subcategories = await db.select().from(serviceSubcategories);
        return NextResponse.json(subcategories);
    } catch (error) {
        console.error("Error fetching service subcategories:", error);
        return NextResponse.json({ error: "Failed to fetch subcategories" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { category_id, name, slug, description } = body;

        if (!category_id || !name || !slug) {
            return NextResponse.json({ error: "Category ID, name, and slug are required" }, { status: 400 });
        }

        const result = await db.insert(serviceSubcategories).values({
            category_id,
            name,
            slug,
            description: description || null,
        });

        return NextResponse.json({ id: result[0].insertId, message: "Subcategory created successfully" });
    } catch (error) {
        console.error("Error creating subcategory:", error);
        return NextResponse.json({ error: "Failed to create subcategory" }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        const body = await request.json();
        const { id, category_id, name, slug, description } = body;

        if (!id) {
            return NextResponse.json({ error: "ID is required" }, { status: 400 });
        }

        await db.update(serviceSubcategories)
            .set({
                category_id,
                name,
                slug,
                description: description || null,
                updatedAt: new Date(),
            })
            .where(eq(serviceSubcategories.id, id));

        return NextResponse.json({ message: "Subcategory updated successfully" });
    } catch (error) {
        console.error("Error updating subcategory:", error);
        return NextResponse.json({ error: "Failed to update subcategory" }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const body = await request.json();
        const { id } = body;

        if (!id) {
            return NextResponse.json({ error: "ID is required" }, { status: 400 });
        }

        await db.delete(serviceSubcategories).where(eq(serviceSubcategories.id, id));
        return NextResponse.json({ message: "Subcategory deleted successfully" });
    } catch (error) {
        console.error("Error deleting subcategory:", error);
        return NextResponse.json({ error: "Failed to delete subcategory" }, { status: 500 });
    }
}
