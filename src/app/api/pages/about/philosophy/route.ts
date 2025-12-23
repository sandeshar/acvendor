import { NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { aboutPagePhilosophy } from '@/db/aboutPageSchema';
import { revalidateTag } from 'next/cache';

// GET - Fetch philosophy section
export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const id = searchParams.get('id');

        if (id) {
            const philosophy = await db.select().from(aboutPagePhilosophy).where(eq(aboutPagePhilosophy.id, parseInt(id))).limit(1);

            if (philosophy.length === 0) {
                return NextResponse.json({ error: 'Philosophy section not found' }, { status: 404 });
            }

            return NextResponse.json(philosophy[0]);
        }

        const philosophy = await db.select().from(aboutPagePhilosophy).where(eq(aboutPagePhilosophy.is_active, 1)).limit(1);

        if (philosophy.length === 0) {
            return NextResponse.json({ error: 'No active philosophy section found' }, { status: 404 });
        }

        return NextResponse.json(philosophy[0]);
    } catch (error) {
        console.error('Error fetching philosophy section:', error);
        return NextResponse.json({ error: 'Failed to fetch philosophy section' }, { status: 500 });
    }
}

// POST - Create philosophy section
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { title, description, is_active = 1 } = body;

        if (!title || !description) {
            return NextResponse.json({ error: 'Title and description are required' }, { status: 400 });
        }

        const result = await db.insert(aboutPagePhilosophy).values({ title, description, is_active });
        revalidateTag('about-philosophy', 'max');
        return NextResponse.json(
            { success: true, message: 'Philosophy section created successfully', id: result[0].insertId },
            { status: 201 }
        );
    } catch (error) {
        console.error('Error creating philosophy section:', error);
        return NextResponse.json({ error: 'Failed to create philosophy section' }, { status: 500 });
    }
}

// PUT - Update philosophy section
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

        await db.update(aboutPagePhilosophy).set(updateData).where(eq(aboutPagePhilosophy.id, id));

        revalidateTag('about-philosophy', 'max');

        return NextResponse.json({ success: true, message: 'Philosophy section updated successfully' });
    } catch (error) {
        console.error('Error updating philosophy section:', error);
        return NextResponse.json({ error: 'Failed to update philosophy section' }, { status: 500 });
    }
}

// DELETE - Delete philosophy section
export async function DELETE(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'ID is required' }, { status: 400 });
        }

        await db.delete(aboutPagePhilosophy).where(eq(aboutPagePhilosophy.id, parseInt(id)));

        revalidateTag('about-philosophy', 'max');

        return NextResponse.json({ success: true, message: 'Philosophy section deleted successfully' });
    } catch (error) {
        console.error('Error deleting philosophy section:', error);
        return NextResponse.json({ error: 'Failed to delete philosophy section' }, { status: 500 });
    }
}
