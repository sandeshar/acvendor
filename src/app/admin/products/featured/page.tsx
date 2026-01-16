"use client";

import { useEffect, useState } from "react";
import NextLink from "next/link";
import { showToast } from '@/components/Toast';

type FeaturedProduct = {
    _id: string;
    id: string;
    name: string;
    title: string;
    model?: string;
    category?: string;
    featured?: number;
    priority?: number;
    thumbnail?: string;
    price?: number | string;
};

export default function FeaturedProductsPage() {
    const [featuredProducts, setFeaturedProducts] = useState<FeaturedProduct[]>([]);
    const [allProducts, setAllProducts] = useState<FeaturedProduct[]>([]);
    const [categories, setCategories] = useState<{ id: string; name: string; slug: string }[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);

    // Filters
    const [categoryFilter, setCategoryFilter] = useState("");
    const [searchQuery, setSearchQuery] = useState("");

    // Modal Filters
    const [modalCategoryFilter, setModalCategoryFilter] = useState("");
    const [modalSearchQuery, setModalSearchQuery] = useState("");

    useEffect(() => {
        fetchData();
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const res = await fetch('/api/pages/services/categories');
            if (res.ok) {
                const data = await res.json();
                setCategories(Array.isArray(data) ? data : []);
            }
        } catch (err) {
            console.error('Failed to load categories:', err);
        }
    };

    const fetchData = async () => {
        setLoading(true);
        try {
            // Fetch only featured products for the main list
            const featuredRes = await fetch('/api/products?featured=1&limit=100');
            const fData = await featuredRes.json();
            const fList = Array.isArray(fData) ? fData : (fData.products || []);
            setFeaturedProducts(fList);

            // Fetch all products for the selector (could be optimized with pagination if list is huge)
            const allRes = await fetch('/api/products?limit=1000');
            const aData = await allRes.json();
            const aList = Array.isArray(aData) ? aData : (aData.products || []);
            setAllProducts(aList);
        } catch (error) {
            console.error('Error fetching featured products:', error);
            showToast('Failed to load products', { type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const handleToggleFeatured = async (product: FeaturedProduct, isFeatured: boolean) => {
        try {
            // When featuring a new product, give it a high priority so it appears at top
            const maxPriority = featuredProducts.length > 0
                ? Math.max(...featuredProducts.map(p => p.priority || 0))
                : 0;

            const res = await fetch(`/api/products`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: product._id || product.id,
                    featured: isFeatured ? 1 : 0,
                    priority: isFeatured ? maxPriority + 10 : (product.priority || 0)
                })
            });

            if (res.ok) {
                showToast(isFeatured ? 'Product featured' : 'Product removed from featured', { type: 'success' });
                fetchData();
            } else {
                showToast('Failed to update product', { type: 'error' });
            }
        } catch (err) {
            showToast('An error occurred', { type: 'error' });
        }
    };

    const handleUpdatePriority = async (product: FeaturedProduct, newPriority: number) => {
        try {
            const res = await fetch(`/api/products`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: product._id || product.id,
                    priority: newPriority
                })
            });

            if (res.ok) {
                // Update local state for immediate feedback
                setFeaturedProducts(prev =>
                    prev.map(p => (p._id === product._id || p.id === product.id) ? { ...p, priority: newPriority } : p)
                        .sort((a, b) => (b.priority || 0) - (a.priority || 0))
                );
            }
        } catch (err) {
            showToast('Failed to update order', { type: 'error' });
        }
    };

    const moveItem = async (index: number, direction: 'up' | 'down') => {
        // We use the filtered list for logical swapping context
        const filteredList = featuredProducts.filter(p => {
            const matchesCategory = !categoryFilter ||
                (typeof p.category === 'object' ? (p.category as any).id === categoryFilter || (p.category as any).slug === categoryFilter : p.category === categoryFilter);
            const matchesSearch = !searchQuery ||
                p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (p.model || '').toLowerCase().includes(searchQuery.toLowerCase());
            return matchesCategory && matchesSearch;
        });

        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        if (targetIndex < 0 || targetIndex >= filteredList.length) return;

        const currentItem = filteredList[index];
        const targetItem = filteredList[targetIndex];

        // Swap priorities
        const currentP = currentItem.priority || 0;
        const targetP = targetItem.priority || 0;

        let newCurrentP, newTargetP;
        if (currentP !== targetP) {
            // Standard swap: the two items just exchange their priority values
            newCurrentP = targetP;
            newTargetP = currentP;
        } else {
            // They are tied (likely both 0). 
            // To move currentItem ABOVE targetItem, it needs a higher priority.
            if (direction === 'up') {
                newCurrentP = targetP + 1;
                newTargetP = targetP;
            } else {
                // To move currentItem BELOW targetItem, it needs a lower priority.
                newCurrentP = targetP - 1;
                newTargetP = targetP;
            }
        }

        setSaving(true);
        try {
            await Promise.all([
                fetch(`/api/products`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        id: currentItem._id || currentItem.id,
                        priority: newCurrentP
                    })
                }),
                fetch(`/api/products`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        id: targetItem._id || targetItem.id,
                        priority: newTargetP
                    })
                })
            ]);
            showToast('Order updated', { type: 'success' });
            await fetchData();
        } catch (err) {
            showToast('Failed to update order', { type: 'error' });
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    const filteredFeatured = featuredProducts.filter(p => {
        const matchesCategory = !categoryFilter ||
            (typeof p.category === 'object' ? (p.category as any).id === categoryFilter || (p.category as any).slug === categoryFilter : p.category === categoryFilter);
        const matchesSearch = !searchQuery ||
            p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (p.model || '').toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 leading-tight">Featured Products</h1>
                    <p className="text-sm text-gray-500 mt-1">Manage products that appear as featured across the site.</p>
                </div>
                <div className="flex flex-wrap gap-3">
                    <div className="relative">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[20px]">search</span>
                        <input
                            type="text"
                            placeholder="Search featured..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 w-48 md:w-64 transition-all"
                        />
                    </div>

                    <select
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                        className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                    >
                        <option value="">All Categories</option>
                        {categories.map(cat => (
                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                    </select>

                    <button
                        onClick={() => setShowAddModal(true)}
                        className="bg-primary hover:bg-primary-dark text-white px-5 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-all shadow-lg shadow-primary/20"
                    >
                        <span className="material-symbols-outlined text-[20px]">add_circle</span>
                        Add Featured Product
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-50/50 border-b border-gray-100">
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider w-16 text-center">Order</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Product</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Category / Model</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredFeatured.map((product, idx) => (
                                <tr key={product._id || product.id} className="hover:bg-gray-50/50 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col items-center gap-1">
                                            <button
                                                disabled={idx === 0 || saving}
                                                onClick={() => moveItem(idx, 'up')}
                                                className="p-1 hover:bg-gray-100 rounded text-gray-400 disabled:opacity-20 hover:text-primary transition-colors"
                                            >
                                                <span className="material-symbols-outlined text-xl">arrow_upward</span>
                                            </button>
                                            <button
                                                disabled={idx === filteredFeatured.length - 1 || saving}
                                                onClick={() => moveItem(idx, 'down')}
                                                className="p-1 hover:bg-gray-100 rounded text-gray-400 disabled:opacity-20 hover:text-primary transition-colors"
                                            >
                                                <span className="material-symbols-outlined text-xl">arrow_downward</span>
                                            </button>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            {product.thumbnail ? (
                                                <img src={product.thumbnail} alt="" className="w-10 h-10 rounded-lg object-cover border border-gray-200" />
                                            ) : (
                                                <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                                                    <span className="material-symbols-outlined text-gray-400">image</span>
                                                </div>
                                            )}
                                            <div>
                                                <p className="text-sm font-semibold text-gray-900 group-hover:text-primary transition-colors">{product.title}</p>
                                                <p className="text-[11px] text-gray-500 font-medium">ID: {product._id || product.id}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-100 uppercase tracking-wider">
                                            {typeof product.category === 'object' ? (product.category as any).name : (product.category || 'N/A')}
                                        </span>
                                        <p className="text-xs text-gray-500 font-medium mt-1 uppercase">{product.model || 'No Model'}</p>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <NextLink
                                                href={`/admin/products/${product._id || product.id}`}
                                                className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-all"
                                                title="Edit Product"
                                            >
                                                <span className="material-symbols-outlined text-[20px]">edit</span>
                                            </NextLink>
                                            <button
                                                onClick={() => handleToggleFeatured(product, false)}
                                                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                                title="Remove from Featured"
                                            >
                                                <span className="material-symbols-outlined text-[20px]">heart_minus</span>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}

                            {filteredFeatured.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center">
                                        <div className="flex flex-col items-center">
                                            <span className="material-symbols-outlined text-4xl text-gray-200 mb-2">star_outline</span>
                                            <p className="text-gray-500 text-sm italic font-medium">
                                                {searchQuery || categoryFilter ? 'No products match your filters.' : 'No featured products found.'}
                                            </p>
                                            <button
                                                onClick={() => setShowAddModal(true)}
                                                className="mt-4 text-primary font-semibold text-sm hover:underline"
                                            >
                                                Feature your first product
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="mt-4 flex items-center gap-2 text-xs text-gray-400 font-medium">
                <span className="material-symbols-outlined text-[16px]">info</span>
                <p>Use the arrows on the left to organize your featured products. Changes are saved automatically.</p>
            </div>

            {/* Add Featured Product Modal */}
            {showAddModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm" onClick={() => setShowAddModal(false)}></div>
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl relative overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between">
                            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary">add_circle</span>
                                Select Products to Feature
                            </h2>
                            <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        <div className="px-8 py-4 bg-gray-50/50 border-b border-gray-100 flex gap-3">
                            <div className="relative flex-1">
                                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[18px]">search</span>
                                <input
                                    type="text"
                                    placeholder="Search products..."
                                    value={modalSearchQuery}
                                    onChange={(e) => setModalSearchQuery(e.target.value)}
                                    className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                                />
                            </div>
                            <select
                                value={modalCategoryFilter}
                                onChange={(e) => setModalCategoryFilter(e.target.value)}
                                className="px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                            >
                                <option value="">All Categories</option>
                                {categories.map(cat => (
                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="p-8 max-h-[60vh] overflow-y-auto">
                            <div className="grid grid-cols-1 gap-3">
                                {allProducts
                                    .filter(p => p.featured !== 1)
                                    .filter(p => {
                                        const matchesCategory = !modalCategoryFilter ||
                                            (typeof p.category === 'object' ? (p.category as any).id === modalCategoryFilter || (p.category as any).slug === modalCategoryFilter : p.category === modalCategoryFilter);
                                        const matchesSearch = !modalSearchQuery ||
                                            p.title.toLowerCase().includes(modalSearchQuery.toLowerCase()) ||
                                            (p.model || '').toLowerCase().includes(modalSearchQuery.toLowerCase());
                                        return matchesCategory && matchesSearch;
                                    })
                                    .map(product => (
                                        <div key={product._id || product.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100 hover:border-primary/30 transition-all group">
                                            <div className="flex items-center gap-4">
                                                {product.thumbnail ? (
                                                    <img src={product.thumbnail} alt="" className="w-12 h-12 rounded-xl object-cover border border-white shadow-sm" />
                                                ) : (
                                                    <div className="w-12 h-12 rounded-xl bg-gray-200 flex items-center justify-center">
                                                        <span className="material-symbols-outlined text-gray-400 text-xl">image</span>
                                                    </div>
                                                )}
                                                <div>
                                                    <p className="font-bold text-gray-900 leading-tight">{product.title}</p>
                                                    <p className="text-xs text-gray-500 mt-0.5 font-medium">{typeof product.category === 'object' ? (product.category as any).name : (product.category || 'N/A')} / {product.model || 'v1.0'}</p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handleToggleFeatured(product, true)}
                                                className="bg-white hover:bg-primary hover:text-white border border-gray-200 hover:border-primary text-primary px-4 py-2 rounded-xl text-sm font-bold transition-all shadow-sm"
                                            >
                                                Add Feature
                                            </button>
                                        </div>
                                    ))}
                                {allProducts.filter(p => p.featured !== 1).length === 0 && (
                                    <div className="text-center py-8">
                                        <p className="text-gray-500 italic">All available products are already featured or no products found.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}