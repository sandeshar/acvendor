import { NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { aboutPageCertificationsSection } from '@/db/aboutPageSchema';
import { revalidateTag } from 'next/cache';

// GET - Fetch certifications section
export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const id = searchParams.get('id');

        if (id) {
            const row = await db.select().from(aboutPageCertificationsSection).where(eq(aboutPageCertificationsSection.id, parseInt(id))).limit(1);
            if (row.length === 0) return NextResponse.json({ error: 'Certifications section not found' }, { status: 404 });
            return NextResponse.json(row[0]);
        }

        const rows = await db.select().from(aboutPageCertificationsSection).where(eq(aboutPageCertificationsSection.is_active, 1)).limit(1);
        if (rows.length === 0) return NextResponse.json({ error: 'No active certifications section' }, { status: 404 });
        return NextResponse.json(rows[0]);
    } catch (error) {
        console.error('Error fetching certifications section:', error);
        return NextResponse.json({ error: 'Failed to fetch certifications section' }, { status: 500 });
    }
}

// POST - Create section
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { title = '', subtitle = '', is_active = 1 } = body;

        const res = await db.insert(aboutPageCertificationsSection).values({ title, subtitle, is_active });
        return NextResponse.json({ success: true, id: res[0].insertId }, { status: 201 });
    } catch (error) {
        console.error('Error creating certifications section:', error);
        return NextResponse.json({ error: 'Failed to create certifications section' }, { status: 500 });
    }
}

// PUT - Update section
export async function PUT(request: NextRequest) {
    try {
        const body = await request.json();
        const { id, title, subtitle, is_active } = body;
        if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 });

        const update: any = {};
        if (title !== undefined) update.title = title;
        if (subtitle !== undefined) update.subtitle = subtitle;
        if (is_active !== undefined) update.is_active = is_active;

        await db.update(aboutPageCertificationsSection).set(update).where(eq(aboutPageCertificationsSection.id, id));
        revalidateTag('about-certifications-section', 'max');
        return NextResponse.json({ success: true, message: 'Updated' });
    } catch (error) {
        console.error('Error updating certifications section:', error);
        return NextResponse.json({ error: 'Failed to update certifications section' }, { status: 500 });
    }
}

// DELETE - Delete by id
export async function DELETE(request: NextRequest) {
    try {
        const id = request.nextUrl.searchParams.get('id');
        if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 });
        await db.delete(aboutPageCertificationsSection).where(eq(aboutPageCertificationsSection.id, parseInt(id)));
        revalidateTag('about-certifications-section', 'max');
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting certifications section:', error);
        return NextResponse.json({ error: 'Failed to delete certifications section' }, { status: 500 });
    }
}
