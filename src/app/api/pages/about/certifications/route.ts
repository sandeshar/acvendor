import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/db';
import { AboutPageCertifications } from '@/db/aboutPageSchema';
import { revalidateTag } from 'next/cache';

export async function GET(request: NextRequest) {
    try {
        await connectDB();
        const searchParams = request.nextUrl.searchParams;
        const id = searchParams.get('id');

        if (id) {
            const row = await AboutPageCertifications.findById(id).lean();
            if (!row) return NextResponse.json({ error: 'Certification not found' }, { status: 404 });
            return NextResponse.json(row);
        }

        const rows = await AboutPageCertifications.find({ is_active: 1 }).sort({ display_order: 1 }).lean();
        return NextResponse.json(rows);
    } catch (error) {
        console.error('Error fetching certifications:', error);
        return NextResponse.json({ error: 'Failed to fetch certifications' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        await connectDB();
        const body = await request.json();
        const { name, logo = '', link = '', display_order = 0, is_active = 1 } = body;
        if (!name) return NextResponse.json({ error: 'Name is required' }, { status: 400 });
        const newCert = await AboutPageCertifications.create({ name, logo, link, display_order, is_active });
        revalidateTag('about-certifications', 'max');
        return NextResponse.json({ success: true, id: newCert._id }, { status: 201 });
    } catch (error) {
        console.error('Error creating certification:', error);
        return NextResponse.json({ error: 'Failed to create certification' }, { status: 500 });
    }
}

export async function PUT(request: NextRequest) {
    try {
        await connectDB();
        const body = await request.json();
        const { id } = body;
        if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 });
        const update: any = {};
        ['name', 'logo', 'link', 'display_order', 'is_active'].forEach(k => { if (body[k] !== undefined) update[k] = body[k]; });
        await AboutPageCertifications.findByIdAndUpdate(id, update, { new: true });
        revalidateTag('about-certifications', 'max');
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error updating certification:', error);
        return NextResponse.json({ error: 'Failed to update certification' }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest) {
    try {
        await connectDB();
        const searchParams = request.nextUrl.searchParams;
        const id = searchParams.get('id');
        if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 });
        await AboutPageCertifications.findByIdAndDelete(id);
        revalidateTag('about-certifications', 'max');
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting certification:', error);
        return NextResponse.json({ error: 'Failed to delete certification' }, { status: 500 });
    }
}
