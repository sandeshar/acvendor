import { NextRequest, NextResponse } from 'next/server';
import { eq, asc } from 'drizzle-orm';
import { db } from '@/db';
import { servicesPageDetails } from '@/db/servicesPageSchema';
import { revalidateTag } from 'next/cache';

// GET - Fetch service details
export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const id = searchParams.get('id');
        const key = searchParams.get('key');
        const slug = searchParams.get('slug');

        if (id) {
            const service = await db.select().from(servicesPageDetails).where(eq(servicesPageDetails.id, parseInt(id))).limit(1);

            if (service.length === 0) {
                return NextResponse.json({ error: 'Service not found' }, { status: 404 });
            }

            return NextResponse.json(service[0]);
        }

        if (key) {
            const service = await db.select().from(servicesPageDetails).where(eq(servicesPageDetails.key, key)).limit(1);

            if (service.length === 0) {
                return NextResponse.json({ error: 'Service not found' }, { status: 404 });
            }

            return NextResponse.json(service[0]);
        }

        if (slug) {
            const service = await db.select().from(servicesPageDetails).where(eq(servicesPageDetails.slug, slug)).limit(1);

            if (service.length === 0) {
                return NextResponse.json({ error: 'Service not found' }, { status: 404 });
            }

            return NextResponse.json(service[0]);
        }

        const services = await db.select().from(servicesPageDetails)
            .where(eq(servicesPageDetails.is_active, 1))
            .orderBy(asc(servicesPageDetails.display_order));

        return NextResponse.json(services);
    } catch (error) {
        console.error('Error fetching service details:', error);
        return NextResponse.json({ error: 'Failed to fetch service details' }, { status: 500 });
    }
}

// POST - Create service detail
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { key, slug, icon, title, description, bullets, image, image_alt, display_order, is_active = 1 } = body;

        if (!key || !icon || !title || !description || bullets === undefined || !image || !image_alt || display_order === undefined) {
            return NextResponse.json(
                { error: 'Key, icon, title, description, bullets, image, image_alt, and display_order are required' },
                { status: 400 }
            );
        }

        const result = await db.insert(servicesPageDetails).values({
            key,
            slug: slug || null,
            icon,
            title,
            description,
            bullets,
            image,
            image_alt,
            display_order,
            is_active,
        });

        revalidateTag('services-details', 'max');

        return NextResponse.json(
            { success: true, message: 'Service detail created successfully', id: result[0].insertId },
            { status: 201 }
        );
    } catch (error: any) {
        console.error('Error creating service detail:', error);

        if (error.code === 'ER_DUP_ENTRY') {
            return NextResponse.json({ error: 'A service with this key already exists' }, { status: 409 });
        }

        return NextResponse.json({ error: 'Failed to create service detail' }, { status: 500 });
    }
}

// PUT - Update service detail
export async function PUT(request: NextRequest) {
    try {
        const body = await request.json();
        const { id, key, slug, icon, title, description, bullets, image, image_alt, display_order, is_active } = body;

        if (!id) {
            return NextResponse.json({ error: 'ID is required' }, { status: 400 });
        }

        const updateData: any = {};
        if (key !== undefined) updateData.key = key;
        if (slug !== undefined) updateData.slug = slug;
        if (icon !== undefined) updateData.icon = icon;
        if (title !== undefined) updateData.title = title;
        if (description !== undefined) updateData.description = description;
        if (bullets !== undefined) updateData.bullets = bullets;
        if (image !== undefined) updateData.image = image;
        if (image_alt !== undefined) updateData.image_alt = image_alt;
        if (display_order !== undefined) updateData.display_order = display_order;
        if (is_active !== undefined) updateData.is_active = is_active;

        await db.update(servicesPageDetails).set(updateData).where(eq(servicesPageDetails.id, id));

        revalidateTag('services-details', 'max');

        return NextResponse.json({ success: true, message: 'Service detail updated successfully' });
    } catch (error: any) {
        console.error('Error updating service detail:', error);

        if (error.code === 'ER_DUP_ENTRY') {
            return NextResponse.json({ error: 'A service with this key already exists' }, { status: 409 });
        }

        return NextResponse.json({ error: 'Failed to update service detail' }, { status: 500 });
    }
}

// DELETE - Delete service detail
export async function DELETE(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'ID is required' }, { status: 400 });
        }

        await db.delete(servicesPageDetails).where(eq(servicesPageDetails.id, parseInt(id)));

        revalidateTag('services-details', 'max');

        return NextResponse.json({ success: true, message: 'Service detail deleted successfully' });
    } catch (error) {
        console.error('Error deleting service detail:', error);
        return NextResponse.json({ error: 'Failed to delete service detail' }, { status: 500 });
    }
}
