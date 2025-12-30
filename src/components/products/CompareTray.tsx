"use client";

import Link from 'next/link';

export default function CompareTray({ items, removeItem, clear }: { items: any[], removeItem: (id: number) => void, clear: () => void }) {
    const ids = items.map(i => i.id).join(',');

    if (!items || items.length === 0) return null;

    return (
        <div className="fixed bottom-6 right-6 z-50 w-[320px] bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
            <div className="flex items-center justify-between p-3 border-b">
                <div className="text-sm font-bold">Compare ({items.length})</div>
                <div className="flex items-center gap-2">
                    <button onClick={() => clear()} className="text-xs text-gray-500 hover:text-gray-700">Clear</button>
                    {items.length >= 2 && (
                        <Link href={`/products/compare?ids=${encodeURIComponent(ids)}`} className="bg-primary text-white px-3 py-1 rounded">Compare</Link>
                    )}
                </div>
            </div>
            <div className="p-3 max-h-40 overflow-auto">
                {items.map(it => (
                    <div key={it.id} className="flex items-center gap-3 mb-2">
                        <img src={it.thumbnail || '/placeholder-product.png'} alt={it.title} className="h-10 w-10 object-contain rounded" />
                        <div className="flex-1 text-sm">
                            <div className="font-medium truncate">{it.title}</div>
                            <div className="text-xs text-gray-500">{it.price}</div>
                        </div>
                        <button onClick={() => removeItem(it.id)} className="text-sm text-gray-500">Remove</button>
                    </div>
                ))}
            </div>
        </div>
    );
}
