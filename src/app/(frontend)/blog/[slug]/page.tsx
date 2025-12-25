import { notFound } from 'next/navigation';
export const dynamic = 'force-dynamic';
import ShareButtons from '@/components/BlogPage/ShareButtons';

import type { BlogPostPageProps } from '@/types/pages';

import { redirect } from 'next/navigation';

export default async function BlogPostPage({ params }: any) {
    const { slug } = await params;
    redirect(`/products/${slug}`);
    return null;
}

// This page is dynamic and fetches content via API at request time. Static params were removed to avoid DB access at build-time.


// Generate metadata for SEO (API-only)
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const base = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

    try {
        // Fetch post via API
        const postRes = await fetch(`${base}/api/blog?slug=${encodeURIComponent(slug)}`);
        let post: any = null;
        if (postRes.ok) {
            post = await postRes.json();
        }
        if (!post) {
            return {
                title: 'Post Not Found',
                robots: 'noindex, nofollow',
            };
        }

        const storeRes = await fetch(`${base}/api/store-settings`, { next: { tags: ['store-settings'] } });
        const storePayload = storeRes.ok ? await storeRes.json() : null;
        const store = storePayload?.data || null;

        const stripHtml = (html: string) => html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
        const description = stripHtml(post.content).slice(0, 160) || post.title;
        const keywords = post.tags ? post.tags.split(',').map((t: string) => t.trim()).filter(Boolean) : [];
        const publishedIso = post.createdAt instanceof Date ? post.createdAt.toISOString() : new Date(post.createdAt as unknown as string).toISOString();
        const siteName = store?.storeName || 'Content Solution';
        const authorName = siteName;

        return {
            title: `${post.title} | ${siteName}`,
            description,
            keywords,
            creator: authorName,
            publisher: siteName,
            authors: [{ name: authorName }],
            openGraph: {
                type: 'article',
                siteName,
                title: post.title,
                description,
                images: post.thumbnail ? [{ url: post.thumbnail, alt: post.title }] : [],
                publishedTime: publishedIso,
                authors: [authorName],
                tags: keywords,
            },
            twitter: {
                card: 'summary_large_image',
                title: post.title,
                description,
                images: post.thumbnail ? [post.thumbnail] : [],
                creator: authorName,
            },
            alternates: {
                canonical: `${process.env.NEXT_PUBLIC_BASE_URL || ''}/blog/${post.slug}`,
            },
        };
    } catch (e) {
        return {
            title: 'Post Not Found',
            robots: 'noindex, nofollow',
        };
    }
}
