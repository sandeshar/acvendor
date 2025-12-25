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
        // Use the services API as products for sitemap; if it fails, return static pages only
        const base = process.env.NEXT_PUBLIC_BASE_URL || baseUrl;
        try {
            const res = await fetch(`${base}/api/services`);
            if (res.ok) {
                const posts = await res.json();
                if (Array.isArray(posts)) {
                    const productPages: MetadataRoute.Sitemap = posts.map((post: any) => ({
                        url: `${baseUrl}/products/${post.slug}`,
                        lastModified: new Date(post.updatedAt || post.createdAt),
                        changeFrequency: 'weekly',
                        priority: 0.8,
                    }));
                    return [...staticPages, ...productPages];
                }
            }
        } catch (e) {
            console.error('Error fetching /api/services for sitemap:', e);
            return staticPages;
        }

        return staticPages;
    } catch (error) {
        console.error('Error generating sitemap:', error);
        return staticPages;
    }
}
