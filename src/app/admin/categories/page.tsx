"use client";

import { useEffect, useState } from "react";
import { showToast } from '@/components/Toast';

type Category = {
    id?: number;
    name: string;
    slug: string;
    description?: string | null;
    icon?: string | null;
    isNew?: boolean;
};

type Subcategory = {
    id?: number;
    category_id: number;
    name: string;
    slug: string;
    description?: string | null;
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

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [categoriesRes, subcategoriesRes] = await Promise.all([
                fetch('/api/pages/services/categories'),
                fetch('/api/pages/services/subcategories'),
            ]);

            if (categoriesRes.ok) {
                const cats = await categoriesRes.json();
                setCategories(cats);
            }

            if (subcategoriesRes.ok) {
                const subs = await subcategoriesRes.json();
                setSubcategories(subs);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const addCategory = () => {
        setSelectedCategory({
            name: "",
            slug: "",
            description: "",
            icon: "",
            isNew: true,
        });
        setIsCategoryModalOpen(true);
    };

    const addSubcategory = () => {
        setSelectedSubcategory({
            category_id: categories[0]?.id || 0,
            name: "",
            slug: "",
            description: "",
            isNew: true,
        });
        setIsSubcategoryModalOpen(true);
    };

    const saveCategory = async () => {
        if (!selectedCategory) return;

        setSaving(true);
        try {
            const method = selectedCategory.isNew ? 'POST' : 'PUT';
            const response = await fetch('/api/pages/services/categories', {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(selectedCategory),
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

        setSaving(true);
        try {
            const method = selectedSubcategory.isNew ? 'POST' : 'PUT';
            const response = await fetch('/api/pages/services/subcategories', {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(selectedSubcategory),
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

    const deleteCategory = async (id: number) => {
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

    const deleteSubcategory = async (id: number) => {
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

    const filteredSubcategories = subcategories.filter(sub =>
        sub.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

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
                                            className="w-full pl-11 pr-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        />
                                    </div>
                                </div>
                                <button
                                    onClick={addCategory}
                                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 whitespace-nowrap"
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
                                    {filteredCategories.map((category) => (
                                        <div
                                            key={category.id}
                                            className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-all"
                                        >
                                            <div className="flex items-start justify-between">
                                                <div className="flex items-start gap-3 flex-1">
                                                    <div className="shrink-0">
                                                        <div className="w-12 h-12 bg-indigo-50 rounded-lg flex items-center justify-center">
                                                            <span className="material-symbols-outlined text-indigo-600 text-2xl">
                                                                {category.icon || "category"}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <h3 className="text-base font-semibold text-slate-900 truncate">{category.name}</h3>
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
                                <div className="flex-1">
                                    <div className="relative">
                                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl">
                                            search
                                        </span>
                                        <input
                                            type="text"
                                            placeholder="Search subcategories..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="w-full pl-11 pr-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        />
                                    </div>
                                </div>
                                <button
                                    onClick={addSubcategory}
                                    disabled={categories.length === 0}
                                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 whitespace-nowrap disabled:opacity-50"
                                >
                                    <span className="material-symbols-outlined text-[18px]">add</span>
                                    Add Subcategory
                                </button>
                            </div>

                            {/* Subcategories List */}
                            {filteredSubcategories.length === 0 ? (
                                <div className="text-center py-16 bg-white rounded-lg border border-dashed border-slate-300">
                                    <span className="material-symbols-outlined text-5xl text-slate-300 mb-3">subdirectory_arrow_right</span>
                                    <p className="text-slate-500 text-sm">No subcategories found</p>
                                </div>
                            ) : (
                                <div className="bg-white rounded-lg border border-slate-200 divide-y divide-slate-200">
                                    {filteredSubcategories.map((subcategory) => {
                                        const parentCategory = categories.find(c => c.id === subcategory.category_id);
                                        return (
                                            <div
                                                key={subcategory.id}
                                                className="p-4 hover:bg-slate-50 transition-colors"
                                            >
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1">
                                                        <h3 className="text-base font-semibold text-slate-900">{subcategory.name}</h3>
                                                        <p className="text-xs text-slate-500 mt-1">
                                                            {subcategory.slug} • Parent: {parentCategory?.name || 'Unknown'}
                                                        </p>
                                                        {subcategory.description && (
                                                            <p className="text-sm text-slate-600 mt-2">{subcategory.description}</p>
                                                        )}
                                                    </div>
                                                    <div className="flex gap-1 ml-4">
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
                    <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full">
                        <div className="px-6 py-4 border-b border-slate-200">
                            <h2 className="text-xl font-bold text-slate-900">
                                {selectedCategory.isNew ? "New Category" : "Edit Category"}
                            </h2>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
                                <input
                                    type="text"
                                    value={selectedCategory.name}
                                    onChange={(e) => setSelectedCategory({ ...selectedCategory, name: e.target.value })}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Slug</label>
                                <input
                                    type="text"
                                    value={selectedCategory.slug}
                                    onChange={(e) => setSelectedCategory({ ...selectedCategory, slug: e.target.value })}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Icon (Material Symbol)</label>
                                <input
                                    type="text"
                                    value={selectedCategory.icon || ''}
                                    onChange={(e) => setSelectedCategory({ ...selectedCategory, icon: e.target.value })}
                                    placeholder="category"
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                                <textarea
                                    value={selectedCategory.description || ''}
                                    onChange={(e) => setSelectedCategory({ ...selectedCategory, description: e.target.value })}
                                    rows={3}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>
                        </div>
                        <div className="px-6 py-4 border-t border-slate-200 flex gap-3">
                            <button
                                onClick={saveCategory}
                                disabled={saving}
                                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
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
                    <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full">
                        <div className="px-6 py-4 border-b border-slate-200">
                            <h2 className="text-xl font-bold text-slate-900">
                                {selectedSubcategory.isNew ? "New Subcategory" : "Edit Subcategory"}
                            </h2>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Parent Category</label>
                                <select
                                    value={selectedSubcategory.category_id}
                                    onChange={(e) => setSelectedSubcategory({ ...selectedSubcategory, category_id: Number(e.target.value) })}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                >
                                    {categories.map((cat) => (
                                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
                                <input
                                    type="text"
                                    value={selectedSubcategory.name}
                                    onChange={(e) => setSelectedSubcategory({ ...selectedSubcategory, name: e.target.value })}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Slug</label>
                                <input
                                    type="text"
                                    value={selectedSubcategory.slug}
                                    onChange={(e) => setSelectedSubcategory({ ...selectedSubcategory, slug: e.target.value })}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                                <textarea
                                    value={selectedSubcategory.description || ''}
                                    onChange={(e) => setSelectedSubcategory({ ...selectedSubcategory, description: e.target.value })}
                                    rows={3}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>
                        </div>
                        <div className="px-6 py-4 border-t border-slate-200 flex gap-3">
                            <button
                                onClick={saveSubcategory}
                                disabled={saving}
                                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
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
