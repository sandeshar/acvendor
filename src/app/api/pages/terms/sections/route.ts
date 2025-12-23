import { NextRequest, NextResponse } from 'next/server';
import { eq, asc } from 'drizzle-orm';
import { db } from '@/db';
import { termsPageSections } from '@/db/termsPageSchema';
import { revalidateTag } from 'next/cache';

// GET - Fetch sections
export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const id = searchParams.get('id');

        if (id) {
            const section = await db.select().from(termsPageSections).where(eq(termsPageSections.id, parseInt(id))).limit(1);

            if (section.length === 0) {
                return NextResponse.json({ error: 'Section not found' }, { status: 404 });
            }

            return NextResponse.json(section[0]);
        }

        const sections = await db.select().from(termsPageSections)
            .where(eq(termsPageSections.is_active, 1))
            .orderBy(asc(termsPageSections.display_order));

        return NextResponse.json(sections);
    } catch (error) {
        console.error('Error fetching sections:', error);
        return NextResponse.json({ error: 'Failed to fetch sections' }, { status: 500 });
    }
}

// POST - Create section
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { title, content, has_email = 0, display_order, is_active = 1 } = body;

        if (!title || !content || display_order === undefined) {
            return NextResponse.json({ error: 'Title, content, and display_order are required' }, { status: 400 });
        }

        const result = await db.insert(termsPageSections).values({
            title,
            content,
            has_email,
            display_order,
            is_active,
        });

        revalidateTag('terms-sections', 'max');

        return NextResponse.json(
            { success: true, message: 'Section created successfully', id: result[0].insertId },
            { status: 201 }
        );
    } catch (error) {
        console.error('Error creating section:', error);
        return NextResponse.json({ error: 'Failed to create section' }, { status: 500 });
    }
}

// PUT - Update section
export async function PUT(request: NextRequest) {
    try {
        const body = await request.json();
        const { id, title, content, has_email, display_order, is_active } = body;

        if (!id) {
            return NextResponse.json({ error: 'ID is required' }, { status: 400 });
        }

        const updateData: any = {};
        if (title !== undefined) updateData.title = title;
        if (content !== undefined) updateData.content = content;
        if (has_email !== undefined) updateData.has_email = has_email;
        if (display_order !== undefined) updateData.display_order = display_order;
        if (is_active !== undefined) updateData.is_active = is_active;

        await db.update(termsPageSections).set(updateData).where(eq(termsPageSections.id, id));

        revalidateTag('terms-sections', 'max');

        return NextResponse.json({ success: true, message: 'Section updated successfully' });
    } catch (error) {
        console.error('Error updating section:', error);
        return NextResponse.json({ error: 'Failed to update section' }, { status: 500 });
    }
}

// DELETE - Delete section
export async function DELETE(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'ID is required' }, { status: 400 });
        }

        await db.delete(termsPageSections).where(eq(termsPageSections.id, parseInt(id)));

        revalidateTag('terms-sections', 'max');

        return NextResponse.json({ success: true, message: 'Section deleted successfully' });
    } catch (error) {
        console.error('Error deleting section:', error);
        return NextResponse.json({ error: 'Failed to delete section' }, { status: 500 });
    }
}
