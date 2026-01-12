'use client';

import React, { useState, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

interface CategoryOption { name: string; slug: string }

interface BlogSearchProps {
    categories: CategoryOption[];
    currentCategorySlug: string;
    currentSearch: string;
}

const BlogSearch = ({ categories, currentCategorySlug, currentSearch }: BlogSearchProps) => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [searchValue, setSearchValue] = useState(currentSearch);
    const [isPending, startTransition] = useTransition();

    const handleSearch = (value: string) => {
        const params = new URLSearchParams(searchParams.toString());
        if (value) {
            params.set('search', value);
        } else {
            params.delete('search');
        }
        params.delete('page'); // Reset to page 1 on search

        startTransition(() => {
            router.push(`/blog?${params.toString()}`);
        });
    };

    const handleCategoryClick = (slug: string) => {
        const params = new URLSearchParams(searchParams.toString());
        if (!slug) {
            params.delete('category');
        } else {
            params.set('category', slug);
        }
        params.delete('page'); // Reset to page 1 on category change

        startTransition(() => {
            router.push(`/blog?${params.toString()}`);
        });
    };

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleSearch(searchValue);
        }
    };

    return (
        <div className="mb-10 px-4">
            <div className="flex flex-col md:flex-row gap-6 items-center">
                <div className="w-full md:max-w-sm">
                    <label className="flex flex-col min-w-40 w-full h-12">
                        <div className="flex w-full flex-1 items-stretch rounded-xl h-full shadow-lg">
                            <div className="text-slate-500 flex bg-white items-center justify-center pl-4 rounded-l-xl">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                                </svg>
                            </div>
                            <input
                                type="text"
                                value={searchValue}
                                onChange={(e) => setSearchValue(e.target.value)}
                                onKeyPress={handleKeyPress}
                                onBlur={() => handleSearch(searchValue)}
                                className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-r-xl text-slate-900 focus:outline-0 focus:ring-2 focus:ring-primary/50 border-none bg-white h-full placeholder:text-slate-500 px-4 pl-2 text-base font-normal leading-normal"
                                placeholder="Search articles..."
                            />
                        </div>
                    </label>
                </div>
                <div className="flex gap-2 p-1 flex-wrap justify-center">
                    {categories.map((category) => (
                        <button
                            key={category.slug}
                            onClick={() => handleCategoryClick(category.slug)}
                            disabled={isPending}
                            className={`flex h-9 shrink-0 cursor-pointer items-center justify-center gap-x-2 rounded-full pl-4 pr-4 transition-colors ${category.slug === currentCategorySlug
                                ? 'bg-primary/20 text-primary'
                                : 'bg-slate-200 hover:bg-slate-300 text-slate-700'
                                } ${isPending ? 'opacity-50 cursor-wait' : ''}`}
                        >
                            <p className="text-sm font-medium leading-normal">
                                {category.name}
                            </p>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default BlogSearch;
