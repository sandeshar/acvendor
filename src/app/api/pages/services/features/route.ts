import { NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { servicesPageFeatures } from '@/db/servicesPageSchema';
import { revalidateTag } from 'next/cache';

export async function GET(request: NextRequest) {
    try {
        const rows = await db.select().from(servicesPageFeatures).orderBy(servicesPageFeatures.display_order);
        return NextResponse.json(rows);
    } catch (error) {
        console.error('Error fetching features:', error);
        return NextResponse.json({ error: 'Failed to fetch features' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { icon = '', title, description = '', display_order = 0, is_active = 1 } = body;
        if (!title) return NextResponse.json({ error: 'Title is required' }, { status: 400 });
        const res = await db.insert(servicesPageFeatures).values({ icon, title, description, display_order, is_active });
        revalidateTag('services-features', 'max');
        return NextResponse.json({ success: true, id: res[0].insertId }, { status: 201 });
    } catch (error) {
        console.error('Error creating feature:', error);
        return NextResponse.json({ error: 'Failed to create feature' }, { status: 500 });
    }
}

export async function PUT(request: NextRequest) {
    try {
        const body = await request.json();
        const { id } = body;
        if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 });
        const update: any = {};
        ['icon','title','description','display_order','is_active'].forEach(k => { if (body[k] !== undefined) update[k] = body[k]; });
        await db.update(servicesPageFeatures).set(update).where(eq(servicesPageFeatures.id, id));
        revalidateTag('services-features', 'max');
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error updating feature:', error);
        return NextResponse.json({ error: 'Failed to update feature' }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const id = searchParams.get('id');
        if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 });
        await db.delete(servicesPageFeatures).where(eq(servicesPageFeatures.id, parseInt(id)));
        revalidateTag('services-features', 'max');
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting feature:', error);
        return NextResponse.json({ error: 'Failed to delete feature' }, { status: 500 });
    }
}
