import { NextRequest, NextResponse } from 'next/server';
import { eq, asc } from 'drizzle-orm';
import { db } from '@/db';
import { aboutPageBadges } from '@/db/aboutPageSchema';
import { revalidateTag } from 'next/cache';

export async function GET() {
    try {
        const rows = await db.select().from(aboutPageBadges).where(eq(aboutPageBadges.is_active, 1)).orderBy(asc(aboutPageBadges.display_order));
        return NextResponse.json(rows);
    } catch (error) {
        console.error('Error fetching badges:', error);
        return NextResponse.json({ error: 'Failed to fetch badges' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { name, logo = '', link = '', display_order = 0, is_active = 1 } = body;
        const res = await db.insert(aboutPageBadges).values({ name, logo, link, display_order, is_active });
        revalidateTag('about-badges', 'max');
        return NextResponse.json({ success: true, id: res[0].insertId }, { status: 201 });
    } catch (error) {
        console.error('Error creating badge:', error);
        return NextResponse.json({ error: 'Failed to create badge' }, { status: 500 });
    }
}

export async function PUT(request: NextRequest) {
    try {
        const body = await request.json();
        const { id, name, logo, link, display_order, is_active } = body;
        if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 });
        const update: any = {};
        if (name !== undefined) update.name = name;
        if (logo !== undefined) update.logo = logo;
        if (link !== undefined) update.link = link;
        if (display_order !== undefined) update.display_order = display_order;
        if (is_active !== undefined) update.is_active = is_active;
        await db.update(aboutPageBadges).set(update).where(eq(aboutPageBadges.id, id));
        revalidateTag('about-badges', 'max');
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error updating badge:', error);
        return NextResponse.json({ error: 'Failed to update badge' }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const id = request.nextUrl.searchParams.get('id');
        if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 });
        await db.delete(aboutPageBadges).where(eq(aboutPageBadges.id, parseInt(id)));
        revalidateTag('about-badges', 'max');
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting badge:', error);
        return NextResponse.json({ error: 'Failed to delete badge' }, { status: 500 });
    }
}
