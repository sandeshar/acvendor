import { MetadataRoute } from 'next';
import { headers } from 'next/headers';
import { frontendPages } from '@/utils/frontendPages';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    let baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

    if (!baseUrl) {
        try {
            const headersList = await headers();
            const host = headersList.get('host');
            const protocol = headersList.get('x-forwarded-proto') || (host?.includes('localhost') ? 'http' : 'https');
            if (host) {
                baseUrl = `${protocol}://${host}`;
            }
        } catch (error) {
            console.warn('Could not determine base URL from headers', error);
        }
    }

    baseUrl = baseUrl || 'http://localhost:3000';
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
        let categoryPages: MetadataRoute.Sitemap = [];

        // 1. Fetch Products
        try {
            const res = await fetch(`${apiBase}/api/products`);
            if (res.ok) {
                const products = await res.json();
                if (Array.isArray(products)) {
                    productPages = products.map((p: any) => ({
                        url: `${baseUrl}/products/${p.slug}`,
                        lastModified: new Date(p.updatedAt || p.createdAt || new Date()),
                        changeFrequency: 'weekly',
                        priority: 0.8,
                    }));
                }
            }
        } catch (e) {
            console.error('Error fetching products for sitemap:', e);
        }

        // 2. Fetch Categories and Subcategories
        try {
            const [catsRes, subsRes] = await Promise.all([
                fetch(`${apiBase}/api/pages/services/categories`),
                fetch(`${apiBase}/api/pages/services/subcategories`)
            ]);

            if (catsRes.ok) {
                const cats = await catsRes.ok ? await catsRes.json() : [];
                const subs = await subsRes.ok ? await subsRes.json() : [];

                if (Array.isArray(cats)) {
                    cats.forEach((cat: any) => {
                        // Main category page
                        categoryPages.push({
                            url: `${baseUrl}/shop/category/${cat.slug}`,
                            lastModified: new Date(cat.updatedAt || cat.createdAt || new Date()),
                            changeFrequency: 'weekly',
                            priority: 0.7,
                        });

                        // Filter subcategories for this category
                        const catSubs = Array.isArray(subs) ? subs.filter((s: any) => s.category_id === cat.id || s.category_id === cat._id) : [];
                        catSubs.forEach((sub: any) => {
                            categoryPages.push({
                                url: `${baseUrl}/shop/category/${cat.slug}/${sub.slug}`,
                                lastModified: new Date(sub.updatedAt || sub.createdAt || new Date()),
                                changeFrequency: 'weekly',
                                priority: 0.6,
                            });
                        });
                    });
                }
            }
        } catch (e) {
            console.error('Error fetching categories for sitemap:', e);
        }

        // 3. Fetch Blogs
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

        return [...staticPages, ...productPages, ...blogPages, ...servicePages, ...categoryPages];
    } catch (error) {
        console.error('Error generating sitemap:', error);
        return staticPages;
    }
}
