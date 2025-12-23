import { NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { faqPageCTA } from '@/db/faqPageSchema';
import { revalidateTag } from 'next/cache';

// GET - Fetch CTA section
export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const id = searchParams.get('id');

        if (id) {
            const cta = await db.select().from(faqPageCTA).where(eq(faqPageCTA.id, parseInt(id))).limit(1);

            if (cta.length === 0) {
                return NextResponse.json({ error: 'CTA section not found' }, { status: 404 });
            }

            return NextResponse.json(cta[0]);
        }

        const cta = await db.select().from(faqPageCTA).where(eq(faqPageCTA.is_active, 1)).limit(1);

        if (cta.length === 0) {
            return NextResponse.json({ error: 'No active CTA section found' }, { status: 404 });
        }

        return NextResponse.json(cta[0]);
    } catch (error) {
        console.error('Error fetching CTA section:', error);
        return NextResponse.json({ error: 'Failed to fetch CTA section' }, { status: 500 });
    }
}

// POST - Create CTA section
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { title, description, button_text, button_link, is_active = 1 } = body;

        if (!title || !description || !button_text || !button_link) {
            return NextResponse.json({ error: 'Title, description, button_text, and button_link are required' }, { status: 400 });
        }

        const result = await db.insert(faqPageCTA).values({ title, description, button_text, button_link, is_active });

        revalidateTag('faq-cta', 'max');

        return NextResponse.json(
            { success: true, message: 'CTA section created successfully', id: result[0].insertId },
            { status: 201 }
        );
    } catch (error) {
        console.error('Error creating CTA section:', error);
        return NextResponse.json({ error: 'Failed to create CTA section' }, { status: 500 });
    }
}

// PUT - Update CTA section
export async function PUT(request: NextRequest) {
    try {
        const body = await request.json();
        const { id, title, description, button_text, button_link, is_active } = body;

        if (!id) {
            return NextResponse.json({ error: 'ID is required' }, { status: 400 });
        }

        const updateData: any = {};
        if (title !== undefined) updateData.title = title;
        if (description !== undefined) updateData.description = description;
        if (button_text !== undefined) updateData.button_text = button_text;
        if (button_link !== undefined) updateData.button_link = button_link;
        if (is_active !== undefined) updateData.is_active = is_active;

        await db.update(faqPageCTA).set(updateData).where(eq(faqPageCTA.id, id));

        revalidateTag('faq-cta', 'max');

        return NextResponse.json({ success: true, message: 'CTA section updated successfully' });
    } catch (error) {
        console.error('Error updating CTA section:', error);
        return NextResponse.json({ error: 'Failed to update CTA section' }, { status: 500 });
    }
}

// DELETE - Delete CTA section
export async function DELETE(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'ID is required' }, { status: 400 });
        }

        await db.delete(faqPageCTA).where(eq(faqPageCTA.id, parseInt(id)));

        revalidateTag('faq-cta', 'max');

        return NextResponse.json({ success: true, message: 'CTA section deleted successfully' });
    } catch (error) {
        console.error('Error deleting CTA section:', error);
        return NextResponse.json({ error: 'Failed to delete CTA section' }, { status: 500 });
    }
}
