import { NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { contactPageFormConfig } from '@/db/contactPageSchema';
import { revalidateTag } from 'next/cache';

// GET - Fetch form config
export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const id = searchParams.get('id');

        if (id) {
            const config = await db.select().from(contactPageFormConfig).where(eq(contactPageFormConfig.id, parseInt(id))).limit(1);

            if (config.length === 0) {
                return NextResponse.json({ error: 'Form config not found' }, { status: 404 });
            }

            return NextResponse.json(config[0]);
        }

        const config = await db.select().from(contactPageFormConfig).where(eq(contactPageFormConfig.is_active, 1)).limit(1);

        if (config.length === 0) {
            return NextResponse.json({ error: 'No active form config found' }, { status: 404 });
        }

        return NextResponse.json(config[0]);
    } catch (error) {
        console.error('Error fetching form config:', error);
        return NextResponse.json({ error: 'Failed to fetch form config' }, { status: 500 });
    }
}

// POST - Create form config
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { name_placeholder, email_placeholder, phone_placeholder, subject_placeholder, service_placeholder, message_placeholder, submit_button_text, success_message, is_active = 1 } = body;

        if (!name_placeholder || !email_placeholder || !subject_placeholder || !service_placeholder || !message_placeholder || !submit_button_text || !success_message) {
            return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
        }

        const result = await db.insert(contactPageFormConfig).values({
            name_placeholder,
            email_placeholder,
            phone_placeholder: phone_placeholder || null,
            subject_placeholder,
            service_placeholder,
            message_placeholder,
            submit_button_text,
            success_message,
            is_active,
        });

        revalidateTag('contact-form-config', 'max');

        return NextResponse.json(
            { success: true, message: 'Form config created successfully', id: result[0].insertId },
            { status: 201 }
        );
    } catch (error) {
        console.error('Error creating form config:', error);
        return NextResponse.json({ error: 'Failed to create form config' }, { status: 500 });
    }
}

// PUT - Update form config
export async function PUT(request: NextRequest) {
    try {
        const body = await request.json();
        const { id, name_placeholder, email_placeholder, phone_placeholder, subject_placeholder, service_placeholder, message_placeholder, submit_button_text, success_message, is_active } = body;

        if (!id) {
            return NextResponse.json({ error: 'ID is required' }, { status: 400 });
        }

        const updateData: any = {};
        if (name_placeholder !== undefined) updateData.name_placeholder = name_placeholder;
        if (email_placeholder !== undefined) updateData.email_placeholder = email_placeholder;
        if (phone_placeholder !== undefined) updateData.phone_placeholder = phone_placeholder;
        if (subject_placeholder !== undefined) updateData.subject_placeholder = subject_placeholder;
        if (service_placeholder !== undefined) updateData.service_placeholder = service_placeholder;
        if (message_placeholder !== undefined) updateData.message_placeholder = message_placeholder;
        if (submit_button_text !== undefined) updateData.submit_button_text = submit_button_text;
        if (success_message !== undefined) updateData.success_message = success_message;
        if (is_active !== undefined) updateData.is_active = is_active;

        await db.update(contactPageFormConfig).set(updateData).where(eq(contactPageFormConfig.id, id));

        revalidateTag('contact-form-config', 'max');

        return NextResponse.json({ success: true, message: 'Form config updated successfully' });
    } catch (error) {
        console.error('Error updating form config:', error);
        return NextResponse.json({ error: 'Failed to update form config' }, { status: 500 });
    }
}

// DELETE - Delete form config
export async function DELETE(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'ID is required' }, { status: 400 });
        }

        await db.delete(contactPageFormConfig).where(eq(contactPageFormConfig.id, parseInt(id)));

        revalidateTag('contact-form-config', 'max');

        return NextResponse.json({ success: true, message: 'Form config deleted successfully' });
    } catch (error) {
        console.error('Error deleting form config:', error);
        return NextResponse.json({ error: 'Failed to delete form config' }, { status: 500 });
    }
}
