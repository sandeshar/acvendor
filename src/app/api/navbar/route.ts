import { NextResponse } from "next/server";
import { db } from "@/db";
import { navbarItems } from "@/db/navbarSchema";
import { eq, and, asc } from "drizzle-orm";

export async function GET() {
    try {
        const items = await db.select().from(navbarItems).orderBy(asc(navbarItems.order));
        return NextResponse.json(items);
    } catch (error) {
        console.error("Error fetching navbar items:", error);
        return NextResponse.json({ error: "Failed to fetch navbar items" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { label, href, order, parent_id, is_button, is_active, is_dropdown } = body;

        if (!label || !href) {
            return NextResponse.json({ error: "Label and href are required" }, { status: 400 });
        }

        // Check for duplicate by href and parent_id to avoid duplicate creation
        const [existing] = await db
            .select()
            .from(navbarItems)
            .where(
                and(
                    eq(navbarItems.href, href),
                    eq(navbarItems.parent_id, parent_id || null),
                    eq(navbarItems.is_button, is_button || 0)
                )
            )
            .limit(1);

        if (existing) {
            return NextResponse.json({ id: existing.id, message: "Navbar item already exists", existing: true }, { status: 200 });
        }

        try {
            const result = await db.insert(navbarItems).values({
                label,
                href,
                order: order || 0,
                parent_id: parent_id || null,
                is_button: is_button || 0,
                is_active: is_active !== undefined ? is_active : 1,
                is_dropdown: is_dropdown || 0,
            });
            return NextResponse.json({ id: result[0].insertId, message: "Navbar item created successfully" }, { status: 201 });
        } catch (err: any) {
            // If DB reports duplicate key, return 409
            const code = err?.cause?.errno || err?.errno || err?.code;
            if (code === 'ER_DUP_ENTRY' || code === 1062) {
                return NextResponse.json({ error: 'Duplicate navbar item', details: String(err?.message || err) }, { status: 409 });
            }
            throw err;
        }
    } catch (error) {
        console.error("Error creating navbar item:", error);
        return NextResponse.json({ error: "Failed to create navbar item" }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        const body = await request.json();
        const { id, label, href, order, parent_id, is_button, is_active, is_dropdown } = body;

        if (!id) {
            return NextResponse.json({ error: "ID is required" }, { status: 400 });
        }

        await db.update(navbarItems)
            .set({
                label,
                href,
                order,
                parent_id: parent_id || null,
                is_button,
                is_active,
                is_dropdown,
                updated_at: new Date(),
            })
            .where(eq(navbarItems.id, id));

        return NextResponse.json({ message: "Navbar item updated successfully" });
    } catch (error) {
        console.error("Error updating navbar item:", error);
        return NextResponse.json({ error: "Failed to update navbar item" }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const body = await request.json();
        const { id } = body;

        if (!id) {
            return NextResponse.json({ error: "ID is required" }, { status: 400 });
        }

        await db.delete(navbarItems).where(eq(navbarItems.id, id));
        return NextResponse.json({ message: "Navbar item deleted successfully" });
    } catch (error) {
        console.error("Error deleting navbar item:", error);
        return NextResponse.json({ error: "Failed to delete navbar item" }, { status: 500 });
    }
}
