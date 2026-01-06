import { NextRequest, NextResponse } from 'next/server';

import { connectDB } from '@/db';
import { ContactPageInfo } from '@/db/contactPageSchema';
import { revalidateTag } from 'next/cache';

// GET - Fetch info section
export async function GET(request: NextRequest) {
    try {
        await connectDB();
        const searchParams = request.nextUrl.searchParams;
        const id = searchParams.get('id');

        if (id) {
            const info = await ContactPageInfo.findById(id).lean();

            if (!info) {
                return NextResponse.json({ error: 'Info section not found' }, { status: 404 });
            }

            return NextResponse.json({ ...info, id: info._id.toString() });
        }

        const info = await ContactPageInfo.findOne({ is_active: 1 }).lean();

        if (!info) {
            return NextResponse.json({ error: 'No active info section found' }, { status: 404 });
        }

        return NextResponse.json({ ...info, id: info._id.toString() });
    } catch (error) {
        console.error('Error fetching info section:', error);
        return NextResponse.json({ error: 'Failed to fetch info section' }, { status: 500 });
    }
}

// POST - Create info section
export async function POST(request: NextRequest) {
    try {
        await connectDB();
        const body = await request.json();
        const {
            office_location,
            phone,
            phone_item_1_number = '',
            phone_item_2_number = '',
            email,
            whatsapp_number = '',
            whatsapp_link = '',
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

        const whatsapp_number_clean = String(whatsapp_number || '').replace(/\D/g, '');

        const result = await ContactPageInfo.create({
            office_location,
            phone,
            phone_item_1_number,
            phone_item_2_number,
            email,
            whatsapp_number: whatsapp_number_clean,
            whatsapp_link,
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

        try { revalidateTag('contact-info'); } catch (e) { /* ignore */ }

        const data = { ...result.toObject(), id: result._id.toString() };
        return NextResponse.json(
            { success: true, message: 'Info section created successfully', data },
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
        await connectDB();
        const body = await request.json();
        const {
            id,
            office_location,
            phone,
            phone_item_1_number,
            phone_item_2_number,
            email,
            whatsapp_number,
            whatsapp_link,
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

        // Normalize incoming whatsapp number if present
        let whatsapp_number_clean: string | undefined = undefined;
        if (whatsapp_number !== undefined) {
            whatsapp_number_clean = String(whatsapp_number || '').replace(/\D/g, '');
        }

        if (!id) {
            return NextResponse.json({ error: 'ID is required' }, { status: 400 });
        }

        const updateData: any = {};
        if (office_location !== undefined) updateData.office_location = office_location;
        if (phone !== undefined) updateData.phone = phone;
        if (phone_item_1_number !== undefined) updateData.phone_item_1_number = phone_item_1_number;
        if (phone_item_2_number !== undefined) updateData.phone_item_2_number = phone_item_2_number;
        if (email !== undefined) updateData.email = email;
        if (whatsapp_number !== undefined) updateData.whatsapp_number = whatsapp_number_clean !== undefined ? whatsapp_number_clean : String(whatsapp_number);
        if (whatsapp_link !== undefined) updateData.whatsapp_link = whatsapp_link;
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

        const updated = await ContactPageInfo.findByIdAndUpdate(id, updateData, { new: true }).lean();

        if (!updated) {
            return NextResponse.json({ error: 'Info section not found' }, { status: 404 });
        }

        try { revalidateTag('contact-info'); } catch (e) { /* ignore */ }

        const data = { ...updated, id: updated._id?.toString?.() ?? id };
        return NextResponse.json({ success: true, message: 'Info section updated successfully', data });
    } catch (error) {
        console.error('Error updating info section:', error);
        const msg = error instanceof Error ? error.message : String(error);
        return NextResponse.json({ error: msg || 'Failed to update info section' }, { status: 500 });
    }
}

// DELETE - Delete info section
export async function DELETE(request: NextRequest) {
    try {
        await connectDB();
        const searchParams = request.nextUrl.searchParams;
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'ID is required' }, { status: 400 });
        }

        await ContactPageInfo.findByIdAndDelete(id);

        try { revalidateTag('contact-info'); } catch (e) { /* ignore */ }

        return NextResponse.json({ success: true, message: 'Info section deleted successfully' });
    } catch (error) {
        console.error('Error deleting info section:', error);
        return NextResponse.json({ error: 'Failed to delete info section' }, { status: 500 });
    }
}
