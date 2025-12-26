"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

export default function ProductsListClient({ products }: { products: any[] }) {
    const [view, setView] = useState<'grid' | 'list'>('grid');
    const [query, setQuery] = useState('');

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return products;
        return products.filter((p: any) => {
            return (p.title || '').toLowerCase().includes(q) || (p.slug || '').toLowerCase().includes(q) || (p.excerpt || '').toLowerCase().includes(q);
        });
    }, [products, query]);

    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2 flex-1">
                    <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search products, models, or descriptions..." className="w-full rounded-lg border border-gray-200 px-3 py-2" />
                </div>
                <div className="inline-flex items-center gap-2">
                    <button onClick={() => setView('grid')} aria-pressed={view === 'grid'} className={`px-3 py-2 rounded ${view === 'grid' ? 'bg-gray-100' : ''}`}>Grid</button>
                    <button onClick={() => setView('list')} aria-pressed={view === 'list'} className={`px-3 py-2 rounded ${view === 'list' ? 'bg-gray-100' : ''}`}>List</button>
                </div>
            </div>

            {filtered.length === 0 ? (
                <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">No products matched your search.</div>
            ) : view === 'grid' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filtered.map((p: any) => (
                        <article key={p.id || p.slug} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
                            <div className="h-56 bg-gray-50 flex items-center justify-center overflow-hidden">
                                <img src={p.thumbnail || '/placeholder-product.png'} alt={p.title} className="w-full h-full object-contain" />
                                {/* Badge */}
                                {p.inventory_status === 'in_stock' && <div className="absolute mt-3 ml-3 bg-green-50 text-green-700 px-3 py-1 rounded-full text-xs font-semibold">In Stock</div>}
                            </div>
                            <div className="p-4 flex flex-col gap-2">
                                <div className="flex items-center justify-between">
                                    <h3 className="font-semibold text-lg truncate">{p.title}</h3>
                                    <div className="text-sm font-bold">{p.price}</div>
                                </div>
                                <p className="text-sm text-gray-500 line-clamp-2">{p.excerpt || p.description || ''}</p>

                                <div className="mt-3 flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-xs text-gray-500">
                                        <span className="inline-flex items-center gap-1">{p.rating ? '★' : ''} <strong className="text-sm text-gray-700">{p.rating || '-'}</strong></span>
                                        <span>•</span>
                                        <span>{p.capacity || p.model || ''}</span>
                                    </div>
                                    <Link href={`/products/${p.slug}`} className="px-3 py-1.5 bg-primary text-white rounded-lg text-sm font-bold">View</Link>
                                </div>
                            </div>
                        </article>
                    ))}
                </div>
            ) : (
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-[#fafafa]">
                            <tr>
                                <th className="px-4 py-3 font-medium">Product</th>
                                <th className="px-4 py-3 font-medium">Price</th>
                                <th className="px-4 py-3 font-medium">Model / Capacity</th>
                                <th className="px-4 py-3 font-medium">Stock</th>
                                <th className="px-4 py-3 font-medium">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((p: any) => (
                                <tr key={p.id || p.slug} className="border-t hover:bg-gray-50 transition-colors">
                                    <td className="px-4 py-4">
                                        <div className="flex items-center gap-4">
                                            <img src={p.thumbnail || '/placeholder-product.png'} alt={p.title} className="h-16 w-28 object-contain rounded" />
                                            <div>
                                                <div className="font-semibold">{p.title}</div>
                                                <div className="text-xs text-gray-500">{p.slug}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-4 font-bold">{p.price}</td>
                                    <td className="px-4 py-4">{p.model || p.capacity || '-'}</td>
                                    <td className="px-4 py-4"><span className={`inline-flex items-center px-2 py-0.5 rounded text-sm font-medium ${p.inventory_status === 'in_stock' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-gray-50 text-gray-700 border border-gray-100'}`}>{p.inventory_status === 'in_stock' ? 'In Stock' : (p.inventory_status || '—')}</span></td>
                                    <td className="px-4 py-4"><Link href={`/products/${p.slug}`} className="px-3 py-1 rounded border border-gray-200 text-sm">View</Link></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
