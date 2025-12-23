import { NextRequest, NextResponse } from 'next/server';
import { eq, asc } from 'drizzle-orm';
import { db } from '@/db';
import { faqCategories } from '@/db/faqPageSchema';
import { revalidateTag } from 'next/cache';

// GET - Fetch categories
export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const id = searchParams.get('id');
        const name = searchParams.get('name');

        if (id) {
            const category = await db.select().from(faqCategories).where(eq(faqCategories.id, parseInt(id))).limit(1);

            if (category.length === 0) {
                return NextResponse.json({ error: 'Category not found' }, { status: 404 });
            }

            return NextResponse.json(category[0]);
        }

        if (name) {
            const category = await db.select().from(faqCategories).where(eq(faqCategories.name, name)).limit(1);

            if (category.length === 0) {
                return NextResponse.json({ error: 'Category not found' }, { status: 404 });
            }

            return NextResponse.json(category[0]);
        }

        const categories = await db.select().from(faqCategories)
            .where(eq(faqCategories.is_active, 1))
            .orderBy(asc(faqCategories.display_order));

        return NextResponse.json(categories);
    } catch (error) {
        console.error('Error fetching categories:', error);
        return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
    }
}

// POST - Create category
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { name, display_order, is_active = 1 } = body;

        if (!name || display_order === undefined) {
            return NextResponse.json({ error: 'Name and display_order are required' }, { status: 400 });
        }

        const result = await db.insert(faqCategories).values({ name, display_order, is_active });

        revalidateTag('faq-categories', 'max');

        return NextResponse.json(
            { success: true, message: 'Category created successfully', id: result[0].insertId },
            { status: 201 }
        );
    } catch (error: any) {
        console.error('Error creating category:', error);

        if (error.code === 'ER_DUP_ENTRY') {
            return NextResponse.json({ error: 'A category with this name already exists' }, { status: 409 });
        }

        return NextResponse.json({ error: 'Failed to create category' }, { status: 500 });
    }
}

// PUT - Update category
export async function PUT(request: NextRequest) {
    try {
        const body = await request.json();
        const { id, name, display_order, is_active } = body;

        if (!id) {
            return NextResponse.json({ error: 'ID is required' }, { status: 400 });
        }

        const updateData: any = {};
        if (name !== undefined) updateData.name = name;
        if (display_order !== undefined) updateData.display_order = display_order;
        if (is_active !== undefined) updateData.is_active = is_active;

        await db.update(faqCategories).set(updateData).where(eq(faqCategories.id, id));

        revalidateTag('faq-categories', 'max');

        return NextResponse.json({ success: true, message: 'Category updated successfully' });
    } catch (error: any) {
        console.error('Error updating category:', error);

        if (error.code === 'ER_DUP_ENTRY') {
            return NextResponse.json({ error: 'A category with this name already exists' }, { status: 409 });
        }

        return NextResponse.json({ error: 'Failed to update category' }, { status: 500 });
    }
}

// DELETE - Delete category
export async function DELETE(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'ID is required' }, { status: 400 });
        }

        await db.delete(faqCategories).where(eq(faqCategories.id, parseInt(id)));

        revalidateTag('faq-categories', 'max');

        return NextResponse.json({ success: true, message: 'Category deleted successfully' });
    } catch (error) {
        console.error('Error deleting category:', error);
        return NextResponse.json({ error: 'Failed to delete category' }, { status: 500 });
    }
}
