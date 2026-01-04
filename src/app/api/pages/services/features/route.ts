import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/db';
import { ServicesPageFeatures } from '@/db/servicesPageSchema';
import { revalidateTag } from 'next/cache';

export async function GET(request: NextRequest) {
    try {
        await connectDB();
        const rows = await ServicesPageFeatures.find().sort({ display_order: 1 }).lean();
        return NextResponse.json(rows);
    } catch (error) {
        console.error('Error fetching features:', error);
        return NextResponse.json({ error: 'Failed to fetch features' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        await connectDB();
        const body = await request.json();
        const { icon = '', title, description = '', display_order = 0, is_active = 1 } = body;
        if (!title) return NextResponse.json({ error: 'Title is required' }, { status: 400 });
        const res = await ServicesPageFeatures.create({ icon, title, description, display_order, is_active });
        revalidateTag('services-features', 'max');
        return NextResponse.json({ success: true, id: res._id }, { status: 201 });
    } catch (error) {
        console.error('Error creating feature:', error);
        return NextResponse.json({ error: 'Failed to create feature' }, { status: 500 });
    }
}

export async function PUT(request: NextRequest) {
    try {
        await connectDB();
        const body = await request.json();
        const { id } = body;
        if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 });
        const update: any = {};
        ['icon','title','description','display_order','is_active'].forEach(k => { if (body[k] !== undefined) update[k] = body[k]; });
        await ServicesPageFeatures.findByIdAndUpdate(id, update, { new: true });
        revalidateTag('services-features', 'max');
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error updating feature:', error);
        return NextResponse.json({ error: 'Failed to update feature' }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest) {
    try {
        await connectDB();
        const searchParams = request.nextUrl.searchParams;
        const id = searchParams.get('id');
        if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 });
        await ServicesPageFeatures.findByIdAndDelete(id);
        revalidateTag('services-features', 'max');
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting feature:', error);
        return NextResponse.json({ error: 'Failed to delete feature' }, { status: 500 });
    }
}
