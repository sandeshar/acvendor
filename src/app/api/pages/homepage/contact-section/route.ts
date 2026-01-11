import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/db';
import { HomepageContactSection } from '@/db/homepageSchema';
import { revalidateTag } from 'next/cache';

// GET - Fetch contact section
export async function GET(request: NextRequest) {
    try {
        await connectDB();
        const searchParams = request.nextUrl.searchParams;
        const id = searchParams.get('id');

        if (id) {
            const section = await HomepageContactSection.findById(id).lean();

            if (!section) {
                return NextResponse.json({ error: 'Contact section not found' }, { status: 404 });
            }

            return NextResponse.json(section);
        }

        const section = await HomepageContactSection.findOne({ is_active: 1 }).lean();

        if (!section) {
            // Return empty object to allow admin UI to create new entry
            return NextResponse.json({});
        }

        return NextResponse.json(section);
    } catch (error) {
        console.error('Error fetching contact section:', error);
        return NextResponse.json({ error: 'Failed to fetch contact section' }, { status: 500 });
    }
}

// POST - Create contact section
export async function POST(request: NextRequest) {
    try {
        await connectDB();
        const body = await request.json();
        const { title, description, about_heading, about_paragraph, name_placeholder, email_placeholder, phone_placeholder, service_placeholder, message_placeholder, submit_button_text, is_active = 1 } = body;

        if (!title || !description || !name_placeholder || !email_placeholder || !service_placeholder || !message_placeholder || !submit_button_text) {
            return NextResponse.json({ error: 'All required fields are required' }, { status: 400 });
        }

        const result = await HomepageContactSection.create({
            title,
            description,
            about_heading: about_heading || '',
            about_paragraph: about_paragraph || '',
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
            { success: true, message: 'Contact section created successfully', id: result._id },
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
        await connectDB();
        const body = await request.json();
        const { id, title, description, about_heading, about_paragraph, name_placeholder, email_placeholder, phone_placeholder, service_placeholder, message_placeholder, submit_button_text, is_active } = body;

        if (!id) {
            return NextResponse.json({ error: 'ID is required' }, { status: 400 });
        }

        const updateData: any = {};
        if (title !== undefined) updateData.title = title;
        if (description !== undefined) updateData.description = description;
        if (about_heading !== undefined) updateData.about_heading = about_heading;
        if (about_paragraph !== undefined) updateData.about_paragraph = about_paragraph;
        if (name_placeholder !== undefined) updateData.name_placeholder = name_placeholder;
        if (email_placeholder !== undefined) updateData.email_placeholder = email_placeholder;
        if (phone_placeholder !== undefined) updateData.phone_placeholder = phone_placeholder;
        if (service_placeholder !== undefined) updateData.service_placeholder = service_placeholder;
        if (message_placeholder !== undefined) updateData.message_placeholder = message_placeholder;
        if (submit_button_text !== undefined) updateData.submit_button_text = submit_button_text;
        if (is_active !== undefined) updateData.is_active = is_active;

        await HomepageContactSection.findByIdAndUpdate(id, updateData, { new: true });
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
        await connectDB();
        const searchParams = request.nextUrl.searchParams;
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'ID is required' }, { status: 400 });
        }

        await HomepageContactSection.findByIdAndDelete(id);
        revalidateTag('homepage-contact-section', 'max');

        return NextResponse.json({ success: true, message: 'Contact section deleted successfully' });
    } catch (error) {
        console.error('Error deleting contact section:', error);
        return NextResponse.json({ error: 'Failed to delete contact section' }, { status: 500 });
    }
}
