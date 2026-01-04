import { NextResponse } from 'next/server';
import { connectDB } from '@/db';
import { BlogPost } from '@/db/schema';
import { resolveStatusId } from '@/utils/resolveStatus';
import { getFrontendPageCount } from '@/utils/frontendPages';

export async function GET() {
    try {
        await connectDB();
        // Count published blog posts (status = 2)
        const publishedStatusId = await resolveStatusId(2);
        const posts = publishedStatusId ? await BlogPost.find({ status: publishedStatusId }).lean() : [];
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
