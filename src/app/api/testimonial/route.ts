import { connectDB } from "@/db";
import { ReviewTestimonials } from "@/db/reviewSchema";
import { ReviewTestimonialServices } from "@/db/reviewTestimonialServicesSchema";
import { ReviewTestimonialProducts } from "@/db/reviewTestimonialProductsSchema";
import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from 'next/cache';

export async function GET(request: NextRequest) {
    await connectDB();

    const searchParams = request.nextUrl.searchParams;
    const service = parseInt(searchParams.get('service') || '0');
    const product = parseInt(searchParams.get('product') || '0');
    const id = parseInt(searchParams.get('id') || '0');
    const homepage = searchParams.get('homepage');
    const limit = parseInt(searchParams.get('limit') || '0');

    if (homepage === '1' || homepage === 'true') {
        const response = await ReviewTestimonials.find().sort({ date: -1 }).limit(limit || 3).lean();
        return NextResponse.json(response);
    }

    if (id) {
        const one = await ReviewTestimonials.findById(id).lean();
        const withIds = await attachRelationIds(one ? [one] : []);
        return NextResponse.json(withIds);
    }

    if (service) {
        // Get testimonial IDs from service mapping
        const serviceMappings = await ReviewTestimonialServices.find({ serviceId: service }).lean();
        const testimonialIds = serviceMappings.map(m => m.testimonialId);

        const testimonials = await ReviewTestimonials.find({ _id: { $in: testimonialIds } })
            .sort({ date: -1 })
            .limit(limit || 10)
            .lean();

        const withIds = await attachRelationIds(testimonials);
        return NextResponse.json(withIds);
    }

    if (product) {
        // Get testimonial IDs from product mapping
        const productMappings = await ReviewTestimonialProducts.find({ productId: product }).lean();
        const testimonialIds = productMappings.map(m => m.testimonialId);

        const testimonials = await ReviewTestimonials.find({ _id: { $in: testimonialIds } })
            .sort({ date: -1 })
            .limit(limit || 10)
            .lean();

        const withIds = await attachRelationIds(testimonials);
        return NextResponse.json(withIds);
    }

    // Return all testimonials if no specific filter
    const all = await ReviewTestimonials.find().sort({ date: -1 }).lean();
    const withIds = await attachRelationIds(all);
    return NextResponse.json(withIds);
}
export async function POST(request: NextRequest) {
    try {
        await connectDB();

        const { name, url, role, content, rating, serviceIds, productIds, link } = await request.json();

        const serviceIdArray = Array.isArray(serviceIds)
            ? serviceIds.map((id: any) => parseInt(id)).filter((id) => !Number.isNaN(id))
            : [];

        // Basic validation
        if (!name || !url || !role || !content || !rating) {
            return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
        }

        const newTestimonial = await ReviewTestimonials.create({
            name,
            url,
            role,
            content,
            rating,
            service: serviceIdArray[0] ?? null,
            link: link || 'homepage'
        });

        const testimonialId = newTestimonial._id;

        if (serviceIdArray.length) {
            // Validate services exist
            const { ServicePosts } = await import('@/db/servicePostsSchema');
            const existingServices = await ServicePosts.find({ _id: { $in: serviceIdArray } }).lean();
            const existingIds = new Set(existingServices.map((s: any) => s._id.toString()));
            const invalidServices = serviceIdArray.filter((id: number) => !existingIds.has(id.toString()));
            if (invalidServices.length) {
                return NextResponse.json({ error: `Invalid service IDs: ${invalidServices.join(', ')}` }, { status: 400 });
            }

            await ReviewTestimonialServices.insertMany(
                serviceIdArray.map((serviceId: number) => ({ testimonialId, serviceId }))
            );
        }

        const productIdArray = Array.isArray(productIds)
            ? productIds.map((id: any) => parseInt(id)).filter((id) => !Number.isNaN(id))
            : [];

        if (productIdArray.length) {
            // Validate products exist
            const { products } = await import('@/db/productsSchema');
            const existingProducts = await products.find({ _id: { $in: productIdArray } }).lean();
            const existingProductIds = new Set(existingProducts.map((p: any) => p._id.toString()));
            const invalidProducts = productIdArray.filter((id: number) => !existingProductIds.has(id.toString()));
            if (invalidProducts.length) {
                return NextResponse.json({ error: `Invalid product IDs: ${invalidProducts.join(', ')}` }, { status: 400 });
            }

            await ReviewTestimonialProducts.insertMany(
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
        await connectDB();

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

        const result = await ReviewTestimonials.findByIdAndUpdate(id, updateData, { new: true });

        // Replace service mappings
        await ReviewTestimonialServices.deleteMany({ testimonialId: id });
        if (serviceIdArray.length) {
            await ReviewTestimonialServices.insertMany(
                serviceIdArray.map((serviceId: number) => ({ testimonialId: id, serviceId }))
            );
        }

        // Replace product mappings
        await ReviewTestimonialProducts.deleteMany({ testimonialId: id });
        const productIdArray = Array.isArray(productIds)
            ? productIds.map((pid: any) => parseInt(pid)).filter((pid) => !Number.isNaN(pid))
            : [];
        if (productIdArray.length) {
            await ReviewTestimonialProducts.insertMany(
                productIdArray.map((productId: number) => ({ testimonialId: id, productId }))
            );
        }

        return NextResponse.json({ success: true, id: result?._id });
    } catch (error: any) {
        try { const payload = await request.json(); console.error('Update testimonial payload:', payload); } catch (e) { /* ignore */ }
        console.error('Error updating testimonial:', error);
        return NextResponse.json({ error: error?.message || 'Failed to update testimonial' }, { status: 500 });
    }
}
export async function DELETE(request: NextRequest) {
    await connectDB();

    const token = request.cookies.get('admin_auth')?.value;
    const id = request.nextUrl.searchParams.get('id');
    if (!token) {
        return NextResponse.json(
            { error: 'Unauthorized - No token provided' },
            { status: 401 }
        );
    }
    try {
        const result = await ReviewTestimonials.findByIdAndDelete(parseInt(id!));
        return NextResponse.json({ success: true, id: result?._id });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete testimonial' }, { status: 500 });
    }
}

async function attachRelationIds(testimonials: any[]) {
    if (!testimonials.length) return testimonials;
    const ids = testimonials.map((t) => t._id);

    const serviceMappings = await ReviewTestimonialServices.find({ testimonialId: { $in: ids } }).lean();
    const productMappings = await ReviewTestimonialProducts.find({ testimonialId: { $in: ids } }).lean();

    const serviceMap = new Map<string, number[]>();
    serviceMappings.forEach((m: any) => {
        const testimonialIdStr = m.testimonialId.toString();
        const arr = serviceMap.get(testimonialIdStr) ?? [];
        arr.push(m.serviceId);
        serviceMap.set(testimonialIdStr, arr);
    });

    const productMap = new Map<string, number[]>();
    productMappings.forEach((m: any) => {
        const testimonialIdStr = m.testimonialId.toString();
        const arr = productMap.get(testimonialIdStr) ?? [];
        arr.push(m.productId);
        productMap.set(testimonialIdStr, arr);
    });

    return testimonials.map((t) => {
        const idStr = t._id.toString();
        return {
            ...t,
            serviceIds: serviceMap.get(idStr) ?? [],
            productIds: productMap.get(idStr) ?? []
        };
    });
}