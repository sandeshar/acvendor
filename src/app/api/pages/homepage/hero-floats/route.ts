import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/db';
import { HomepageHeroFeatures } from '@/db/homepageSchema';
import { revalidateTag } from 'next/cache';

export async function GET(request: NextRequest) {
    try {
        await connectDB();
        const searchParams = request.nextUrl.searchParams;
        const admin = searchParams.get('admin');
        let rows;
        if (admin === '1' || admin === 'true') {
            rows = await HomepageHeroFeatures.find().sort({ display_order: 1 }).lean();
        } else {
            rows = await HomepageHeroFeatures.find({ is_active: 1 }).sort({ display_order: 1 }).lean();
        }
        // Normalize to include `id` string
        const normalized = Array.isArray(rows) ? rows.map(r => ({ ...r, id: r._id ? String(r._id) : undefined })) : [];
        return NextResponse.json(normalized);
    } catch (error) {
        console.error('Error fetching homepage hero features:', error);
        return NextResponse.json({ error: 'Failed to fetch homepage hero features' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        await connectDB();
        const body = await request.json();
        const { icon_name, icon_bg, title, description = '', display_order = 0, is_active = 1 } = body;
        if (!title) return NextResponse.json({ error: 'Title is required' }, { status: 400 });
        if (!icon_name) return NextResponse.json({ error: 'Icon is required' }, { status: 400 });
        const res = await HomepageHeroFeatures.create({ icon_name, icon_bg, title, description, display_order, is_active });
        revalidateTag('homepage-hero-floats', 'max');
        return NextResponse.json({ success: true, id: res._id }, { status: 201 });
    } catch (error) {
        console.error('Error creating homepage hero feature:', error);
        return NextResponse.json({ error: 'Failed to create homepage hero feature' }, { status: 500 });
    }
}

export async function PUT(request: NextRequest) {
    try {
        await connectDB();
        const body = await request.json();
        const { id } = body;
        if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 });
        const update: any = {};
        ['icon_name', 'icon_bg', 'title', 'description', 'display_order', 'is_active'].forEach(k => { if (body[k] !== undefined) update[k] = body[k]; });
        await HomepageHeroFeatures.findByIdAndUpdate(id, update, { new: true });
        revalidateTag('homepage-hero-floats', 'max');
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error updating homepage hero feature:', error);
        return NextResponse.json({ error: 'Failed to update homepage hero feature' }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest) {
    try {
        await connectDB();
        const searchParams = request.nextUrl.searchParams;
        const id = searchParams.get('id');
        if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 });
        await HomepageHeroFeatures.findByIdAndDelete(id);
        revalidateTag('homepage-hero-floats', 'max');
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting homepage hero feature:', error);
        return NextResponse.json({ error: 'Failed to delete homepage hero feature' }, { status: 500 });
    }
}
