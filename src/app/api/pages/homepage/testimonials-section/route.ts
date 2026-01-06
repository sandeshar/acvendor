import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/db';
import { HomepageTestimonialsSection } from '@/db/homepageSchema';
import { revalidateTag } from 'next/cache';

// GET - Fetch testimonials section
export async function GET(request: NextRequest) {
    try {
        await connectDB();
        const searchParams = request.nextUrl.searchParams;
        const id = searchParams.get('id');

        if (id) {
            const section = await HomepageTestimonialsSection.findById(id).lean();

            if (!section) {
                return NextResponse.json({ error: 'Testimonials section not found' }, { status: 404 });
            }

            return NextResponse.json(section);
        }

        const section = await HomepageTestimonialsSection.findOne({ is_active: 1 }).lean();

        if (!section) {
            // Return empty object to allow admin UI to create new entry
            return NextResponse.json({});
        }

        return NextResponse.json(section);
    } catch (error) {
        console.error('Error fetching testimonials section:', error);
        return NextResponse.json({ error: 'Failed to fetch testimonials section' }, { status: 500 });
    }
}

// POST - Create testimonials section
export async function POST(request: NextRequest) {
    try {
        await connectDB();
        const body = await request.json();
        const { title, subtitle, is_active = 1 } = body;

        if (!title || !subtitle) {
            return NextResponse.json({ error: 'Title and subtitle are required' }, { status: 400 });
        }

        const result = await HomepageTestimonialsSection.create({ title, subtitle, is_active });
        revalidateTag('homepage-testimonials-section', 'max');
        return NextResponse.json(
            { success: true, message: 'Testimonials section created successfully', id: result._id },
            { status: 201 }
        );
    } catch (error) {
        console.error('Error creating testimonials section:', error);
        return NextResponse.json({ error: 'Failed to create testimonials section' }, { status: 500 });
    }
}

// PUT - Update testimonials section
export async function PUT(request: NextRequest) {
    try {
        await connectDB();
        const body = await request.json();
        const { id, title, subtitle, is_active } = body;

        if (!id) {
            return NextResponse.json({ error: 'ID is required' }, { status: 400 });
        }

        const updateData: any = {};
        if (title !== undefined) updateData.title = title;
        if (subtitle !== undefined) updateData.subtitle = subtitle;
        if (is_active !== undefined) updateData.is_active = is_active;

        await HomepageTestimonialsSection.findByIdAndUpdate(id, updateData, { new: true });
        revalidateTag('homepage-testimonials-section', 'max');

        return NextResponse.json({ success: true, message: 'Testimonials section updated successfully' });
    } catch (error) {
        console.error('Error updating testimonials section:', error);
        return NextResponse.json({ error: 'Failed to update testimonials section' }, { status: 500 });
    }
}

// DELETE - Delete testimonials section
export async function DELETE(request: NextRequest) {
    try {
        await connectDB();
        const searchParams = request.nextUrl.searchParams;
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'ID is required' }, { status: 400 });
        }

        await HomepageTestimonialsSection.findByIdAndDelete(id);
        revalidateTag('homepage-testimonials-section', 'max');

        return NextResponse.json({ success: true, message: 'Testimonials section deleted successfully' });
    } catch (error) {
        console.error('Error deleting testimonials section:', error);
        return NextResponse.json({ error: 'Failed to delete testimonials section' }, { status: 500 });
    }
}
