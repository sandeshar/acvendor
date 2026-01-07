import { connectDB } from "@/db";
import { ReviewTestimonials } from "@/db/reviewSchema";
import { ReviewTestimonialServices } from "@/db/reviewTestimonialServicesSchema";
import { ReviewTestimonialProducts } from "@/db/reviewTestimonialProductsSchema";
import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from 'next/cache';
import mongoose from 'mongoose';

export async function GET(request: NextRequest) {
    await connectDB();

    const searchParams = request.nextUrl.searchParams;
    const service = searchParams.get('service');
    const product = searchParams.get('product');
    const id = searchParams.get('id');
    const homepage = searchParams.get('homepage');
    const limit = parseInt(searchParams.get('limit') || '0');

    if (homepage === '1' || homepage === 'true') {
        const response = await ReviewTestimonials.find().sort({ date: -1 }).limit(limit || 3).lean();
        const formatted = response.map((t: any) => ({ ...t, id: t._id.toString() }));
        return NextResponse.json(formatted);
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

        const serviceIdArray = Array.isArray(serviceIds) ? serviceIds : [];
        const productIdArray = Array.isArray(productIds) ? productIds : [];

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
            const invalidServices = serviceIdArray.filter((id: string) => !existingIds.has(id));
            if (invalidServices.length) {
                return NextResponse.json({ error: `Invalid service IDs: ${invalidServices.join(', ')}` }, { status: 400 });
            }

            await ReviewTestimonialServices.insertMany(
                serviceIdArray.map((serviceId: string) => ({ testimonialId, serviceId }))
            );
        }

        if (productIdArray.length) {
            // Validate products exist
            const { Product } = await import('@/db/productsSchema');
            const existingProducts = await Product.find({ _id: { $in: productIdArray } }).lean();
            const existingProductIds = new Set(existingProducts.map((p: any) => p._id.toString()));
            const invalidProducts = productIdArray.filter((id: string) => !existingProductIds.has(id));
            if (invalidProducts.length) {
                return NextResponse.json({ error: `Invalid product IDs: ${invalidProducts.join(', ')}` }, { status: 400 });
            }

            await ReviewTestimonialProducts.insertMany(
                productIdArray.map((productId: string) => ({ testimonialId, productId }))
            );

            // trigger revalidation for product pages so aggregated ratings/counts update
            try { productIdArray.forEach(pid => { try { revalidateTag(`product-${pid}`, 'max'); } catch (e) { /* ignore */ } }); revalidateTag('products', 'max'); } catch (e) { /* ignore */ }
        }

        return NextResponse.json({ success: true, id: testimonialId });
    } catch (error: any) {
        console.error('Error creating testimonial:', error);
        return NextResponse.json({ error: error?.message || 'Failed to create testimonial' }, { status: 500 });
    }
}
export async function PUT(request: NextRequest) {
    try {
        await connectDB();

        const { id, name, url, role, content, rating, serviceIds, productIds, link } = await request.json();

        const serviceIdArray = Array.isArray(serviceIds) ? serviceIds : [];
        const productIdArray = Array.isArray(productIds) ? productIds : [];

        // Basic validation
        if (!id) {
            return NextResponse.json({ error: 'ID is required' }, { status: 400 });
        }

        // ensure id is a valid Mongo ObjectId
        if (!mongoose.Types.ObjectId.isValid(String(id))) {
            return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
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
                serviceIdArray.map((serviceId: string) => ({ testimonialId: id, serviceId }))
            );
        }

        // Replace product mappings
        await ReviewTestimonialProducts.deleteMany({ testimonialId: id });
        if (productIdArray.length) {
            await ReviewTestimonialProducts.insertMany(
                productIdArray.map((productId: string) => ({ testimonialId: id, productId }))
            );
        }

        return NextResponse.json({ success: true, id: result?._id });
    } catch (error: any) {
        console.error('Error updating testimonial:', error);
        return NextResponse.json({ error: error?.message || 'Failed to update testimonial' }, { status: 500 });
    }
}
export async function DELETE(request: NextRequest) {
    await connectDB();

    const id = request.nextUrl.searchParams.get('id');
    if (!id) {
        return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }
    try {
        const result = await ReviewTestimonials.findByIdAndDelete(id);
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

    const serviceMap = new Map<string, string[]>();
    serviceMappings.forEach((m: any) => {
        const testimonialIdStr = m.testimonialId.toString();
        const arr = serviceMap.get(testimonialIdStr) ?? [];
        arr.push(m.serviceId.toString());
        serviceMap.set(testimonialIdStr, arr);
    });

    const productMap = new Map<string, string[]>();
    productMappings.forEach((m: any) => {
        const testimonialIdStr = m.testimonialId.toString();
        const arr = productMap.get(testimonialIdStr) ?? [];
        arr.push(m.productId.toString());
        productMap.set(testimonialIdStr, arr);
    });

    return testimonials.map((t) => {
        const idStr = t._id.toString();
        return {
            ...t,
            id: idStr,
            serviceIds: serviceMap.get(idStr) ?? [],
            productIds: productMap.get(idStr) ?? []
        };
    });
}