import React from 'react';
import Link from 'next/link';

interface Post {
    _id?: string;
    id?: string | number;
    title: string;
    slug?: string;
    thumbnail?: string | null;
    metaDescription?: string | null;
}

interface BlogSectionProps {
    posts: Post[];
    section?: {
        title?: string;
        subtitle?: string;
        cta_text?: string;
        cta_link?: string;
        is_active?: number;
    } | null;
}

const BlogSection = ({ posts, section }: BlogSectionProps) => {
    if (section && section.is_active === 0) return null;

    const displayPosts = (posts && posts.length) ? posts.slice(0, 3) : [];

    return (
        <div className="w-full bg-white py-20" id="blog">
            <div className="layout-container flex justify-center px-4 md:px-10">
                <div className="flex flex-col w-full max-w-7xl gap-12">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div className="flex flex-col gap-4 max-w-2xl">
                            <h2 className="text-[#111418] text-3xl md:text-4xl font-black leading-tight">
                                {section?.title || 'From our Blog'}
                            </h2>
                            <p className="text-[#617589] text-lg">
                                {section?.subtitle || 'Latest news, updates, and how-tos from our team.'}
                            </p>
                        </div>
                        {section?.cta_text && section?.cta_link && (
                            <Link
                                href={section.cta_link}
                                className="text-primary font-bold flex items-center"
                            >
                                {section.cta_text} <span className="material-symbols-outlined ml-1">arrow_forward</span>
                            </Link>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {displayPosts.length ? displayPosts.map((post, i) => (
                            <Link key={i} href={`/blog/${post.slug || post.id}`} className="block group overflow-hidden rounded-xl border border-gray-100">
                                <div className="aspect-[16/9] bg-cover bg-center" style={{ backgroundImage: `url('${post.thumbnail || 'https://via.placeholder.com/600x400?text=Blog'}')` }} />
                                <div className="p-4">
                                    <h3 className="text-lg font-bold text-[#111418]">{post.title}</h3>
                                    {post.metaDescription && <p className="text-sm text-slate-600 mt-2">{post.metaDescription}</p>}
                                </div>
                            </Link>
                        )) : (
                            <div className="text-center py-8 col-span-full">
                                <p className="text-lg text-slate-600">No posts to show yet.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BlogSection;
