import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { shopPageHero } from '@/db/shopPageSchema';
import { eq } from 'drizzle-orm';
import { revalidateTag } from 'next/cache';

export async function GET() {
    try {
        const rows = await db.select().from(shopPageHero).limit(1);
        return NextResponse.json(rows && rows.length ? rows[0] : {});
    } catch (error) {
        console.error('Error fetching shop hero:', error);
        return NextResponse.json({ error: 'Failed to fetch shop hero' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { tagline = '', title = '', subtitle = '', description = '', cta_text = '', cta_link = '', background_image = '', hero_image_alt = '', is_active = 1 } = body;
        const res: any = await db.insert(shopPageHero).values({ tagline, title, subtitle, description, cta_text, cta_link, background_image, hero_image_alt, is_active });
        revalidateTag('shop-hero', 'max');
        return NextResponse.json({ success: true, id: res[0].insertId }, { status: 201 });
    } catch (error) {
        console.error('Error creating shop hero:', error);
        return NextResponse.json({ error: 'Failed to create shop hero' }, { status: 500 });
    }
}

export async function PUT(request: NextRequest) {
    try {
        const body = await request.json();
        const { id } = body;
        if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 });
        const update: any = {};
        ['tagline', 'title', 'subtitle', 'description', 'cta_text', 'cta_link', 'background_image', 'hero_image_alt', 'is_active'].forEach(k => { if (body[k] !== undefined) update[k] = body[k]; });
        await db.update(shopPageHero).set(update).where(eq(shopPageHero.id, id));
        revalidateTag('shop-hero', 'max');
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error updating shop hero:', error);
        return NextResponse.json({ error: 'Failed to update shop hero' }, { status: 500 });
    }
}