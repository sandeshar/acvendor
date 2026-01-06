import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/db';
import { ServicesPageTrust } from '@/db/servicesPageSchema';
import { revalidateTag } from 'next/cache';

export async function GET(request: NextRequest) {
    try {
        await connectDB();
        const searchParams = request.nextUrl.searchParams;
        const admin = searchParams.get('admin');
        let row;
        if (admin === '1' || admin === 'true') {
            // Return the most recently updated trust section for admin (regardless of is_active)
            row = await ServicesPageTrust.findOne().sort({ updatedAt: -1 }).lean();
        } else {
            row = await ServicesPageTrust.findOne({ is_active: 1 }).lean();
        }
        if (!row) return NextResponse.json({ error: 'No trust section found' }, { status: 404 });
        // Return id for client PUT/POST detection
        return NextResponse.json({ ...row, id: row._id ? String(row._id) : undefined });
    } catch (error) {
        console.error('Error fetching trust:', error);
        return NextResponse.json({ error: 'Failed to fetch trust section' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        await connectDB();
        const body = await request.json();
        const {
            title = '', description = '', quote_text = '', quote_author = '', quote_role = '', quote_image = '',
            stat1_value = '', stat1_label = '', stat1_sublabel = '',
            stat2_value = '', stat2_label = '', stat2_sublabel = '',
            stat3_value = '', stat3_label = '', stat3_sublabel = '',
            is_active = 1
        } = body;

        // If we're creating an active trust, deactivate other active entries to ensure only one active
        if (is_active === 1) {
            try { await ServicesPageTrust.updateMany({ is_active: 1 }, { is_active: 0 }); } catch (err) { console.warn('Failed to deactivate existing trust entries:', err); }
        }

        const res = await ServicesPageTrust.create({
            title, description, quote_text, quote_author, quote_role, quote_image,
            stat1_value, stat1_label, stat1_sublabel,
            stat2_value, stat2_label, stat2_sublabel,
            stat3_value, stat3_label, stat3_sublabel,
            is_active
        });

        revalidateTag('services-trust', 'max');
        return NextResponse.json({ success: true, id: res._id }, { status: 201 });
    } catch (error) {
        console.error('Error creating trust:', error);
        return NextResponse.json({ error: 'Failed to create trust section' }, { status: 500 });
    }
}

export async function PUT(request: NextRequest) {
    try {
        await connectDB();
        const body = await request.json();
        const { id, is_active } = body;
        if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 });
        const update: any = {};
        ['title', 'description', 'quote_text', 'quote_author', 'quote_role', 'quote_image', 'is_active',
            'stat1_value', 'stat1_label', 'stat1_sublabel',
            'stat2_value', 'stat2_label', 'stat2_sublabel',
            'stat3_value', 'stat3_label', 'stat3_sublabel'
        ].forEach(k => { if (body[k] !== undefined) update[k] = body[k]; });
        // If setting this trust as active, deactivate other active trust records (excluding this id)
        if (is_active === 1) {
            try { await ServicesPageTrust.updateMany({ _id: { $ne: id }, is_active: 1 }, { is_active: 0 }); } catch (err) { console.warn('Failed to deactivate other trust entries:', err); }
        }
        await ServicesPageTrust.findByIdAndUpdate(id, update, { new: true });
        revalidateTag('services-trust', 'max');
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error updating trust:', error);
        return NextResponse.json({ error: 'Failed to update trust section' }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest) {
    try {
        await connectDB();
        const searchParams = request.nextUrl.searchParams;
        const id = searchParams.get('id');
        if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 });
        await ServicesPageTrust.findByIdAndDelete(id);
        revalidateTag('services-trust', 'max');
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting trust:', error);
        return NextResponse.json({ error: 'Failed to delete trust section' }, { status: 500 });
    }
}
