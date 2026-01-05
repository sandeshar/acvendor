import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/db';
import { FAQCategories } from '@/db/faqPageSchema';
import { revalidateTag } from 'next/cache';

// GET - Fetch categories
export async function GET(request: NextRequest) {
    try {
        await connectDB();
        const searchParams = request.nextUrl.searchParams;
        const id = searchParams.get('id');
        const name = searchParams.get('name');

        if (id) {
            const category = await FAQCategories.findById(id).lean();

            if (!category) {
                return NextResponse.json({ error: 'Category not found' }, { status: 404 });
            }

            return NextResponse.json({ ...category, id: category._id.toString() });
        }

        if (name) {
            const category = await FAQCategories.findOne({ name }).lean();

            if (!category) {
                return NextResponse.json({ error: 'Category not found' }, { status: 404 });
            }

            return NextResponse.json({ ...category, id: category._id.toString() });
        }

        const categories = await FAQCategories.find({ is_active: 1 }).sort({ display_order: 1 }).lean();

        const formattedCategories = categories.map((cat: any) => ({
            ...cat,
            id: cat._id.toString()
        }));

        return NextResponse.json(formattedCategories);
    } catch (error) {
        console.error('Error fetching categories:', error);
        return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
    }
}

// POST - Create category
export async function POST(request: NextRequest) {
    try {
        await connectDB();
        const body = await request.json();
        const { name, display_order, is_active = 1 } = body;

        if (!name || display_order === undefined) {
            return NextResponse.json({ error: 'Name and display_order are required' }, { status: 400 });
        }

        const result = await FAQCategories.create({ name, display_order, is_active });

        revalidateTag('faq-categories', 'max');

        return NextResponse.json(
            { success: true, message: 'Category created successfully', id: result._id },
            { status: 201 }
        );
    } catch (error: any) {
        console.error('Error creating category:', error);

        if (error.code === 11000) {
            return NextResponse.json({ error: 'A category with this name already exists' }, { status: 409 });
        }

        return NextResponse.json({ error: 'Failed to create category' }, { status: 500 });
    }
}

// PUT - Update category
export async function PUT(request: NextRequest) {
    try {
        await connectDB();
        const body = await request.json();
        const { id, name, display_order, is_active } = body;

        if (!id) {
            return NextResponse.json({ error: 'ID is required' }, { status: 400 });
        }

        const updateData: any = {};
        if (name !== undefined) updateData.name = name;
        if (display_order !== undefined) updateData.display_order = display_order;
        if (is_active !== undefined) updateData.is_active = is_active;

        await FAQCategories.findByIdAndUpdate(id, updateData, { new: true });

        revalidateTag('faq-categories', 'max');

        return NextResponse.json({ success: true, message: 'Category updated successfully' });
    } catch (error: any) {
        console.error('Error updating category:', error);

        if (error.code === 11000) {
            return NextResponse.json({ error: 'A category with this name already exists' }, { status: 409 });
        }

        return NextResponse.json({ error: 'Failed to update category' }, { status: 500 });
    }
}

// DELETE - Delete category
export async function DELETE(request: NextRequest) {
    try {
        await connectDB();
        const searchParams = request.nextUrl.searchParams;
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'ID is required' }, { status: 400 });
        }

        await FAQCategories.findByIdAndDelete(id);

        revalidateTag('faq-categories', 'max');

        return NextResponse.json({ success: true, message: 'Category deleted successfully' });
    } catch (error) {
        console.error('Error deleting category:', error);
        return NextResponse.json({ error: 'Failed to delete category' }, { status: 500 });
    }
}
