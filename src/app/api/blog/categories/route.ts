import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/db';
import { BlogCategories } from '@/db/blogCategoriesSchema';

export async function GET(request: NextRequest) {
    try {
        await connectDB();
        const slug = request.nextUrl.searchParams.get('slug');
        if (slug) {
            const cat = await BlogCategories.findOne({ slug }).lean();
            if (!cat) return NextResponse.json(null);
            return NextResponse.json({ ...cat, id: cat._id.toString() });
        }

        const categories = await BlogCategories.find().sort({ display_order: 1 }).lean();
        return NextResponse.json(categories.map((c: any) => ({ ...c, id: c._id.toString() })));
    } catch (error) {
        console.error('Error fetching blog categories:', error);
        return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        await connectDB();
        const body = await request.json();
        const { name, slug, description, thumbnail, display_order, is_active, meta_title, meta_description } = body;

        if (!name || !slug) return NextResponse.json({ error: 'Name and slug are required' }, { status: 400 });

        const result = await BlogCategories.create({
            name,
            slug,
            description: description || null,
            thumbnail: thumbnail || null,
            display_order: display_order || 0,
            is_active: is_active === 0 ? 0 : 1,
            meta_title: meta_title || null,
            meta_description: meta_description || null,
        });

        return NextResponse.json({ id: result._id, message: 'Category created successfully' });
    } catch (error) {
        console.error('Error creating blog category:', error);
        return NextResponse.json({ error: 'Failed to create category' }, { status: 500 });
    }
}

export async function PUT(request: NextRequest) {
    try {
        await connectDB();
        const body = await request.json();
        const { id, name, slug, description, thumbnail, display_order, is_active, meta_title, meta_description } = body;

        if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 });

        await BlogCategories.findByIdAndUpdate(id, {
            name,
            slug,
            description: description || null,
            thumbnail: thumbnail || null,
            display_order: display_order || 0,
            is_active: is_active === 0 ? 0 : 1,
            meta_title: meta_title || null,
            meta_description: meta_description || null,
            updatedAt: new Date(),
        }, { new: true });

        return NextResponse.json({ message: 'Category updated successfully' });
    } catch (error) {
        console.error('Error updating blog category:', error);
        return NextResponse.json({ error: 'Failed to update category' }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest) {
    try {
        await connectDB();
        const body = await request.json();
        const { id } = body;

        if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 });

        await BlogCategories.findByIdAndDelete(id);
        return NextResponse.json({ message: 'Category deleted successfully' });
    } catch (error) {
        console.error('Error deleting blog category:', error);
        return NextResponse.json({ error: 'Failed to delete category' }, { status: 500 });
    }
}
