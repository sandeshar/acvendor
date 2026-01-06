"use client";

import { useMemo, useState, useEffect } from "react";
import Link from "next/link";
import Star from '@/components/icons/Star';
import useCompare from './useCompare';
import CompareTray from './CompareTray';
import { formatPrice } from '@/utils/formatPrice';


export default function ProductsListClient({ products, productPathPrefix, searchContext }: { products: any[], productPathPrefix?: string, searchContext?: { category?: string, subcategory?: string, minPrice?: string, maxPrice?: string, status?: string } }) {
    const [view, setView] = useState<'grid' | 'list'>('grid');
    const [query, setQuery] = useState('');

    const [remoteProducts, setRemoteProducts] = useState<any[] | null>(null);
    const [loading, setLoading] = useState(false);

    // Compare hook for inline buttons and tray (so grid/list can show + beside price and tray uses same state)
    const { items, addItem, removeItem, clear, contains } = useCompare();

    const filteredLocal = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return products;
        return products.filter((p: any) => {
            return (p.title || '').toLowerCase().includes(q) || (p.slug || '').toLowerCase().includes(q) || (p.excerpt || '').toLowerCase().includes(q);
        });
    }, [products, query]);

    useEffect(() => {
        let active = true;
        const q = query.trim();
        if (!q) {
            setRemoteProducts(null);
            setLoading(false);
            return;
        }
        const timer = setTimeout(async () => {
            try {
                setLoading(true);
                const params = new URLSearchParams();
                params.set('q', q);
                params.set('limit', '48');
                if (searchContext?.category) params.set('category', searchContext.category);
                if (searchContext?.subcategory) params.set('subcategory', searchContext.subcategory);
                if (searchContext?.minPrice) params.set('minPrice', searchContext.minPrice);
                if (searchContext?.maxPrice) params.set('maxPrice', searchContext.maxPrice);
                if (searchContext?.status) params.set('status', searchContext.status);
                const res = await fetch(`/api/products?${params.toString()}`);
                if (!res.ok) {
                    if (active) setRemoteProducts([]);
                    return;
                }
                const data = await res.json();
                if (active) {
                    const normalizeValue = (v: any): any => {
                        if (v && typeof v === 'object') {
                            if ('$numberDecimal' in v) return String(v['$numberDecimal']);
                            if (Array.isArray(v)) return v.map(normalizeValue);
                            const out: any = {};
                            for (const k of Object.keys(v)) out[k] = normalizeValue(v[k]);
                            return out;
                        }
                        return v;
                    };
                    const normalize = (list: any[]) => Array.isArray(list) ? list.map((p: any) => normalizeValue(p)) : [];
                    setRemoteProducts(normalize(Array.isArray(data) ? data : []));
                }
            } catch (e) {
                console.error('Error performing remote product search:', (e as Error)?.message || String(e));
                if (active) setRemoteProducts([]);
            } finally {
                if (active) setLoading(false);
            }
        }, 300);

        return () => { active = false; clearTimeout(timer); };
    }, [query, searchContext?.category]);

    const displayedProducts = remoteProducts !== null ? remoteProducts : filteredLocal;

    // helpers for inline price compare buttons
    function containsButtonIcon(p: any) {
        const pid = p?._id ?? p?.id;
        return pid && contains(pid) ? 'check' : 'add';
    }
    function containsButtonClass(p: any) {
        const pid = p?._id ?? p?.id;
        return pid && contains(pid) ? 'bg-primary/10 border-primary text-primary' : 'border-[#e5e7eb] text-[#111418] hover:bg-gray-50';
    }
    function containsButtonAria(p: any) {
        const pid = p?._id ?? p?.id;
        return pid && contains(pid) ? 'Remove from compare' : 'Add to compare';
    }
    function onCompareClick(e: any, product: any) {
        e.preventDefault();
        const pid = product?._id ?? product?.id;
        if (!pid) return;
        if (contains(pid)) removeItem(pid);
        else addItem({ _id: product._id, id: product.id, slug: product.slug, title: product.title, thumbnail: product.thumbnail, price: product.price });
    }

    // Compare button component (uses local compare hook)
    function CompareButton({ product }: { product: any }) {
        const pid = product?._id ?? product?.id;
        const selected = pid ? contains(pid) : false;
        const onClick = (e: any) => {
            e.preventDefault();
            if (!pid) return;
            if (selected) removeItem(pid);
            else addItem({ _id: product._id, id: product.id, slug: product.slug, title: product.title, thumbnail: product.thumbnail, price: product.price });
        };
        return (
            <button onClick={onClick} className={`h-9 w-9 flex items-center justify-center rounded-lg border ${selected ? 'bg-primary/10 border-primary text-primary' : 'border-[#e5e7eb] text-[#111418] hover:bg-gray-50'} transition-colors`}>
                <span className="material-symbols-outlined text-[20px]">{selected ? 'check' : 'add'}</span>
            </button>
        );
    }

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

            {loading ? (
                <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">Searching...</div>
            ) : displayedProducts.length === 0 ? (
                <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">No products matched your search.</div>
            ) : view === 'grid' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {displayedProducts.map((p: any) => (
                        <article key={p.id ?? p._id ?? p.slug} className="group flex flex-col bg-white rounded-xl border border-[#e5e7eb] overflow-hidden hover:shadow-lg hover:border-primary/50 transition-all duration-300">
                            <div className="relative h-48 w-full bg-[#f3f6f9] flex items-center justify-center p-4">
                                {p.inventory_status === 'in_stock' && (
                                    <div className="absolute top-3 left-3 bg-green-500 text-white text-[10px] font-bold px-2 py-1 rounded">IN STOCK</div>
                                )}

                                {/* Replace with actual product image */}
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img alt={p.title || 'Product image'} className="h-full w-auto object-contain mix-blend-multiply" src={p.thumbnail || '/placeholder-product.png'} />

                                <button className="absolute top-3 right-3 p-1.5 rounded-full bg-white text-gray-400 hover:text-red-500 transition-colors shadow-sm">
                                    <span className="material-symbols-outlined text-[20px]">favorite</span>
                                </button>
                            </div>
                            <div className="p-4 flex flex-col flex-1 gap-2">
                                <div className="flex items-center gap-2 mb-1">
                                    {p.category?.slug ? (
                                        <Link href={`/shop/category/${encodeURIComponent(p.category.slug)}`} className="text-xs font-semibold text-primary bg-blue-50 px-2 py-0.5 rounded">{p.category?.name || p.category_name || 'Category'}</Link>
                                    ) : (
                                        <span className="text-xs font-semibold text-primary bg-blue-50 px-2 py-0.5 rounded">{p.category_name || 'Category'}</span>
                                    )}
                                    <span className="text-xs font-medium text-gray-500">{p.model || p.capacity || ''}</span>
                                </div>
                                <h3 className="text-lg font-bold text-[#111418] group-hover:text-primary transition-colors">{p.title}</h3>
                                <p className="text-sm text-[#617589] line-clamp-2">{p.excerpt || p.description || ''}</p>

                                {/* Price row: show price and compare add button */}
                                <div className="flex items-center justify-between mt-3">
                                    <div className="text-lg font-bold text-[#111418]">
                                        {Number(p.price) > 0 ? `NPR ${formatPrice(p.price)}` : (
                                            <span className="text-sm font-semibold text-primary/80">Contact for Price</span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button aria-label={containsButtonAria(p) ? 'Remove from compare' : 'Add to compare'} onClick={(e) => onCompareClick(e, p)} className={`h-9 w-9 flex items-center justify-center rounded-lg border bg-white shadow-sm relative z-10 ${containsButtonClass(p)} transition-colors`}>
                                            <span className="material-symbols-outlined text-[20px]">{containsButtonIcon(p)}</span>
                                        </button>
                                    </div>
                                </div>

                                <div className="mt-3 pt-3 border-t border-[#f0f2f4] flex gap-2 items-center">
                                    <Link href={`${productPathPrefix || '/products'}/${p.slug}`} className="flex-1 h-9 rounded-lg bg-primary hover:bg-blue-600 text-white text-sm font-bold transition-colors flex items-center justify-center">View Details</Link>
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
                            {displayedProducts.map((p: any) => (
                                <tr key={p.id ?? p._id ?? p.slug} className="border-t hover:bg-gray-50 transition-colors">
                                    <td className="px-4 py-4">
                                        <div className="flex items-center gap-4">
                                            <img src={p.thumbnail || '/placeholder-product.png'} alt={p.title} className="h-16 w-28 object-contain rounded" />
                                            <div>
                                                <div className="font-semibold">{p.title}</div>
                                                <div className="text-xs text-gray-500">{p.slug}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-4 font-bold">{Number(p.price) > 0 ? `NPR ${formatPrice(p.price)}` : <span className="text-xs text-primary/80">Contact for Price</span>}</td>
                                    <td className="px-4 py-4">{p.model || p.capacity || '-'}</td>
                                    <td className="px-4 py-4"><span className={`inline-flex items-center px-2 py-0.5 rounded text-sm font-medium ${p.inventory_status === 'in_stock' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-gray-50 text-gray-700 border border-gray-100'}`}>{p.inventory_status === 'in_stock' ? 'In Stock' : (p.inventory_status || '—')}</span></td>
                                    <td className="px-4 py-4">
                                        <div className="flex items-center gap-2">
                                            <Link href={`${productPathPrefix || '/products'}/${p.slug}`} className="px-3 py-1 rounded border border-gray-200 text-sm">View</Link>
                                            <button onClick={(e) => onCompareClick(e, p)} aria-label={containsButtonAria(p)} className={`h-8 w-8 flex items-center justify-center rounded border bg-white shadow-sm relative z-10 ${containsButtonClass(p)}`}>
                                                <span className="material-symbols-outlined text-[18px]">{containsButtonIcon(p)}</span>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
            <CompareTray items={items} removeItem={removeItem} clear={clear} />
        </div>
    );
}
