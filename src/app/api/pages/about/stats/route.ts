import { NextRequest, NextResponse } from 'next/server';
import { eq, asc } from 'drizzle-orm';
import { db } from '@/db';
import { aboutPageStats } from '@/db/aboutPageSchema';
import { revalidateTag } from 'next/cache';

// GET - Fetch stats
export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const id = searchParams.get('id');

        if (id) {
            const stat = await db.select().from(aboutPageStats).where(eq(aboutPageStats.id, parseInt(id))).limit(1);

            if (stat.length === 0) {
                return NextResponse.json({ error: 'Stat not found' }, { status: 404 });
            }

            return NextResponse.json(stat[0]);
        }

        const stats = await db.select().from(aboutPageStats)
            .where(eq(aboutPageStats.is_active, 1))
            .orderBy(asc(aboutPageStats.display_order));

        return NextResponse.json(stats);
    } catch (error) {
        console.error('Error fetching stats:', error);
        return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
    }
}

// POST - Create stat
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { label, value, display_order, is_active = 1 } = body;

        if (!label || !value || display_order === undefined) {
            return NextResponse.json({ error: 'Label, value, and display_order are required' }, { status: 400 });
        }

        const result = await db.insert(aboutPageStats).values({ label, value, display_order, is_active });

        revalidateTag('about-stats', 'max');

        return NextResponse.json(
            { success: true, message: 'Stat created successfully', id: result[0].insertId },
            { status: 201 }
        );
    } catch (error) {
        console.error('Error creating stat:', error);
        return NextResponse.json({ error: 'Failed to create stat' }, { status: 500 });
    }
}

// PUT - Update stat
export async function PUT(request: NextRequest) {
    try {
        const body = await request.json();
        const { id, label, value, display_order, is_active } = body;

        if (!id) {
            return NextResponse.json({ error: 'ID is required' }, { status: 400 });
        }

        const updateData: any = {};
        if (label !== undefined) updateData.label = label;
        if (value !== undefined) updateData.value = value;
        if (display_order !== undefined) updateData.display_order = display_order;
        if (is_active !== undefined) updateData.is_active = is_active;

        await db.update(aboutPageStats).set(updateData).where(eq(aboutPageStats.id, id));

        revalidateTag('about-stats', 'max');

        return NextResponse.json({ success: true, message: 'Stat updated successfully' });
    } catch (error) {
        console.error('Error updating stat:', error);
        return NextResponse.json({ error: 'Failed to update stat' }, { status: 500 });
    }
}

// DELETE - Delete stat
export async function DELETE(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'ID is required' }, { status: 400 });
        }

        await db.delete(aboutPageStats).where(eq(aboutPageStats.id, parseInt(id)));

        revalidateTag('about-stats', 'max');

        return NextResponse.json({ success: true, message: 'Stat deleted successfully' });
    } catch (error) {
        console.error('Error deleting stat:', error);
        return NextResponse.json({ error: 'Failed to delete stat' }, { status: 500 });
    }
}
