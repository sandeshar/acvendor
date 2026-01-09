import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/db';
import { HomepageBlogSection } from '@/db/homepageSchema';
import { revalidateTag } from 'next/cache';

// GET - fetch single active blog section or by id
export async function GET(request: NextRequest) {
    try {
        await connectDB();
        const searchParams = request.nextUrl.searchParams;
        const id = searchParams.get('id');

        if (id) {
            const section = await HomepageBlogSection.findById(id).lean();
            if (!section) return NextResponse.json({ error: 'Blog section not found' }, { status: 404 });
            return NextResponse.json({ ...section, id: section._id.toString() });
        }

        const section = await HomepageBlogSection.findOne({ is_active: 1 }).lean();
        if (!section) return NextResponse.json({ error: 'No active blog section found' }, { status: 404 });
        return NextResponse.json({ ...section, id: section._id.toString() });
    } catch (error) {
        console.error('Error fetching homepage blog section:', error);
        return NextResponse.json({ error: 'Failed to fetch blog section' }, { status: 500 });
    }
}

// POST - create
export async function POST(request: NextRequest) {
    try {
        await connectDB();
        const body = await request.json();
        const { title, subtitle = '', cta_text = '', cta_link = '', is_active = 1 } = body;

        if (!title) {
            return NextResponse.json({ error: 'Title is required' }, { status: 400 });
        }

        const result = await HomepageBlogSection.create({ title, subtitle, cta_text, cta_link, is_active });
        try { revalidateTag('homepage-blog-section', 'max'); } catch (e) { /* ignore */ }
        return NextResponse.json({ success: true, message: 'Blog section created', data: { ...result.toObject(), id: result._id.toString() } }, { status: 201 });
    } catch (error) {
        console.error('Error creating blog section:', error);
        return NextResponse.json({ error: 'Failed to create blog section' }, { status: 500 });
    }
}

// PUT - update
export async function PUT(request: NextRequest) {
    try {
        await connectDB();
        const body = await request.json();
        const { id, title, subtitle, cta_text, cta_link, is_active } = body;
        if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 });

        const updateData: any = {};
        if (title !== undefined) updateData.title = title;
        if (subtitle !== undefined) updateData.subtitle = subtitle;
        if (cta_text !== undefined) updateData.cta_text = cta_text;
        if (cta_link !== undefined) updateData.cta_link = cta_link;
        if (is_active !== undefined) updateData.is_active = is_active;

        const updated = await HomepageBlogSection.findByIdAndUpdate(id, updateData, { new: true }).lean();
        if (!updated) return NextResponse.json({ error: 'Blog section not found' }, { status: 404 });
        try { revalidateTag('homepage-blog-section', 'max'); } catch (e) { /* ignore */ }
        return NextResponse.json({ success: true, message: 'Blog section updated', data: { ...updated, id: updated._id.toString() } });
    } catch (error) {
        console.error('Error updating blog section:', error);
        return NextResponse.json({ error: 'Failed to update blog section' }, { status: 500 });
    }
}

// DELETE - delete
export async function DELETE(request: NextRequest) {
    try {
        await connectDB();
        const id = request.nextUrl.searchParams.get('id');
        if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 });
        await HomepageBlogSection.findByIdAndDelete(id);
        try { revalidateTag('homepage-blog-section', 'max'); } catch (e) { /* ignore */ }
        return NextResponse.json({ success: true, message: 'Blog section deleted' });
    } catch (error) {
        console.error('Error deleting blog section:', error);
        return NextResponse.json({ error: 'Failed to delete blog section' }, { status: 500 });
    }
}
