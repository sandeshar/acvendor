import { NextRequest, NextResponse } from 'next/server';

import { connectDB } from '@/db';
import { ContactPageHero } from '@/db/contactPageSchema';
import { revalidateTag } from 'next/cache';

// GET - Fetch hero section
export async function GET(request: NextRequest) {
    try {
        await connectDB();
        const searchParams = request.nextUrl.searchParams;
        const id = searchParams.get('id');

        if (id) {
            const hero = await ContactPageHero.findById(id).lean();

            if (!hero) {
                return NextResponse.json({ error: 'Hero section not found' }, { status: 404 });
            }

            return NextResponse.json(hero);
        }

        const hero = await ContactPageHero.findOne({ is_active: 1 }).lean();

        if (!hero) {
            return NextResponse.json({ error: 'No active hero section found' }, { status: 404 });
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
        const { badge_text = '', tagline, title, highlight_text = '', description, background_image = '', hero_image_alt = '', is_active = 1 } = body;

        if (!tagline || !title || !description) {
            return NextResponse.json({ error: 'Tagline, title, and description are required' }, { status: 400 });
        }

        const newHero = await ContactPageHero.create({ badge_text, tagline, title, highlight_text, description, background_image, hero_image_alt, is_active });

        revalidateTag('contact-hero', 'max');

        return NextResponse.json(
            { success: true, message: 'Hero section created successfully', id: newHero._id },
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
        const { id, badge_text, tagline, title, highlight_text, description, background_image, hero_image_alt, is_active } = body;

        if (!id) {
            return NextResponse.json({ error: 'ID is required' }, { status: 400 });
        }

        const updateData: any = {};
        if (badge_text !== undefined) updateData.badge_text = badge_text;
        if (tagline !== undefined) updateData.tagline = tagline;
        if (title !== undefined) updateData.title = title;
        if (highlight_text !== undefined) updateData.highlight_text = highlight_text;
        if (description !== undefined) updateData.description = description;
        if (background_image !== undefined) updateData.background_image = background_image;
        if (hero_image_alt !== undefined) updateData.hero_image_alt = hero_image_alt;
        if (is_active !== undefined) updateData.is_active = is_active;

        await ContactPageHero.findByIdAndUpdate(id, updateData, { new: true });

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
        await connectDB();
        const searchParams = request.nextUrl.searchParams;
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'ID is required' }, { status: 400 });
        }

        await ContactPageHero.findByIdAndDelete(id);

        revalidateTag('contact-hero', 'max');

        return NextResponse.json({ success: true, message: 'Hero section deleted successfully' });
    } catch (error) {
        console.error('Error deleting hero section:', error);
        return NextResponse.json({ error: 'Failed to delete hero section' }, { status: 500 });
    }
}
