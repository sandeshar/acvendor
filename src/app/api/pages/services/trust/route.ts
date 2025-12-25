import { NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { servicesPageTrust } from '@/db/servicesPageSchema';
import { revalidateTag } from 'next/cache';

export async function GET(request: NextRequest) {
    try {
        const rows = await db.select().from(servicesPageTrust).where(eq(servicesPageTrust.is_active, 1)).limit(1);
        if (rows.length === 0) return NextResponse.json({ error: 'No trust section found' }, { status: 404 });
        return NextResponse.json(rows[0]);
    } catch (error) {
        console.error('Error fetching trust:', error);
        return NextResponse.json({ error: 'Failed to fetch trust section' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { title = '', description = '', quote_text = '', quote_author = '', quote_role = '', quote_image = '', is_active = 1 } = body;
        const res = await db.insert(servicesPageTrust).values({ title, description, quote_text, quote_author, quote_role, quote_image, is_active });
        revalidateTag('services-trust', 'max');
        return NextResponse.json({ success: true, id: res[0].insertId }, { status: 201 });
    } catch (error) {
        console.error('Error creating trust:', error);
        return NextResponse.json({ error: 'Failed to create trust section' }, { status: 500 });
    }
}

export async function PUT(request: NextRequest) {
    try {
        const body = await request.json();
        const { id } = body;
        if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 });
        const update: any = {};
        ['title','description','quote_text','quote_author','quote_role','quote_image','is_active'].forEach(k => { if (body[k] !== undefined) update[k] = body[k]; });
        await db.update(servicesPageTrust).set(update).where(eq(servicesPageTrust.id, id));
        revalidateTag('services-trust', 'max');
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error updating trust:', error);
        return NextResponse.json({ error: 'Failed to update trust section' }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const id = searchParams.get('id');
        if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 });
        await db.delete(servicesPageTrust).where(eq(servicesPageTrust.id, parseInt(id)));
        revalidateTag('services-trust', 'max');
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting trust:', error);
        return NextResponse.json({ error: 'Failed to delete trust section' }, { status: 500 });
    }
}
