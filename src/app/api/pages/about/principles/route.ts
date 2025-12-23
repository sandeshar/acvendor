import { NextRequest, NextResponse } from 'next/server';
import { eq, asc } from 'drizzle-orm';
import { db } from '@/db';
import { aboutPagePrinciples } from '@/db/aboutPageSchema';
import { revalidateTag } from 'next/cache';

// GET - Fetch principles
export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const id = searchParams.get('id');

        if (id) {
            const principle = await db.select().from(aboutPagePrinciples).where(eq(aboutPagePrinciples.id, parseInt(id))).limit(1);

            if (principle.length === 0) {
                return NextResponse.json({ error: 'Principle not found' }, { status: 404 });
            }

            return NextResponse.json(principle[0]);
        }

        const principles = await db.select().from(aboutPagePrinciples)
            .where(eq(aboutPagePrinciples.is_active, 1))
            .orderBy(asc(aboutPagePrinciples.display_order));

        return NextResponse.json(principles);
    } catch (error) {
        console.error('Error fetching principles:', error);
        return NextResponse.json({ error: 'Failed to fetch principles' }, { status: 500 });
    }
}

// POST - Create principle
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { title, description, display_order, is_active = 1 } = body;

        if (!title || !description || display_order === undefined) {
            return NextResponse.json({ error: 'Title, description, and display_order are required' }, { status: 400 });
        }

        const result = await db.insert(aboutPagePrinciples).values({ title, description, display_order, is_active });

        revalidateTag('about-principles', 'max');

        return NextResponse.json(
            { success: true, message: 'Principle created successfully', id: result[0].insertId },
            { status: 201 }
        );
    } catch (error) {
        console.error('Error creating principle:', error);
        return NextResponse.json({ error: 'Failed to create principle' }, { status: 500 });
    }
}

// PUT - Update principle
export async function PUT(request: NextRequest) {
    try {
        const body = await request.json();
        const { id, title, description, display_order, is_active } = body;

        if (!id) {
            return NextResponse.json({ error: 'ID is required' }, { status: 400 });
        }

        const updateData: any = {};
        if (title !== undefined) updateData.title = title;
        if (description !== undefined) updateData.description = description;
        if (display_order !== undefined) updateData.display_order = display_order;
        if (is_active !== undefined) updateData.is_active = is_active;

        await db.update(aboutPagePrinciples).set(updateData).where(eq(aboutPagePrinciples.id, id));

        revalidateTag('about-principles', 'max');

        return NextResponse.json({ success: true, message: 'Principle updated successfully' });
    } catch (error) {
        console.error('Error updating principle:', error);
        return NextResponse.json({ error: 'Failed to update principle' }, { status: 500 });
    }
}

// DELETE - Delete principle
export async function DELETE(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'ID is required' }, { status: 400 });
        }

        await db.delete(aboutPagePrinciples).where(eq(aboutPagePrinciples.id, parseInt(id)));

        revalidateTag('about-principles', 'max');

        return NextResponse.json({ success: true, message: 'Principle deleted successfully' });
    } catch (error) {
        console.error('Error deleting principle:', error);
        return NextResponse.json({ error: 'Failed to delete principle' }, { status: 500 });
    }
}
