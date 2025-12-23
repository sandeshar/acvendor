import { NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { servicesPageProcessSection } from '@/db/servicesPageSchema';
import { revalidateTag } from 'next/cache';

// GET - Fetch process section
export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const id = searchParams.get('id');

        if (id) {
            const section = await db.select().from(servicesPageProcessSection).where(eq(servicesPageProcessSection.id, parseInt(id))).limit(1);

            if (section.length === 0) {
                return NextResponse.json({ error: 'Process section not found' }, { status: 404 });
            }

            return NextResponse.json(section[0]);
        }

        const section = await db.select().from(servicesPageProcessSection).where(eq(servicesPageProcessSection.is_active, 1)).limit(1);

        if (section.length === 0) {
            return NextResponse.json({ error: 'No active process section found' }, { status: 404 });
        }

        return NextResponse.json(section[0]);
    } catch (error) {
        console.error('Error fetching process section:', error);
        return NextResponse.json({ error: 'Failed to fetch process section' }, { status: 500 });
    }
}

// POST - Create process section
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { title, description, is_active = 1 } = body;

        if (!title || !description) {
            return NextResponse.json({ error: 'Title and description are required' }, { status: 400 });
        }

        const result = await db.insert(servicesPageProcessSection).values({ title, description, is_active });

        revalidateTag('services-process-section', 'max');

        return NextResponse.json(
            { success: true, message: 'Process section created successfully', id: result[0].insertId },
            { status: 201 }
        );
    } catch (error) {
        console.error('Error creating process section:', error);
        return NextResponse.json({ error: 'Failed to create process section' }, { status: 500 });
    }
}

// PUT - Update process section
export async function PUT(request: NextRequest) {
    try {
        const body = await request.json();
        const { id, title, description, is_active } = body;

        if (!id) {
            return NextResponse.json({ error: 'ID is required' }, { status: 400 });
        }

        const updateData: any = {};
        if (title !== undefined) updateData.title = title;
        if (description !== undefined) updateData.description = description;
        if (is_active !== undefined) updateData.is_active = is_active;

        await db.update(servicesPageProcessSection).set(updateData).where(eq(servicesPageProcessSection.id, id));

        revalidateTag('services-process-section', 'max');

        return NextResponse.json({ success: true, message: 'Process section updated successfully' });
    } catch (error) {
        console.error('Error updating process section:', error);
        return NextResponse.json({ error: 'Failed to update process section' }, { status: 500 });
    }
}

// DELETE - Delete process section
export async function DELETE(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'ID is required' }, { status: 400 });
        }

        await db.delete(servicesPageProcessSection).where(eq(servicesPageProcessSection.id, parseInt(id)));

        revalidateTag('services-process-section', 'max');

        return NextResponse.json({ success: true, message: 'Process section deleted successfully' });
    } catch (error) {
        console.error('Error deleting process section:', error);
        return NextResponse.json({ error: 'Failed to delete process section' }, { status: 500 });
    }
}
