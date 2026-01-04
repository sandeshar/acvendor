import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/db';
import { HomepageHero } from '@/db/homepageSchema';
import { revalidateTag } from 'next/cache';

// GET - Fetch hero section
export async function GET(request: NextRequest) {
    try {
        await connectDB();
        const searchParams = request.nextUrl.searchParams;
        const id = searchParams.get('id');

        if (id) {
            const hero = await HomepageHero.findById(id).lean();

            if (!hero) {
                return NextResponse.json({ error: 'Hero section not found' }, { status: 404 });
            }

            return NextResponse.json(hero);
        }

        // Get active hero section
        const hero = await HomepageHero.findOne({ is_active: 1 }).lean();

        if (!hero) {
            // Return empty object to allow admin UI to create new entry
            return NextResponse.json({});
        }

        return NextResponse.json(hero);
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
            title,
            subtitle,
            cta_text,
            cta_link,
            background_image,
            hero_image_alt = '',
            badge_text = '',
            highlight_text = '',
            colored_word = '',
            // Floating UI defaults
            float_top_enabled = 1,
            float_top_icon = 'trending_up',
            float_top_title = 'Growth',
            float_top_value = '+240% ROI',
            float_bottom_enabled = 1,
            float_bottom_icon = 'check_circle',
            float_bottom_title = 'Ranking',
            float_bottom_value = '#1 Result',
            secondary_cta_text = '',
            secondary_cta_link = '',
            rating_text = '',
            is_active = 1,
        } = body;

        if (!title || !subtitle || !cta_text || !cta_link || !background_image) {
            return NextResponse.json(
                { error: 'Required fields missing (title, subtitle, cta_text, cta_link, background_image)' },
                { status: 400 }
            );
        }

        const result = await HomepageHero.create({
            title,
            subtitle,
            cta_text,
            cta_link,
            background_image,
            hero_image_alt,
            badge_text,
            highlight_text,
            colored_word,
            float_top_enabled,
            float_top_icon,
            float_top_title,
            float_top_value,
            float_bottom_enabled,
            float_bottom_icon,
            float_bottom_title,
            float_bottom_value,
            secondary_cta_text,
            secondary_cta_link,
            rating_text,
            is_active,
        });

        revalidateTag('homepage-hero', 'max');

        return NextResponse.json(
            { success: true, message: 'Hero section created successfully', id: result._id },
            { status: 201 }
        );
    } catch (error) {
        console.error('Error creating hero section:', error);
        return NextResponse.json({ error: 'Failed to create hero section', details: error instanceof Error ? error.message : String(error) }, { status: 500 });
    }
}

// PUT - Update hero section
export async function PUT(request: NextRequest) {
    try {
        await connectDB();
        const body = await request.json();
        const {
            id,
            title,
            subtitle,
            cta_text,
            cta_link,
            background_image,
            hero_image_alt,
            badge_text,
            highlight_text,
            colored_word,
            float_top_enabled,
            float_top_icon,
            float_top_title,
            float_top_value,
            float_bottom_enabled,
            float_bottom_icon,
            float_bottom_title,
            float_bottom_value,
            secondary_cta_text,
            secondary_cta_link,
            rating_text,
            is_active,
        } = body;

        if (!id) {
            return NextResponse.json({ error: 'ID is required' }, { status: 400 });
        }

        const updateData: any = {};
        if (title !== undefined) updateData.title = title;
        if (subtitle !== undefined) updateData.subtitle = subtitle;
        if (cta_text !== undefined) updateData.cta_text = cta_text;
        if (cta_link !== undefined) updateData.cta_link = cta_link;
        if (background_image !== undefined) updateData.background_image = background_image;
        if (hero_image_alt !== undefined) updateData.hero_image_alt = hero_image_alt;
        if (badge_text !== undefined) updateData.badge_text = badge_text;
        if (highlight_text !== undefined) updateData.highlight_text = highlight_text;
        if (colored_word !== undefined) updateData.colored_word = colored_word;
        if (float_top_enabled !== undefined) updateData.float_top_enabled = float_top_enabled;
        if (float_top_icon !== undefined) updateData.float_top_icon = float_top_icon;
        if (float_top_title !== undefined) updateData.float_top_title = float_top_title;
        if (float_top_value !== undefined) updateData.float_top_value = float_top_value;
        if (float_bottom_enabled !== undefined) updateData.float_bottom_enabled = float_bottom_enabled;
        if (float_bottom_icon !== undefined) updateData.float_bottom_icon = float_bottom_icon;
        if (float_bottom_title !== undefined) updateData.float_bottom_title = float_bottom_title;
        if (float_bottom_value !== undefined) updateData.float_bottom_value = float_bottom_value;
        if (secondary_cta_text !== undefined) updateData.secondary_cta_text = secondary_cta_text;
        if (secondary_cta_link !== undefined) updateData.secondary_cta_link = secondary_cta_link;
        if (rating_text !== undefined) updateData.rating_text = rating_text;
        if (is_active !== undefined) updateData.is_active = is_active;

        // If there's nothing to update, return early to avoid DB errors
        if (Object.keys(updateData).length === 0) {
            return NextResponse.json({ success: true, message: 'No changes to update' });
        }

        await HomepageHero.findByIdAndUpdate(id, updateData, { new: true });
        revalidateTag('homepage-hero', 'max');
        return NextResponse.json({ success: true, message: 'Hero section updated successfully' });
    } catch (error) {
        console.error('Error updating hero section:', error);
        return NextResponse.json({ error: 'Failed to update hero section', details: error instanceof Error ? error.message : String(error) }, { status: 500 });
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

        await HomepageHero.findByIdAndDelete(id);
        revalidateTag("homepage-hero", 'max');
        return NextResponse.json({ success: true, message: 'Hero section deleted successfully' });
    } catch (error) {
        console.error('Error deleting hero section:', error);
        return NextResponse.json({ error: 'Failed to delete hero section', details: error instanceof Error ? error.message : String(error) }, { status: 500 });
    }
}
