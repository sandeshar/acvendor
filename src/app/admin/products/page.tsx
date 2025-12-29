"use client";

import { useEffect, useState } from "react";
import NextLink from "next/link";
import ImageUploader from '@/components/shared/ImageUploader';
import { showToast } from '@/components/Toast';

type ProductPost = {
    id?: number;
    slug: string;
    title: string;
    excerpt?: string;
    content?: string;
    thumbnail?: string | null;
    inventory_status?: string | null;
    rating?: number | null;
    reviews_count?: number | null;
    featured?: number;
    statusId?: number;
    price?: string | null;
    model?: string | null;
    capacity?: string | null;
    warranty?: string | null;
    createdAt?: string;
    updatedAt?: string;
};

export default function AdminProductsPage() {
    const [loading, setLoading] = useState(true);
    const [products, setProducts] = useState<ProductPost[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [selected, setSelected] = useState<ProductPost | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [saving, setSaving] = useState(false);

    // Selection & bulk actions
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const selectedCount = selectedIds.length;
    const isAllSelected = !loading && products.length > 0 && selectedIds.length === products.filter(p => p.id).length;

    const toggleSelect = (id?: number) => {
        if (!id) return;
        setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
    };

    const toggleSelectAll = () => {
        if (isAllSelected) setSelectedIds([]);
        else setSelectedIds(products.map(p => p.id).filter(Boolean) as number[]);
    };

    const bulkDelete = async () => {
        if (selectedIds.length === 0) return;
        if (!confirm(`Delete ${selectedIds.length} selected products?`)) return;
        setSaving(true);
        try {
            for (const id of selectedIds) {
                try {
                    await fetch(`/api/products?id=${id}`, { method: 'DELETE' });
                } catch (e) {
                    console.warn('Failed to delete', id, e);
                }
            }
            showToast('Selected products deleted', { type: 'success' });
            setSelectedIds([]);
            const data = await fetchProducts(page);
            if (data.length === 0 && page > 1) setPage(page - 1);
        } catch (e) {
            console.error(e);
            showToast('Bulk delete failed', { type: 'error' });
        } finally {
            setSaving(false);
        }
    };

    const [page, setPage] = useState<number>(1);
    const [perPage, setPerPage] = useState<number>(12);
    const [hasMore, setHasMore] = useState<boolean>(false);

    useEffect(() => {
        fetchProducts(page);
        // eslint-disable-next-line react-hooks/exhaustive-deps
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

    const openNew = () => {
        setSelected({ slug: `product-${Date.now()}`, title: 'New Product', excerpt: '', content: '<p></p>', thumbnail: '', statusId: 1, price: '', model: '', capacity: '', warranty: '' });
        setIsModalOpen(true);
    };

    const openEdit = (p: ProductPost) => {
        setSelected({ ...p });
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelected(null);
    };

    const saveProduct = async () => {
        if (!selected) return;
        if (!selected.slug || !selected.title) {
            showToast('Please provide title and slug', { type: 'error' });
            return;
        }
        setSaving(true);
        try {
            const payload: any = {
                title: selected.title,
                slug: selected.slug,
                excerpt: selected.excerpt,
                content: selected.content,
                thumbnail: selected.thumbnail || null,
                statusId: selected.statusId || 1,
                price: selected.price || null,
                model: selected.model || null,
                capacity: selected.capacity || null,
                warranty: selected.warranty || null,
            };

            let res;
            if (selected.id) {
                res = await fetch('/api/products', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id: selected.id, ...payload }),
                });
            } else {
                res = await fetch('/api/products', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload),
                });
            }

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || 'Failed to save product');
            }

            showToast('Product saved successfully', { type: 'success' });
            closeModal();
            fetchProducts();
        } catch (error) {
            console.error('Save error:', error);
            showToast('Failed to save product', { type: 'error' });
        } finally {
            setSaving(false);
        }
    };

    const deleteProduct = async (p: ProductPost) => {
        if (!confirm(`Delete product "${p.title}"?`)) return;
        try {
            const res = await fetch(`/api/products?id=${p.id}`, { method: 'DELETE' });
            if (!res.ok) throw new Error('Delete failed');
            showToast('Product deleted', { type: 'success' });
            const data = await fetchProducts(page);
            if (data.length === 0 && page > 1) setPage(page - 1);
        } catch (error) {
            console.error('Delete error:', error);
            showToast('Failed to delete product', { type: 'error' });
        }
    };

    const [sortBy, setSortBy] = useState<'title' | 'price' | 'updated'>('updated');
    const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

    const filtered = products.filter(p => {
        if (!searchQuery) return true;
        const q = searchQuery.toLowerCase();
        return (p.title || '').toLowerCase().includes(q) || (p.slug || '').toLowerCase().includes(q) || (p.excerpt || '').toLowerCase().includes(q);
    }).slice();

    // Sort
    filtered.sort((a, b) => {
        const dir = sortDir === 'asc' ? 1 : -1;
        if (sortBy === 'title') return ((a.title || '').localeCompare(b.title || '')) * dir;
        if (sortBy === 'price') {
            const ap = parseFloat(String(a.price || '').replace(/[^0-9.-]+/g, '')) || 0;
            const bp = parseFloat(String(b.price || '').replace(/[^0-9.-]+/g, '')) || 0;
            return (ap - bp) * dir;
        }
        // updated
        const at = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
        const bt = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
        return (at - bt) * dir;
    });

    const toggleSort = (col: typeof sortBy) => {
        if (sortBy === col) setSortDir(prev => prev === 'asc' ? 'desc' : 'asc');
        else { setSortBy(col); setSortDir('asc'); }
    };

    // Inline editing
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editingValue, setEditingValue] = useState<string>('');

    const startEdit = (id: number, value: string) => { setEditingId(id); setEditingValue(value ?? ''); };
    const cancelEdit = () => { setEditingId(null); setEditingValue(''); };

    const saveInline = async (id: number, field: 'price' | 'status', value: string | number) => {
        try {
            const payload: any = { id };
            if (field === 'price') payload.price = String(value);
            if (field === 'status') payload.statusId = Number(value);
            const res = await fetch('/api/products', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
            if (!res.ok) throw new Error('Save failed');
            showToast('Saved', { type: 'success' });
            setEditingId(null); setEditingValue('');
            fetchProducts();
        } catch (e) {
            console.error('Inline save error', e);
            showToast('Failed to save', { type: 'error' });
        }
    };

    return (
        <div className="p-6">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-semibold text-slate-800">Products</h1>
                    <p className="text-sm text-slate-500 mt-1">Manage your product catalog, inventory, and pricing</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <span className="material-symbols-outlined absolute left-3 top-2.5 text-slate-400">search</span>
                        <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search products, models, or descriptions..." className="rounded-full border border-gray-200 pl-10 pr-3 py-2 text-sm w-72 shadow-sm focus:ring-1 focus:ring-primary" />
                    </div>
                    <a href="/admin/products/new" className="inline-flex items-center gap-2 h-10 px-4 bg-primary text-white rounded-lg shadow-sm hover:shadow-md transition">
                        <span className="material-symbols-outlined">add</span>
                        <span className="font-medium">Add</span>
                    </a>
                </div>
            </div>

            {/* Bulk action bar */}
            {selectedCount > 0 && (
                <div className="mb-4 p-3 bg-white rounded-lg border border-gray-200 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <input type="checkbox" checked={isAllSelected} onChange={toggleSelectAll} className="h-4 w-4" />
                        <div className="text-sm">{selectedCount} selected</div>
                        <button onClick={bulkDelete} disabled={saving} className="px-3 py-1 rounded bg-red-600 text-white text-sm">Delete Selected</button>
                        <button onClick={() => { /* placeholder for other bulk actions */ }} className="px-3 py-1 rounded border text-sm">More actions</button>
                    </div>
                    <div className="text-sm text-gray-500">Bulk actions for selected items</div>
                </div>
            )}

            {/* Mobile: Card grid (smaller screens) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:hidden">
                {loading ? (
                    Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="animate-pulse bg-white rounded-lg border border-gray-200 p-4">
                            <div className="h-40 bg-gray-100 rounded mb-3" />
                            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                            <div className="h-3 bg-gray-200 rounded w-1/2 mb-4" />
                            <div className="flex gap-2">
                                <div className="h-8 w-20 bg-gray-200 rounded" />
                                <div className="h-8 w-20 bg-gray-200 rounded" />
                            </div>
                        </div>
                    ))
                ) : filtered.length === 0 ? (
                    <div className="col-span-full bg-white rounded-lg border border-gray-200 p-6 text-center">No products found.</div>
                ) : (
                    filtered.map((p) => {
                        const pid = p.id ?? -1; return (
                            <article key={p.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow relative">
                                <div className="absolute top-3 left-3 z-10">
                                    <input type="checkbox" checked={selectedIds.includes(pid)} onChange={() => toggleSelect(pid)} className="h-4 w-4" />
                                </div>
                                <div className="relative h-56 bg-linear-to-b from-white to-gray-50 flex items-center justify-center overflow-hidden">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img src={p.thumbnail || '/placeholder-product.png'} alt={p.title} className="h-full w-full object-contain" />

                                    <div className="absolute top-3 right-3 flex items-center gap-2">
                                        <a href={`/admin/products/${p.slug ?? p.id}`} className="bg-white/80 p-2 rounded-md shadow-sm hover:bg-white" title="Edit">
                                            <span className="material-symbols-outlined text-sm text-slate-700">edit</span>
                                        </a>
                                        <button onClick={() => deleteProduct(p)} className="bg-white/80 p-2 rounded-md shadow-sm hover:bg-white" title="Delete">
                                            <span className="material-symbols-outlined text-sm text-red-600">delete</span>
                                        </button>
                                    </div>

                                    <div className="absolute top-3 left-12">
                                        <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${p.inventory_status === 'in_stock' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-700'}`}>{p.inventory_status === 'in_stock' ? 'In Stock' : (p.inventory_status || '—')}</div>
                                    </div>
                                </div>

                                <div className="p-4">
                                    <h3 className="font-semibold text-lg text-slate-800 truncate">{p.title}</h3>
                                    <p className="text-sm text-slate-500 mt-1 line-clamp-2">{p.excerpt || ''}</p>

                                    <div className="mt-4 flex items-center justify-between">
                                        <div className="text-sm text-slate-700 font-bold">{p.price || '-'}</div>
                                        <a href={`/midea-ac/${p.slug}`} className="px-3 py-1.5 bg-primary text-white rounded-md text-sm font-semibold">View</a>
                                    </div>
                                </div>
                            </article>
                        );
                    })
                )}
            </div>

            {/* Desktop: Table */}
            <div className="hidden md:block bg-white rounded-xl border border-[#e5e7eb] overflow-hidden">
                <table className="w-full text-left text-sm">
                    <thead className="bg-[#fafafa]">
                        <tr>
                            <th className="px-4 py-3"><input type="checkbox" checked={isAllSelected} onChange={toggleSelectAll} className="h-4 w-4" /></th>
                            <th className="px-4 py-3 font-medium">Product</th>
                            <th className="px-4 py-3 font-medium">Price</th>
                            <th className="px-4 py-3 font-medium">Status</th>
                            <th className="px-4 py-3 font-medium">Updated</th>
                            <th className="px-4 py-3 font-medium">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading && Array.from({ length: 6 }).map((_, i) => (
                            <tr key={i} className="border-t">
                                <td className="px-4 py-4">
                                    <div className="flex items-center gap-4">
                                        <div className="h-16 w-28 bg-gray-100 rounded overflow-hidden" />
                                        <div className="flex-1">
                                            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                                            <div className="h-3 bg-gray-200 rounded w-1/2" />
                                        </div>
                                    </div>
                                </td>
                                <td className="px-4 py-4">&nbsp;</td>
                                <td className="px-4 py-4">&nbsp;</td>
                                <td className="px-4 py-4">&nbsp;</td>
                                <td className="px-4 py-4">&nbsp;</td>
                            </tr>
                        ))}

                        {!loading && filtered.length === 0 && <tr><td colSpan={5} className="px-4 py-6 text-center">No products found.</td></tr>}

                        {!loading && filtered.map((p) => {
                            const pid = p.id ?? -1; return (
                                <tr key={p.id} className="border-t hover:bg-gray-50 transition-colors">
                                    <td className="px-4 py-4">
                                        <input type="checkbox" checked={selectedIds.includes(p.id as number)} onChange={() => toggleSelect(p.id as number)} className="h-4 w-4" />
                                    </td>
                                    <td className="px-4 py-4">
                                        <div className="flex items-center gap-4">
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img src={p.thumbnail || '/placeholder-product.png'} alt={p.title} className="h-16 w-28 object-contain rounded" />
                                            <div>
                                                <div className="font-semibold">{p.title}</div>
                                                <div className="text-xs text-gray-500">{p.slug} • {p.model || ''}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-4 font-bold">
                                        {editingId === pid ? (
                                            <input autoFocus value={editingValue} onChange={(e) => setEditingValue(e.target.value)} onBlur={() => saveInline(pid, 'price', editingValue)} onKeyDown={(e) => e.key === 'Enter' && saveInline(pid, 'price', editingValue)} className="w-28 rounded border px-2 py-1" />
                                        ) : (
                                            <button onClick={() => startEdit(pid, String(p.price || ''))} className="hover:underline">{p.price || '-'}</button>
                                        )}
                                    </td>
                                    <td className="px-4 py-4">
                                        {editingId === pid ? (
                                            <select value={Number(p.statusId ?? 1)} onChange={(e) => saveInline(pid, 'status', Number(e.target.value))} onBlur={cancelEdit} className="rounded border px-2 py-1">
                                                <option value={1}>Published</option>
                                                <option value={2}>Draft</option>
                                            </select>
                                        ) : (
                                            <button onClick={() => startEdit(pid, String(p.statusId ?? 1))} className={`inline-flex items-center px-2 py-0.5 rounded text-sm font-medium ${p.inventory_status === 'in_stock' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-gray-50 text-gray-700 border border-gray-100'}`}>{p.inventory_status === 'in_stock' ? 'In Stock' : (p.inventory_status || '—')}</button>
                                        )}
                                    </td>
                                    <td className="px-4 py-4 text-sm text-gray-500">{p.updatedAt ? new Date(p.updatedAt).toLocaleString() : '-'}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <a href={`/admin/products/${p.slug ?? p.id}`} className="p-2 rounded hover:bg-gray-100" title="Edit">
                                                <span className="material-symbols-outlined text-base text-slate-600">edit</span>
                                            </a>
                                            <button onClick={() => deleteProduct(p)} className="p-2 rounded hover:bg-gray-100" title="Delete">
                                                <span className="material-symbols-outlined text-base text-red-600">delete</span>
                                            </button>
                                            <NextLink href={`/midea-ac/${p.slug}`} className="p-2 rounded hover:bg-gray-100" title="View">
                                                <span className="material-symbols-outlined text-base text-slate-600">open_in_new</span>
                                            </NextLink>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* Pagination Controls */}
            <div className="mt-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                    <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1 rounded border">Prev</button>
                    <span className="text-sm">Page <strong>{page}</strong></span>
                    <button onClick={() => { if (hasMore) setPage((p) => p + 1); }} disabled={!hasMore} className="px-3 py-1 rounded border">Next</button>
                </div>
                <div className="flex items-center gap-2">
                    <label className="text-sm">Per page</label>
                    <select value={perPage} onChange={(e) => { setPerPage(Number(e.target.value)); setPage(1); }} className="rounded border px-2 py-1">
                        <option value={6}>6</option>
                        <option value={12}>12</option>
                        <option value={24}>24</option>
                        <option value={48}>48</option>
                    </select>
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && selected && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                    <div className="w-full max-w-2xl bg-white rounded-xl p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-bold">{selected.id ? 'Edit Product' : 'New Product'}</h2>
                            <div className="flex gap-2">
                                <button onClick={closeModal} className="px-3 py-1 rounded border">Cancel</button>
                                <button onClick={saveProduct} disabled={saving} className="px-3 py-1 rounded bg-primary text-white">Save</button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Title</label>
                                <input value={selected.title} onChange={(e) => setSelected({ ...selected, title: e.target.value })} className="w-full rounded-lg border border-gray-200 px-3 py-2" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Slug</label>
                                <input value={selected.slug} onChange={(e) => setSelected({ ...selected, slug: e.target.value })} className="w-full rounded-lg border border-gray-200 px-3 py-2" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Price</label>
                                <input value={selected.price || ''} onChange={(e) => setSelected({ ...selected, price: e.target.value })} className="w-full rounded-lg border border-gray-200 px-3 py-2" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Status</label>
                                <select value={selected.statusId ?? 1} onChange={(e) => setSelected({ ...selected, statusId: Number(e.target.value) })} className="w-full rounded-lg border border-gray-200 px-3 py-2">
                                    <option value={1}>Published</option>
                                    <option value={2}>Draft</option>
                                </select>
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium mb-1">Excerpt</label>
                                <textarea value={selected.excerpt || ''} onChange={(e) => setSelected({ ...selected, excerpt: e.target.value })} className="w-full rounded-lg border border-gray-200 px-3 py-2" rows={3} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Model</label>
                                <input value={selected.model || ''} onChange={(e) => setSelected({ ...selected, model: e.target.value })} className="w-full rounded-lg border border-gray-200 px-3 py-2" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Capacity</label>
                                <input value={selected.capacity || ''} onChange={(e) => setSelected({ ...selected, capacity: e.target.value })} className="w-full rounded-lg border border-gray-200 px-3 py-2" />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium mb-1">Thumbnail</label>
                                <ImageUploader label="Thumbnail" folder="products" value={selected.thumbnail || ''} onChange={(url) => setSelected({ ...selected, thumbnail: url })} />
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
