import { NextRequest, NextResponse } from 'next/server';
import { eq, asc } from 'drizzle-orm';
import { db } from '@/db';
import { servicesTrustStats } from '@/db/servicesPageSchema';
import { revalidateTag } from 'next/cache';

// GET - fetch trust stats
export async function GET(request: NextRequest) {
    try {
        const id = request.nextUrl.searchParams.get('id');
        if (id) {
            const row = await db.select().from(servicesTrustStats).where(eq(servicesTrustStats.id, parseInt(id))).limit(1);
            if (row.length === 0) return NextResponse.json({ error: 'Stat not found' }, { status: 404 });
            return NextResponse.json(row[0]);
        }

        const rows = await db.select().from(servicesTrustStats).where(eq(servicesTrustStats.is_active, 1)).orderBy(asc(servicesTrustStats.display_order));
        return NextResponse.json(rows);
    } catch (error) {
        console.error('Error fetching trust stats:', error);
        return NextResponse.json({ error: 'Failed to fetch trust stats' }, { status: 500 });
    }
}

// POST - create stat
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { label, value, description = '', display_order = 0, is_active = 1 } = body;
        if (!label || !value) return NextResponse.json({ error: 'Label and value are required' }, { status: 400 });

        const result = await db.insert(servicesTrustStats).values({ label, value, description, display_order, is_active });
        revalidateTag('services-trust-stats', 'max');
        return NextResponse.json({ success: true, message: 'Stat created', id: result[0].insertId }, { status: 201 });
    } catch (error) {
        console.error('Error creating trust stat:', error);
        return NextResponse.json({ error: 'Failed to create stat' }, { status: 500 });
    }
}

// PUT - update stat
export async function PUT(request: NextRequest) {
    try {
        const body = await request.json();
        const { id, label, value, description, display_order, is_active } = body;
        if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 });

        const updateData: any = {};
        if (label !== undefined) updateData.label = label;
        if (value !== undefined) updateData.value = value;
        if (description !== undefined) updateData.description = description;
        if (display_order !== undefined) updateData.display_order = display_order;
        if (is_active !== undefined) updateData.is_active = is_active;

        await db.update(servicesTrustStats).set(updateData).where(eq(servicesTrustStats.id, id));
        revalidateTag('services-trust-stats', 'max');
        return NextResponse.json({ success: true, message: 'Stat updated' });
    } catch (error) {
        console.error('Error updating trust stat:', error);
        return NextResponse.json({ error: 'Failed to update stat' }, { status: 500 });
    }
}

// DELETE - delete stat
export async function DELETE(request: NextRequest) {
    try {
        const id = request.nextUrl.searchParams.get('id');
        if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 });
        await db.delete(servicesTrustStats).where(eq(servicesTrustStats.id, parseInt(id)));
        revalidateTag('services-trust-stats', 'max');
        return NextResponse.json({ success: true, message: 'Stat deleted' });
    } catch (error) {
        console.error('Error deleting trust stat:', error);
        return NextResponse.json({ error: 'Failed to delete stat' }, { status: 500 });
    }
}
