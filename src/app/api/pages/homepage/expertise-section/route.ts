import { NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { homepageExpertiseSection } from '@/db/homepageSchema';
import { revalidateTag } from 'next/cache';

// GET - Fetch expertise section
export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const id = searchParams.get('id');

        if (id) {
            const section = await db.select().from(homepageExpertiseSection).where(eq(homepageExpertiseSection.id, parseInt(id))).limit(1);

            if (section.length === 0) {
                return NextResponse.json({ error: 'Expertise section not found' }, { status: 404 });
            }

            return NextResponse.json(section[0]);
        }

        const section = await db.select().from(homepageExpertiseSection).where(eq(homepageExpertiseSection.is_active, 1)).limit(1);

        if (section.length === 0) {
            // Return empty object to allow admin UI to create new entry
            return NextResponse.json({});
        }

        return NextResponse.json(section[0]);
    } catch (error) {
        console.error('Error fetching expertise section:', error);
        return NextResponse.json({ error: 'Failed to fetch expertise section' }, { status: 500 });
    }
}

// POST - Create expertise section
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { title, description, is_active = 1 } = body;

        if (!title || !description) {
            return NextResponse.json({ error: 'Title and description are required' }, { status: 400 });
        }

        const result = await db.insert(homepageExpertiseSection).values({ title, description, is_active });
        revalidateTag('homepage-expertise-items', 'max');
        return NextResponse.json(
            { success: true, message: 'Expertise section created successfully', id: result[0].insertId },
            { status: 201 }
        );
    } catch (error) {
        console.error('Error creating expertise section:', error);
        return NextResponse.json({ error: 'Failed to create expertise section' }, { status: 500 });
    }
}

// PUT - Update expertise section
export async function PUT(request: NextRequest) {
    try {
        const body = await request.json();
        const { id, title, description, is_active } = body;

        if (!id) {
            return NextResponse.json({ error: 'ID is required' }, { status: 400 });
        }

        const updateData: any = {};
        if (title !== undefined) updateData.title = title;
        if (description !== undefined) updateData.description = description;
        if (is_active !== undefined) updateData.is_active = is_active;

        await db.update(homepageExpertiseSection).set(updateData).where(eq(homepageExpertiseSection.id, id));
        revalidateTag('homepage-expertise-items', 'max');

        return NextResponse.json({ success: true, message: 'Expertise section updated successfully' });
    } catch (error) {
        console.error('Error updating expertise section:', error);
        return NextResponse.json({ error: 'Failed to update expertise section' }, { status: 500 });
    }
}

// DELETE - Delete expertise section
export async function DELETE(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'ID is required' }, { status: 400 });
        }

        await db.delete(homepageExpertiseSection).where(eq(homepageExpertiseSection.id, parseInt(id)));
        revalidateTag('homepage-expertise-items', 'max');

        return NextResponse.json({ success: true, message: 'Expertise section deleted successfully' });
    } catch (error) {
        console.error('Error deleting expertise section:', error);
        return NextResponse.json({ error: 'Failed to delete expertise section' }, { status: 500 });
    }
}
