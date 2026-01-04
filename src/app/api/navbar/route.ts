import { NextResponse } from "next/server";
import { connectDB } from "@/db";
import { NavbarItems } from "@/db/navbarSchema";

export async function GET() {
    try {
        await connectDB();

        const items = await NavbarItems.find().sort({ order: 1 }).lean();
        return NextResponse.json(items);
    } catch (error) {
        console.error("Error fetching navbar items:", error);
        return NextResponse.json({ error: "Failed to fetch navbar items" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        await connectDB();

        const body = await request.json();
        const { label, href, order, parent_id, is_button, is_active, is_dropdown } = body;

        if (!label || !href) {
            return NextResponse.json({ error: "Label and href are required" }, { status: 400 });
        }

        // Check for duplicate by href and parent_id to avoid duplicate creation
        const existing = await NavbarItems.findOne({
            href,
            parent_id: parent_id || null,
            is_button: is_button || 0
        }).lean();

        if (existing) {
            return NextResponse.json({ id: existing._id, message: "Navbar item already exists", existing: true }, { status: 200 });
        }

        try {
            const result = await NavbarItems.create({
                label,
                href,
                order: order || 0,
                parent_id: parent_id || null,
                is_button: is_button || 0,
                is_active: is_active !== undefined ? is_active : 1,
                is_dropdown: is_dropdown || 0,
            });
            return NextResponse.json({ id: result._id, message: "Navbar item created successfully" }, { status: 201 });
        } catch (err: any) {
            // If DB reports duplicate key, return 409
            if (err.code === 11000) {
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
        await connectDB();

        const body = await request.json();
        const { id, label, href, order, parent_id, is_button, is_active, is_dropdown } = body;

        if (!id) {
            return NextResponse.json({ error: "ID is required" }, { status: 400 });
        }

        await NavbarItems.findByIdAndUpdate(id, {
            label,
            href,
            order,
            parent_id: parent_id || null,
            is_button,
            is_active,
            is_dropdown,
            updated_at: new Date(),
        }, { new: true });

        return NextResponse.json({ message: "Navbar item updated successfully" });
    } catch (error) {
        console.error("Error updating navbar item:", error);
        return NextResponse.json({ error: "Failed to update navbar item" }, { status: 500 });
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

        await NavbarItems.findByIdAndDelete(id);
        return NextResponse.json({ message: "Navbar item deleted successfully" });
    } catch (error) {
        console.error("Error deleting navbar item:", error);
        return NextResponse.json({ error: "Failed to delete navbar item" }, { status: 500 });
    }
}
