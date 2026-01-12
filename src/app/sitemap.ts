import { MetadataRoute } from 'next';
import { frontendPages } from '@/utils/frontendPages';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const apiBase = process.env.NEXT_PUBLIC_API_URL || baseUrl;

    // Dynamic frontend pages
    const staticPages: MetadataRoute.Sitemap = frontendPages.map((page) => ({
        url: `${baseUrl}${page.path}`,
        lastModified: new Date(),
        changeFrequency: page.path === '/' ? 'daily' : 'monthly' as 'daily' | 'monthly',
        priority: page.path === '/' ? 1 : 0.7,
    }));

    try {
        let productPages: MetadataRoute.Sitemap = [];
        let blogPages: MetadataRoute.Sitemap = [];
        let servicePages: MetadataRoute.Sitemap = [];

        // 1. Fetch Products
        try {
            const res = await fetch(`${apiBase}/api/products`);
            if (res.ok) {
                const products = await res.json();
                if (Array.isArray(products)) {
                    productPages = products.map((p: any) => ({
                        url: `${baseUrl}/midea-ac/${p.slug}`,
                        lastModified: new Date(p.updatedAt || p.createdAt || new Date()),
                        changeFrequency: 'weekly',
                        priority: 0.8,
                    }));
                }
            }
        } catch (e) {
            console.error('Error fetching products for sitemap:', e);
        }

        // 2. Fetch Blogs
        try {
            const res = await fetch(`${apiBase}/api/blog`);
            if (res.ok) {
                const blogs = await res.json();
                if (Array.isArray(blogs)) {
                    blogPages = blogs.map((b: any) => ({
                        url: `${baseUrl}/blog/${b.slug}`,
                        lastModified: new Date(b.updatedAt || b.createdAt || new Date()),
                        changeFrequency: 'weekly',
                        priority: 0.6,
                    }));
                }
            }
        } catch (e) {
            console.error('Error fetching blogs for sitemap:', e);
        }

        // 3. Fetch Services
        try {
            const res = await fetch(`${apiBase}/api/services`);
            if (res.ok) {
                const services = await res.json();
                if (Array.isArray(services)) {
                    servicePages = services.map((s: any) => ({
                        url: `${baseUrl}/services/${s.slug}`,
                        lastModified: new Date(s.updatedAt || s.createdAt || new Date()),
                        changeFrequency: 'weekly',
                        priority: 0.7,
                    }));
                }
            }
        } catch (e) {
            console.error('Error fetching services for sitemap:', e);
        }

        return [...staticPages, ...productPages, ...blogPages, ...servicePages];
    } catch (error) {
        console.error('Error generating sitemap:', error);
        return staticPages;
    }
}
