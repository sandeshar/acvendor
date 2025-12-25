import { NextRequest, NextResponse } from 'next/server';
import { eq, asc } from 'drizzle-orm';
import { db } from '@/db';
import { servicesFeatureStrip } from '@/db/servicesPageSchema';
import { revalidateTag } from 'next/cache';

// GET - fetch feature strip items (all active, ordered)
export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const id = searchParams.get('id');

        if (id) {
            const row = await db.select().from(servicesFeatureStrip).where(eq(servicesFeatureStrip.id, parseInt(id))).limit(1);
            if (row.length === 0) return NextResponse.json({ error: 'Item not found' }, { status: 404 });
            return NextResponse.json(row[0]);
        }

        const rows = await db.select().from(servicesFeatureStrip).where(eq(servicesFeatureStrip.is_active, 1)).orderBy(asc(servicesFeatureStrip.display_order));
        return NextResponse.json(rows);
    } catch (error) {
        console.error('Error fetching feature strip items:', error);
        return NextResponse.json({ error: 'Failed to fetch feature strip items' }, { status: 500 });
    }
}

// POST - create
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { icon, title, description, display_order = 0, is_active = 1 } = body;

        if (!icon || !title || !description) {
            return NextResponse.json({ error: 'icon, title and description are required' }, { status: 400 });
        }

        const result = await db.insert(servicesFeatureStrip).values({ icon, title, description, display_order, is_active });
        revalidateTag('services-feature-strip', 'max');
        return NextResponse.json({ success: true, message: 'Item created', id: result[0].insertId }, { status: 201 });
    } catch (error) {
        console.error('Error creating feature strip item:', error);
        return NextResponse.json({ error: 'Failed to create item' }, { status: 500 });
    }
}

// PUT - update
export async function PUT(request: NextRequest) {
    try {
        const body = await request.json();
        const { id, icon, title, description, display_order, is_active } = body;
        if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 });

        const updateData: any = {};
        if (icon !== undefined) updateData.icon = icon;
        if (title !== undefined) updateData.title = title;
        if (description !== undefined) updateData.description = description;
        if (display_order !== undefined) updateData.display_order = display_order;
        if (is_active !== undefined) updateData.is_active = is_active;

        await db.update(servicesFeatureStrip).set(updateData).where(eq(servicesFeatureStrip.id, id));
        revalidateTag('services-feature-strip', 'max');
        return NextResponse.json({ success: true, message: 'Item updated' });
    } catch (error) {
        console.error('Error updating feature strip item:', error);
        return NextResponse.json({ error: 'Failed to update item' }, { status: 500 });
    }
}

// DELETE - delete
export async function DELETE(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const id = searchParams.get('id');
        if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 });

        await db.delete(servicesFeatureStrip).where(eq(servicesFeatureStrip.id, parseInt(id)));
        revalidateTag('services-feature-strip', 'max');
        return NextResponse.json({ success: true, message: 'Item deleted' });
    } catch (error) {
        console.error('Error deleting feature strip item:', error);
        return NextResponse.json({ error: 'Failed to delete item' }, { status: 500 });
    }
}
