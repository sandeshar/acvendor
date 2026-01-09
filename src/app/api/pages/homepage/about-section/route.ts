import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/db';
import { HomepageAboutSection } from '@/db/homepageSchema';
import { revalidateTag } from 'next/cache';

// GET - fetch single active about section or by id
export async function GET(request: NextRequest) {
    try {
        await connectDB();
        const searchParams = request.nextUrl.searchParams;
        const id = searchParams.get('id');

        if (id) {
            const section = await HomepageAboutSection.findById(id).lean();
            if (!section) return NextResponse.json({ error: 'About section not found' }, { status: 404 });
            const normalized = { ...section, cta_text: section.cta_text ?? '', cta_link: section.cta_link ?? '', bullets: section.bullets ?? '[]', image_url: section.image_url ?? '', image_alt: section.image_alt ?? '', id: section._id.toString() };
            return NextResponse.json(normalized);
        }

        const section = await HomepageAboutSection.findOne({ is_active: 1 }).lean();
        if (!section) return NextResponse.json({ error: 'No active about section found' }, { status: 404 });
        const normalized = { ...section, cta_text: section.cta_text ?? '', cta_link: section.cta_link ?? '', bullets: section.bullets ?? '[]', image_url: section.image_url ?? '', image_alt: section.image_alt ?? '', id: section._id.toString() };
        return NextResponse.json(normalized);
    } catch (error) {
        console.error('Error fetching homepage about section:', error);
        return NextResponse.json({ error: 'Failed to fetch about section' }, { status: 500 });
    }
}

// POST
export async function POST(request: NextRequest) {
    try {
        await connectDB();
        const body = await request.json();
        const { title, description = '', image_url = '', image_alt = '', cta_text = '', cta_link = '', is_active = 1 } = body;

        if (!title || !description) {
            return NextResponse.json({ error: 'Title and description are required' }, { status: 400 });
        }

        const result = await HomepageAboutSection.create({ title, description, image_url, image_alt, cta_text, cta_link, is_active });
        try { revalidateTag('homepage-about-section', 'max'); } catch (e) { /* ignore */ }
        return NextResponse.json({ success: true, message: 'About section created', data: { ...result.toObject(), id: result._id.toString() } }, { status: 201 });
    } catch (error) {
        console.error('Error creating about section:', error);
        return NextResponse.json({ error: 'Failed to create about section' }, { status: 500 });
    }
}

// PUT
export async function PUT(request: NextRequest) {
    try {
        await connectDB();
        const body = await request.json();
        const { id, title, description, image_url, image_alt, cta_text, cta_link, is_active } = body;
        if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 });

        const updateData: any = {};
        if (title !== undefined) updateData.title = title;
        if (description !== undefined) updateData.description = description;
        if (image_url !== undefined) updateData.image_url = image_url;
        if (image_alt !== undefined) updateData.image_alt = image_alt;
        if (cta_text !== undefined) updateData.cta_text = cta_text;
        if (cta_link !== undefined) updateData.cta_link = cta_link;
        if (is_active !== undefined) updateData.is_active = is_active;

        const updated = await HomepageAboutSection.findByIdAndUpdate(id, updateData, { new: true }).lean();
        if (!updated) return NextResponse.json({ error: 'About section not found' }, { status: 404 });
        try { revalidateTag('homepage-about-section', 'max'); } catch (e) { /* ignore */ }
        return NextResponse.json({ success: true, message: 'About section updated', data: { ...updated, id: updated._id.toString() } });
    } catch (error) {
        console.error('Error updating about section:', error);
        return NextResponse.json({ error: 'Failed to update about section' }, { status: 500 });
    }
}

// DELETE
export async function DELETE(request: NextRequest) {
    try {
        await connectDB();
        const id = request.nextUrl.searchParams.get('id');
        if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 });
        await HomepageAboutSection.findByIdAndDelete(id);
        try { revalidateTag('homepage-about-section', 'max'); } catch (e) { /* ignore */ }
        return NextResponse.json({ success: true, message: 'About section deleted' });
    } catch (error) {
        console.error('Error deleting about section:', error);
        return NextResponse.json({ error: 'Failed to delete about section' }, { status: 500 });
    }
}
