import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/db';
import { HomepageTrustSection } from '@/db/homepageSchema';
import { revalidateTag } from 'next/cache';

// GET - Fetch trust section
export async function GET(request: NextRequest) {
    try {
        await connectDB();
        const searchParams = request.nextUrl.searchParams;
        const id = searchParams.get('id');

        if (id) {
            const section = await HomepageTrustSection.findById(id).lean();

            if (!section) {
                return NextResponse.json({ error: 'Trust section not found' }, { status: 404 });
            }

            return NextResponse.json(section);
        }

        const section = await HomepageTrustSection.findOne({ is_active: 1 }).lean();

        if (!section) {
            // Return empty object to allow admin UI to create new entry
            return NextResponse.json({});
        }

        return NextResponse.json(section);
    } catch (error) {
        console.error('Error fetching trust section:', error);
        return NextResponse.json({ error: 'Failed to fetch trust section' }, { status: 500 });
    }
}

// POST - Create trust section
export async function POST(request: NextRequest) {
    try {
        await connectDB();
        const body = await request.json();
        const { heading, is_active = 1 } = body;

        if (!heading) {
            return NextResponse.json({ error: 'Heading is required' }, { status: 400 });
        }

        const result = await HomepageTrustSection.create({ heading, is_active });
        revalidateTag('homepage-trust-section', 'max');
        return NextResponse.json(
            { success: true, message: 'Trust section created successfully', id: result._id },
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
        await connectDB();
        const body = await request.json();
        const { id, heading, is_active } = body;

        if (!id) {
            return NextResponse.json({ error: 'ID is required' }, { status: 400 });
        }

        const updateData: any = {};
        if (heading !== undefined) updateData.heading = heading;
        if (is_active !== undefined) updateData.is_active = is_active;

        await HomepageTrustSection.findByIdAndUpdate(id, updateData, { new: true });
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
        await connectDB();
        const searchParams = request.nextUrl.searchParams;
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'ID is required' }, { status: 400 });
        }

        await HomepageTrustSection.findByIdAndDelete(id);
        revalidateTag('homepage-trust-section', 'max');

        return NextResponse.json({ success: true, message: 'Trust section deleted successfully' });
    } catch (error) {
        console.error('Error deleting trust section:', error);
        return NextResponse.json({ error: 'Failed to delete trust section' }, { status: 500 });
    }
}
