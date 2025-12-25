import { NextRequest, NextResponse } from 'next/server';
import { eq, asc } from 'drizzle-orm';
import { db } from '@/db';
import { servicesBrands } from '@/db/servicesPageSchema';
import { revalidateTag } from 'next/cache';

// GET - fetch brands
export async function GET(request: NextRequest) {
    try {
        const id = request.nextUrl.searchParams.get('id');
        if (id) {
            const row = await db.select().from(servicesBrands).where(eq(servicesBrands.id, parseInt(id))).limit(1);
            if (row.length === 0) return NextResponse.json({ error: 'Brand not found' }, { status: 404 });
            return NextResponse.json(row[0]);
        }

        const rows = await db.select().from(servicesBrands).where(eq(servicesBrands.is_active, 1)).orderBy(asc(servicesBrands.display_order));
        return NextResponse.json(rows);
    } catch (error) {
        console.error('Error fetching brands:', error);
        return NextResponse.json({ error: 'Failed to fetch brands' }, { status: 500 });
    }
}

// POST - create brand
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { name, logo_url = '', display_order = 0, is_active = 1 } = body;
        if (!name) return NextResponse.json({ error: 'Name is required' }, { status: 400 });

        const result = await db.insert(servicesBrands).values({ name, logo_url, display_order, is_active });
        revalidateTag('services-brands', 'max');
        return NextResponse.json({ success: true, message: 'Brand created', id: result[0].insertId }, { status: 201 });
    } catch (error) {
        console.error('Error creating brand:', error);
        return NextResponse.json({ error: 'Failed to create brand' }, { status: 500 });
    }
}

// PUT - update brand
export async function PUT(request: NextRequest) {
    try {
        const body = await request.json();
        const { id, name, logo_url, display_order, is_active } = body;
        if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 });

        const updateData: any = {};
        if (name !== undefined) updateData.name = name;
        if (logo_url !== undefined) updateData.logo_url = logo_url;
        if (display_order !== undefined) updateData.display_order = display_order;
        if (is_active !== undefined) updateData.is_active = is_active;

        await db.update(servicesBrands).set(updateData).where(eq(servicesBrands.id, id));
        revalidateTag('services-brands', 'max');
        return NextResponse.json({ success: true, message: 'Brand updated' });
    } catch (error) {
        console.error('Error updating brand:', error);
        return NextResponse.json({ error: 'Failed to update brand' }, { status: 500 });
    }
}

// DELETE - delete brand
export async function DELETE(request: NextRequest) {
    try {
        const id = request.nextUrl.searchParams.get('id');
        if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 });
        await db.delete(servicesBrands).where(eq(servicesBrands.id, parseInt(id)));
        revalidateTag('services-brands', 'max');
        return NextResponse.json({ success: true, message: 'Brand deleted' });
    } catch (error) {
        console.error('Error deleting brand:', error);
        return NextResponse.json({ error: 'Failed to delete brand' }, { status: 500 });
    }
}
