"use client";

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

export default function ProductsPagination({ currentPage, hasMore }: { currentPage: number, hasMore: boolean }) {
    const searchParams = useSearchParams();
    const category = searchParams?.get('category');
    const subcategory = searchParams?.get('subcategory');

    const buildHref = (newPage: number) => {
        const params = new URLSearchParams();
        if (category) params.set('category', category);
        if (subcategory) params.set('subcategory', subcategory);
        if (newPage && newPage > 1) params.set('page', String(newPage));
        const qs = params.toString();
        return `/products${qs ? `?${qs}` : ''}`;
    };

    const page = Math.max(1, currentPage || 1);

    return (
        <div className="flex justify-center mt-8">
            <nav aria-label="Pagination" className="flex items-center gap-2">
                {page > 1 ? (
                    <Link href={buildHref(page - 1)} className="w-10 h-10 flex items-center justify-center rounded-lg border border-[#e5e7eb] hover:bg-gray-50 text-[#111418]" aria-label="Previous page">
                        <span className="material-symbols-outlined">chevron_left</span>
                    </Link>
                ) : (
                    <button disabled className="w-10 h-10 flex items-center justify-center rounded-lg border border-[#e5e7eb] text-[#9aa4ad]" aria-label="Previous page disabled">
                        <span className="material-symbols-outlined">chevron_left</span>
                    </button>
                )}

                {page > 1 && (
                    <Link href={buildHref(page - 1)} className="w-10 h-10 flex items-center justify-center rounded-lg border border-[#e5e7eb] hover:bg-gray-50 text-[#111418]">{page - 1}</Link>
                )}

                <span className="w-10 h-10 flex items-center justify-center rounded-lg bg-primary text-white font-bold">{page}</span>

                {hasMore ? (
                    <Link href={buildHref(page + 1)} className="w-10 h-10 flex items-center justify-center rounded-lg border border-[#e5e7eb] hover:bg-gray-50 text-[#111418]">{page + 1}</Link>
                ) : null}

                {hasMore ? (
                    <Link href={buildHref(page + 1)} className="w-10 h-10 flex items-center justify-center rounded-lg border border-[#e5e7eb] hover:bg-gray-50 text-[#111418]" aria-label="Next page">
                        <span className="material-symbols-outlined">chevron_right</span>
                    </Link>
                ) : (
                    <button disabled className="w-10 h-10 flex items-center justify-center rounded-lg border border-[#e5e7eb] text-[#9aa4ad]" aria-label="Next page disabled">
                        <span className="material-symbols-outlined">chevron_right</span>
                    </button>
                )}
            </nav>
        </div>
    );
}
