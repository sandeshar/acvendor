import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/db';
import { AboutPageBadges } from '@/db/aboutPageSchema';
import { revalidateTag } from 'next/cache';

export async function GET() {
    try {
        await connectDB();
        const rows = await AboutPageBadges.find({ is_active: 1 }).sort({ display_order: 1 }).lean();
        return NextResponse.json(rows);
    } catch (error) {
        console.error('Error fetching badges:', error);
        return NextResponse.json({ error: 'Failed to fetch badges' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        await connectDB();
        const body = await request.json();
        const { name, logo = '', link = '', display_order = 0, is_active = 1 } = body;
        const newBadge = await AboutPageBadges.create({ name, logo, link, display_order, is_active });
        try { revalidateTag('about-badges', 'max'); } catch (e) { /* ignore */ }
        return NextResponse.json({ success: true, id: newBadge._id }, { status: 201 });
    } catch (error) {
        console.error('Error creating badge:', error);
        return NextResponse.json({ error: 'Failed to create badge' }, { status: 500 });
    }
}

export async function PUT(request: NextRequest) {
    try {
        await connectDB();
        const body = await request.json();
        const { id, name, logo, link, display_order, is_active } = body;
        if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 });
        const update: any = {};
        if (name !== undefined) update.name = name;
        if (logo !== undefined) update.logo = logo;
        if (link !== undefined) update.link = link;
        if (display_order !== undefined) update.display_order = display_order;
        if (is_active !== undefined) update.is_active = is_active;
        await AboutPageBadges.findByIdAndUpdate(id, update, { new: true });
        try { revalidateTag('about-badges', 'max'); } catch (e) { /* ignore */ }
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error updating badge:', error);
        return NextResponse.json({ error: 'Failed to update badge' }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest) {
    try {
        await connectDB();
        const id = request.nextUrl.searchParams.get('id');
        if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 });
        await AboutPageBadges.findByIdAndDelete(id);
        try { revalidateTag('about-badges', 'max'); } catch (e) { /* ignore */ }
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting badge:', error);
        return NextResponse.json({ error: 'Failed to delete badge' }, { status: 500 });
    }
}
