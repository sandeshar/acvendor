import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/db';
import { ShopPageCTA } from '@/db/shopPageSchema';
import { revalidateTag } from 'next/cache';

export async function GET() {
    try {
        await connectDB();
        const cta = await ShopPageCTA.findOne().lean();
        return NextResponse.json(cta || {});
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch shop cta' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        await connectDB();
        const body = await request.json();
        const { title, description, bullets, button_text, button_link, button1_text, button1_link, button2_text, button2_link, is_active = 1 } = body;

        const cta = await ShopPageCTA.findOneAndUpdate(
            {},
            { title, description, bullets, button_text, button_link, button1_text, button1_link, button2_text, button2_link, is_active },
            { upsert: true, new: true }
        );

        try { revalidateTag('shop-cta', 'max'); } catch (e) { }

        return NextResponse.json(cta);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to save shop cta' }, { status: 500 });
    }
}
