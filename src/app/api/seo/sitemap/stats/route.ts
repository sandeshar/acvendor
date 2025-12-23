import { NextResponse } from 'next/server';
import { db } from '@/db';
import { blogPosts } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { getFrontendPageCount } from '@/utils/frontendPages';

export async function GET() {
    try {
        // Count published blog posts (status = 2)
        const posts = await db.select().from(blogPosts).where(eq(blogPosts.status, 2));
        const pageCount = getFrontendPageCount();

        const stats = {
            totalUrls: pageCount + posts.length,
            pages: pageCount,
            blogPosts: posts.length,
        }; return NextResponse.json({
            success: true,
            stats,
            lastGenerated: new Date().toISOString()
        });
    } catch (error) {
        console.error('GET /api/seo/sitemap/stats error', error);
        return NextResponse.json({ success: false, error: 'Failed to get stats' }, { status: 500 });
    }
}
