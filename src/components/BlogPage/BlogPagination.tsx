import React from 'react';
import Link from 'next/link';

interface BlogPaginationProps {
    currentPage: number;
    totalPages: number;
    searchQuery?: string;
    category?: string;
}

const BlogPagination = ({ currentPage, totalPages, searchQuery, category }: BlogPaginationProps) => {
    if (totalPages <= 1) return null;

    // Build query string with filters
    const buildUrl = (page: number) => {
        const params = new URLSearchParams();
        params.set('page', page.toString());
        if (searchQuery) params.set('search', searchQuery);
        if (category && category !== 'All') params.set('category', category);
        return `/blog?${params.toString()}`;
    };

    // Generate array of page numbers to display
    const getPageNumbers = () => {
        const pages: (number | string)[] = [];
        const showEllipsis = totalPages > 7;

        if (!showEllipsis) {
            // Show all pages if 7 or fewer
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            // Show first page, last page, current and surrounding pages with ellipsis
            pages.push(1);

            if (currentPage > 3) {
                pages.push('...');
            }

            for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
                pages.push(i);
            }

            if (currentPage < totalPages - 2) {
                pages.push('...');
            }

            pages.push(totalPages);
        }

        return pages;
    };

    const pages = getPageNumbers();

    return (
        <div className="flex justify-center items-center gap-2 mt-10">
            <Link
                href={buildUrl(currentPage - 1)}
                className={`flex items-center justify-center h-10 w-10 rounded-lg bg-slate-200 text-slate-700 hover:bg-slate-300 transition-colors ${currentPage === 1 ? 'pointer-events-none opacity-50' : ''
                    }`}
                aria-disabled={currentPage === 1}
            >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                </svg>
            </Link>

            {pages.map((page, index) => {
                if (page === '...') {
                    return (
                        <span key={`ellipsis-${index}`} className="flex items-center justify-center h-10 w-10 text-slate-500">
                            ...
                        </span>
                    );
                }

                const pageNum = page as number;
                return (
                    <Link
                        key={pageNum}
                        href={buildUrl(pageNum)}
                        className={`flex items-center justify-center h-10 w-10 rounded-lg text-sm font-bold transition-colors ${pageNum === currentPage
                            ? 'bg-primary text-white'
                            : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                            }`}
                    >
                        {pageNum}
                    </Link>
                );
            })}

            <Link
                href={buildUrl(currentPage + 1)}
                className={`flex items-center justify-center h-10 w-10 rounded-lg bg-slate-200 text-slate-700 hover:bg-slate-300 transition-colors ${currentPage === totalPages ? 'pointer-events-none opacity-50' : ''
                    }`}
                aria-disabled={currentPage === totalPages}
            >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                </svg>
            </Link>
        </div>
    );
};

export default BlogPagination;