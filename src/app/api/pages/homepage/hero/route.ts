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
            colored_word = '',
            // Trust Badges
            trust_badge1_text = 'Certified Techs',
            trust_badge1_icon = 'engineering',
            trust_badge2_text = '1 Year Warranty',
            trust_badge2_icon = 'verified_user',
            trust_badge3_text = 'Same Day Service',
            trust_badge3_icon = 'schedule',
            secondary_cta_text = '',
            secondary_cta_link = '',
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
            trust_badge1_text,
            trust_badge1_icon,
            trust_badge2_text,
            trust_badge2_icon,
            trust_badge3_text,
            trust_badge3_icon,
            secondary_cta_text,
            secondary_cta_link,
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
            trust_badge1_text,
            trust_badge1_icon,
            trust_badge2_text,
            trust_badge2_icon,
            trust_badge3_text,
            trust_badge3_icon,
            secondary_cta_text,
            secondary_cta_link,
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
        if (colored_word !== undefined) updateData.colored_word = colored_word;
        if (trust_badge1_text !== undefined) updateData.trust_badge1_text = trust_badge1_text;
        if (trust_badge1_icon !== undefined) updateData.trust_badge1_icon = trust_badge1_icon;
        if (trust_badge2_text !== undefined) updateData.trust_badge2_text = trust_badge2_text;
        if (trust_badge2_icon !== undefined) updateData.trust_badge2_icon = trust_badge2_icon;
        if (trust_badge3_text !== undefined) updateData.trust_badge3_text = trust_badge3_text;
        if (trust_badge3_icon !== undefined) updateData.trust_badge3_icon = trust_badge3_icon;
        if (secondary_cta_text !== undefined) updateData.secondary_cta_text = secondary_cta_text;
        if (secondary_cta_link !== undefined) updateData.secondary_cta_link = secondary_cta_link;
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
