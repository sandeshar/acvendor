import { NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { servicesPageHero } from '@/db/servicesPageSchema';
import { revalidateTag } from 'next/cache';

// GET - Fetch hero section
export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const id = searchParams.get('id');

        if (id) {
            const hero = await db.select().from(servicesPageHero).where(eq(servicesPageHero.id, parseInt(id))).limit(1);

            if (hero.length === 0) {
                return NextResponse.json({ error: 'Hero section not found' }, { status: 404 });
            }

            return NextResponse.json(hero[0]);
        }

        const hero = await db.select().from(servicesPageHero).where(eq(servicesPageHero.is_active, 1)).limit(1);

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
        const {
            tagline,
            title,
            description,
            badge_text = '',
            highlight_text = '',
            primary_cta_text = '',
            primary_cta_link = '',
            secondary_cta_text = '',
            secondary_cta_link = '',
            background_image = '',
            hero_image_alt = '',
            stat1_value = '',
            stat1_label = '',
            stat2_value = '',
            stat2_label = '',
            stat3_value = '',
            stat3_label = '',
            is_active = 1,
        } = body;

        if (!tagline || !title || !description) {
            return NextResponse.json({ error: 'Tagline, title, and description are required' }, { status: 400 });
        }

        const result = await db.insert(servicesPageHero).values({
            tagline,
            title,
            description,
            badge_text,
            highlight_text,
            primary_cta_text,
            primary_cta_link,
            secondary_cta_text,
            secondary_cta_link,
            background_image,
            hero_image_alt,
            stat1_value,
            stat1_label,
            stat2_value,
            stat2_label,
            stat3_value,
            stat3_label,
            is_active,
        });

        revalidateTag('services-hero', 'max');

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
        const {
            id,
            tagline,
            title,
            description,
            badge_text,
            highlight_text,
            primary_cta_text,
            primary_cta_link,
            secondary_cta_text,
            secondary_cta_link,
            background_image,
            hero_image_alt,
            stat1_value,
            stat1_label,
            stat2_value,
            stat2_label,
            stat3_value,
            stat3_label,
            is_active,
        } = body;

        if (!id) {
            return NextResponse.json({ error: 'ID is required' }, { status: 400 });
        }

        const updateData: any = {};
        if (tagline !== undefined) updateData.tagline = tagline;
        if (title !== undefined) updateData.title = title;
        if (description !== undefined) updateData.description = description;
        if (badge_text !== undefined) updateData.badge_text = badge_text;
        if (highlight_text !== undefined) updateData.highlight_text = highlight_text;
        if (primary_cta_text !== undefined) updateData.primary_cta_text = primary_cta_text;
        if (primary_cta_link !== undefined) updateData.primary_cta_link = primary_cta_link;
        if (secondary_cta_text !== undefined) updateData.secondary_cta_text = secondary_cta_text;
        if (secondary_cta_link !== undefined) updateData.secondary_cta_link = secondary_cta_link;
        if (background_image !== undefined) updateData.background_image = background_image;
        if (hero_image_alt !== undefined) updateData.hero_image_alt = hero_image_alt;
        if (stat1_value !== undefined) updateData.stat1_value = stat1_value;
        if (stat1_label !== undefined) updateData.stat1_label = stat1_label;
        if (stat2_value !== undefined) updateData.stat2_value = stat2_value;
        if (stat2_label !== undefined) updateData.stat2_label = stat2_label;
        if (stat3_value !== undefined) updateData.stat3_value = stat3_value;
        if (stat3_label !== undefined) updateData.stat3_label = stat3_label;
        if (is_active !== undefined) updateData.is_active = is_active;

        await db.update(servicesPageHero).set(updateData).where(eq(servicesPageHero.id, id));

        revalidateTag('services-hero', 'max');

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

        await db.delete(servicesPageHero).where(eq(servicesPageHero.id, parseInt(id)));

        revalidateTag('services-hero', 'max');

        return NextResponse.json({ success: true, message: 'Hero section deleted successfully' });
    } catch (error) {
        console.error('Error deleting hero section:', error);
        return NextResponse.json({ error: 'Failed to delete hero section' }, { status: 500 });
    }
}
