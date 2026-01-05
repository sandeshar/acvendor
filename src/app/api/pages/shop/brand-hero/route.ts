import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/db';
import { ShopPageBrandHero } from '@/db/shopPageSchema';
import { revalidateTag } from 'next/cache';

export async function GET(request: NextRequest) {
    try {
        await connectDB();
        const searchParams = request.nextUrl.searchParams;
        const brand = searchParams.get('brand');

        if (!brand) {
            return NextResponse.json({ error: 'brand query param is required' }, { status: 400 });
        }

        const row = await ShopPageBrandHero.findOne({ brand_slug: brand }).lean();
        if (!row) return NextResponse.json({}, { status: 200 });
        return NextResponse.json({ ...row, id: row._id.toString() });
    } catch (error) {
        console.error('Error fetching brand hero:', error);
        // If table not present or other DB issue, return empty object (non-fatal)
        return NextResponse.json({}, { status: 200 });
    }
}

export async function POST(request: NextRequest) {
    try {
        await connectDB();
        const body = await request.json();
        const { brand_slug, badge_text, tagline, title, highlight_text, subtitle, description, cta_text, cta_link, cta2_text, cta2_link, background_image, hero_image_alt, is_active, display_order } = body;
        if (!brand_slug) return NextResponse.json({ error: 'brand_slug is required' }, { status: 400 });

        const res = await ShopPageBrandHero.create({ brand_slug, badge_text: badge_text || '', tagline: tagline || '', title: title || '', highlight_text: highlight_text || '', subtitle: subtitle || '', description: description || '', cta_text: cta_text || '', cta_link: cta_link || '', cta2_text: cta2_text || '', cta2_link: cta2_link || '', background_image: background_image || '', hero_image_alt: hero_image_alt || '', is_active: typeof is_active === 'number' ? is_active : 1, display_order: display_order || 0 });
        try { revalidateTag('shop-brand-hero', 'max'); } catch (e) { }
        return NextResponse.json({ success: true, id: res._id });
    } catch (error) {
        console.error('Error creating brand hero:', error);
        return NextResponse.json({ error: 'Failed to create brand hero' }, { status: 500 });
    }
}

export async function PUT(request: NextRequest) {
    try {
        await connectDB();
        const body = await request.json();
        const { id, brand_slug, badge_text, tagline, title, highlight_text, subtitle, description, cta_text, cta_link, cta2_text, cta2_link, background_image, hero_image_alt, is_active, display_order } = body;
        if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 });

        const updateData: any = {};
        if (brand_slug !== undefined) updateData.brand_slug = brand_slug;
        if (badge_text !== undefined) updateData.badge_text = badge_text;
        if (tagline !== undefined) updateData.tagline = tagline;
        if (title !== undefined) updateData.title = title;
        if (highlight_text !== undefined) updateData.highlight_text = highlight_text;
        if (subtitle !== undefined) updateData.subtitle = subtitle;
        if (description !== undefined) updateData.description = description;
        if (cta_text !== undefined) updateData.cta_text = cta_text;
        if (cta_link !== undefined) updateData.cta_link = cta_link;
        if (cta2_text !== undefined) updateData.cta2_text = cta2_text;
        if (cta2_link !== undefined) updateData.cta2_link = cta2_link;
        if (background_image !== undefined) updateData.background_image = background_image;
        if (hero_image_alt !== undefined) updateData.hero_image_alt = hero_image_alt;
        if (is_active !== undefined) updateData.is_active = is_active;
        if (display_order !== undefined) updateData.display_order = display_order;

        await ShopPageBrandHero.findByIdAndUpdate(id, updateData, { new: true });
        try { revalidateTag('shop-brand-hero', 'max'); } catch (e) { }
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error updating brand hero:', error);
        return NextResponse.json({ error: 'Failed to update brand hero' }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest) {
    try {
        await connectDB();
        const searchParams = request.nextUrl.searchParams;
        const id = searchParams.get('id');
        if (!id) return NextResponse.json({ error: 'id query param is required' }, { status: 400 });
        await ShopPageBrandHero.findByIdAndDelete(id);
        try { revalidateTag('shop-brand-hero', 'max'); } catch (e) { }
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting brand hero:', error);
        return NextResponse.json({ error: 'Failed to delete brand hero' }, { status: 500 });
    }
}