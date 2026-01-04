import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/db';
import { ServicesPageProcessSteps } from '@/db/servicesPageSchema';
import { revalidateTag } from 'next/cache';

// GET - Fetch process steps
export async function GET(request: NextRequest) {
    try {
        await connectDB();
        const searchParams = request.nextUrl.searchParams;
        const id = searchParams.get('id');

        if (id) {
            const step = await ServicesPageProcessSteps.findById(id).lean();

            if (!step) {
                return NextResponse.json({ error: 'Process step not found' }, { status: 404 });
            }

            return NextResponse.json(step);
        }

        const steps = await ServicesPageProcessSteps.find({ is_active: 1 })
            .sort({ display_order: 1 })
            .lean();

        return NextResponse.json(steps);
    } catch (error) {
        console.error('Error fetching process steps:', error);
        return NextResponse.json({ error: 'Failed to fetch process steps' }, { status: 500 });
    }
}

// POST - Create process step
export async function POST(request: NextRequest) {
    try {
        await connectDB();
        const body = await request.json();
        const { step_number, title, description, display_order, is_active = 1 } = body;

        if (step_number === undefined || !title || !description || display_order === undefined) {
            return NextResponse.json(
                { error: 'Step_number, title, description, and display_order are required' },
                { status: 400 }
            );
        }

        const result = await ServicesPageProcessSteps.create({
            step_number,
            title,
            description,
            display_order,
            is_active,
        });

        revalidateTag('services-process-steps', 'max');

        return NextResponse.json(
            { success: true, message: 'Process step created successfully', id: result._id },
            { status: 201 }
        );
    } catch (error) {
        console.error('Error creating process step:', error);
        return NextResponse.json({ error: 'Failed to create process step' }, { status: 500 });
    }
}

// PUT - Update process step
export async function PUT(request: NextRequest) {
    try {
        await connectDB();
        const body = await request.json();
        const { id, step_number, title, description, display_order, is_active } = body;

        if (!id) {
            return NextResponse.json({ error: 'ID is required' }, { status: 400 });
        }

        const updateData: any = {};
        if (step_number !== undefined) updateData.step_number = step_number;
        if (title !== undefined) updateData.title = title;
        if (description !== undefined) updateData.description = description;
        if (display_order !== undefined) updateData.display_order = display_order;
        if (is_active !== undefined) updateData.is_active = is_active;

        await ServicesPageProcessSteps.findByIdAndUpdate(id, updateData, { new: true });

        revalidateTag('services-process-steps', 'max');

        return NextResponse.json({ success: true, message: 'Process step updated successfully' });
    } catch (error) {
        console.error('Error updating process step:', error);
        return NextResponse.json({ error: 'Failed to update process step' }, { status: 500 });
    }
}

// DELETE - Delete process step
export async function DELETE(request: NextRequest) {
    try {
        await connectDB();
        const searchParams = request.nextUrl.searchParams;
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'ID is required' }, { status: 400 });
        }

        await ServicesPageProcessSteps.findByIdAndDelete(id);

        revalidateTag('services-process-steps', 'max');

        return NextResponse.json({ success: true, message: 'Process step deleted successfully' });
    } catch (error) {
        console.error('Error deleting process step:', error);
        return NextResponse.json({ error: 'Failed to delete process step' }, { status: 500 });
    }
}
