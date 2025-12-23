import { NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { faqPageHeader } from '@/db/faqPageSchema';
import { revalidateTag } from 'next/cache';

// GET - Fetch header section
export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const id = searchParams.get('id');

        if (id) {
            const header = await db.select().from(faqPageHeader).where(eq(faqPageHeader.id, parseInt(id))).limit(1);

            if (header.length === 0) {
                return NextResponse.json({ error: 'Header section not found' }, { status: 404 });
            }

            return NextResponse.json(header[0]);
        }

        const header = await db.select().from(faqPageHeader).where(eq(faqPageHeader.is_active, 1)).limit(1);

        if (header.length === 0) {
            return NextResponse.json({ error: 'No active header section found' }, { status: 404 });
        }

        return NextResponse.json(header[0]);
    } catch (error) {
        console.error('Error fetching header section:', error);
        return NextResponse.json({ error: 'Failed to fetch header section' }, { status: 500 });
    }
}

// POST - Create header section
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { title, description, search_placeholder, is_active = 1 } = body;

        if (!title || !description || !search_placeholder) {
            return NextResponse.json({ error: 'Title, description, and search_placeholder are required' }, { status: 400 });
        }

        const result = await db.insert(faqPageHeader).values({ title, description, search_placeholder, is_active });

        revalidateTag('faq-header', 'max');

        return NextResponse.json(
            { success: true, message: 'Header section created successfully', id: result[0].insertId },
            { status: 201 }
        );
    } catch (error) {
        console.error('Error creating header section:', error);
        return NextResponse.json({ error: 'Failed to create header section' }, { status: 500 });
    }
}

// PUT - Update header section
export async function PUT(request: NextRequest) {
    try {
        const body = await request.json();
        const { id, title, description, search_placeholder, is_active } = body;

        if (!id) {
            return NextResponse.json({ error: 'ID is required' }, { status: 400 });
        }

        const updateData: any = {};
        if (title !== undefined) updateData.title = title;
        if (description !== undefined) updateData.description = description;
        if (search_placeholder !== undefined) updateData.search_placeholder = search_placeholder;
        if (is_active !== undefined) updateData.is_active = is_active;

        await db.update(faqPageHeader).set(updateData).where(eq(faqPageHeader.id, id));

        revalidateTag('faq-header', 'max');

        return NextResponse.json({ success: true, message: 'Header section updated successfully' });
    } catch (error) {
        console.error('Error updating header section:', error);
        return NextResponse.json({ error: 'Failed to update header section' }, { status: 500 });
    }
}

// DELETE - Delete header section
export async function DELETE(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'ID is required' }, { status: 400 });
        }

        await db.delete(faqPageHeader).where(eq(faqPageHeader.id, parseInt(id)));

        revalidateTag('faq-header', 'max');

        return NextResponse.json({ success: true, message: 'Header section deleted successfully' });
    } catch (error) {
        console.error('Error deleting header section:', error);
        return NextResponse.json({ error: 'Failed to delete header section' }, { status: 500 });
    }
}
