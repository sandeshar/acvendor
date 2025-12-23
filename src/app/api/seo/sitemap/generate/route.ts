import { NextResponse } from 'next/server';
import { db } from '@/db';
import { blogPosts } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { getFrontendPageCount } from '@/utils/frontendPages';

export async function POST() {
    try {
        // Get published blog posts
        const posts = await db.select().from(blogPosts).where(eq(blogPosts.status, 2));
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
