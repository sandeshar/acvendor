import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/db';
import { ServicesPageCTA } from '@/db/servicesPageSchema';
import { revalidateTag } from 'next/cache';

// GET - Fetch CTA section
export async function GET(request: NextRequest) {
    try {
        await connectDB();
        const searchParams = request.nextUrl.searchParams;
        const admin = searchParams.get('admin');
        const id = searchParams.get('id');

        let row: any;
        if (id) {
            row = await ServicesPageCTA.findById(id).lean();
            if (!row) {
                return NextResponse.json({ error: 'CTA section not found' }, { status: 404 });
            }
            return NextResponse.json({ ...row, id: row._id ? String(row._id) : undefined });
        }

        if (admin === '1' || admin === 'true') {
            // Return the most recently updated CTA for admin (regardless of is_active)
            row = await ServicesPageCTA.findOne().sort({ updatedAt: -1 }).lean();
        } else {
            row = await ServicesPageCTA.findOne({ is_active: 1 }).lean();
        }

        if (!row) {
            return NextResponse.json({ error: 'No CTA section found' }, { status: 404 });
        }

        return NextResponse.json({ ...row, id: row._id ? String(row._id) : undefined });
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
        const { title, description, button_text, button_link, is_active = 1 } = body;

        if (!title || !description || !button_text || !button_link) {
            return NextResponse.json({ error: 'Title, description, button_text, and button_link are required' }, { status: 400 });
        }

        // If creating an active CTA, deactivate other active CTAs to ensure only one active
        if (is_active === 1) {
            try { await ServicesPageCTA.updateMany({ is_active: 1 }, { is_active: 0 }); } catch (err) { console.warn('Failed to deactivate existing CTA entries:', err); }
        }

        const result = await ServicesPageCTA.create({ title, description, button_text, button_link, is_active });

        revalidateTag('services-cta', 'max');

        return NextResponse.json(
            { success: true, message: 'CTA section created successfully', id: result._id },
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
        const { id, title, description, button_text, button_link, is_active } = body;

        if (!id) {
            return NextResponse.json({ error: 'ID is required' }, { status: 400 });
        }

        const updateData: any = {};
        if (title !== undefined) updateData.title = title;
        if (description !== undefined) updateData.description = description;
        if (button_text !== undefined) updateData.button_text = button_text;
        if (button_link !== undefined) updateData.button_link = button_link;
        if (is_active !== undefined) updateData.is_active = is_active;

        // If setting this CTA as active, deactivate other active CTAs (excluding this id)
        if (is_active === 1) {
            try { await ServicesPageCTA.updateMany({ _id: { $ne: id }, is_active: 1 }, { is_active: 0 }); } catch (err) { console.warn('Failed to deactivate other CTA entries:', err); }
        }

        await ServicesPageCTA.findByIdAndUpdate(id, updateData, { new: true });

        revalidateTag('services-cta', 'max');

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

        await ServicesPageCTA.findByIdAndDelete(id);

        revalidateTag('services-cta', 'max');

        return NextResponse.json({ success: true, message: 'CTA section deleted successfully' });
    } catch (error) {
        console.error('Error deleting CTA section:', error);
        return NextResponse.json({ error: 'Failed to delete CTA section' }, { status: 500 });
    }
}
