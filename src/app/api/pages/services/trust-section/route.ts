import { NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { servicesTrustSection } from '@/db/servicesPageSchema';
import { revalidateTag } from 'next/cache';

// GET - fetch trust section (single)
export async function GET(request: NextRequest) {
    try {
        const id = request.nextUrl.searchParams.get('id');
        if (id) {
            const row = await db.select().from(servicesTrustSection).where(eq(servicesTrustSection.id, parseInt(id))).limit(1);
            if (row.length === 0) return NextResponse.json({ error: 'Trust section not found' }, { status: 404 });
            return NextResponse.json(row[0]);
        }

        const rows = await db.select().from(servicesTrustSection).where(eq(servicesTrustSection.is_active, 1)).limit(1);
        if (rows.length === 0) return NextResponse.json({});
        return NextResponse.json(rows[0]);
    } catch (error) {
        console.error('Error fetching trust section:', error);
        return NextResponse.json({ error: 'Failed to fetch trust section' }, { status: 500 });
    }
}

// POST - create trust section
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { heading, testimonial_id = null, is_active = 1 } = body;
        if (!heading) return NextResponse.json({ error: 'Heading is required' }, { status: 400 });

        const result = await db.insert(servicesTrustSection).values({ heading, testimonial_id, is_active });
        revalidateTag('services-trust-section', 'max');
        return NextResponse.json({ success: true, message: 'Trust section created', id: result[0].insertId }, { status: 201 });
    } catch (error) {
        console.error('Error creating trust section:', error);
        return NextResponse.json({ error: 'Failed to create trust section' }, { status: 500 });
    }
}

// PUT - update trust section
export async function PUT(request: NextRequest) {
    try {
        const body = await request.json();
        const { id, heading, testimonial_id, is_active } = body;
        if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 });

        const updateData: any = {};
        if (heading !== undefined) updateData.heading = heading;
        if (testimonial_id !== undefined) updateData.testimonial_id = testimonial_id;
        if (is_active !== undefined) updateData.is_active = is_active;

        await db.update(servicesTrustSection).set(updateData).where(eq(servicesTrustSection.id, id));
        revalidateTag('services-trust-section', 'max');
        return NextResponse.json({ success: true, message: 'Trust section updated' });
    } catch (error) {
        console.error('Error updating trust section:', error);
        return NextResponse.json({ error: 'Failed to update trust section' }, { status: 500 });
    }
}

// DELETE - delete trust section
export async function DELETE(request: NextRequest) {
    try {
        const id = request.nextUrl.searchParams.get('id');
        if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 });
        await db.delete(servicesTrustSection).where(eq(servicesTrustSection.id, parseInt(id)));
        revalidateTag('services-trust-section', 'max');
        return NextResponse.json({ success: true, message: 'Trust section deleted' });
    } catch (error) {
        console.error('Error deleting trust section:', error);
        return NextResponse.json({ error: 'Failed to delete trust section' }, { status: 500 });
    }
}
