import { notFound } from 'next/navigation';
export const dynamic = 'force-dynamic';
import ShareButtons from '@/components/BlogPage/ShareButtons';

import type { BlogPostPageProps } from '@/types/pages';

export default async function BlogPostPage({ params }: BlogPostPageProps) {
    const { slug } = await params;

    // Fetch the blog post by slug via API
    const base = process.env.NEXT_PUBLIC_BASE_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    let post: any = null;
    try {
        const postRes = await fetch(`${base}/api/blog?slug=${encodeURIComponent(slug)}`);
        if (!postRes.ok) {
            const bodyText = await postRes.text();
            console.error(`Failed fetching blog post for slug=${slug} status=${postRes.status} body=${bodyText}`);
        } else {
            const payload = await postRes.json();
            // API returns single post object when slug passed
            post = payload?.id ? payload : null;
            if (!post) {
                console.error(`Blog API returned non-post payload for slug=${slug}: ${JSON.stringify(payload)}`);
            }
        }
    } catch (err) {
        console.error('Error fetching blog post:', err);
    }

    // If post doesn't exist or is not published, show 404.
    // Accept numeric status 2, status string 'published', or a statusName of 'published'.
    const isPublished = post && (
        post.status === 2 ||
        post.status === 'published' ||
        (post.statusName && String(post.statusName).toLowerCase() === 'published')
    );
    if (!post || !isPublished) {
        notFound();
    }

    // Fetch store settings via API
    let store: any = null;
    try {
        const storeRes = await fetch(`${base}/api/store-settings`, { next: { tags: ['store-settings'] } });
        if (storeRes.ok) {
            const payload = await storeRes.json();
            store = payload?.data || null;
        }
    } catch (e) {
        store = null;
    }

    // Format the date
    const formattedDate = new Date(post.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });

    // Get category from tags for breadcrumb
    const category = post.tags ? post.tags.split(',')[0]?.trim() : 'Blog';

    // Fetch related articles via API and filter out current post
    let relatedFiltered: any[] = [];
    try {
        const relRes = await fetch(`${base}/api/blog?limit=3`);
        if (relRes.ok) {
            const relPayload = await relRes.json();
            if (Array.isArray(relPayload)) {
                relatedFiltered = relPayload.filter((p: any) => p.slug !== post.slug).slice(0, 2);
            }
        }
    } catch (e) {
        relatedFiltered = [];
    }

    return (
        <main className="grow bg-white">
            <div className="mx-auto max-w-4xl px-4 py-8 md:py-16 sm:px-6 lg:px-8">
                {/* Breadcrumbs */}
                <div className="flex flex-wrap gap-2 mb-8">
                    <a
                        href="/"
                        className="text-slate-600 hover:text-primary text-sm font-medium leading-normal"
                    >
                        Home
                    </a>
                    <span className="text-slate-600 text-sm font-medium leading-normal">/</span>
                    <a
                        href="/blog"
                        className="text-slate-600 hover:text-primary text-sm font-medium leading-normal"
                    >
                        Blog
                    </a>
                    <span className="text-slate-600 text-sm font-medium leading-normal">/</span>
                    <span className="text-slate-900 text-sm font-medium leading-normal truncate">
                        {post.title}
                    </span>
                </div>

                <article>
                    {/* Header */}
                    <header className="mb-8">
                        <div className="flex flex-col gap-4 mb-8">
                            {category && (
                                <p className="text-primary text-base font-bold leading-normal">
                                    {category}
                                </p>
                            )}
                            <h1 className="text-4xl md:text-5xl font-black leading-tight tracking-tight text-slate-900">
                                {post.title}
                            </h1>
                        </div>

                        {/* Author Info and Share */}
                        <div className="flex flex-wrap items-center justify-between gap-6 border-y border-slate-200 py-6 mb-8">
                            <div className="flex items-center gap-4">
                                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                                    <span className="material-symbols-outlined text-2xl">person</span>
                                </div>
                                <div>
                                    <p className="text-slate-900 text-base font-bold leading-normal">
                                        {store?.storeName || store?.store_name || 'Author'}
                                    </p>
                                    <p className="text-slate-600 text-sm font-normal leading-normal">
                                        Published on {formattedDate} • {Math.ceil(post.content.split(/\s+/).length / 200)} min read
                                    </p>
                                </div>
                            </div>
                            <ShareButtons
                                title={post.title}
                                url={`${process.env.NEXT_PUBLIC_BASE_URL || ''}/blog/${post.slug}`}
                            />
                        </div>

                        {/* Featured Image */}
                        {post.thumbnail && (
                            <div className="mb-8">
                                <img
                                    src={post.thumbnail}
                                    alt={post.title}
                                    className="w-full h-auto object-cover rounded-xl aspect-video"
                                />
                            </div>
                        )}
                    </header>

                    {/* Article Body */}
                    <div
                        className="prose prose-lg prose-slate max-w-none text-slate-900 prose-headings:font-bold prose-headings:text-slate-900 prose-a:text-primary hover:prose-a:text-primary/80 prose-strong:text-slate-900 prose-img:rounded-lg blog-content"
                        dangerouslySetInnerHTML={{ __html: post.content }}
                    />

                    {/* Inline CTA */}
                    <div className="my-12 p-8 bg-primary/10 rounded-xl flex flex-col md:flex-row items-center gap-8">
                        <div className="shrink-0">
                            <div className="flex items-center justify-center size-16 bg-primary text-white rounded-full">
                                <span className="material-symbols-outlined" style={{ fontSize: '32px' }}>
                                    auto_stories
                                </span>
                            </div>
                        </div>
                        <div className="grow">
                            <h3 className="text-xl font-bold text-slate-900 mb-2">
                                Ready to Elevate Your Content?
                            </h3>
                            <p className="text-slate-600">
                                Get in touch with us to discuss how we can help transform your content strategy and drive results.
                            </p>
                        </div>
                        <div className="shrink-0">
                            <a
                                href="/contact"
                                className="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-6 bg-primary text-white text-base font-bold leading-normal tracking-wide hover:bg-primary/90 transition-colors"
                            >
                                <span className="truncate">Get Started</span>
                            </a>
                        </div>
                    </div>

                    {/* Related Articles */}
                    {relatedFiltered.length > 0 && (
                        <section className="mt-16 pt-12 border-t border-slate-200">
                            <h2 className="text-3xl font-bold text-slate-900 mb-8">Related Articles</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {relatedFiltered.map((related) => {
                                    const relatedDate = new Date(related.createdAt).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'short',
                                        day: 'numeric',
                                    });
                                    const stripHtml = (html: string) => html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
                                    const excerpt = stripHtml(related.content).slice(0, 120) + '...';

                                    return (
                                        <div key={related.id} className="flex flex-col group">
                                            <a
                                                href={`/blog/${related.slug}`}
                                                className="block overflow-hidden rounded-lg mb-4"
                                            >
                                                <img
                                                    src={related.thumbnail || 'https://placehold.co/600x400?text=Blog+Post'}
                                                    alt={related.title}
                                                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                                                />
                                            </a>
                                            <h3 className="text-xl font-bold leading-tight mb-2">
                                                <a
                                                    href={`/blog/${related.slug}`}
                                                    className="text-slate-900 hover:text-primary transition-colors"
                                                >
                                                    {related.title}
                                                </a>
                                            </h3>
                                            <p className="text-slate-600 text-sm mb-2">{excerpt}</p>
                                            <p className="text-slate-500 text-xs">{relatedDate}</p>
                                        </div>
                                    );
                                })}
                            </div>
                        </section>
                    )}
                </article>
            </div>
        </main>
    );
}

// This page is dynamic and fetches content via API at request time. Static params were removed to avoid DB access at build-time.


// Generate metadata for SEO (API-only)
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const base = process.env.NEXT_PUBLIC_BASE_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    try {
        // Fetch post via API
        let post: any = null;
        try {
            const postRes = await fetch(`${base}/api/blog?slug=${encodeURIComponent(slug)}`);
            if (postRes.ok) {
                post = await postRes.json();
            } else {
                const bodyText = await postRes.text();
                console.error(`Failed fetching blog post for slug=${slug} in generateMetadata - status=${postRes.status} body=${bodyText}`);
            }
        } catch (err) {
            console.error('Error fetching blog post in generateMetadata:', err);
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
