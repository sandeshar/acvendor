import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/db';
import { FAQItems } from '@/db/faqPageSchema';
import { revalidateTag } from 'next/cache';

// GET - Fetch FAQ items
export async function GET(request: NextRequest) {
    try {
        await connectDB();
        const searchParams = request.nextUrl.searchParams;
        const id = searchParams.get('id');
        const category_id = searchParams.get('category_id');

        if (id) {
            const item = await FAQItems.findById(id).lean();

            if (!item) {
                return NextResponse.json({ error: 'FAQ item not found' }, { status: 404 });
            }

            return NextResponse.json({ ...item, id: item._id.toString() });
        }

        let items;

        if (category_id) {
            items = await FAQItems.find({ is_active: 1, category_id }).sort({ display_order: 1 }).lean();
        } else {
            items = await FAQItems.find({ is_active: 1 }).sort({ display_order: 1 }).lean();
        }

        const formattedItems = items.map((item: any) => ({
            ...item,
            id: item._id.toString()
        }));

        return NextResponse.json(formattedItems);
    } catch (error) {
        console.error('Error fetching FAQ items:', error);
        return NextResponse.json({ error: 'Failed to fetch FAQ items' }, { status: 500 });
    }
}

// POST - Create FAQ item
export async function POST(request: NextRequest) {
    try {
        await connectDB();
        const body = await request.json();
        const { category_id, question, answer, display_order, is_active = 1 } = body;

        if (category_id === undefined || !question || !answer || display_order === undefined) {
            return NextResponse.json(
                { error: 'Category_id, question, answer, and display_order are required' },
                { status: 400 }
            );
        }

        const result = await FAQItems.create({
            category_id,
            question,
            answer,
            display_order,
            is_active,
        });

        revalidateTag('faq-items', 'max');

        return NextResponse.json(
            { success: true, message: 'FAQ item created successfully', id: result._id },
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
        await connectDB();
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

        await FAQItems.findByIdAndUpdate(id, updateData, { new: true });

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
        await connectDB();
        const searchParams = request.nextUrl.searchParams;
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'ID is required' }, { status: 400 });
        }

        await FAQItems.findByIdAndDelete(id);

        revalidateTag('faq-items', 'max');

        return NextResponse.json({ success: true, message: 'FAQ item deleted successfully' });
    } catch (error) {
        console.error('Error deleting FAQ item:', error);
        return NextResponse.json({ error: 'Failed to delete FAQ item' }, { status: 500 });
    }
}
