import { db } from "@/db";
import { reviewTestimonials } from "@/db/reviewSchema";
import { reviewTestimonialServices } from "@/db/reviewTestimonialServicesSchema";
import { desc, eq, inArray } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const service = parseInt(searchParams.get('service') || '0');
    const id = parseInt(searchParams.get('id') || '0');
    const homepage = searchParams.get('homepage');
    const limit = parseInt(searchParams.get('limit') || '0');

    if (homepage === '1' || homepage === 'true') {
        const response = await db.select().from(reviewTestimonials).orderBy(desc(reviewTestimonials.date)).limit(limit || 3);
        return NextResponse.json(response);
    }

    if (id) {
        const one = await db.select().from(reviewTestimonials).where(eq(reviewTestimonials.id, id)).limit(1);
        const withServiceIds = await attachServiceIds(one);
        return NextResponse.json(withServiceIds);
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
        const withServiceIds = await attachServiceIds(testimonials);
        return NextResponse.json(withServiceIds);
    }

    // Return all testimonials if no specific filter
    const all = await db.select().from(reviewTestimonials).orderBy(desc(reviewTestimonials.date));
    const withServiceIds = await attachServiceIds(all);
    return NextResponse.json(withServiceIds);
}
export async function POST(request: NextRequest) {
    try {
        const { name, url, role, content, rating, serviceIds, link } = await request.json();

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
            await db.insert(reviewTestimonialServices).values(
                serviceIdArray.map((serviceId: number) => ({ testimonialId, serviceId }))
            );
        }

        return NextResponse.json({ success: true, id: testimonialId });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to create testimonial' }, { status: 500 });
    }
}
export async function PUT(request: NextRequest) {
    try {
        const { id, name, url, role, content, rating, serviceIds, link } = await request.json();

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

        return NextResponse.json({ success: true, id: result[0].insertId });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to create testimonial' }, { status: 500 });
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

async function attachServiceIds(testimonials: any[]) {
    if (!testimonials.length) return testimonials;
    const ids = testimonials.map((t) => t.id);
    const mappings = await db
        .select({ testimonialId: reviewTestimonialServices.testimonialId, serviceId: reviewTestimonialServices.serviceId })
        .from(reviewTestimonialServices)
        .where(inArray(reviewTestimonialServices.testimonialId, ids));

    const map = new Map<number, number[]>();
    mappings.forEach((m) => {
        const arr = map.get(m.testimonialId) ?? [];
        arr.push(m.serviceId);
        map.set(m.testimonialId, arr);
    });

    return testimonials.map((t) => ({ ...t, serviceIds: map.get(t.id) ?? [] }));
}