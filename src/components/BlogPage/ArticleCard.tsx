import React from 'react';

interface ArticleCardProps {
    category: string;
    title: string;
    excerpt: string;
    author: string;
    date: string;
    readTime: string;
    image: string;
}

const ArticleCard = ({ category, title, excerpt, author, date, readTime, image }: ArticleCardProps) => {
    return (
        <article className="group flex flex-col overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-slate-200 transition-shadow hover:shadow-md">
            <div className="aspect-video overflow-hidden">
                <img
                    src={image}
                    alt={title}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
            </div>
            <div className="flex flex-1 flex-col gap-3 p-6">
                <span className="w-fit rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                    {category}
                </span>
                <h3 className="text-xl font-bold leading-tight text-slate-900">
                    {title}
                </h3>
                <p className="text-sm leading-relaxed text-slate-600">
                    {excerpt}
                </p>
                <div className="mt-auto flex items-center gap-4 border-t border-slate-100 pt-4 text-xs text-slate-500">
                    <span className="font-medium">{author}</span>
                    <span>•</span>
                    <span>{date}</span>
                    <span>•</span>
                    <span>{readTime}</span>
                </div>
            </div>
        </article>
    );
};

export default ArticleCard;
