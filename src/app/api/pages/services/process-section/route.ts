import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/db';
import { ServicesPageProcessSection } from '@/db/servicesPageSchema';
import { revalidateTag } from 'next/cache';

// GET - Fetch process section
export async function GET(request: NextRequest) {
    try {
        await connectDB();
        const searchParams = request.nextUrl.searchParams;
        const id = searchParams.get('id');

        if (id) {
            const section = await ServicesPageProcessSection.findById(id).lean();

            if (!section) {
                return NextResponse.json({ error: 'Process section not found' }, { status: 404 });
            }

            return NextResponse.json(section);
        }

        const section = await ServicesPageProcessSection.findOne({ is_active: 1 }).lean();

        if (!section) {
            return NextResponse.json({ error: 'No active process section found' }, { status: 404 });
        }

        return NextResponse.json(section);
    } catch (error) {
        console.error('Error fetching process section:', error);
        return NextResponse.json({ error: 'Failed to fetch process section' }, { status: 500 });
    }
}

// POST - Create process section
export async function POST(request: NextRequest) {
    try {
        await connectDB();
        const body = await request.json();
        const { title, description, is_active = 1 } = body;

        if (!title || !description) {
            return NextResponse.json({ error: 'Title and description are required' }, { status: 400 });
        }

        const result = await ServicesPageProcessSection.create({ title, description, is_active });

        revalidateTag('services-process-section', 'max');

        return NextResponse.json(
            { success: true, message: 'Process section created successfully', id: result._id },
            { status: 201 }
        );
    } catch (error) {
        console.error('Error creating process section:', error);
        return NextResponse.json({ error: 'Failed to create process section' }, { status: 500 });
    }
}

// PUT - Update process section
export async function PUT(request: NextRequest) {
    try {
        await connectDB();
        const body = await request.json();
        const { id, title, description, is_active } = body;

        if (!id) {
            return NextResponse.json({ error: 'ID is required' }, { status: 400 });
        }

        const updateData: any = {};
        if (title !== undefined) updateData.title = title;
        if (description !== undefined) updateData.description = description;
        if (is_active !== undefined) updateData.is_active = is_active;

        await ServicesPageProcessSection.findByIdAndUpdate(id, updateData, { new: true });

        revalidateTag('services-process-section', 'max');

        return NextResponse.json({ success: true, message: 'Process section updated successfully' });
    } catch (error) {
        console.error('Error updating process section:', error);
        return NextResponse.json({ error: 'Failed to update process section' }, { status: 500 });
    }
}

// DELETE - Delete process section
export async function DELETE(request: NextRequest) {
    try {
        await connectDB();
        const searchParams = request.nextUrl.searchParams;
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'ID is required' }, { status: 400 });
        }

        await ServicesPageProcessSection.findByIdAndDelete(id);

        revalidateTag('services-process-section', 'max');

        return NextResponse.json({ success: true, message: 'Process section deleted successfully' });
    } catch (error) {
        console.error('Error deleting process section:', error);
        return NextResponse.json({ error: 'Failed to delete process section' }, { status: 500 });
    }
}
