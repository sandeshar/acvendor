import { NextRequest, NextResponse } from 'next/server';
import { eq, asc } from 'drizzle-orm';
import { db } from '@/db';
import { homepageExpertiseItems } from '@/db/homepageSchema';
import { revalidateTag } from 'next/cache';

// GET - Fetch expertise items
export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const id = searchParams.get('id');

        if (id) {
            const item = await db.select().from(homepageExpertiseItems).where(eq(homepageExpertiseItems.id, parseInt(id))).limit(1);

            if (item.length === 0) {
                return NextResponse.json({ error: 'Expertise item not found' }, { status: 404 });
            }

            return NextResponse.json(item[0]);
        }

        // Get all active items ordered by display_order
        const items = await db.select().from(homepageExpertiseItems)
            .where(eq(homepageExpertiseItems.is_active, 1))
            .orderBy(asc(homepageExpertiseItems.display_order));

        return NextResponse.json(items);
    } catch (error) {
        console.error('Error fetching expertise items:', error);
        return NextResponse.json({ error: 'Failed to fetch expertise items' }, { status: 500 });
    }
}

// POST - Create expertise item
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { icon, title, description, display_order, is_active = 1 } = body;

        if (!icon || !title || !description || display_order === undefined) {
            return NextResponse.json(
                { error: 'Icon, title, description, and display_order are required' },
                { status: 400 }
            );
        }

        const result = await db.insert(homepageExpertiseItems).values({
            icon,
            title,
            description,
            display_order,
            is_active,
        });
        revalidateTag('homepage-expertise-items', 'max');
        return NextResponse.json(
            { success: true, message: 'Expertise item created successfully', id: result[0].insertId },
            { status: 201 }
        );
    } catch (error) {
        console.error('Error creating expertise item:', error);
        return NextResponse.json({ error: 'Failed to create expertise item' }, { status: 500 });
    }
}

// PUT - Update expertise item
export async function PUT(request: NextRequest) {
    try {
        const body = await request.json();
        const { id, icon, title, description, display_order, is_active } = body;

        if (!id) {
            return NextResponse.json({ error: 'ID is required' }, { status: 400 });
        }

        const updateData: any = {};
        if (icon !== undefined) updateData.icon = icon;
        if (title !== undefined) updateData.title = title;
        if (description !== undefined) updateData.description = description;
        if (display_order !== undefined) updateData.display_order = display_order;
        if (is_active !== undefined) updateData.is_active = is_active;

        await db.update(homepageExpertiseItems).set(updateData).where(eq(homepageExpertiseItems.id, id));
        revalidateTag('homepage-expertise-items', 'max');

        return NextResponse.json({ success: true, message: 'Expertise item updated successfully' });
    } catch (error) {
        console.error('Error updating expertise item:', error);
        return NextResponse.json({ error: 'Failed to update expertise item' }, { status: 500 });
    }
}

// DELETE - Delete expertise item
export async function DELETE(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'ID is required' }, { status: 400 });
        }

        await db.delete(homepageExpertiseItems).where(eq(homepageExpertiseItems.id, parseInt(id)));
        revalidateTag('homepage-expertise-items', 'max');

        return NextResponse.json({ success: true, message: 'Expertise item deleted successfully' });
    } catch (error) {
        console.error('Error deleting expertise item:', error);
        return NextResponse.json({ error: 'Failed to delete expertise item' }, { status: 500 });
    }
}
