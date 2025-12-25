import { NextRequest, NextResponse } from 'next/server';
import { eq, asc } from 'drizzle-orm';
import { db } from '@/db';
import { homepageTrustLogos } from '@/db/homepageSchema';
import { revalidateTag } from 'next/cache';

// GET - Fetch trust logos
export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const id = searchParams.get('id');

        if (id) {
            const logo = await db.select().from(homepageTrustLogos).where(eq(homepageTrustLogos.id, parseInt(id))).limit(1);

            if (logo.length === 0) {
                return NextResponse.json({ error: 'Logo not found' }, { status: 404 });
            }

            return NextResponse.json(logo[0]);
        }

        // Get all active logos ordered by display_order
        const logos = await db.select().from(homepageTrustLogos)
            .where(eq(homepageTrustLogos.is_active, 1))
            .orderBy(asc(homepageTrustLogos.display_order));

        return NextResponse.json(logos);
    } catch (error) {
        console.error('Error fetching trust logos:', error);
        return NextResponse.json({ error: 'Failed to fetch trust logos' }, { status: 500 });
    }
}

// POST - Create trust logo
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { alt_text, logo_url, invert = 0, display_order, is_active = 1 } = body;

        if (!alt_text || !logo_url || display_order === undefined) {
            return NextResponse.json(
                { error: 'alt_text, logo_url, and display_order are required' },
                { status: 400 }
            );
        }

        const result = await db.insert(homepageTrustLogos).values({
            alt_text,
            logo_url,
            invert,
            display_order,
            is_active,
        });
        revalidateTag('homepage-trust-logos', 'max');

        return NextResponse.json(
            { success: true, message: 'Trust logo created successfully', id: result[0].insertId },
            { status: 201 }
        );
    } catch (error) {
        console.error('Error creating trust logo:', error);
        return NextResponse.json({ error: 'Failed to create trust logo' }, { status: 500 });
    }
}

// PUT - Update trust logo
export async function PUT(request: NextRequest) {
    try {
        const body = await request.json();
        const { id, alt_text, logo_url, invert, display_order, is_active } = body;

        if (!id) {
            return NextResponse.json({ error: 'ID is required' }, { status: 400 });
        }

        const updateData: any = {};
        if (alt_text !== undefined) updateData.alt_text = alt_text;
        if (logo_url !== undefined) updateData.logo_url = logo_url;
        if (invert !== undefined) updateData.invert = invert;
        if (display_order !== undefined) updateData.display_order = display_order;
        if (is_active !== undefined) updateData.is_active = is_active;

        await db.update(homepageTrustLogos).set(updateData).where(eq(homepageTrustLogos.id, id));
        revalidateTag('homepage-trust-logos', 'max');

        return NextResponse.json({ success: true, message: 'Trust logo updated successfully' });
    } catch (error) {
        console.error('Error updating trust logo:', error);
        return NextResponse.json({ error: 'Failed to update trust logo' }, { status: 500 });
    }
}

// DELETE - Delete trust logo
export async function DELETE(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'ID is required' }, { status: 400 });
        }

        await db.delete(homepageTrustLogos).where(eq(homepageTrustLogos.id, parseInt(id)));
        revalidateTag('homepage-trust-logos', 'max');

        return NextResponse.json({ success: true, message: 'Trust logo deleted successfully' });
    } catch (error) {
        console.error('Error deleting trust logo:', error);
        return NextResponse.json({ error: 'Failed to delete trust logo' }, { status: 500 });
    }
}
