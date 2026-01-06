"use client";

import { useEffect, useState } from "react";
import NextLink from "next/link";
import { useRouter } from "next/navigation";
import { showToast } from '@/components/Toast';
import { formatPrice } from '@/utils/formatPrice';

type ProductPost = {
    id: number;
    slug: string;
    title: string;
    excerpt?: string;
    thumbnail?: string | null;
    inventory_status?: string | null;
    price?: string | null;
    statusId?: number;
    updatedAt?: string;
};

export default function AdminProductsPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [products, setProducts] = useState<ProductPost[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [saving, setSaving] = useState(false);
    const [page, setPage] = useState<number>(1);
    const [perPage, setPerPage] = useState<number>(12);
    const [hasMore, setHasMore] = useState<boolean>(false);

    useEffect(() => {
        fetchProducts(page);
    }, [page, perPage]);

    const fetchProducts = async (p: number = 1) => {
        setLoading(true);
        try {
            const offset = (p - 1) * perPage;
            const res = await fetch(`/api/products?limit=${perPage}&offset=${offset}`);
            const data = res.ok ? await res.json() : [];
            setProducts(data || []);
            setHasMore((data || []).length === perPage);
            return data || [];
        } catch (error) {
            console.error('Error fetching products:', error);
            showToast('Failed to load products', { type: 'error' });
            return [];
        } finally {
            setLoading(false);
        }
    };

    const toggleSelect = (id: number) => {
        setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
    };

    const toggleSelectAll = () => {
        if (selectedIds.length === products.length) setSelectedIds([]);
        else setSelectedIds(products.map(p => p.id));
    };

    const deleteProduct = async (p: ProductPost) => {
        if (!confirm(`Delete product "${p.title}"?`)) return;
        try {
            const res = await fetch(`/api/products?id=${p.id}`, { method: 'DELETE' });
            if (!res.ok) throw new Error('Delete failed');
            showToast('Product deleted', { type: 'success' });
            fetchProducts(page);
        } catch (error) {
            console.error('Delete error:', error);
            showToast('Failed to delete product', { type: 'error' });
        }
    };

    const bulkDelete = async () => {
        if (selectedIds.length === 0) return;
        if (!confirm(`Delete ${selectedIds.length} selected products?`)) return;
        setSaving(true);
        try {
            await Promise.all(selectedIds.map(id => fetch(`/api/products?id=${id}`, { method: 'DELETE' })));
            showToast('Selected products deleted', { type: 'success' });
            setSelectedIds([]);
            fetchProducts(page);
        } catch (e) {
            console.error(e);
            showToast('Bulk delete failed', { type: 'error' });
        } finally {
            setSaving(false);
        }
    };

    const filtered = products.filter(p => {
        if (!searchQuery) return true;
        const q = searchQuery.toLowerCase();
        return (p.title || '').toLowerCase().includes(q) || (p.slug || '').toLowerCase().includes(q);
    });

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Simple Header */}
            <div className="sticky top-0 z-20 bg-white border-b border-gray-200">
                <div className="max-w-[1400px] mx-auto px-6 h-16 flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-bold text-gray-900">Products</h1>
                        <p className="text-xs text-gray-500">Inventory and catalog management</p>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="relative hidden md:block">
                            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[18px]">search</span>
                            <input
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search..."
                                className="pl-9 pr-4 py-2 bg-gray-100 border border-transparent rounded-md text-sm focus:bg-white focus:border-gray-200 outline-none w-64 transition-all"
                            />
                        </div>

                        <NextLink
                            href="/admin/products/new"
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-semibold transition-colors flex items-center gap-2"
                        >
                            <span className="material-symbols-outlined text-[18px]">add</span>
                            New Product
                        </NextLink>
                    </div>
                </div>
            </div>

            <div className="max-w-[1400px] mx-auto px-6 py-8">
                {/* Simplified Bulk Actions */}
                {selectedIds.length > 0 && (
                    <div className="mb-4 p-3 bg-gray-900 rounded-lg flex items-center justify-between shadow-lg">
                        <span className="text-white text-sm font-bold ml-2">
                            {selectedIds.length} items selected
                        </span>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => router.push(`/admin/quotation?productIds=${selectedIds.join(',')}`)}
                                className="px-3 py-1.5 bg-blue-600 text-white rounded text-xs font-bold hover:bg-blue-700 transition-colors"
                            >
                                Make Quotation
                            </button>
                            <button
                                onClick={bulkDelete}
                                disabled={saving}
                                className="px-3 py-1.5 bg-red-600 text-white rounded text-xs font-bold hover:bg-red-700 transition-colors"
                            >
                                Delete
                            </button>
                            <button
                                onClick={() => setSelectedIds([])}
                                className="px-3 py-1.5 bg-gray-700 text-white rounded text-xs font-bold hover:bg-gray-600"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                )}

                {/* Table Section */}
                <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead>
                                <tr className="border-b border-gray-100 bg-gray-50/50">
                                    <th className="px-6 py-4 w-10">
                                        <input
                                            type="checkbox"
                                            checked={selectedIds.length === products.length && products.length > 0}
                                            onChange={toggleSelectAll}
                                            className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                        />
                                    </th>
                                    <th className="px-4 py-4 font-bold text-gray-500 text-[11px] uppercase tracking-wider">Product</th>
                                    <th className="px-4 py-4 font-bold text-gray-500 text-[11px] uppercase tracking-wider">Status</th>
                                    <th className="px-4 py-4 font-bold text-gray-500 text-[11px] uppercase tracking-wider">Price</th>
                                    <th className="px-6 py-4 font-bold text-gray-500 text-[11px] uppercase tracking-wider text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {loading ? (
                                    Array.from({ length: 5 }).map((_, i) => (
                                        <tr key={i}>
                                            <td className="px-6 py-4"><div className="w-4 h-4 bg-gray-100 rounded animate-pulse"></div></td>
                                            <td className="px-4 py-4"><div className="w-48 h-4 bg-gray-100 rounded animate-pulse"></div></td>
                                            <td className="px-4 py-4"><div className="w-24 h-4 bg-gray-100 rounded animate-pulse"></div></td>
                                            <td className="px-4 py-4"><div className="w-16 h-4 bg-gray-100 rounded animate-pulse"></div></td>
                                            <td className="px-6 py-4"><div className="w-16 h-4 bg-gray-100 rounded ml-auto animate-pulse"></div></td>
                                        </tr>
                                    ))
                                ) : filtered.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="py-20 text-center text-gray-400">
                                            No products found.
                                        </td>
                                    </tr>
                                ) : (
                                    filtered.map((p) => (
                                        <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedIds.includes(p.id)}
                                                    onChange={() => toggleSelect(p.id)}
                                                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                />
                                            </td>
                                            <td className="px-4 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-gray-100 rounded border border-gray-200 overflow-hidden flex-shrink-0">
                                                        {p.thumbnail && <img src={p.thumbnail} className="w-full h-full object-cover" />}
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-gray-900">{p.title}</div>
                                                        <div className="text-[11px] text-gray-500 font-mono">{p.slug}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-4">
                                                <div className="flex gap-2">
                                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${p.inventory_status === 'in_stock' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                        {p.inventory_status === 'in_stock' ? 'In Stock' : 'Out of Stock'}
                                                    </span>
                                                    {p.statusId === 1 && (
                                                        <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-700 text-[10px] font-bold uppercase">
                                                            Public
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-4 py-4 font-bold text-gray-900">
                                                {p.price ? `NRS ${formatPrice(p.price)}` : '--'}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button onClick={() => router.push(`/admin/quotation?productIds=${p.id}`)} className="p-1.5 text-gray-400 hover:text-green-600 transition-colors" title="Make Quotation">
                                                        <span className="material-symbols-outlined text-[20px]">request_quote</span>
                                                    </button>
                                                    <NextLink href={`/admin/products/${p.id}`} className="p-1.5 text-gray-400 hover:text-blue-600 transition-colors">
                                                        <span className="material-symbols-outlined text-[20px]">edit</span>
                                                    </NextLink>
                                                    <button onClick={() => deleteProduct(p)} className="p-1.5 text-gray-400 hover:text-red-600 transition-colors">
                                                        <span className="material-symbols-outlined text-[20px]">delete</span>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="bg-gray-50 px-6 py-4 border-t border-gray-100 flex items-center justify-between">
                        <div className="flex items-center gap-4 text-xs font-medium text-gray-500">
                            <span>Show</span>
                            <select value={perPage} onChange={e => { setPerPage(Number(e.target.value)); setPage(1); }} className="bg-transparent border-none focus:ring-0 cursor-pointer font-bold text-gray-900">
                                <option value={12}>12</option>
                                <option value={24}>24</option>
                                <option value={48}>48</option>
                            </select>
                        </div>
                        <div className="flex items-center gap-2">
                            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-1 disabled:opacity-30"><span className="material-symbols-outlined">chevron_left</span></button>
                            <span className="text-xs font-bold px-3">Page {page}</span>
                            <button onClick={() => setPage(p => p + 1)} disabled={!hasMore} className="p-1 disabled:opacity-30"><span className="material-symbols-outlined">chevron_right</span></button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
