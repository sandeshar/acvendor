import { MetadataRoute } from 'next';
import { frontendPages } from '@/utils/frontendPages';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

    // Dynamic frontend pages
    const staticPages: MetadataRoute.Sitemap = frontendPages.map((page) => ({
        url: `${baseUrl}${page.path}`,
        lastModified: new Date(),
        changeFrequency: page.path === '/' ? 'daily' : 'monthly' as 'daily' | 'monthly',
        priority: page.path === '/' ? 1 : 0.7,
    }));

    try {
        // Use the blog API; if it fails, return static pages only (no DB access here)
        const base = process.env.NEXT_PUBLIC_BASE_URL || baseUrl;
        try {
            const res = await fetch(`${base}/api/blog`);
            if (res.ok) {
                const posts = await res.json();
                if (Array.isArray(posts)) {
                    const blogPages: MetadataRoute.Sitemap = posts.map((post: any) => ({
                        url: `${baseUrl}/blog/${post.slug}`,
                        lastModified: new Date(post.updatedAt),
                        changeFrequency: 'weekly',
                        priority: 0.7,
                    }));
                    return [...staticPages, ...blogPages];
                }
            }
        } catch (e) {
            console.error('Error fetching /api/blog for sitemap:', e);
            return staticPages;
        }

        return staticPages;
    } catch (error) {
        console.error('Error generating sitemap:', error);
        return staticPages;
    }
}
