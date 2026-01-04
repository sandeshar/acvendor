import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/db';
import { TermsPageHeader } from '@/db/termsPageSchema';
import { revalidateTag } from 'next/cache';

// GET - Fetch header section
export async function GET(request: NextRequest) {
    try {
        await connectDB();
        const searchParams = request.nextUrl.searchParams;
        const id = searchParams.get('id');

        if (id) {
            const header = await TermsPageHeader.findById(id).lean();

            if (!header) {
                return NextResponse.json({ error: 'Header section not found' }, { status: 404 });
            }

            return NextResponse.json(header);
        }

        const header = await TermsPageHeader.findOne({ is_active: 1 }).lean();

        if (!header) {
            return NextResponse.json({ error: 'No active header section found' }, { status: 404 });
        }

        return NextResponse.json(header);
    } catch (error) {
        console.error('Error fetching header section:', error);
        return NextResponse.json({ error: 'Failed to fetch header section' }, { status: 500 });
    }
}

// POST - Create header section
export async function POST(request: NextRequest) {
    try {
        await connectDB();
        const body = await request.json();
        const { title, last_updated, is_active = 1 } = body;

        if (!title || !last_updated) {
            return NextResponse.json({ error: 'Title and last_updated are required' }, { status: 400 });
        }

        const result = await TermsPageHeader.create({ title, last_updated, is_active });

        revalidateTag('terms-header', 'max');

        return NextResponse.json(
            { success: true, message: 'Header section created successfully', id: result._id },
            { status: 201 }
        );
    } catch (error) {
        console.error('Error creating header section:', error);
        return NextResponse.json({ error: 'Failed to create header section' }, { status: 500 });
    }
}

// PUT - Update header section
export async function PUT(request: NextRequest) {
    try {
        await connectDB();
        const body = await request.json();
        const { id, title, last_updated, is_active } = body;

        if (!id) {
            return NextResponse.json({ error: 'ID is required' }, { status: 400 });
        }

        const updateData: any = {};
        if (title !== undefined) updateData.title = title;
        if (last_updated !== undefined) updateData.last_updated = last_updated;
        if (is_active !== undefined) updateData.is_active = is_active;

        await TermsPageHeader.findByIdAndUpdate(id, updateData, { new: true });

        revalidateTag('terms-header', 'max');

        return NextResponse.json({ success: true, message: 'Header section updated successfully' });
    } catch (error) {
        console.error('Error updating header section:', error);
        return NextResponse.json({ error: 'Failed to update header section' }, { status: 500 });
    }
}

// DELETE - Delete header section
export async function DELETE(request: NextRequest) {
    try {
        await connectDB();
        const searchParams = request.nextUrl.searchParams;
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'ID is required' }, { status: 400 });
        }

        await TermsPageHeader.findByIdAndDelete(id);

        revalidateTag('terms-header', 'max');

        return NextResponse.json({ success: true, message: 'Header section deleted successfully' });
    } catch (error) {
        console.error('Error deleting header section:', error);
        return NextResponse.json({ error: 'Failed to delete header section' }, { status: 500 });
    }
}
