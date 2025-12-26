import { NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { contactPageInfo } from '@/db/contactPageSchema';
import { revalidateTag } from 'next/cache';

// GET - Fetch info section
export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const id = searchParams.get('id');

        if (id) {
            const info = await db.select().from(contactPageInfo).where(eq(contactPageInfo.id, parseInt(id))).limit(1);

            if (info.length === 0) {
                return NextResponse.json({ error: 'Info section not found' }, { status: 404 });
            }

            return NextResponse.json(info[0]);
        }

        const info = await db.select().from(contactPageInfo).where(eq(contactPageInfo.is_active, 1)).limit(1);

        if (info.length === 0) {
            return NextResponse.json({ error: 'No active info section found' }, { status: 404 });
        }

        return NextResponse.json(info[0]);
    } catch (error) {
        console.error('Error fetching info section:', error);
        return NextResponse.json({ error: 'Failed to fetch info section' }, { status: 500 });
    }
}

// POST - Create info section
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const {
            office_location,
            phone,
            email,
            map_url,
            map_description,
            info_title,
            info_description,
            phone_item_1_subtext,
            phone_item_2_subtext,
            whatsapp_title,
            whatsapp_subtext,
            location_title,
            opening_hours_title,
            opening_hours_text,
            is_active = 1,
        } = body;

        if (!office_location || !phone || !email || !map_url) {
            return NextResponse.json({ error: 'office_location, phone, email and map_url are required' }, { status: 400 });
        }

        const result = await db.insert(contactPageInfo).values({
            office_location,
            phone,
            email,
            map_url,
            map_description: map_description || undefined,
            info_title: info_title || undefined,
            info_description: info_description || undefined,
            phone_item_1_subtext: phone_item_1_subtext || undefined,
            phone_item_2_subtext: phone_item_2_subtext || undefined,
            whatsapp_title: whatsapp_title || undefined,
            whatsapp_subtext: whatsapp_subtext || undefined,
            location_title: location_title || undefined,
            opening_hours_title: opening_hours_title || undefined,
            opening_hours_text: opening_hours_text || undefined,
            is_active,
        });

        revalidateTag('contact-info', 'max');

        return NextResponse.json(
            { success: true, message: 'Info section created successfully', id: result[0].insertId },
            { status: 201 }
        );
    } catch (error) {
        console.error('Error creating info section:', error);
        return NextResponse.json({ error: 'Failed to create info section' }, { status: 500 });
    }
}

// PUT - Update info section
export async function PUT(request: NextRequest) {
    try {
        const body = await request.json();
        const {
            id,
            office_location,
            phone,
            email,
            map_url,
            map_description,
            info_title,
            info_description,
            phone_item_1_subtext,
            phone_item_2_subtext,
            whatsapp_title,
            whatsapp_subtext,
            location_title,
            opening_hours_title,
            opening_hours_text,
            is_active,
        } = body;

        if (!id) {
            return NextResponse.json({ error: 'ID is required' }, { status: 400 });
        }

        const updateData: any = {};
        if (office_location !== undefined) updateData.office_location = office_location;
        if (phone !== undefined) updateData.phone = phone;
        if (email !== undefined) updateData.email = email;
        if (map_url !== undefined) updateData.map_url = map_url;
        if (info_title !== undefined) updateData.info_title = info_title;
        if (info_description !== undefined) updateData.info_description = info_description;
        if (map_description !== undefined) updateData.map_description = map_description;
        if (phone_item_1_subtext !== undefined) updateData.phone_item_1_subtext = phone_item_1_subtext;
        if (phone_item_2_subtext !== undefined) updateData.phone_item_2_subtext = phone_item_2_subtext;
        if (whatsapp_title !== undefined) updateData.whatsapp_title = whatsapp_title;
        if (whatsapp_subtext !== undefined) updateData.whatsapp_subtext = whatsapp_subtext;
        if (location_title !== undefined) updateData.location_title = location_title;
        if (opening_hours_title !== undefined) updateData.opening_hours_title = opening_hours_title;
        if (opening_hours_text !== undefined) updateData.opening_hours_text = opening_hours_text;
        if (is_active !== undefined) updateData.is_active = is_active;

        await db.update(contactPageInfo).set(updateData).where(eq(contactPageInfo.id, id));

        revalidateTag('contact-info', 'max');

        return NextResponse.json({ success: true, message: 'Info section updated successfully' });
    } catch (error) {
        console.error('Error updating info section:', error);
        return NextResponse.json({ error: 'Failed to update info section' }, { status: 500 });
    }
}

// DELETE - Delete info section
export async function DELETE(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'ID is required' }, { status: 400 });
        }

        await db.delete(contactPageInfo).where(eq(contactPageInfo.id, parseInt(id)));

        revalidateTag('contact-info', 'max');

        return NextResponse.json({ success: true, message: 'Info section deleted successfully' });
    } catch (error) {
        console.error('Error deleting info section:', error);
        return NextResponse.json({ error: 'Failed to delete info section' }, { status: 500 });
    }
}
