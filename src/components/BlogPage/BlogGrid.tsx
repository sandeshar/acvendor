import React from 'react';
import ArticleCard from './ArticleCard';
import Link from 'next/link';

interface BlogPost {
    id: number;
    slug: string;
    title: string;
    content: string;
    tags: string | null;
    thumbnail: string | null;
    authorId: number | null;
    status: number;
    createdAt: Date;
    updatedAt: Date;
}

interface BlogGridProps {
    posts: BlogPost[];
}

const BlogGrid = ({ posts }: BlogGridProps) => {
    // Helper function to extract first category from tags
    const getCategory = (tags: string | null) => {
        if (!tags) return 'Article';
        const tagArray = tags.split(',');
        return tagArray[0]?.trim() || 'Article';
    };

    // Helper function to format date
    const formatDate = (date: Date) => {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    // Helper function to estimate read time from content
    const estimateReadTime = (content: string) => {
        const wordsPerMinute = 200;
        const wordCount = content.split(/\s+/).length;
        const minutes = Math.ceil(wordCount / wordsPerMinute);
        return `${minutes} min read`;
    };

    // Helper function to create excerpt from content
    const createExcerpt = (content: string, maxLength: number = 150) => {
        const strippedContent = content.replace(/<[^>]*>/g, '');
        if (strippedContent.length <= maxLength) return strippedContent;
        return strippedContent.substring(0, maxLength).trim() + '...';
    };

    if (posts.length === 0) {
        return (
            <div className="p-8 text-center">
                <p className="text-xl text-slate-600">No blog posts available yet. Check back soon!</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 gap-8 p-4 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
                <Link key={post.id} href={`/products/${post.slug}`}>
                    <ArticleCard
                        category={getCategory(post.tags)}
                        title={post.title}
                        excerpt={createExcerpt(post.content)}
                        author="Content Solution Nepal"
                        date={formatDate(post.createdAt)}
                        readTime={estimateReadTime(post.content)}
                        image={post.thumbnail || 'https://placehold.co/600x400?text=Blog+Post'}
                    />
                </Link>
            ))}
        </div>
    );
};

export default BlogGrid;
