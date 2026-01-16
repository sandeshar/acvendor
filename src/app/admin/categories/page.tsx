"use client";

import { useEffect, useState } from "react";
import { showToast } from '@/components/Toast';
import IconSelector from "@/components/admin/IconSelector";
import { isValidSlug, normalizeSlug } from "@/utils/slug";

type Category = {
    id?: string | number;
    name: string;
    slug: string;
    brand?: string;
    description?: string | null;
    icon?: string | null;
    display_order?: number;
    is_active?: number;
    // Optional SEO fields
    meta_title?: string | null;
    meta_description?: string | null;
    isNew?: boolean;
};

type Subcategory = {
    id?: number | string;
    category_id: string | number;
    name: string;
    // AC type (e.g., 'Inverter', 'Window', 'Split')
    ac_type?: string | null;
    slug: string;
    description?: string | null;
    display_order?: number;
    is_active?: number;
    meta_title?: string | null;
    meta_description?: string | null;
    isNew?: boolean;
};

export default function CategoriesManagerPage() {
    const [activeTab, setActiveTab] = useState<"categories" | "subcategories">("categories");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [categories, setCategories] = useState<Category[]>([]);
    const [subcategories, setSubcategories] = useState<Subcategory[]>([]);

    const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
    const [selectedSubcategory, setSelectedSubcategory] = useState<Subcategory | null>(null);

    const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
    const [isSubcategoryModalOpen, setIsSubcategoryModalOpen] = useState(false);

    const [searchQuery, setSearchQuery] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("all");

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [categoriesRes, subcategoriesRes] = await Promise.all([
                fetch('/api/pages/services/categories?admin=1'),
                fetch('/api/pages/services/subcategories?admin=1'),
            ]);

            if (categoriesRes.ok) {
                const cats = await categoriesRes.json();
                // Normalize IDs so we always have an `id` field (some APIs return `_id`)
                setCategories(Array.isArray(cats) ? cats.map((c: any) => ({ ...c, id: c.id ?? c._id })) : []);
            }

            if (subcategoriesRes.ok) {
                const subs = await subcategoriesRes.json();
                // Ensure category_id is present and consistent (may come as ObjectId or _id)
                // Coerce to string to handle Mongo ObjectIds or numeric ids uniformly
                setSubcategories(Array.isArray(subs) ? subs.map((s: any) => ({ ...s, category_id: String(s.category_id ?? s.category?._id ?? '') })) : []);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const moveCategory = async (id: string | number, direction: 'up' | 'down') => {
        const idStr = String(id);
        const currentCats = [...categories].sort((a, b) => (a.display_order || 0) - (b.display_order || 0));

        const index = currentCats.findIndex(cat => String(cat.id) === idStr);
        if (index === -1) return;
        if (direction === 'up' && index === 0) return;
        if (direction === 'down' && index === currentCats.length - 1) return;

        const newIndex = direction === 'up' ? index - 1 : index + 1;
        const newCats = [...currentCats];
        [newCats[index], newCats[newIndex]] = [newCats[newIndex], newCats[index]];

        // Assign new sequential orders
        const updates = newCats.map((cat, idx) => ({ ...cat, display_order: idx }));

        // Optimistic UI update
        setCategories(updates);

        try {
            await Promise.all(
                updates.map(cat =>
                    fetch('/api/pages/services/categories', {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(cat),
                    })
                )
            );
            fetchData();
        } catch (error) {
            console.error('Error reordering categories:', error);
            fetchData();
        }
    };

    const moveSubcategory = async (categoryId: string | number, subId: string | number, direction: 'up' | 'down') => {
        const cidStr = String(categoryId);
        const sidStr = String(subId);

        // Get subcategories for THIS category only
        const currentSubs = subcategories
            .filter(s => String(s.category_id) === cidStr)
            .sort((a, b) => (a.display_order || 0) - (b.display_order || 0));

        const index = currentSubs.findIndex(s => String(s.id) === sidStr);
        if (index === -1) return;
        if (direction === 'up' && index === 0) return;
        if (direction === 'down' && index === currentSubs.length - 1) return;

        const newIndex = direction === 'up' ? index - 1 : index + 1;
        const newSubs = [...currentSubs];
        [newSubs[index], newSubs[newIndex]] = [newSubs[newIndex], newSubs[index]];

        // Assign sequential orders
        const updates = newSubs.map((s, idx) => ({ ...s, display_order: idx }));

        // Optimistic UI: update subcategories array
        setSubcategories(prev => {
            const others = prev.filter(s => String(s.category_id) !== cidStr);
            return [...others, ...updates].sort((a, b) => {
                // Keep the global array somewhat consistent, though filtered lists depend on category_id
                if (String(a.category_id) !== String(b.category_id)) return String(a.category_id).localeCompare(String(b.category_id));
                return (a.display_order || 0) - (b.display_order || 0);
            });
        });

        try {
            await Promise.all(
                updates.map(s =>
                    fetch('/api/pages/services/subcategories', {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(s),
                    })
                )
            );
            fetchData();
        } catch (error) {
            console.error('Error reordering subcategories:', error);
            fetchData();
        }
    };

    const addCategory = () => {
        setSelectedCategory({
            name: "",
            slug: "",
            brand: "",
            description: "",
            icon: "",
            display_order: 0,
            is_active: 1,
            meta_title: "",
            meta_description: "",
            isNew: true,
        });
        setIsCategoryModalOpen(true);
    };

    const addSubcategory = () => {
        setSelectedSubcategory({
            // Use the current filter category if one is selected, otherwise default to first category
            category_id: categoryFilter !== "all" ? categoryFilter : String(categories[0]?.id ?? ''),
            name: "",
            ac_type: '',
            slug: "",
            description: "",
            display_order: 0,
            is_active: 1,
            meta_title: "",
            meta_description: "",
            isNew: true,
        });
        setIsSubcategoryModalOpen(true);
    };

    const saveCategory = async () => {
        if (!selectedCategory) return;
        if (!selectedCategory.name || !selectedCategory.slug) {
            showToast("Name and Slug are required", { type: "error" });
            return;
        }

        if (selectedCategory.slug && !isValidSlug(selectedCategory.slug)) {
            showToast("Invalid slug format. Use only letters, numbers, hyphens and underscores.", { type: "error" });
            return;
        }

        setSaving(true);
        try {
            const method = selectedCategory.isNew ? 'POST' : 'PUT';
            const payload = { ...selectedCategory };
            const response = await fetch('/api/pages/services/categories', {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (!response.ok) throw new Error('Failed to save category');

            showToast('Category saved successfully!', { type: 'success' });
            setIsCategoryModalOpen(false);
            setSelectedCategory(null);
            fetchData();
        } catch (error) {
            console.error('Error saving category:', error);
            showToast('Failed to save category. Please try again.', { type: 'error' });
        } finally {
            setSaving(false);
        }
    };

    const saveSubcategory = async () => {
        if (!selectedSubcategory) return;
        if (!selectedSubcategory.name || !selectedSubcategory.slug || !selectedSubcategory.category_id) {
            showToast("Name, Slug and Parent Category are required", { type: "error" });
            return;
        }

        if (selectedSubcategory.slug && !isValidSlug(selectedSubcategory.slug)) {
            showToast("Invalid slug format. Use only letters, numbers, hyphens and underscores.", { type: "error" });
            return;
        }

        setSaving(true);
        try {
            const method = selectedSubcategory.isNew ? 'POST' : 'PUT';
            const payload: any = { ...selectedSubcategory };
            const response = await fetch('/api/pages/services/subcategories', {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (!response.ok) throw new Error('Failed to save subcategory');

            showToast('Subcategory saved successfully!', { type: 'success' });
            setIsSubcategoryModalOpen(false);
            setSelectedSubcategory(null);
            fetchData();
        } catch (error) {
            console.error('Error saving subcategory:', error);
            showToast('Failed to save subcategory. Please try again.', { type: 'error' });
        } finally {
            setSaving(false);
        }
    };

    const deleteCategory = async (id: string | number) => {
        if (!confirm('Are you sure you want to delete this category?')) return;

        setSaving(true);
        try {
            const response = await fetch('/api/pages/services/categories', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id }),
            });

            if (!response.ok) throw new Error('Failed to delete category');

            showToast('Category deleted successfully!', { type: 'success' });
            fetchData();
        } catch (error) {
            console.error('Error deleting category:', error);
            showToast('Failed to delete category. Please try again.', { type: 'error' });
        } finally {
            setSaving(false);
        }
    };

    const deleteSubcategory = async (id: string | number) => {
        if (!confirm('Are you sure you want to delete this subcategory?')) return;

        setSaving(true);
        try {
            const response = await fetch('/api/pages/services/subcategories', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id }),
            });

            if (!response.ok) throw new Error('Failed to delete subcategory');

            showToast('Subcategory deleted successfully!', { type: 'success' });
            fetchData();
        } catch (error) {
            console.error('Error deleting subcategory:', error);
            showToast('Failed to delete subcategory. Please try again.', { type: 'error' });
        } finally {
            setSaving(false);
        }
    };

    const filteredCategories = categories.filter(cat =>
        cat.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const filteredSubcategories = subcategories.filter(sub => {
        const matchesSearch = sub.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = categoryFilter === "all" || String(sub.category_id) === String(categoryFilter);
        return matchesSearch && matchesCategory;
    });

    if (loading) {
        return (
            <div className="flex-1 flex items-center justify-center min-h-screen">
                <div className="flex flex-col items-center gap-3">
                    <span className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                    <p className="text-slate-600 text-sm">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 overflow-y-auto bg-slate-50 h-screen">
            {/* Header */}
            <div className="sticky top-0 z-10 bg-white border-b border-slate-200 shadow-sm">
                <div className="px-6 py-4">
                    <h1 className="text-2xl font-bold text-slate-900">Category Manager</h1>
                    <p className="text-sm text-slate-500 mt-1">Manage service categories and subcategories</p>
                </div>
            </div>

            <div className="w-full mx-auto px-6 py-8">
                {/* Tabs */}
                <div className="flex justify-center mb-10">
                    <div className="bg-white p-1.5 rounded-2xl shadow-sm border border-gray-100 inline-flex gap-1">
                        <button
                            onClick={() => setActiveTab("categories")}
                            className={`px-6 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 flex items-center gap-2 ${activeTab === "categories"
                                ? "bg-gray-900 text-white shadow-md"
                                : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                                }`}
                        >
                            <span className="material-symbols-outlined text-[18px]">category</span>
                            Categories
                        </button>
                        <button
                            onClick={() => setActiveTab("subcategories")}
                            className={`px-6 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 flex items-center gap-2 ${activeTab === "subcategories"
                                ? "bg-gray-900 text-white shadow-md"
                                : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                                }`}
                        >
                            <span className="material-symbols-outlined text-[18px]">subdirectory_arrow_right</span>
                            Subcategories
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="max-w-7xl mx-auto">
                    {/* CATEGORIES TAB */}
                    {activeTab === "categories" && (
                        <div className="space-y-6">
                            {/* Search and Add */}
                            <div className="flex flex-col sm:flex-row gap-4 bg-white p-4 rounded-lg shadow-sm border border-slate-200">
                                <div className="flex-1">
                                    <div className="relative">
                                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl">
                                            search
                                        </span>
                                        <input
                                            type="text"
                                            placeholder="Search categories..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="w-full pl-11 pr-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                                        />
                                    </div>
                                </div>
                                <button
                                    onClick={addCategory}
                                    className="bg-primary hover:bg-primary/90 text-white px-6 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 whitespace-nowrap"
                                >
                                    <span className="material-symbols-outlined text-[18px]">add</span>
                                    Add Category
                                </button>
                            </div>

                            {/* Categories Grid */}
                            {filteredCategories.length === 0 ? (
                                <div className="text-center py-16 bg-white rounded-lg border border-dashed border-slate-300">
                                    <span className="material-symbols-outlined text-5xl text-slate-300 mb-3">category</span>
                                    <p className="text-slate-500 text-sm">No categories found</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {filteredCategories
                                        .sort((a, b) => (a.display_order || 0) - (b.display_order || 0))
                                        .map((category, index) => (
                                            <div
                                                key={category.id}
                                                className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-all"
                                            >
                                                <div className="flex items-start gap-3">
                                                    {/* Reorder Arrows */}
                                                    <div className="flex flex-col gap-1 shrink-0">
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); if (category.id) moveCategory(category.id, 'up'); }}
                                                            disabled={index === 0}
                                                            className="p-1 text-slate-400 hover:text-primary hover:bg-slate-100 rounded disabled:opacity-20 transition-all"
                                                            title="Move Up"
                                                        >
                                                            <span className="material-symbols-outlined text-[18px] font-bold">keyboard_arrow_up</span>
                                                        </button>
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); if (category.id) moveCategory(category.id, 'down'); }}
                                                            disabled={index === filteredCategories.length - 1}
                                                            className="p-1 text-slate-400 hover:text-primary hover:bg-slate-100 rounded disabled:opacity-20 transition-all"
                                                            title="Move Down"
                                                        >
                                                            <span className="material-symbols-outlined text-[18px] font-bold">keyboard_arrow_down</span>
                                                        </button>
                                                    </div>

                                                    <div className="flex items-start gap-3 flex-1 min-w-0">
                                                        <div className="shrink-0">
                                                            <div className="w-10 h-10 bg-primary-50 rounded-lg flex items-center justify-center">
                                                                <span className="material-symbols-outlined text-primary text-xl">
                                                                    {category.icon || "category"}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-[10px] font-bold bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">#{index + 1}</span>
                                                                <h3 className="text-base font-semibold text-slate-900 truncate">{category.name}</h3>                                                            {category.is_active === 0 && (
                                                                    <span className="text-[10px] font-bold bg-red-100 text-red-600 px-1.5 py-0.5 rounded uppercase">Inactive</span>
                                                                )}
                                                                {category.brand && (
                                                                    <span className="text-[10px] font-bold bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded uppercase">{category.brand}</span>
                                                                )}                                                            </div>
                                                            <p className="text-xs text-slate-500 mt-1">{category.slug}</p>
                                                            {category.description && (
                                                                <p className="text-sm text-slate-600 line-clamp-2 mt-2">{category.description}</p>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-1 ml-2">
                                                        <button
                                                            onClick={() => {
                                                                setSelectedCategory(category);
                                                                setIsCategoryModalOpen(true);
                                                            }}
                                                            className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                                                        >
                                                            <span className="material-symbols-outlined text-[18px]">edit</span>
                                                        </button>
                                                        <button
                                                            onClick={() => category.id && deleteCategory(category.id)}
                                                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                        >
                                                            <span className="material-symbols-outlined text-[18px]">delete</span>
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* SUBCATEGORIES TAB */}
                    {activeTab === "subcategories" && (
                        <div className="space-y-6">
                            {/* Search and Add */}
                            <div className="flex flex-col sm:flex-row gap-4 bg-white p-4 rounded-lg shadow-sm border border-slate-200">
                                <div className="flex-1 flex flex-col sm:flex-row gap-4">
                                    <div className="relative flex-1">
                                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl">
                                            search
                                        </span>
                                        <input
                                            type="text"
                                            placeholder="Search subcategories..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="w-full pl-11 pr-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                                        />
                                    </div>
                                    <div className="min-w-[200px]">
                                        <select
                                            value={categoryFilter}
                                            onChange={(e) => setCategoryFilter(e.target.value)}
                                            className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary appearance-none bg-white cursor-pointer"
                                        >
                                            <option value="all">All Categories</option>
                                            {categories.map(cat => (
                                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                <button
                                    onClick={addSubcategory}
                                    disabled={categories.length === 0}
                                    className="bg-primary hover:bg-primary/90 text-white px-6 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 whitespace-nowrap disabled:opacity-50"
                                >
                                    <span className="material-symbols-outlined text-[18px]">add</span>
                                    Add Subcategory
                                </button>
                            </div>

                            {/* Subcategories Grid */}
                            {filteredSubcategories.length === 0 ? (
                                <div className="text-center py-16 bg-white rounded-lg border border-dashed border-slate-300">
                                    <span className="material-symbols-outlined text-5xl text-slate-300 mb-3">subdirectory_arrow_right</span>
                                    <p className="text-slate-500 text-sm">No subcategories found</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {filteredSubcategories
                                        .sort((a, b) => (a.display_order || 0) - (b.display_order || 0))
                                        .map((subcategory, index) => {
                                            const parentCategory = categories.find(c => String(c.id) === String(subcategory.category_id));
                                            return (
                                                <div
                                                    key={subcategory.id}
                                                    className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-all"
                                                >
                                                    <div className="flex items-start gap-3">
                                                        {/* Reorder Arrows */}
                                                        <div className="flex flex-col gap-1 shrink-0">
                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); if (subcategory.id) moveSubcategory(subcategory.category_id, subcategory.id, 'up'); }}
                                                                disabled={index === 0}
                                                                className="p-1 text-slate-400 hover:text-primary hover:bg-slate-100 rounded disabled:opacity-20 transition-all font-bold"
                                                                title="Move Up"
                                                            >
                                                                <span className="material-symbols-outlined text-[18px]">keyboard_arrow_up</span>
                                                            </button>
                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); if (subcategory.id) moveSubcategory(subcategory.category_id, subcategory.id, 'down'); }}
                                                                disabled={index === filteredSubcategories.length - 1}
                                                                className="p-1 text-slate-400 hover:text-primary hover:bg-slate-100 rounded disabled:opacity-20 transition-all font-bold"
                                                                title="Move Down"
                                                            >
                                                                <span className="material-symbols-outlined text-[18px]">keyboard_arrow_down</span>
                                                            </button>
                                                        </div>

                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-[10px] font-bold bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">#{index + 1}</span>
                                                                <h3 className="text-base font-semibold text-slate-900 truncate">{subcategory.name}</h3>
                                                                {subcategory.is_active === 0 && (
                                                                    <span className="text-[10px] font-bold bg-red-100 text-red-600 px-1.5 py-0.5 rounded uppercase">Inactive</span>
                                                                )}
                                                            </div>
                                                            <div className="mt-1 flex flex-wrap gap-2">
                                                                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-600 border border-slate-200">
                                                                    {parentCategory?.name || 'Unknown'}
                                                                </span>
                                                                {subcategory.ac_type && (
                                                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-primary-50 text-primary border border-primary-100">
                                                                        {subcategory.ac_type}
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <p className="text-[11px] text-slate-400 mt-2 font-mono truncate">{subcategory.slug}</p>
                                                            {subcategory.description && (
                                                                <p className="text-sm text-slate-600 line-clamp-2 mt-2">{subcategory.description}</p>
                                                            )}
                                                        </div>

                                                        <div className="flex flex-col gap-1">
                                                            <button
                                                                onClick={() => {
                                                                    setSelectedSubcategory(subcategory);
                                                                    setIsSubcategoryModalOpen(true);
                                                                }}
                                                                className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                                                            >
                                                                <span className="material-symbols-outlined text-[18px]">edit</span>
                                                            </button>
                                                            <button
                                                                onClick={() => subcategory.id && deleteSubcategory(subcategory.id)}
                                                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                            >
                                                                <span className="material-symbols-outlined text-[18px]">delete</span>
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* CATEGORY MODAL */}
            {isCategoryModalOpen && selectedCategory && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[95vh] flex flex-col overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-200 shrink-0">
                            <h2 className="text-xl font-bold text-slate-900">
                                {selectedCategory.isNew ? "New Category" : "Edit Category"}
                            </h2>
                        </div>
                        <div className="p-6 space-y-4 overflow-y-auto">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
                                <input
                                    type="text"
                                    value={selectedCategory.name}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        setSelectedCategory({
                                            ...selectedCategory,
                                            name: val,
                                            slug: selectedCategory.isNew ? normalizeSlug(val) : selectedCategory.slug
                                        });
                                    }}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Slug</label>
                                <input
                                    type="text"
                                    value={selectedCategory.slug}
                                    onChange={(e) => setSelectedCategory({ ...selectedCategory, slug: e.target.value })}
                                    className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary ${selectedCategory.slug && !isValidSlug(selectedCategory.slug) ? 'border-red-500' : 'border-slate-300'}`}
                                />
                                {selectedCategory.slug && !isValidSlug(selectedCategory.slug) && (
                                    <p className="text-[10px] text-red-500 mt-1">Invalid slug. Use only letters, numbers, hyphens and underscores.</p>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Brand (Internal slug)</label>
                                    <input
                                        type="text"
                                        value={selectedCategory.brand || ''}
                                        onChange={(e) => setSelectedCategory({ ...selectedCategory, brand: e.target.value })}
                                        placeholder="e.g. midea"
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                                    />
                                    <p className="text-[10px] text-slate-500 mt-1">Leave empty for global. Use "midea" for Midea AC page.</p>
                                </div>
                                <div className="flex items-center gap-2 pt-6">
                                    <input
                                        type="checkbox"
                                        id="cat-active"
                                        checked={selectedCategory.is_active === 1}
                                        onChange={(e) => setSelectedCategory({ ...selectedCategory, is_active: e.target.checked ? 1 : 0 })}
                                        className="w-4 h-4 text-primary border-slate-300 rounded focus:ring-primary"
                                    />
                                    <label htmlFor="cat-active" className="text-sm font-medium text-slate-700 cursor-pointer">Active (Show on site)</label>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Icon</label>
                                <IconSelector
                                    value={selectedCategory.icon || ''}
                                    onChange={(v) => setSelectedCategory({ ...selectedCategory, icon: v })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Meta Title</label>
                                <input
                                    type="text"
                                    value={selectedCategory.meta_title || ''}
                                    onChange={(e) => setSelectedCategory({ ...selectedCategory, meta_title: e.target.value })}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                                    maxLength={60}
                                    placeholder="Optional — SEO title"
                                />
                                <p className="text-xs text-slate-500 mt-1">Optional — used for SEO title (recommended 50-60 chars)</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Meta Description</label>
                                <textarea
                                    value={selectedCategory.meta_description || ''}
                                    onChange={(e) => setSelectedCategory({ ...selectedCategory, meta_description: e.target.value })}
                                    rows={3}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                                    maxLength={160}
                                    placeholder="Optional — used for search snippets and social previews"
                                />
                                <p className="text-xs text-slate-500 mt-1">Optional — used for search engines and social previews (recommended 150-160 chars)</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                                <textarea
                                    value={selectedCategory.description || ''}
                                    onChange={(e) => setSelectedCategory({ ...selectedCategory, description: e.target.value })}
                                    rows={3}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                                />
                            </div>
                        </div>
                        <div className="px-6 py-4 border-t border-slate-200 flex gap-3">
                            <button
                                onClick={saveCategory}
                                disabled={saving}
                                className="flex-1 bg-primary hover:bg-primary/90 text-white px-6 py-2.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                            >
                                {saving ? 'Saving...' : 'Save Category'}
                            </button>
                            <button
                                onClick={() => {
                                    setIsCategoryModalOpen(false);
                                    setSelectedCategory(null);
                                }}
                                disabled={saving}
                                className="px-6 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* SUBCATEGORY MODAL */}
            {isSubcategoryModalOpen && selectedSubcategory && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[95vh] flex flex-col overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-200 shrink-0">
                            <h2 className="text-xl font-bold text-slate-900">
                                {selectedSubcategory.isNew ? "New Subcategory" : "Edit Subcategory"}
                            </h2>
                        </div>
                        <div className="p-6 space-y-4 overflow-y-auto">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Parent Category</label>
                                <select
                                    value={String(selectedSubcategory.category_id ?? '')}
                                    onChange={(e) => setSelectedSubcategory({ ...selectedSubcategory, category_id: e.target.value })}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                                >
                                    <option value="">Select Category</option>
                                    {categories.map((cat) => (
                                        <option key={String(cat.id)} value={String(cat.id)}>{cat.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
                                <input
                                    type="text"
                                    value={selectedSubcategory.name}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        setSelectedSubcategory({
                                            ...selectedSubcategory,
                                            name: val,
                                            slug: selectedSubcategory.isNew ? normalizeSlug(val) : selectedSubcategory.slug
                                        });
                                    }}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">AC Type</label>
                                <input
                                    type="text"
                                    value={selectedSubcategory.ac_type || ''}
                                    onChange={(e) => setSelectedSubcategory({ ...selectedSubcategory, ac_type: e.target.value })}
                                    placeholder="Inverter, Window, Split, Cassette..."
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Slug</label>
                                <input
                                    type="text"
                                    value={selectedSubcategory.slug}
                                    onChange={(e) => setSelectedSubcategory({ ...selectedSubcategory, slug: e.target.value })}
                                    className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary ${selectedSubcategory.slug && !isValidSlug(selectedSubcategory.slug) ? 'border-red-500' : 'border-slate-300'}`}
                                />
                                {selectedSubcategory.slug && !isValidSlug(selectedSubcategory.slug) && (
                                    <p className="text-[10px] text-red-500 mt-1">Invalid slug. Use only letters, numbers, hyphens and underscores.</p>
                                )}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                                <textarea
                                    value={selectedSubcategory.description || ''}
                                    onChange={(e) => setSelectedSubcategory({ ...selectedSubcategory, description: e.target.value })}
                                    rows={3}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                                />
                            </div>
                            <div className="flex items-center gap-2 py-2">
                                <input
                                    type="checkbox"
                                    id="sub-active"
                                    checked={selectedSubcategory.is_active === 1}
                                    onChange={(e) => setSelectedSubcategory({ ...selectedSubcategory, is_active: e.target.checked ? 1 : 0 })}
                                    className="w-4 h-4 text-primary border-slate-300 rounded focus:ring-primary"
                                />
                                <label htmlFor="sub-active" className="text-sm font-medium text-slate-700 cursor-pointer">Active (Show on site)</label>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Meta Title</label>
                                    <input
                                        type="text"
                                        value={selectedSubcategory.meta_title || ''}
                                        onChange={(e) => setSelectedSubcategory({ ...selectedSubcategory, meta_title: e.target.value })}
                                        placeholder="SEO Title"
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Meta Description</label>
                                    <input
                                        type="text"
                                        value={selectedSubcategory.meta_description || ''}
                                        onChange={(e) => setSelectedSubcategory({ ...selectedSubcategory, meta_description: e.target.value })}
                                        placeholder="SEO Description"
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="px-6 py-4 border-t border-slate-200 flex gap-3">
                            <button
                                onClick={saveSubcategory}
                                disabled={saving}
                                className="flex-1 bg-primary hover:bg-primary/90 text-white px-6 py-2.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                            >
                                {saving ? 'Saving...' : 'Save Subcategory'}
                            </button>
                            <button
                                onClick={() => {
                                    setIsSubcategoryModalOpen(false);
                                    setSelectedSubcategory(null);
                                }}
                                disabled={saving}
                                className="px-6 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
