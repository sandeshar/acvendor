import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/db';
import { ShopPageCategoryCTA } from '@/db/shopPageSchema';
import { revalidateTag } from 'next/cache';

export async function GET(request: NextRequest) {
    try {
        await connectDB();
        const { searchParams } = new URL(request.url);
        const slug = searchParams.get('category');

        if (!slug) {
            return NextResponse.json({ error: 'Category slug is required' }, { status: 400 });
        }

        const cta = await ShopPageCategoryCTA.findOne({ category_slug: slug }).lean();
        return NextResponse.json(cta || {});
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch category cta' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        await connectDB();
        const body = await request.json();
        const { category_slug, title, description, bullets, button1_text, button1_link, button2_text, button2_link, is_active = 1 } = body;

        if (!category_slug) {
            return NextResponse.json({ error: 'Category slug is required' }, { status: 400 });
        }

        const cta = await ShopPageCategoryCTA.findOneAndUpdate(
            { category_slug },
            { title, description, bullets, button1_text, button1_link, button2_text, button2_link, is_active },
            { upsert: true, new: true }
        );

        try { revalidateTag('category-cta', 'max'); } catch (e) { }

        return NextResponse.json(cta);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to save category cta' }, { status: 500 });
    }
}
