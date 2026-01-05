import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/db';
import { ShopPageHero } from '@/db/shopPageSchema';
import { revalidateTag } from 'next/cache';

export async function GET() {
    try {
        await connectDB();
        const row = await ShopPageHero.findOne().lean();
        if (!row) return NextResponse.json({});
        return NextResponse.json({ ...row, id: row._id.toString() });
    } catch (error) {
        console.error('Error fetching shop hero:', error);
        const e: any = error;
        // Gracefully handle missing table (e.g., local dev DB not seeded)
        if (e?.cause?.code === 'ER_NO_SUCH_TABLE' || e?.code === 'ER_NO_SUCH_TABLE' || e?.errno === 1146) {
            // eslint-disable-next-line no-console
            console.warn('Shop hero table missing - returning empty hero object');
            return NextResponse.json({});
        }
        return NextResponse.json({ error: 'Failed to fetch shop hero' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        await connectDB();
        const body = await request.json();
        const { badge_text = '', tagline = '', title = '', highlight_text = '', subtitle = '', description = '', cta_text = '', cta_link = '', cta2_text = '', cta2_link = '', background_image = '', hero_image_alt = '', is_active = 1 } = body;
        const res = await ShopPageHero.create({ badge_text, tagline, title, highlight_text, subtitle, description, cta_text, cta_link, cta2_text, cta2_link, background_image, hero_image_alt, is_active });
        revalidateTag('shop-hero', 'max');
        return NextResponse.json({ success: true, id: res._id }, { status: 201 });
    } catch (error) {
        console.error('Error creating shop hero:', error);
        return NextResponse.json({ error: 'Failed to create shop hero' }, { status: 500 });
    }
}

export async function PUT(request: NextRequest) {
    try {
        await connectDB();
        const body = await request.json();
        const { id } = body;
        if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 });
        const update: any = {};
        ['badge_text', 'tagline', 'title', 'highlight_text', 'subtitle', 'description', 'cta_text', 'cta_link', 'cta2_text', 'cta2_link', 'background_image', 'hero_image_alt', 'is_active'].forEach(k => { if (body[k] !== undefined) update[k] = body[k]; });
        await ShopPageHero.findByIdAndUpdate(id, update, { new: true });
        revalidateTag('shop-hero', 'max');
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error updating shop hero:', error);
        return NextResponse.json({ error: 'Failed to update shop hero' }, { status: 500 });
    }
}