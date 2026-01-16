"use client";

import { useRouter, useSearchParams } from 'next/navigation';

export default function SortDropdown({ currentSort }: { currentSort: string }) {
    const router = useRouter();
    const searchParams = useSearchParams();

    const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const val = e.target.value;
        const params = new URLSearchParams(searchParams?.toString());
        if (val) {
            params.set('sort', val);
        } else {
            params.delete('sort');
        }
        // Reset to page 1 when sorting changes
        params.delete('page');
        router.push(`?${params.toString()}`, { scroll: false });
    };

    return (
        <select
            value={currentSort}
            onChange={handleSortChange}
            className="h-9 rounded-lg border-gray-200 text-sm bg-white text-[#111418] focus:ring-primary focus:border-primary"
        >
            <option value="">Sort by: Recommended</option>
            <option value="newest">Newest First</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="name_asc">Name: A to Z</option>
            <option value="name_desc">Name: Z to A</option>
            <option value="capacity_asc">Capacity: Low to High</option>
            <option value="capacity_desc">Capacity: High to Low</option>
        </select>
    );
}
