import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/db';
import { ServicesPageBrands } from '@/db/servicesPageSchema';
import { revalidateTag } from 'next/cache';

export async function GET(request: NextRequest) {
    try {
        await connectDB();
        const searchParams = request.nextUrl.searchParams;
        const id = searchParams.get('id');

        if (id) {
            const row = await ServicesPageBrands.findById(id).lean();
            if (!row) return NextResponse.json({ error: 'Brand not found' }, { status: 404 });
            return NextResponse.json(row);
        }

        const rows = await ServicesPageBrands.find().sort({ display_order: 1 }).lean();
        return NextResponse.json(rows);
    } catch (error) {
        console.error('Error fetching brands:', error);
        return NextResponse.json({ error: 'Failed to fetch brands' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        await connectDB();
        const body = await request.json();
        const { name, slug = '', logo = '', link = '', display_order = 0, is_active = 1 } = body;
        if (!name) return NextResponse.json({ error: 'Name is required' }, { status: 400 });
        const res = await ServicesPageBrands.create({ name, slug: slug || null, logo, link, display_order, is_active });
        revalidateTag('services-brands', 'max');
        return NextResponse.json({ success: true, id: res._id }, { status: 201 });
    } catch (error) {
        console.error('Error creating brand:', error);
        return NextResponse.json({ error: 'Failed to create brand' }, { status: 500 });
    }
}

export async function PUT(request: NextRequest) {
    try {
        await connectDB();
        const body = await request.json();
        const { id } = body;
        if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 });
        const update: any = {};
        ['name', 'slug', 'logo', 'link', 'display_order', 'is_active'].forEach(k => { if (body[k] !== undefined) update[k] = body[k]; });
        await ServicesPageBrands.findByIdAndUpdate(id, update, { new: true });
        revalidateTag('services-brands', 'max');
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error updating brand:', error);
        return NextResponse.json({ error: 'Failed to update brand' }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest) {
    try {
        await connectDB();
        const searchParams = request.nextUrl.searchParams;
        const id = searchParams.get('id');
        if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 });
        await ServicesPageBrands.findByIdAndDelete(id);
        revalidateTag('services-brands', 'max');
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting brand:', error);
        return NextResponse.json({ error: 'Failed to delete brand' }, { status: 500 });
    }
}
