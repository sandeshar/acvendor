import { NextRequest, NextResponse } from 'next/server';
import { eq, asc } from 'drizzle-orm';
import { db } from '@/db';
import { aboutPageFeatures } from '@/db/aboutPageSchema';
import { revalidateTag } from 'next/cache';

// GET - Fetch features
export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const id = searchParams.get('id');

        if (id) {
            const feature = await db.select().from(aboutPageFeatures).where(eq(aboutPageFeatures.id, parseInt(id))).limit(1);

            if (feature.length === 0) {
                return NextResponse.json({ error: 'Feature not found' }, { status: 404 });
            }

            return NextResponse.json(feature[0]);
        }

        const features = await db.select().from(aboutPageFeatures)
            .where(eq(aboutPageFeatures.is_active, 1))
            .orderBy(asc(aboutPageFeatures.display_order));

        return NextResponse.json(features);
    } catch (error) {
        console.error('Error fetching features:', error);
        return NextResponse.json({ error: 'Failed to fetch features' }, { status: 500 });
    }
}

// POST - Create feature
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { title, description, icon = '', display_order, is_active = 1 } = body;

        if (!title || !description || display_order === undefined) {
            return NextResponse.json({ error: 'Title, description, and display_order are required' }, { status: 400 });
        }

        const result = await db.insert(aboutPageFeatures).values({ title, description, icon, display_order, is_active });
        revalidateTag('about-features', 'max');
        return NextResponse.json(
            { success: true, message: 'Feature created successfully', id: result[0].insertId },
            { status: 201 }
        );
    } catch (error) {
        console.error('Error creating feature:', error);
        return NextResponse.json({ error: 'Failed to create feature' }, { status: 500 });
    }
}

// PUT - Update feature
export async function PUT(request: NextRequest) {
    try {
        const body = await request.json();
        const { id, title, description, icon, display_order, is_active } = body;

        if (!id) {
            return NextResponse.json({ error: 'ID is required' }, { status: 400 });
        }

        const updateData: any = {};
        if (title !== undefined) updateData.title = title;
        if (description !== undefined) updateData.description = description;
        if (icon !== undefined) updateData.icon = icon;
        if (display_order !== undefined) updateData.display_order = display_order;
        if (is_active !== undefined) updateData.is_active = is_active;

        await db.update(aboutPageFeatures).set(updateData).where(eq(aboutPageFeatures.id, id));

        revalidateTag('about-features', 'max');

        return NextResponse.json({ success: true, message: 'Feature updated successfully' });
    } catch (error) {
        console.error('Error updating feature:', error);
        return NextResponse.json({ error: 'Failed to update feature' }, { status: 500 });
    }
}

// DELETE - Delete feature
export async function DELETE(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'ID is required' }, { status: 400 });
        }

        await db.delete(aboutPageFeatures).where(eq(aboutPageFeatures.id, parseInt(id)));

        revalidateTag('about-features', 'max');

        return NextResponse.json({ success: true, message: 'Feature deleted successfully' });
    } catch (error) {
        console.error('Error deleting feature:', error);
        return NextResponse.json({ error: 'Failed to delete feature' }, { status: 500 });
    }
}
