import { NextResponse } from 'next/server';
import { connectDB } from '@/db';
import { ReviewTestimonials } from '@/db/reviewSchema';
import { ReviewTestimonialServices } from '@/db/reviewTestimonialServicesSchema';
import { ReviewTestimonialProducts } from '@/db/reviewTestimonialProductsSchema';
import { ServicePosts } from '@/db/servicePostsSchema';
import { products as ProductsModel } from '@/db/productsSchema';

export async function POST() {
    try {
        await connectDB();

        // Clean existing testimonials (idempotent)
        try { await ReviewTestimonialServices.deleteMany({}); } catch (e) { /* ignore */ }
        try { await ReviewTestimonialProducts.deleteMany({}); } catch (e) { /* ignore */ }
        await ReviewTestimonials.deleteMany({});

        // Pick a service and product to attach to sample testimonials if available
        const someService = await ServicePosts.findOne().lean();
        const someProduct = await ProductsModel.findOne().lean();

        const samples = [
            {
                url: 'https://example.com/review/1',
                name: 'Anita Shrestha',
                role: 'Homeowner',
                content: 'Great service and fast installation. The team was professional and the AC works perfectly.',
                rating: 5,
                service: someService ? someService._id : null,
                link: 'homepage',
            },
            {
                url: 'https://example.com/review/2',
                name: 'Ramesh Thapa',
                role: 'Business Owner',
                content: 'Reliable products and good after-sales support. Highly recommended.',
                rating: 4,
                product: someProduct ? someProduct._id : null,
                link: 'homepage',
            },
            {
                url: 'https://example.com/review/3',
                name: 'Sita Koirala',
                role: 'Facility Manager',
                content: 'Installation team was on time and knowledgeable. Good value for money.',
                rating: 5,
                link: 'homepage',
            }
        ];

        const created = [] as any[];
        for (const s of samples) {
            const row = await ReviewTestimonials.create({
                url: s.url,
                name: s.name,
                role: s.role,
                content: s.content,
                rating: s.rating,
                service: s.service ?? null,
                link: s.link,
            });
            created.push(row);

            if (s.service && row._id) {
                await ReviewTestimonialServices.create({ testimonialId: row._id, serviceId: s.service });
            }
            if (s.product && row._id) {
                await ReviewTestimonialProducts.create({ testimonialId: row._id, productId: s.product });
            }
        }

        return NextResponse.json({ success: true, message: 'Testimonials seeded successfully', count: created.length });
    } catch (err) {
        console.error('Error seeding testimonials:', err);
        return NextResponse.json({ success: false, error: 'Failed to seed testimonials' }, { status: 500 });
    }
}
