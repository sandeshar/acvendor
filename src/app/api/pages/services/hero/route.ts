import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/db';
import { ServicesPageHero } from '@/db/servicesPageSchema';
import { revalidateTag } from 'next/cache';

// GET - Fetch hero section
export async function GET(request: NextRequest) {
    try {
        await connectDB();
        const searchParams = request.nextUrl.searchParams;
        const id = searchParams.get('id');

        if (id) {
            const hero = await ServicesPageHero.findById(id).lean();

            if (!hero) {
                return NextResponse.json({ error: 'Hero section not found' }, { status: 404 });
            }

            return NextResponse.json({ ...hero, id: String(hero._id) });
        }

        const hero = await ServicesPageHero.findOne({ is_active: 1 }).lean();

        if (!hero) {
            return NextResponse.json({ error: 'No active hero section found' }, { status: 404 });
        }

        return NextResponse.json({ ...hero, id: String(hero._id) });
    } catch (error) {
        console.error('Error fetching hero section:', error);
        return NextResponse.json({ error: 'Failed to fetch hero section' }, { status: 500 });
    }
}

// POST - Create hero section
export async function POST(request: NextRequest) {
    try {
        await connectDB();
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
            is_active = 1,
        } = body;

        if (!title || !description) {
            return NextResponse.json({ error: 'Title and description are required' }, { status: 400 });
        }

        // If we're creating a new active hero, deactivate existing active entries so only one is active
        if (is_active === 1) {
            try {
                await ServicesPageHero.updateMany({ is_active: 1 }, { is_active: 0 });
            } catch (e) {
                console.warn('Failed to deactivate existing hero sections:', e);
            }
        }

        const result = await ServicesPageHero.create({
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
            is_active,
        });

        revalidateTag('services-hero', 'max');

        return NextResponse.json(
            { success: true, message: 'Hero section created successfully', id: result._id },
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
        await connectDB();
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
        if (is_active !== undefined) updateData.is_active = is_active;

        // If setting this hero as active, deactivate any other active hero records
        if (is_active === 1) {
            try {
                await ServicesPageHero.updateMany({ _id: { $ne: id }, is_active: 1 }, { is_active: 0 });
            } catch (e) {
                console.warn('Failed to deactivate other hero sections:', e);
            }
        }

        await ServicesPageHero.findByIdAndUpdate(id, updateData, { new: true });

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
        await connectDB();
        const searchParams = request.nextUrl.searchParams;
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'ID is required' }, { status: 400 });
        }

        await ServicesPageHero.findByIdAndDelete(id);

        revalidateTag('services-hero', 'max');

        return NextResponse.json({ success: true, message: 'Hero section deleted successfully' });
    } catch (error) {
        console.error('Error deleting hero section:', error);
        return NextResponse.json({ error: 'Failed to delete hero section' }, { status: 500 });
    }
}
