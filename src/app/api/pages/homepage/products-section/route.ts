import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/db';
import { HomepageProductsSection } from '@/db/homepageSchema';
import { revalidateTag } from 'next/cache';

// GET - Fetch products section
export async function GET(request: NextRequest) {
    try {
        await connectDB();
        const searchParams = request.nextUrl.searchParams;
        const id = searchParams.get('id');

        if (id) {
            const section = await HomepageProductsSection.findById(id).lean();

            if (!section) {
                return NextResponse.json({ error: 'Products section not found' }, { status: 404 });
            }

            return NextResponse.json(section);
        }

        const section = await HomepageProductsSection.findOne({ is_active: 1 }).lean();

        if (!section) {
            // Return empty object to allow admin UI to create new entry
            return NextResponse.json({});
        }

        return NextResponse.json(section);
    } catch (error) {
        console.error('Error fetching products section:', error);
        return NextResponse.json({ error: 'Failed to fetch products section' }, { status: 500 });
    }
}

// POST - Create products section
export async function POST(request: NextRequest) {
    try {
        await connectDB();
        const body = await request.json();
        const { title, description, is_active = 1 } = body;

        if (!title || !description) {
            return NextResponse.json({ error: 'Title and description are required' }, { status: 400 });
        }

        const result = await HomepageProductsSection.create({ title, description, is_active });
        revalidateTag('homepage-products-section', 'max');
        return NextResponse.json(
            { success: true, message: 'Products section created successfully', id: result._id },
            { status: 201 }
        );
    } catch (error) {
        console.error('Error creating products section:', error);
        return NextResponse.json({ error: 'Failed to create products section' }, { status: 500 });
    }
}

// PUT - Update products section
export async function PUT(request: NextRequest) {
    try {
        await connectDB();
        const body = await request.json();
        const { id, title, description, is_active } = body;

        if (!id) {
            return NextResponse.json({ error: 'ID is required' }, { status: 400 });
        }

        const updateData: any = {};
        if (title !== undefined) updateData.title = title;
        if (description !== undefined) updateData.description = description;
        if (is_active !== undefined) updateData.is_active = is_active;

        await HomepageProductsSection.findByIdAndUpdate(id, updateData, { new: true });
        revalidateTag('homepage-products-section', 'max');

        return NextResponse.json({ success: true, message: 'Products section updated successfully' });
    } catch (error) {
        console.error('Error updating products section:', error);
        return NextResponse.json({ error: 'Failed to update products section' }, { status: 500 });
    }
}

// DELETE - Delete products section
export async function DELETE(request: NextRequest) {
    try {
        await connectDB();
        const searchParams = request.nextUrl.searchParams;
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'ID is required' }, { status: 400 });
        }

        await HomepageProductsSection.findByIdAndDelete(id);
        revalidateTag('homepage-products-section', 'max');

        return NextResponse.json({ success: true, message: 'Products section deleted successfully' });
    } catch (error) {
        console.error('Error deleting products section:', error);
        return NextResponse.json({ error: 'Failed to delete products section' }, { status: 500 });
    }
}
