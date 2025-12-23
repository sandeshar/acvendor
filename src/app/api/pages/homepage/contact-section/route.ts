import { NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { homepageContactSection } from '@/db/homepageSchema';
import { revalidateTag } from 'next/cache';

// GET - Fetch contact section
export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const id = searchParams.get('id');

        if (id) {
            const section = await db.select().from(homepageContactSection).where(eq(homepageContactSection.id, parseInt(id))).limit(1);

            if (section.length === 0) {
                return NextResponse.json({ error: 'Contact section not found' }, { status: 404 });
            }

            return NextResponse.json(section[0]);
        }

        const section = await db.select().from(homepageContactSection).where(eq(homepageContactSection.is_active, 1)).limit(1);

        if (section.length === 0) {
            // Return empty object to allow admin UI to create new entry
            return NextResponse.json({});
        }

        return NextResponse.json(section[0]);
    } catch (error) {
        console.error('Error fetching contact section:', error);
        return NextResponse.json({ error: 'Failed to fetch contact section' }, { status: 500 });
    }
}

// POST - Create contact section
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { title, description, name_placeholder, email_placeholder, phone_placeholder, service_placeholder, message_placeholder, submit_button_text, is_active = 1 } = body;

        if (!title || !description || !name_placeholder || !email_placeholder || !service_placeholder || !message_placeholder || !submit_button_text) {
            return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
        }

        const result = await db.insert(homepageContactSection).values({
            title,
            description,
            name_placeholder,
            email_placeholder,
            phone_placeholder: phone_placeholder || null,
            service_placeholder,
            message_placeholder,
            submit_button_text,
            is_active,
        });
        revalidateTag('homepage-contact-section', 'max');

        return NextResponse.json(
            { success: true, message: 'Contact section created successfully', id: result[0].insertId },
            { status: 201 }
        );
    } catch (error) {
        console.error('Error creating contact section:', error);
        return NextResponse.json({ error: 'Failed to create contact section' }, { status: 500 });
    }
}

// PUT - Update contact section
export async function PUT(request: NextRequest) {
    try {
        const body = await request.json();
        const { id, title, description, name_placeholder, email_placeholder, phone_placeholder, service_placeholder, message_placeholder, submit_button_text, is_active } = body;

        if (!id) {
            return NextResponse.json({ error: 'ID is required' }, { status: 400 });
        }

        const updateData: any = {};
        if (title !== undefined) updateData.title = title;
        if (description !== undefined) updateData.description = description;
        if (name_placeholder !== undefined) updateData.name_placeholder = name_placeholder;
        if (email_placeholder !== undefined) updateData.email_placeholder = email_placeholder;
        if (phone_placeholder !== undefined) updateData.phone_placeholder = phone_placeholder;
        if (service_placeholder !== undefined) updateData.service_placeholder = service_placeholder;
        if (message_placeholder !== undefined) updateData.message_placeholder = message_placeholder;
        if (submit_button_text !== undefined) updateData.submit_button_text = submit_button_text;
        if (is_active !== undefined) updateData.is_active = is_active;

        await db.update(homepageContactSection).set(updateData).where(eq(homepageContactSection.id, id));
        revalidateTag('homepage-contact-section', 'max');
        return NextResponse.json({ success: true, message: 'Contact section updated successfully' });
    } catch (error) {
        console.error('Error updating contact section:', error);
        return NextResponse.json({ error: 'Failed to update contact section' }, { status: 500 });
    }
}

// DELETE - Delete contact section
export async function DELETE(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'ID is required' }, { status: 400 });
        }

        await db.delete(homepageContactSection).where(eq(homepageContactSection.id, parseInt(id)));
        revalidateTag('homepage-contact-section', 'max');

        return NextResponse.json({ success: true, message: 'Contact section deleted successfully' });
    } catch (error) {
        console.error('Error deleting contact section:', error);
        return NextResponse.json({ error: 'Failed to delete contact section' }, { status: 500 });
    }
}
