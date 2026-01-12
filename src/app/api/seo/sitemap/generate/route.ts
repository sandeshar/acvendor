import { NextResponse } from 'next/server';
import { connectDB } from '@/db';
import { BlogPost } from '@/db/schema';
import { Product } from '@/db/productsSchema';
import { ServicePosts } from '@/db/servicePostsSchema';
import { resolveStatusId } from '@/utils/resolveStatus';
import { getFrontendPageCount } from '@/utils/frontendPages';

export async function POST() {
    try {
        await connectDB();
        // Get counts for dashboard
        const publishedStatusId = await resolveStatusId(2);
        const postsCount = publishedStatusId ? await BlogPost.countDocuments({ status: publishedStatusId }) : 0;
        const productsCount = await Product.countDocuments();
        const servicesCount = await ServicePosts.countDocuments();
        const pageCount = getFrontendPageCount();

        const stats = {
            totalUrls: pageCount + postsCount + productsCount + servicesCount,
            pages: pageCount,
            blogPosts: postsCount,
            products: productsCount,
            services: servicesCount,
        };

        // Note: Sitemap is automatically served by Next.js from src/app/sitemap.ts
        // This endpoint just returns stats for the admin dashboard
        return NextResponse.json({
            success: true,
            message: 'Sitemap stats retrieved. Sitemap is automatically generated at /sitemap.xml',
            stats
        });
    } catch (error) {
        console.error('POST /api/seo/sitemap/generate error', error);
        return NextResponse.json({ success: false, error: 'Failed to get sitemap stats' }, { status: 500 });
    }
}
