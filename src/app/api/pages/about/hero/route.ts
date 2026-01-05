import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/db';
import { AboutPageHero } from '@/db/aboutPageSchema';
import { revalidateTag } from 'next/cache';

// GET - Fetch hero section
export async function GET(request: NextRequest) {
    try {
        await connectDB();
        const searchParams = request.nextUrl.searchParams;
        const id = searchParams.get('id');

        if (id) {
            const hero = await AboutPageHero.findById(id).lean();

            if (!hero) {
                return NextResponse.json({ error: 'Hero section not found' }, { status: 404 });
            }

            return NextResponse.json(hero);
        }

        const hero = await AboutPageHero.findOne({ is_active: 1 }).lean();

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
        const { title, description, button1_text, button1_link, button2_text, button2_link, hero_image, hero_image_alt, badge_text = '', highlight_text = '',
            is_active = 1 } = body;

        if (!title || !description || !button1_text || !button1_link || !button2_text || !button2_link || !hero_image || !hero_image_alt) {
            return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
        }

        const newHero = await AboutPageHero.create({
            title,
            description,
            button1_text,
            button1_link,
            button2_text,
            button2_link,
            hero_image,
            hero_image_alt,
            badge_text,
            highlight_text,
            is_active,
        });

        revalidateTag('about-hero', 'max');

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
        const { id, title, description, button1_text, button1_link, button2_text, button2_link, badge_text, highlight_text, hero_image, hero_image_alt,
            is_active } = body;

        if (!id) {
            return NextResponse.json({ error: 'ID is required' }, { status: 400 });
        }

        const updateData: any = {};
        if (title !== undefined) updateData.title = title;
        if (description !== undefined) updateData.description = description;
        if (button1_text !== undefined) updateData.button1_text = button1_text;
        if (button1_link !== undefined) updateData.button1_link = button1_link;
        if (button2_text !== undefined) updateData.button2_text = button2_text;
        if (button2_link !== undefined) updateData.button2_link = button2_link;
        if (badge_text !== undefined) updateData.badge_text = badge_text;
        if (highlight_text !== undefined) updateData.highlight_text = highlight_text;
        if (hero_image !== undefined) updateData.hero_image = hero_image;
        if (hero_image_alt !== undefined) updateData.hero_image_alt = hero_image_alt;
        if (is_active !== undefined) updateData.is_active = is_active;

        await AboutPageHero.findByIdAndUpdate(id, updateData, { new: true });

        revalidateTag('about-hero', 'max');

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

        await AboutPageHero.findByIdAndDelete(id);

        revalidateTag('about-hero', 'max');

        return NextResponse.json({ success: true, message: 'Hero section deleted successfully' });
    } catch (error) {
        console.error('Error deleting hero section:', error);
        return NextResponse.json({ error: 'Failed to delete hero section' }, { status: 500 });
    }
}
