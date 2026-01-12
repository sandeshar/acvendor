import { NextResponse } from 'next/server';
import { connectDB } from '@/db';
import { BlogPost } from '@/db/schema';
import { Product } from '@/db/productsSchema';
import { ServicePosts } from '@/db/servicePostsSchema';
import { resolveStatusId } from '@/utils/resolveStatus';
import { getFrontendPageCount } from '@/utils/frontendPages';

export async function GET() {
    try {
        await connectDB();
        // Count published blog posts (status = 2)
        const publishedStatusId = await resolveStatusId(2);

        const postsCount = publishedStatusId ? await BlogPost.countDocuments({ status: publishedStatusId }) : 0;
        const productsCount = await Product.countDocuments(); // Assume all for now or filter if needed
        const servicesCount = await ServicePosts.countDocuments();
        const pageCount = getFrontendPageCount();

        const stats = {
            totalUrls: pageCount + postsCount + productsCount + servicesCount,
            pages: pageCount,
            blogPosts: postsCount,
            products: productsCount,
            services: servicesCount,
        };
        return NextResponse.json({
            success: true,
            stats,
            lastGenerated: new Date().toISOString()
        });
    } catch (error) {
        console.error('GET /api/seo/sitemap/stats error', error);
        return NextResponse.json({ success: false, error: 'Failed to get stats' }, { status: 500 });
    }
}
