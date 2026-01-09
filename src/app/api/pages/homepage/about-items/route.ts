import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/db';
import { HomepageAboutItems } from '@/db/homepageSchema';
import { revalidateTag } from 'next/cache';

export async function GET(request: NextRequest) {
    try {
        await connectDB();
        const searchParams = request.nextUrl.searchParams;
        const admin = searchParams.get('admin');
        const id = searchParams.get('id');

        if (id) {
            const item = await HomepageAboutItems.findById(id).lean();
            if (!item) return NextResponse.json({ error: 'About item not found' }, { status: 404 });
            return NextResponse.json(item);
        }

        let items;
        if (admin === '1' || admin === 'true') {
            items = await HomepageAboutItems.find().sort({ display_order: 1 }).lean();
        } else {
            items = await HomepageAboutItems.find({ is_active: 1 }).sort({ display_order: 1 }).lean();
        }

        return NextResponse.json(items);
    } catch (error) {
        console.error('Error fetching homepage about items:', error);
        return NextResponse.json({ error: 'Failed to fetch about items' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        await connectDB();
        const body = await request.json();
        const { title, description, bullets = '[]', image_url = '', image_alt = '', display_order = 0, is_active = 1 } = body;
        if (!title || display_order === undefined || description === undefined) {
            return NextResponse.json({ error: 'Title, description and display_order are required' }, { status: 400 });
        }

        const res = await HomepageAboutItems.create({ title, description, bullets, image_url, image_alt, display_order, is_active });
        revalidateTag('homepage-about-items', 'max');
        return NextResponse.json({ success: true, id: res._id }, { status: 201 });
    } catch (error) {
        console.error('Error creating about item:', error);
        return NextResponse.json({ error: 'Failed to create about item' }, { status: 500 });
    }
}

export async function PUT(request: NextRequest) {
    try {
        await connectDB();
        const body = await request.json();
        const { id } = body;
        if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 });

        const update: any = {};
        ['title', 'description', 'bullets', 'image_url', 'image_alt', 'display_order', 'is_active'].forEach(k => {
            if (body[k] !== undefined) update[k] = body[k];
        });

        await HomepageAboutItems.findByIdAndUpdate(id, update, { new: true });
        revalidateTag('homepage-about-items', 'max');
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error updating about item:', error);
        return NextResponse.json({ error: 'Failed to update about item' }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest) {
    try {
        await connectDB();
        const id = request.nextUrl.searchParams.get('id');
        if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 });
        await HomepageAboutItems.findByIdAndDelete(id);
        revalidateTag('homepage-about-items', 'max');
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting about item:', error);
        return NextResponse.json({ error: 'Failed to delete about item' }, { status: 500 });
    }
}