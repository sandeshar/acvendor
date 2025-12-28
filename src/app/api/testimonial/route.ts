import { db } from "@/db";
import { reviewTestimonials } from "@/db/reviewSchema";
import { reviewTestimonialServices } from "@/db/reviewTestimonialServicesSchema";
import { reviewTestimonialProducts } from "@/db/reviewTestimonialProductsSchema";
import { desc, eq, inArray } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from 'next/cache';

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const service = parseInt(searchParams.get('service') || '0');
    const product = parseInt(searchParams.get('product') || '0');
    const id = parseInt(searchParams.get('id') || '0');
    const homepage = searchParams.get('homepage');
    const limit = parseInt(searchParams.get('limit') || '0');

    if (homepage === '1' || homepage === 'true') {
        const response = await db.select().from(reviewTestimonials).orderBy(desc(reviewTestimonials.date)).limit(limit || 3);
        return NextResponse.json(response);
    }

    if (id) {
        const one = await db.select().from(reviewTestimonials).where(eq(reviewTestimonials.id, id)).limit(1);
        const withIds = await attachRelationIds(one);
        return NextResponse.json(withIds);
    }

    if (service) {
        const rows = await db
            .select({ testimonial: reviewTestimonials })
            .from(reviewTestimonials)
            .leftJoin(
                reviewTestimonialServices,
                eq(reviewTestimonialServices.testimonialId, reviewTestimonials.id)
            )
            .where(eq(reviewTestimonialServices.serviceId, service))
            .orderBy(desc(reviewTestimonials.date))
            .limit(limit || 10);

        const testimonials = rows.map((r) => r.testimonial);
        const withIds = await attachRelationIds(testimonials);
        return NextResponse.json(withIds);
    }

    if (product) {
        const rows = await db
            .select({ testimonial: reviewTestimonials })
            .from(reviewTestimonials)
            .leftJoin(
                reviewTestimonialProducts,
                eq(reviewTestimonialProducts.testimonialId, reviewTestimonials.id)
            )
            .where(eq(reviewTestimonialProducts.productId, product))
            .orderBy(desc(reviewTestimonials.date))
            .limit(limit || 10);

        const testimonials = rows.map((r) => r.testimonial);
        const withIds = await attachRelationIds(testimonials);
        return NextResponse.json(withIds);
    }

    // Return all testimonials if no specific filter
    const all = await db.select().from(reviewTestimonials).orderBy(desc(reviewTestimonials.date));
    const withIds = await attachRelationIds(all);
    return NextResponse.json(withIds);
}
export async function POST(request: NextRequest) {
    try {
        const { name, url, role, content, rating, serviceIds, productIds, link } = await request.json();

        const serviceIdArray = Array.isArray(serviceIds)
            ? serviceIds.map((id: any) => parseInt(id)).filter((id) => !Number.isNaN(id))
            : [];

        // Basic validation
        if (!name || !url || !role || !content || !rating) {
            return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
        }

        const result = await db.insert(reviewTestimonials).values({
            name,
            url,
            role,
            content,
            rating,
            service: serviceIdArray[0] ?? null,
            link: link || 'homepage'
        });

        const testimonialId = result[0].insertId;

        if (serviceIdArray.length) {
            // Validate services exist
            const { servicePosts } = await import('@/db/servicePostsSchema');
            const existingServices = await db.select().from(servicePosts).where(inArray(servicePosts.id, serviceIdArray));
            const existingIds = new Set(existingServices.map((s: any) => s.id));
            const invalidServices = serviceIdArray.filter((id: number) => !existingIds.has(id));
            if (invalidServices.length) {
                return NextResponse.json({ error: `Invalid service IDs: ${invalidServices.join(', ')}` }, { status: 400 });
            }

            await db.insert(reviewTestimonialServices).values(
                serviceIdArray.map((serviceId: number) => ({ testimonialId, serviceId }))
            );
        }

        const productIdArray = Array.isArray(productIds)
            ? productIds.map((id: any) => parseInt(id)).filter((id) => !Number.isNaN(id))
            : [];

        if (productIdArray.length) {
            // Validate products exist
            const { products } = await import('@/db/productsSchema');
            const existingProducts = await db.select().from(products).where(inArray(products.id, productIdArray));
            const existingProductIds = new Set(existingProducts.map((p: any) => p.id));
            const invalidProducts = productIdArray.filter((id: number) => !existingProductIds.has(id));
            if (invalidProducts.length) {
                return NextResponse.json({ error: `Invalid product IDs: ${invalidProducts.join(', ')}` }, { status: 400 });
            }

            await db.insert(reviewTestimonialProducts).values(
                productIdArray.map((productId: number) => ({ testimonialId, productId }))
            );

            // trigger revalidation for product pages so aggregated ratings/counts update
            try { productIdArray.forEach(pid => { try { revalidateTag(`product-${pid}`, 'max'); } catch (e) { /* ignore */ } }); revalidateTag('products', 'max'); } catch (e) { /* ignore */ }
        }

        return NextResponse.json({ success: true, id: testimonialId });
    } catch (error: any) {
        try { const payload = await request.json(); console.error('Create testimonial payload:', payload); } catch (e) { /* ignore */ }
        console.error('Error creating testimonial:', error);
        return NextResponse.json({ error: error?.message || 'Failed to create testimonial' }, { status: 500 });
    }
}
export async function PUT(request: NextRequest) {
    try {
        const { id, name, url, role, content, rating, serviceIds, productIds, link } = await request.json();

        const serviceIdArray = Array.isArray(serviceIds)
            ? serviceIds.map((sid: any) => parseInt(sid)).filter((sid) => !Number.isNaN(sid))
            : [];

        // Basic validation
        if (!id) {
            return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
        }

        const updateData: any = {};
        if (name) updateData.name = name;
        if (url) updateData.url = url;
        if (role) updateData.role = role;
        if (content) updateData.content = content;
        if (rating) updateData.rating = rating;
        if (serviceIdArray.length) updateData.service = serviceIdArray[0];
        if (link) updateData.link = link;

        const result = await db.update(reviewTestimonials).set(updateData).where(eq(reviewTestimonials.id, id));

        // Replace service mappings
        await db.delete(reviewTestimonialServices).where(eq(reviewTestimonialServices.testimonialId, id));
        if (serviceIdArray.length) {
            await db.insert(reviewTestimonialServices).values(
                serviceIdArray.map((serviceId: number) => ({ testimonialId: id, serviceId }))
            );
        }

        // Replace product mappings
        await db.delete(reviewTestimonialProducts).where(eq(reviewTestimonialProducts.testimonialId, id));
        const productIdArray = Array.isArray(productIds)
            ? productIds.map((pid: any) => parseInt(pid)).filter((pid) => !Number.isNaN(pid))
            : [];
        if (productIdArray.length) {
            await db.insert(reviewTestimonialProducts).values(
                productIdArray.map((productId: number) => ({ testimonialId: id, productId }))
            );
        }

        return NextResponse.json({ success: true, id: result[0].insertId });
    } catch (error: any) {
        try { const payload = await request.json(); console.error('Update testimonial payload:', payload); } catch (e) { /* ignore */ }
        console.error('Error updating testimonial:', error);
        return NextResponse.json({ error: error?.message || 'Failed to update testimonial' }, { status: 500 });
    }
}
export async function DELETE(request: NextRequest) {
    const token = request.cookies.get('admin_auth')?.value;
    const id = request.nextUrl.searchParams.get('id');
    if (!token) {
        return NextResponse.json(
            { error: 'Unauthorized - No token provided' },
            { status: 401 }
        );
    }
    try {
        const result = await db.delete(reviewTestimonials).where(eq(reviewTestimonials.id, parseInt(id!)));
        return NextResponse.json({ success: true, id: result[0].insertId });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete testimonial' }, { status: 500 });
    }
}

