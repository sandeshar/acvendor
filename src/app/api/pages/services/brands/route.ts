import { NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { servicesPageBrands } from '@/db/servicesPageSchema';
import { revalidateTag } from 'next/cache';

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const id = searchParams.get('id');

        if (id) {
            const row = await db.select().from(servicesPageBrands).where(eq(servicesPageBrands.id, parseInt(id))).limit(1);
            if (row.length === 0) return NextResponse.json({ error: 'Brand not found' }, { status: 404 });
            return NextResponse.json(row[0]);
        }

        const rows = await db.select().from(servicesPageBrands).orderBy(servicesPageBrands.display_order);
        return NextResponse.json(rows);
    } catch (error) {
        console.error('Error fetching brands:', error);
        return NextResponse.json({ error: 'Failed to fetch brands' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { name, logo = '', link = '', display_order = 0, is_active = 1 } = body;
        if (!name) return NextResponse.json({ error: 'Name is required' }, { status: 400 });
        const res = await db.insert(servicesPageBrands).values({ name, logo, link, display_order, is_active });
        revalidateTag('services-brands', 'max');
        return NextResponse.json({ success: true, id: res[0].insertId }, { status: 201 });
    } catch (error) {
        console.error('Error creating brand:', error);
        return NextResponse.json({ error: 'Failed to create brand' }, { status: 500 });
    }
}

export async function PUT(request: NextRequest) {
    try {
        const body = await request.json();
        const { id } = body;
        if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 });
        const update: any = {};
        ['name','logo','link','display_order','is_active'].forEach(k => { if (body[k] !== undefined) update[k] = body[k]; });
        await db.update(servicesPageBrands).set(update).where(eq(servicesPageBrands.id, id));
        revalidateTag('services-brands', 'max');
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error updating brand:', error);
        return NextResponse.json({ error: 'Failed to update brand' }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const id = searchParams.get('id');
        if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 });
        await db.delete(servicesPageBrands).where(eq(servicesPageBrands.id, parseInt(id)));
        revalidateTag('services-brands', 'max');
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting brand:', error);
        return NextResponse.json({ error: 'Failed to delete brand' }, { status: 500 });
    }
}
