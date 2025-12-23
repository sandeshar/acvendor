import BlogHero from "@/components/BlogPage/BlogHero";
import BlogSearch from "@/components/BlogPage/BlogSearch";
import BlogGrid from "@/components/BlogPage/BlogGrid";
import BlogPagination from "@/components/BlogPage/BlogPagination";
import BlogCTA from "@/components/BlogPage/BlogCTA";
import { storeSettings } from "@/db/schema";
import type { Metadata } from "next";

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

const POSTS_PER_PAGE = 6;

async function getBlogHeroData() {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    try {
        const res = await fetch(`${baseUrl}/api/pages/blog/hero`, { next: { tags: ['blog-hero'] } });
        return await res.json();
    } catch (error) {
        console.error('Error fetching blog hero:', (error as Error)?.message ?? String(error));
        return {
            title: "The Content Solution Blog",
            subtitle: "Expert insights, trends, and strategies in content marketing for Nepali businesses.",
            background_image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBP7wRSP6PNVQerc44qHCLRoYYd7gD0XXulRDkuPttKz8c2wm7R80QfOir0XcMWFKjBGgyJ5pcMWrIKbPt6SCgNWruICSXdJlao0ovxqmc5rLvSBMdY5X6oZLjHPx9qPTGkgNMIYnTzo9hXeQxzkwUbhDDc7WVvEd49h17mKa6w8QfB2EIEDD7W8XIG5RncWJ-n5n8nCSqHu4E6zkNP0BsMHsoIQz9Vpi8C5qNBL4Po-ca4mAAVTciZ-3q8TREYwunoIejOppPSO_k"
        };
    }
}

async function getBlogCTAData() {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    try {
        const res = await fetch(`${baseUrl}/api/pages/blog/cta`, { cache: 'no-store' });
        return await res.json();
    } catch (error) {
        console.error('Error fetching blog cta:', (error as Error)?.message ?? String(error));
        return {
            title: "Stay Ahead of the Curve",
            description: "Get the latest content marketing tips delivered to your inbox.",
            button_text: "Subscribe"
        };
    }
}

export default async function BlogPage({
    searchParams,
}: {
    searchParams: Promise<{ page?: string; search?: string; category?: string }>;
}) {
    const [params, heroData, ctaData] = await Promise.all([
        searchParams,
        getBlogHeroData(),
        getBlogCTAData()
    ]);

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const currentPage = Math.max(1, parseInt(params.page || '1'));
    const searchQuery = params.search?.trim() || '';
    const categoryFilter = params.category?.trim() || '';
    const offset = (currentPage - 1) * POSTS_PER_PAGE;

    // Call blog API with search, category and pagination
    const q = new URLSearchParams();
    q.set('limit', String(POSTS_PER_PAGE));
    q.set('offset', String(offset));
    if (searchQuery) q.set('search', searchQuery);
    if (categoryFilter && categoryFilter !== 'All') q.set('category', categoryFilter);
    q.set('meta', 'true');

    const res = await fetch(`${baseUrl}/api/blog?${q.toString()}`, { next: { tags: ['blog-posts'] } });
    const body = await res.json();
    const posts = Array.isArray(body) ? body : body.posts || [];
    const totalPosts = Array.isArray(body) ? body.length : Number(body.total || 0);
    const totalPages = Math.ceil(totalPosts / POSTS_PER_PAGE);

    // Get all unique categories from tags (fallback to fetching all posts)
    const allRes = await fetch(`${baseUrl}/api/blog`, { next: { tags: ['blog-posts'] } });
    const allPosts = allRes.ok ? await allRes.json() : [];
    const categoriesSet = new Set<string>();
    (allPosts || []).forEach((post: any) => {
        if (post.tags) {
            post.tags.split(',').forEach((tag: string) => {
                const trimmed = tag.trim();
                if (trimmed) categoriesSet.add(trimmed);
            });
        }
    });
    const categories = ['All', ...Array.from(categoriesSet).sort()];

    return (
        <main className="flex flex-col items-center page-bg">
            <div className="flex flex-col w-full max-w-7xl py-5">
                <BlogHero data={heroData} />
                <BlogSearch
                    categories={categories}
                    currentCategory={categoryFilter || 'All'}
                    currentSearch={searchQuery}
                />
                <BlogGrid posts={posts} />
                {totalPosts === 0 && (
                    <div className="text-center py-16">
                        <p className="text-xl text-slate-600">
                            {searchQuery || categoryFilter
                                ? 'No posts found matching your filters. Try adjusting your search.'
                                : 'No blog posts available yet.'}
                        </p>
                    </div>
                )}
                <BlogPagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    searchQuery={searchQuery}
                    category={categoryFilter}
                />
                <BlogCTA data={ctaData} />
            </div>
        </main>
    );
}

export async function generateMetadata(): Promise<Metadata> {
    try {
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
        const res = await fetch(`${baseUrl}/api/store-settings`, { cache: 'no-store' });
        const payload = res.ok ? await res.json() : null;
        const store = payload?.data || payload;
        const siteName = store?.storeName || store?.store_name || "Content Store";
        const title = `Blog | ${siteName}`;
        const description = store?.metaDescription || store?.meta_description || store?.storeDescription || store?.store_description || "Read the latest articles.";
        return {
            title,
            description,
            creator: siteName,
            publisher: siteName,
            openGraph: {
                type: "website",
                siteName,
                title,
                description,
            },
        };
    } catch (error) {
        return { title: 'Blog' };
    }
}
