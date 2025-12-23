import { NextRequest, NextResponse } from 'next/server';
import { eq, asc, and } from 'drizzle-orm';
import { db } from '@/db';
import { faqItems } from '@/db/faqPageSchema';
import { revalidateTag } from 'next/cache';

// GET - Fetch FAQ items
export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const id = searchParams.get('id');
        const category_id = searchParams.get('category_id');

        if (id) {
            const item = await db.select().from(faqItems).where(eq(faqItems.id, parseInt(id))).limit(1);

            if (item.length === 0) {
                return NextResponse.json({ error: 'FAQ item not found' }, { status: 404 });
            }

            return NextResponse.json(item[0]);
        }

        let items;

        if (category_id) {
            items = await db.select().from(faqItems)
                .where(and(
                    eq(faqItems.is_active, 1),
                    eq(faqItems.category_id, parseInt(category_id))
                ))
                .orderBy(asc(faqItems.display_order));
        } else {
            items = await db.select().from(faqItems)
                .where(eq(faqItems.is_active, 1))
                .orderBy(asc(faqItems.display_order));
        }

        return NextResponse.json(items);
    } catch (error) {
        console.error('Error fetching FAQ items:', error);
        return NextResponse.json({ error: 'Failed to fetch FAQ items' }, { status: 500 });
    }
}

// POST - Create FAQ item
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { category_id, question, answer, display_order, is_active = 1 } = body;

        if (category_id === undefined || !question || !answer || display_order === undefined) {
            return NextResponse.json(
                { error: 'Category_id, question, answer, and display_order are required' },
                { status: 400 }
            );
        }

        const result = await db.insert(faqItems).values({
            category_id,
            question,
            answer,
            display_order,
            is_active,
        });

        revalidateTag('faq-items', 'max');

        return NextResponse.json(
            { success: true, message: 'FAQ item created successfully', id: result[0].insertId },
            { status: 201 }
        );
    } catch (error) {
        console.error('Error creating FAQ item:', error);
        return NextResponse.json({ error: 'Failed to create FAQ item' }, { status: 500 });
    }
}

// PUT - Update FAQ item
export async function PUT(request: NextRequest) {
    try {
        const body = await request.json();
        const { id, category_id, question, answer, display_order, is_active } = body;

        if (!id) {
            return NextResponse.json({ error: 'ID is required' }, { status: 400 });
        }

        const updateData: any = {};
        if (category_id !== undefined) updateData.category_id = category_id;
        if (question !== undefined) updateData.question = question;
        if (answer !== undefined) updateData.answer = answer;
        if (display_order !== undefined) updateData.display_order = display_order;
        if (is_active !== undefined) updateData.is_active = is_active;

        await db.update(faqItems).set(updateData).where(eq(faqItems.id, id));

        revalidateTag('faq-items', 'max');

        return NextResponse.json({ success: true, message: 'FAQ item updated successfully' });
    } catch (error) {
        console.error('Error updating FAQ item:', error);
        return NextResponse.json({ error: 'Failed to update FAQ item' }, { status: 500 });
    }
}

// DELETE - Delete FAQ item
export async function DELETE(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'ID is required' }, { status: 400 });
        }

        await db.delete(faqItems).where(eq(faqItems.id, parseInt(id)));

        revalidateTag('faq-items', 'max');

        return NextResponse.json({ success: true, message: 'FAQ item deleted successfully' });
    } catch (error) {
        console.error('Error deleting FAQ item:', error);
        return NextResponse.json({ error: 'Failed to delete FAQ item' }, { status: 500 });
    }
}
