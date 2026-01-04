import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/db';
import { ServicesPageTrust } from '@/db/servicesPageSchema';
import { revalidateTag } from 'next/cache';

export async function GET(request: NextRequest) {
    try {
        await connectDB();
        const row = await ServicesPageTrust.findOne({ is_active: 1 }).lean();
        if (!row) return NextResponse.json({ error: 'No trust section found' }, { status: 404 });
        return NextResponse.json(row);
    } catch (error) {
        console.error('Error fetching trust:', error);
        return NextResponse.json({ error: 'Failed to fetch trust section' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        await connectDB();
        const body = await request.json();
        const { title = '', description = '', quote_text = '', quote_author = '', quote_role = '', quote_image = '', is_active = 1 } = body;
        const res = await ServicesPageTrust.create({ title, description, quote_text, quote_author, quote_role, quote_image, is_active });
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
        const { id } = body;
        if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 });
        const update: any = {};
        ['title','description','quote_text','quote_author','quote_role','quote_image','is_active'].forEach(k => { if (body[k] !== undefined) update[k] = body[k]; });
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
