"use client";

import Link from 'next/link';
import useCompare from './useCompare';

export default function CompareFloatingButton() {
    const { items } = useCompare();
    if (!items || items.length === 0) return null;
    const ids = items.map(i => String(i._id ?? i.id)).join(',');

    return (
        <div className="fixed bottom-24 right-6 z-50">
            <Link href={`/products/compare?ids=${encodeURIComponent(ids)}`} className="inline-flex items-center gap-3 bg-primary text-white px-4 py-2 rounded-full shadow-lg hover:shadow-xl transition-shadow">
                <span className="font-semibold">Compare</span>
                <span className="inline-flex items-center justify-center bg-white text-primary rounded-full w-6 h-6 text-sm font-bold">{items.length}</span>
            </Link>
        </div>
    );
}