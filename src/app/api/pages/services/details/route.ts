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

        // optional extended fields
        const {
            postId,
            locations,
            inventory_status,
            images: imagesField,
            price,
            compare_at_price,
            currency,
            model,
            capacity,
            warranty,
            technical,
            energy_saving,
            smart,
            filtration,
            brochure_url,
            meta_title,
            meta_description,
            content,
            application_areas,
            features,
        } = body;

        const result = await db.insert(servicesPageDetails).values({
            key,
            slug: slug || null,
            icon,
            title,
            description,
            bullets,
            image,
            image_alt,
            postId: postId || null,
            locations: locations ? (typeof locations === 'string' ? locations : JSON.stringify(locations)) : null,
            inventory_status: inventory_status || 'in_stock',
            images: imagesField ? (typeof imagesField === 'string' ? imagesField : JSON.stringify(imagesField)) : null,
            price: price ?? null,
            compare_at_price: compare_at_price ?? null,
            currency: currency || 'NRS',
            model: model || null,
            capacity: capacity || null,
            warranty: warranty || null,
            technical: technical ? (typeof technical === 'string' ? technical : JSON.stringify(technical)) : null,
            energy_saving: energy_saving || null,
            smart: smart ? Number(!!smart) : 0,
            filtration: filtration ? Number(!!filtration) : 0,
            brochure_url: brochure_url || null,
            application_areas: application_areas ? (typeof application_areas === 'string' ? application_areas : JSON.stringify(application_areas)) : null,
            features: features ? (typeof features === 'string' ? features : JSON.stringify(features)) : null,
            meta_title: meta_title || null,
            meta_description: meta_description || null,
            content: content || null,
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
        try { console.error('Create payload:', typeof body !== 'undefined' ? body : null); } catch (e) { /* ignore */ }

        if (error.code === 'ER_DUP_ENTRY') {
            return NextResponse.json({ error: 'A service with this key already exists' }, { status: 409 });
        }

        // Return the actual error message for easier debugging in development
        return NextResponse.json({ error: error?.message || 'Failed to create service detail' }, { status: 500 });
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

        // extended optional fields
        const {
            postId,
            locations,
            inventory_status,
            images: imagesField,
            price,
            compare_at_price,
            currency,
            model,
            capacity,
            warranty,
            technical,
            energy_saving,
            smart,
            filtration,
            brochure_url,
            meta_title,
            meta_description,
            content,
            application_areas,
            features,
        } = body;

        if (postId !== undefined) updateData.postId = postId;
        if (locations !== undefined) updateData.locations = typeof locations === 'string' ? locations : JSON.stringify(locations);
        if (inventory_status !== undefined) updateData.inventory_status = inventory_status;
        if (imagesField !== undefined) updateData.images = typeof imagesField === 'string' ? imagesField : JSON.stringify(imagesField);
        if (price !== undefined) updateData.price = price;
        if (compare_at_price !== undefined) updateData.compare_at_price = compare_at_price;
        if (currency !== undefined) updateData.currency = currency;
        if (model !== undefined) updateData.model = model;
        if (capacity !== undefined) updateData.capacity = capacity;
        if (warranty !== undefined) updateData.warranty = warranty;
        if (technical !== undefined) updateData.technical = typeof technical === 'string' ? technical : JSON.stringify(technical);
        if (energy_saving !== undefined) updateData.energy_saving = energy_saving;
        if (smart !== undefined) updateData.smart = Number(!!smart);
        if (filtration !== undefined) updateData.filtration = Number(!!filtration);
        if (brochure_url !== undefined) updateData.brochure_url = brochure_url;
        if (application_areas !== undefined) updateData.application_areas = typeof application_areas === 'string' ? application_areas : JSON.stringify(application_areas);
        if (features !== undefined) updateData.features = typeof features === 'string' ? features : JSON.stringify(features);
        if (meta_title !== undefined) updateData.meta_title = meta_title;
        if (meta_description !== undefined) updateData.meta_description = meta_description;
        if (content !== undefined) updateData.content = content;

        await db.update(servicesPageDetails).set(updateData).where(eq(servicesPageDetails.id, id));

        revalidateTag('services-details', 'max');

        return NextResponse.json({ success: true, message: 'Service detail updated successfully' });
    } catch (error: any) {
        console.error('Error updating service detail:', error);
        try { console.error('Update payload:', typeof body !== 'undefined' ? body : null); } catch (e) { /* ignore */ }

        if (error.code === 'ER_DUP_ENTRY') {
            return NextResponse.json({ error: 'A service with this key already exists' }, { status: 409 });
        }

        // Return the actual error message for easier debugging in development
        return NextResponse.json({ error: error?.message || 'Failed to update service detail' }, { status: 500 });
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
