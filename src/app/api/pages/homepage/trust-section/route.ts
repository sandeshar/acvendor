import { NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { homepageTrustSection } from '@/db/homepageSchema';
import { revalidateTag } from 'next/cache';

// GET - Fetch trust section
export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const id = searchParams.get('id');

        if (id) {
            const section = await db.select().from(homepageTrustSection).where(eq(homepageTrustSection.id, parseInt(id))).limit(1);

            if (section.length === 0) {
                return NextResponse.json({ error: 'Trust section not found' }, { status: 404 });
            }

            return NextResponse.json(section[0]);
        }

        const section = await db.select().from(homepageTrustSection).where(eq(homepageTrustSection.is_active, 1)).limit(1);

        if (section.length === 0) {
            // Return empty object to allow admin UI to create new entry
            return NextResponse.json({});
        }

        return NextResponse.json(section[0]);
    } catch (error) {
        console.error('Error fetching trust section:', error);
        return NextResponse.json({ error: 'Failed to fetch trust section' }, { status: 500 });
    }
}

// POST - Create trust section
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { heading, is_active = 1 } = body;

        if (!heading) {
            return NextResponse.json({ error: 'Heading is required' }, { status: 400 });
        }

        const result = await db.insert(homepageTrustSection).values({ heading, is_active });
        revalidateTag('homepage-trust-section', 'max');
        return NextResponse.json(
            { success: true, message: 'Trust section created successfully', id: result[0].insertId },
            { status: 201 }
        );
    } catch (error) {
        console.error('Error creating trust section:', error);
        return NextResponse.json({ error: 'Failed to create trust section' }, { status: 500 });
    }
}

// PUT - Update trust section
export async function PUT(request: NextRequest) {
    try {
        const body = await request.json();
        const { id, heading, is_active } = body;

        if (!id) {
            return NextResponse.json({ error: 'ID is required' }, { status: 400 });
        }

        const updateData: any = {};
        if (heading !== undefined) updateData.heading = heading;
        if (is_active !== undefined) updateData.is_active = is_active;

        await db.update(homepageTrustSection).set(updateData).where(eq(homepageTrustSection.id, id));
        revalidateTag('homepage-trust-section', 'max');

        return NextResponse.json({ success: true, message: 'Trust section updated successfully' });
    } catch (error) {
        console.error('Error updating trust section:', error);
        return NextResponse.json({ error: 'Failed to update trust section' }, { status: 500 });
    }
}

// DELETE - Delete trust section
export async function DELETE(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'ID is required' }, { status: 400 });
        }

        await db.delete(homepageTrustSection).where(eq(homepageTrustSection.id, parseInt(id)));
        revalidateTag('homepage-trust-section', 'max');

        return NextResponse.json({ success: true, message: 'Trust section deleted successfully' });
    } catch (error) {
        console.error('Error deleting trust section:', error);
        return NextResponse.json({ error: 'Failed to delete trust section' }, { status: 500 });
    }
}
