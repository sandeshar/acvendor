import { NextResponse } from 'next/server';
import { connectDB } from '@/db';
import { BlogPost } from '@/db/schema';
import { resolveStatusId } from '@/utils/resolveStatus';
import { getFrontendPageCount } from '@/utils/frontendPages';

export async function POST() {
    try {
        await connectDB();
        // Get published blog posts
        const publishedStatusId = await resolveStatusId(2);
        const posts = publishedStatusId ? await BlogPost.find({ status: publishedStatusId }).lean() : [];
        const pageCount = getFrontendPageCount();

        const stats = {
            totalUrls: pageCount + posts.length,
            pages: pageCount,
            blogPosts: posts.length,
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
