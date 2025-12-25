import { NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { servicesOverview } from '@/db/servicesPageSchema';
import { revalidateTag } from 'next/cache';

// GET - single active overview or by id
export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const id = searchParams.get('id');

        if (id) {
            const row = await db.select().from(servicesOverview).where(eq(servicesOverview.id, parseInt(id))).limit(1);
            if (row.length === 0) return NextResponse.json({ error: 'Overview not found' }, { status: 404 });
            return NextResponse.json(row[0]);
        }

        const row = await db.select().from(servicesOverview).where(eq(servicesOverview.is_active, 1)).limit(1);
        if (row.length === 0) return NextResponse.json({});
        return NextResponse.json(row[0]);
    } catch (error) {
        console.error('Error fetching services overview:', error);
        return NextResponse.json({ error: 'Failed to fetch overview' }, { status: 500 });
    }
}

// POST - create overview
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { title, description, is_active = 1 } = body;
        if (!title || !description) return NextResponse.json({ error: 'Title and description are required' }, { status: 400 });

        const result = await db.insert(servicesOverview).values({ title, description, is_active });
        revalidateTag('services-overview', 'max');
        return NextResponse.json({ success: true, message: 'Overview created', id: result[0].insertId }, { status: 201 });
    } catch (error) {
        console.error('Error creating overview:', error);
        return NextResponse.json({ error: 'Failed to create overview' }, { status: 500 });
    }
}

// PUT - update overview
export async function PUT(request: NextRequest) {
    try {
        const body = await request.json();
        const { id, title, description, is_active } = body;
        if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 });

        const updateData: any = {};
        if (title !== undefined) updateData.title = title;
        if (description !== undefined) updateData.description = description;
        if (is_active !== undefined) updateData.is_active = is_active;

        await db.update(servicesOverview).set(updateData).where(eq(servicesOverview.id, id));
        revalidateTag('services-overview', 'max');
        return NextResponse.json({ success: true, message: 'Overview updated' });
    } catch (error) {
        console.error('Error updating overview:', error);
        return NextResponse.json({ error: 'Failed to update overview' }, { status: 500 });
    }
}

// DELETE - delete overview
export async function DELETE(request: NextRequest) {
    try {
        const id = request.nextUrl.searchParams.get('id');
        if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 });
        await db.delete(servicesOverview).where(eq(servicesOverview.id, parseInt(id)));
        revalidateTag('services-overview', 'max');
        return NextResponse.json({ success: true, message: 'Overview deleted' });
    } catch (error) {
        console.error('Error deleting overview:', error);
        return NextResponse.json({ error: 'Failed to delete overview' }, { status: 500 });
    }
}
