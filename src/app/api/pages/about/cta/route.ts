import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/db';
import { AboutPageCTA } from '@/db/aboutPageSchema';
import { revalidateTag } from 'next/cache';

// GET - Fetch CTA section
export async function GET(request: NextRequest) {
    try {
        await connectDB();
        const searchParams = request.nextUrl.searchParams;
        const id = searchParams.get('id');

        if (id) {
            const cta = await AboutPageCTA.findById(id).lean();

            if (!cta) {
                return NextResponse.json({ error: 'CTA section not found' }, { status: 404 });
            }

            return NextResponse.json(cta);
        }

        const cta = await AboutPageCTA.findOne({ is_active: 1 }).lean();

        if (!cta) {
            return NextResponse.json({ error: 'No active CTA section found' }, { status: 404 });
        }

        return NextResponse.json(cta);
    } catch (error) {
        console.error('Error fetching CTA section:', error);
        return NextResponse.json({ error: 'Failed to fetch CTA section' }, { status: 500 });
    }
}

// POST - Create CTA section
export async function POST(request: NextRequest) {
    try {
        await connectDB();
        const body = await request.json();
        const { title, description, primary_button_text, primary_button_link, secondary_button_text, secondary_button_link, is_active = 1 } = body;

        if (!title || !description || !primary_button_text || !primary_button_link || !secondary_button_text || !secondary_button_link) {
            return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
        }

        const newCTA = await AboutPageCTA.create({
            title,
            description,
            primary_button_text,
            primary_button_link,
            secondary_button_text,
            secondary_button_link,
            is_active,
        });

        revalidateTag('about-cta', 'max');

        return NextResponse.json(
            { success: true, message: 'CTA section created successfully', id: newCTA._id },
            { status: 201 }
        );
    } catch (error) {
        console.error('Error creating CTA section:', error);
        return NextResponse.json({ error: 'Failed to create CTA section' }, { status: 500 });
    }
}

// PUT - Update CTA section
export async function PUT(request: NextRequest) {
    try {
        await connectDB();
        const body = await request.json();
        const { id, title, description, primary_button_text, primary_button_link, secondary_button_text, secondary_button_link, is_active } = body;

        if (!id) {
            return NextResponse.json({ error: 'ID is required' }, { status: 400 });
        }

        const updateData: any = {};
        if (title !== undefined) updateData.title = title;
        if (description !== undefined) updateData.description = description;
        if (primary_button_text !== undefined) updateData.primary_button_text = primary_button_text;
        if (primary_button_link !== undefined) updateData.primary_button_link = primary_button_link;
        if (secondary_button_text !== undefined) updateData.secondary_button_text = secondary_button_text;
        if (secondary_button_link !== undefined) updateData.secondary_button_link = secondary_button_link;
        if (is_active !== undefined) updateData.is_active = is_active;

        await AboutPageCTA.findByIdAndUpdate(id, updateData, { new: true });

        revalidateTag('about-cta', 'max');

        return NextResponse.json({ success: true, message: 'CTA section updated successfully' });
    } catch (error) {
        console.error('Error updating CTA section:', error);
        return NextResponse.json({ error: 'Failed to update CTA section' }, { status: 500 });
    }
}

// DELETE - Delete CTA section
export async function DELETE(request: NextRequest) {
    try {
        await connectDB();
        const searchParams = request.nextUrl.searchParams;
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'ID is required' }, { status: 400 });
        }

        await AboutPageCTA.findByIdAndDelete(id);

        revalidateTag('about-cta', 'max');

        return NextResponse.json({ success: true, message: 'CTA section deleted successfully' });
    } catch (error) {
        console.error('Error deleting CTA section:', error);
        return NextResponse.json({ error: 'Failed to delete CTA section' }, { status: 500 });
    }
}
