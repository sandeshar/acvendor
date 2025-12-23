import { NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { contactPageHero } from '@/db/contactPageSchema';
import { revalidateTag } from 'next/cache';

// GET - Fetch hero section
export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const id = searchParams.get('id');

        if (id) {
            const hero = await db.select().from(contactPageHero).where(eq(contactPageHero.id, parseInt(id))).limit(1);

            if (hero.length === 0) {
                return NextResponse.json({ error: 'Hero section not found' }, { status: 404 });
            }

            return NextResponse.json(hero[0]);
        }

        const hero = await db.select().from(contactPageHero).where(eq(contactPageHero.is_active, 1)).limit(1);

        if (hero.length === 0) {
            return NextResponse.json({ error: 'No active hero section found' }, { status: 404 });
        }

        return NextResponse.json(hero[0]);
    } catch (error) {
        console.error('Error fetching hero section:', error);
        return NextResponse.json({ error: 'Failed to fetch hero section' }, { status: 500 });
    }
}

// POST - Create hero section
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { tagline, title, description, is_active = 1 } = body;

        if (!tagline || !title || !description) {
            return NextResponse.json({ error: 'Tagline, title, and description are required' }, { status: 400 });
        }

        const result = await db.insert(contactPageHero).values({ tagline, title, description, is_active });

        revalidateTag('contact-hero', 'max');

        return NextResponse.json(
            { success: true, message: 'Hero section created successfully', id: result[0].insertId },
            { status: 201 }
        );
    } catch (error) {
        console.error('Error creating hero section:', error);
        return NextResponse.json({ error: 'Failed to create hero section' }, { status: 500 });
    }
}

// PUT - Update hero section
export async function PUT(request: NextRequest) {
    try {
        const body = await request.json();
        const { id, tagline, title, description, is_active } = body;

        if (!id) {
            return NextResponse.json({ error: 'ID is required' }, { status: 400 });
        }

        const updateData: any = {};
        if (tagline !== undefined) updateData.tagline = tagline;
        if (title !== undefined) updateData.title = title;
        if (description !== undefined) updateData.description = description;
        if (is_active !== undefined) updateData.is_active = is_active;

        await db.update(contactPageHero).set(updateData).where(eq(contactPageHero.id, id));

        revalidateTag('contact-hero', 'max');

        return NextResponse.json({ success: true, message: 'Hero section updated successfully' });
    } catch (error) {
        console.error('Error updating hero section:', error);
        return NextResponse.json({ error: 'Failed to update hero section' }, { status: 500 });
    }
}

// DELETE - Delete hero section
export async function DELETE(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'ID is required' }, { status: 400 });
        }

        await db.delete(contactPageHero).where(eq(contactPageHero.id, parseInt(id)));

        revalidateTag('contact-hero', 'max');

        return NextResponse.json({ success: true, message: 'Hero section deleted successfully' });
    } catch (error) {
        console.error('Error deleting hero section:', error);
        return NextResponse.json({ error: 'Failed to delete hero section' }, { status: 500 });
    }
}