async function attachRelationIds(testimonials: any[]) {
    if (!testimonials.length) return testimonials;
    const ids = testimonials.map((t) => t.id);

    const serviceMappings = await db
        .select({ testimonialId: reviewTestimonialServices.testimonialId, serviceId: reviewTestimonialServices.serviceId })
        .from(reviewTestimonialServices)
        .where(inArray(reviewTestimonialServices.testimonialId, ids));

    const productMappings = await db
        .select({ testimonialId: reviewTestimonialProducts.testimonialId, productId: reviewTestimonialProducts.productId })
        .from(reviewTestimonialProducts)
        .where(inArray(reviewTestimonialProducts.testimonialId, ids));

    const serviceMap = new Map<number, number[]>();
    serviceMappings.forEach((m) => {
        const arr = serviceMap.get(m.testimonialId) ?? [];
        arr.push(m.serviceId);
        serviceMap.set(m.testimonialId, arr);
    });

    const productMap = new Map<number, number[]>();
    productMappings.forEach((m) => {
        const arr = productMap.get(m.testimonialId) ?? [];
        arr.push(m.productId);
        productMap.set(m.testimonialId, arr);
    });

    return testimonials.map((t) => ({ ...t, serviceIds: serviceMap.get(t.id) ?? [], productIds: productMap.get(t.id) ?? [] }));
}