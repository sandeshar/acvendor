import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/db';
import { TermsPageSections } from '@/db/termsPageSchema';
import { revalidateTag } from 'next/cache';

// GET - Fetch sections
export async function GET(request: NextRequest) {
    try {
        await connectDB();
        const searchParams = request.nextUrl.searchParams;
        const id = searchParams.get('id');

        if (id) {
            const section = await TermsPageSections.findById(id).lean();

            if (!section) {
                return NextResponse.json({ error: 'Section not found' }, { status: 404 });
            }

            return NextResponse.json(section);
        }

        const sections = await TermsPageSections.find({ is_active: 1 })
            .sort({ display_order: 1 })
            .lean();

        return NextResponse.json(sections);
    } catch (error) {
        console.error('Error fetching sections:', error);
        return NextResponse.json({ error: 'Failed to fetch sections' }, { status: 500 });
    }
}

// POST - Create section
export async function POST(request: NextRequest) {
    try {
        await connectDB();
        const body = await request.json();
        const { title, content, has_email = 0, display_order, is_active = 1 } = body;

        if (!title || !content || display_order === undefined) {
            return NextResponse.json({ error: 'Title, content, and display_order are required' }, { status: 400 });
        }

        const result = await TermsPageSections.create({
            title,
            content,
            has_email,
            display_order,
            is_active,
        });

        revalidateTag('terms-sections', 'max');

        return NextResponse.json(
            { success: true, message: 'Section created successfully', id: result._id },
            { status: 201 }
        );
    } catch (error) {
        console.error('Error creating section:', error);
        return NextResponse.json({ error: 'Failed to create section' }, { status: 500 });
    }
}

// PUT - Update section
export async function PUT(request: NextRequest) {
    try {
        await connectDB();
        const body = await request.json();
        const { id, title, content, has_email, display_order, is_active } = body;

        if (!id) {
            return NextResponse.json({ error: 'ID is required' }, { status: 400 });
        }

        const updateData: any = {};
        if (title !== undefined) updateData.title = title;
        if (content !== undefined) updateData.content = content;
        if (has_email !== undefined) updateData.has_email = has_email;
        if (display_order !== undefined) updateData.display_order = display_order;
        if (is_active !== undefined) updateData.is_active = is_active;

        await TermsPageSections.findByIdAndUpdate(id, updateData, { new: true });

        revalidateTag('terms-sections', 'max');

        return NextResponse.json({ success: true, message: 'Section updated successfully' });
    } catch (error) {
        console.error('Error updating section:', error);
        return NextResponse.json({ error: 'Failed to update section' }, { status: 500 });
    }
}

// DELETE - Delete section
export async function DELETE(request: NextRequest) {
    try {
        await connectDB();
        const searchParams = request.nextUrl.searchParams;
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'ID is required' }, { status: 400 });
        }

        await TermsPageSections.findByIdAndDelete(id);

        revalidateTag('terms-sections', 'max');

        return NextResponse.json({ success: true, message: 'Section deleted successfully' });
    } catch (error) {
        console.error('Error deleting section:', error);
        return NextResponse.json({ error: 'Failed to delete section' }, { status: 500 });
    }
}
