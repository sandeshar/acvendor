import { NextRequest, NextResponse } from 'next/server';
import { eq, asc } from 'drizzle-orm';
import { db } from '@/db';
import { aboutPageCertifications } from '@/db/aboutPageSchema';
import { revalidateTag } from 'next/cache';

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const id = searchParams.get('id');

        if (id) {
            const row = await db.select().from(aboutPageCertifications).where(eq(aboutPageCertifications.id, parseInt(id))).limit(1);
            if (row.length === 0) return NextResponse.json({ error: 'Certification not found' }, { status: 404 });
            return NextResponse.json(row[0]);
        }

        const rows = await db.select().from(aboutPageCertifications).where(eq(aboutPageCertifications.is_active, 1)).orderBy(asc(aboutPageCertifications.display_order));
        return NextResponse.json(rows);
    } catch (error) {
        console.error('Error fetching certifications:', error);
        return NextResponse.json({ error: 'Failed to fetch certifications' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { name, logo = '', link = '', display_order = 0, is_active = 1 } = body;
        if (!name) return NextResponse.json({ error: 'Name is required' }, { status: 400 });
        const res = await db.insert(aboutPageCertifications).values({ name, logo, link, display_order, is_active });
        revalidateTag('about-certifications', 'max');
        return NextResponse.json({ success: true, id: res[0].insertId }, { status: 201 });
    } catch (error) {
        console.error('Error creating certification:', error);
        return NextResponse.json({ error: 'Failed to create certification' }, { status: 500 });
    }
}

export async function PUT(request: NextRequest) {
    try {
        const body = await request.json();
        const { id } = body;
        if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 });
        const update: any = {};
        ['name', 'logo', 'link', 'display_order', 'is_active'].forEach(k => { if (body[k] !== undefined) update[k] = body[k]; });
        await db.update(aboutPageCertifications).set(update).where(eq(aboutPageCertifications.id, id));
        revalidateTag('about-certifications', 'max');
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error updating certification:', error);
        return NextResponse.json({ error: 'Failed to update certification' }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const id = searchParams.get('id');
        if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 });
        await db.delete(aboutPageCertifications).where(eq(aboutPageCertifications.id, parseInt(id)));
        revalidateTag('about-certifications', 'max');
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting certification:', error);
        return NextResponse.json({ error: 'Failed to delete certification' }, { status: 500 });
    }
}
