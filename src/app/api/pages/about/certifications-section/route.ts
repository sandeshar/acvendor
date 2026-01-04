import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/db';
import { AboutPageCertificationsSection } from '@/db/aboutPageSchema';
import { revalidateTag } from 'next/cache';

// GET - Fetch certifications section
export async function GET(request: NextRequest) {
    try {
        await connectDB();
        const searchParams = request.nextUrl.searchParams;
        const id = searchParams.get('id');

        if (id) {
            const row = await AboutPageCertificationsSection.findById(id).lean();
            if (!row) return NextResponse.json({ error: 'Certifications section not found' }, { status: 404 });
            return NextResponse.json(row);
        }

        const row = await AboutPageCertificationsSection.findOne({ is_active: 1 }).lean();
        if (!row) return NextResponse.json({ error: 'No active certifications section' }, { status: 404 });
        return NextResponse.json(row);
    } catch (error) {
        console.error('Error fetching certifications section:', error);
        return NextResponse.json({ error: 'Failed to fetch certifications section' }, { status: 500 });
    }
}

// POST - Create section
export async function POST(request: NextRequest) {
    try {
        await connectDB();
        const body = await request.json();
        const { title = '', subtitle = '', is_active = 1 } = body;

        const newSection = await AboutPageCertificationsSection.create({ title, subtitle, is_active });
        return NextResponse.json({ success: true, id: newSection._id }, { status: 201 });
    } catch (error) {
        console.error('Error creating certifications section:', error);
        return NextResponse.json({ error: 'Failed to create certifications section' }, { status: 500 });
    }
}

// PUT - Update section
export async function PUT(request: NextRequest) {
    try {
        await connectDB();
        const body = await request.json();
        const { id, title, subtitle, is_active } = body;
        if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 });

        const update: any = {};
        if (title !== undefined) update.title = title;
        if (subtitle !== undefined) update.subtitle = subtitle;
        if (is_active !== undefined) update.is_active = is_active;

        await AboutPageCertificationsSection.findByIdAndUpdate(id, update, { new: true });
        revalidateTag('about-certifications-section', 'max');
        return NextResponse.json({ success: true, message: 'Updated' });
    } catch (error) {
        console.error('Error updating certifications section:', error);
        return NextResponse.json({ error: 'Failed to update certifications section' }, { status: 500 });
    }
}

// DELETE - Delete by id
export async function DELETE(request: NextRequest) {
    try {
        await connectDB();
        const id = request.nextUrl.searchParams.get('id');
        if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 });
        await AboutPageCertificationsSection.findByIdAndDelete(id);
        revalidateTag('about-certifications-section', 'max');
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting certifications section:', error);
        return NextResponse.json({ error: 'Failed to delete certifications section' }, { status: 500 });
    }
}
