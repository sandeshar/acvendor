import { NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { shopPageBrandHero } from '@/db/shopPageSchema';
import { revalidateTag } from 'next/cache';

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const brand = searchParams.get('brand');

        if (!brand) {
            return NextResponse.json({ error: 'brand query param is required' }, { status: 400 });
        }

        const rows = await db.select().from(shopPageBrandHero).where(eq(shopPageBrandHero.brand_slug, brand)).limit(1);
        if (!rows || rows.length === 0) return NextResponse.json({}, { status: 200 });
        return NextResponse.json(rows[0]);
    } catch (error) {
        console.error('Error fetching brand hero:', error);
        // If table not present or other DB issue, return empty object (non-fatal)
        return NextResponse.json({}, { status: 200 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { brand_slug, badge_text, tagline, title, subtitle, description, cta_text, cta_link, background_image, hero_image_alt, is_active, display_order } = body;
        if (!brand_slug) return NextResponse.json({ error: 'brand_slug is required' }, { status: 400 });

        const res: any = await db.insert(shopPageBrandHero).values({ brand_slug, badge_text: badge_text || '', tagline: tagline || '', title: title || '', subtitle: subtitle || '', description: description || '', cta_text: cta_text || '', cta_link: cta_link || '', background_image: background_image || '', hero_image_alt: hero_image_alt || '', is_active: typeof is_active === 'number' ? is_active : 1, display_order: display_order || 0 });
        try { revalidateTag('shop-brand-hero', 'max'); } catch (e) { }
        return NextResponse.json({ success: true, id: res?.[0]?.insertId });
    } catch (error) {
        console.error('Error creating brand hero:', error);
        return NextResponse.json({ error: 'Failed to create brand hero' }, { status: 500 });
    }
}

export async function PUT(request: NextRequest) {
    try {
        const body = await request.json();
        const { id, brand_slug, badge_text, tagline, title, subtitle, description, cta_text, cta_link, background_image, hero_image_alt, is_active, display_order } = body;
        if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 });

        const updateData: any = {};
        if (brand_slug !== undefined) updateData.brand_slug = brand_slug;
        if (badge_text !== undefined) updateData.badge_text = badge_text;
        if (tagline !== undefined) updateData.tagline = tagline;
        if (title !== undefined) updateData.title = title;
        if (subtitle !== undefined) updateData.subtitle = subtitle;
        if (description !== undefined) updateData.description = description;
        if (cta_text !== undefined) updateData.cta_text = cta_text;
        if (cta_link !== undefined) updateData.cta_link = cta_link;
        if (background_image !== undefined) updateData.background_image = background_image;
        if (hero_image_alt !== undefined) updateData.hero_image_alt = hero_image_alt;
        if (is_active !== undefined) updateData.is_active = is_active;
        if (display_order !== undefined) updateData.display_order = display_order;

        await db.update(shopPageBrandHero).set(updateData).where(eq(shopPageBrandHero.id, id));
        try { revalidateTag('shop-brand-hero', 'max'); } catch (e) { }
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error updating brand hero:', error);
        return NextResponse.json({ error: 'Failed to update brand hero' }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const id = searchParams.get('id');
        if (!id) return NextResponse.json({ error: 'id query param is required' }, { status: 400 });
        await db.delete(shopPageBrandHero).where(eq(shopPageBrandHero.id, parseInt(id)));
        try { revalidateTag('shop-brand-hero', 'max'); } catch (e) { }
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting brand hero:', error);
        return NextResponse.json({ error: 'Failed to delete brand hero' }, { status: 500 });
    }
}