"use client";

import { useEffect, useState } from "react";
import { showToast } from '@/components/Toast';

type NavbarItem = {
    id?: string | number;
    _id?: string;
    label: string;
    href: string;
    order: number;
    parent_id?: string | number | null;
    is_button: number;
    is_active: number;
    is_dropdown?: number;
    isNew?: boolean;
};

export default function NavbarManagerPage() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [navbarItems, setNavbarItems] = useState<NavbarItem[]>([]);
    const [selectedItem, setSelectedItem] = useState<NavbarItem | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [manageChildrenId, setManageChildrenId] = useState<string | number | null>(null);
    const [categories, setCategories] = useState<any[]>([]);
    const [subcategories, setSubcategories] = useState<any[]>([]);
    const [selectedCategories, setSelectedCategories] = useState<Record<string, boolean>>({});
    const [includeSubcategories, setIncludeSubcategories] = useState(true);
    const [manageSearch, setManageSearch] = useState('');
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        fetchData();
    }, []);

    const getId = (item: any) => String(item?._id ?? item?.id ?? '');

    const fetchData = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/navbar');
            if (response.ok) {
                const items = await response.json();
                // Normalize items: ensure id is string of _id, and parent_id is string or null
                const normalized = items.map((it: any) => ({
                    ...it,
                    _id: it._id ? String(it._id) : undefined,
                    id: getId(it),
                    parent_id: it.parent_id ? String(it.parent_id) : null,
                }));
                setNavbarItems(normalized);
            }
        } catch (error) {
            console.error('Error fetching navbar items:', error);
        } finally {
            setLoading(false);
        }
    };

    const addItem = () => {
        setSelectedItem({
            label: "",
            href: "",
            order: navbarItems.length,
            parent_id: null,
            is_button: 0,
            is_active: 1,
            isNew: true,
            is_dropdown: 0,
        });
        setIsModalOpen(true);
    };

    const saveItem = async () => {
        if (!selectedItem) return;

        setSaving(true);
        try {
            const method = selectedItem.isNew ? 'POST' : 'PUT';
            const response = await fetch('/api/navbar', {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(selectedItem),
            });
            const data = await response.json();
            if (response.status === 201) {
                showToast('Navbar item created successfully!', { type: 'success' });
            } else if (response.status === 200 && data?.existing) {
                showToast('Navbar item already exists.', { type: 'info' });
            } else if (response.status === 409) {
                showToast('Cannot create navbar item: duplicate exists.', { type: 'error' });
            } else if (!response.ok) {
                throw new Error('Failed to save navbar item');
            } else {
                showToast('Navbar item saved successfully!', { type: 'success' });
            }
            setIsModalOpen(false);
            setSelectedItem(null);
            fetchData();
        } catch (error) {
            console.error('Error saving navbar item:', error);
            showToast('Failed to save navbar item. Please try again.', { type: 'error' });
        } finally {
            setSaving(false);
        }
    };

    const deleteItem = async (id: string | number) => {
        if (!confirm('Are you sure you want to delete this navbar item?')) return;

        setSaving(true);
        try {
            const response = await fetch('/api/navbar', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id }),
            });

            if (!response.ok) throw new Error('Failed to delete navbar item');

            showToast('Navbar item deleted successfully!', { type: 'success' });
            fetchData();
        } catch (error) {
            console.error('Error deleting navbar item:', error);
            showToast('Failed to delete navbar item. Please try again.', { type: 'error' });
        } finally {
            setSaving(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const res = await fetch('/api/pages/services/categories');
            if (!res.ok) throw new Error('Failed to fetch categories');
            const data = await res.json();
            setCategories(data);
            setSelectedCategories({});
            const subRes = await fetch('/api/pages/services/subcategories');
            if (subRes.ok) {
                const subData = await subRes.json();
                setSubcategories(subData);
            } else {
                setSubcategories([]);
            }
            return data;
        } catch (error) {
            console.error('Error fetching categories:', error);
            return [];
        }
    };

    const toggleManageChildren = async (id: string | number) => {
        if (manageChildrenId === id) {
            setManageChildrenId(null);
            return;
        }
        setManageChildrenId(id);
        const data = await fetchCategories();
        const defaults: Record<string, boolean> = {};
        for (const cat of data) {
            const exists = navbarItems.some(n => (n.href === `/services/category/${cat.slug}` || n.href === `/shop/category/${cat.slug}`) && String(n.parent_id) === String(id));
            defaults[String(cat.id)] = exists;
        }
        setSelectedCategories(defaults);
    };

    const addSelectedCategories = async (parentId: string | number) => {
        const selected = categories.filter((c: any) => selectedCategories[String(c.id)]);
        if (selected.length === 0) return;
        try {
            // Check if parent is a dropdown; if not, update it
            const parentItem = navbarItems.find(n => String(n.id) === String(parentId));
            if (parentItem && parentItem.is_dropdown !== 1) {
                await fetch('/api/navbar', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ ...parentItem, is_dropdown: 1 }),
                });
            }

            // For each category, create a navbar item and then create nav items for subcategories under it (if any)
            for (const [selIndex, cat] of selected.entries()) {
                // Prevent duplicates: reuse existing category nav item under parent if present
                const existingCat = navbarItems.find(n => (n.href === `/services/category/${cat.slug}` || n.href === `/shop/category/${cat.slug}`) && n.parent_id === parentId);
                let newNavId: string | number | undefined;
                if (existingCat && (existingCat.id || existingCat._id)) {
                    newNavId = existingCat.id ?? existingCat._id;
                    // If this existing category should be a dropdown but isn't, update it
                    const catHasSub = subcategories.some(s => s.category_id === cat.id);
                    if (catHasSub && existingCat.is_dropdown !== 1) {
                        await fetch('/api/navbar', {
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ ...existingCat, id: existingCat.id ?? existingCat._id, is_dropdown: 1 }),
                        });
                        // Update local state for this existing category
                        setNavbarItems(prev => prev.map(n => (String(n.id) === String(existingCat.id ?? existingCat._id)) ? { ...n, is_dropdown: 1 } : n));
                    }
                } else {
                    const childrenUnderParent = navbarItems.filter(n => n.parent_id === parentId);
                    const maxOrder = childrenUnderParent.length > 0 ? Math.max(...childrenUnderParent.map(c => c.order || 0)) : -1;
                    const newOrder = maxOrder + 1 + selIndex;
                    const res = await fetch('/api/navbar', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            label: cat.name,
                            href: `/shop/category/${cat.slug}`,
                            order: newOrder,
                            parent_id: parentId,
                            is_button: 0,
                            is_active: 1,
                            is_dropdown: (subcategories.filter(s => s.category_id === cat.id).length > 0) ? 1 : 0,
                        }),
                    });
                    if (!res.ok) continue;
                    const result = await res.json();
                    newNavId = result.id;
                    // Update local state to include the newly created category nav item
                    if (newNavId) {
                        setNavbarItems(prev => [
                            ...prev,
                            {
                                id: newNavId,
                                label: cat.name,
                                href: `/shop/category/${cat.slug}`,
                                order: newOrder,
                                parent_id: parentId,
                                is_button: 0,
                                is_active: 1,
                                is_dropdown: (subcategories.filter(s => s.category_id === cat.id).length > 0) ? 1 : 0,
                            },
                        ]);
                    }
                }

                // Find subcategories for this category
                const catSubs = subcategories.filter(sc => sc.category_id === cat.id);
                for (const sub of catSubs) {
                    // Skip subcategory creation if includeSubcategories is false
                    if (!includeSubcategories) break;
                    // Check if subcategory nav item exists under this category nav
                    const existingSub = navbarItems.find(n => (n.href === `/services/category/${cat.slug}/${sub.slug}` || n.href === `/shop/category/${cat.slug}/${sub.slug}`) && n.parent_id === newNavId);
                    if (existingSub) continue;
                    const subRes = await fetch('/api/navbar', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            label: sub.name,
                            href: `/shop/category/${cat.slug}/${sub.slug}`,
                            order: 0,
                            parent_id: newNavId,
                            is_button: 0,
                            is_active: 1,
                            is_dropdown: 0,
                        }),
                    });
                    if (subRes.ok) {
                        const subResult = await subRes.json();
                        const newSubId = subResult.id;
                        if (newSubId) {
                            setNavbarItems(prev => [
                                ...prev,
                                {
                                    id: newSubId,
                                    label: sub.name,
                                    href: `/shop/category/${cat.slug}/${sub.slug}`,
                                    order: 0,
                                    parent_id: newNavId as number,
                                    is_button: 0,
                                    is_active: 1,
                                    is_dropdown: 0,
                                },
                            ]);
                        }
                    }
                }
            }
            showToast('Categories and subcategories added to navbar', { type: 'success' });
            setManageChildrenId(null);
            fetchData();
        } catch (error) {
            console.error('Error adding categories:', error);
            showToast('Failed to add categories', { type: 'error' });
        }
    };

    const removeAllChildren = async (parentId: string | number) => {
        if (!confirm('Are you sure you want to remove all child nav items under this dropdown? This cannot be undone.')) return;
        setSaving(true);
        try {
            const children = navbarItems.filter(n => String(n.parent_id) === String(parentId));
            for (const child of children) {
                // delete grandchildren first
                const grandchildren = navbarItems.filter(gc => String(gc.parent_id) === String(child.id));
                for (const g of grandchildren) {
                    await fetch('/api/navbar', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: g.id ?? g._id }) });
                }
                await fetch('/api/navbar', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: child.id ?? child._id }) });
            }
            showToast('All children removed', { type: 'success' });
            fetchData();
        } catch (error) {
            console.error('Error removing children:', error);
            showToast('Failed to remove children', { type: 'error' });
        } finally {
            setSaving(false);
            setManageChildrenId(null);
        }
    };

    const moveItem = async (id: string | number, direction: 'up' | 'down') => {
        const idStr = String(id);
        const index = navbarItems.findIndex(item => String(item.id) === idStr);
        if (index === -1) return;
        if (direction === 'up' && index === 0) return;
        if (direction === 'down' && index === navbarItems.length - 1) return;

        const newIndex = direction === 'up' ? index - 1 : index + 1;
        const newItems = [...navbarItems];
        [newItems[index], newItems[newIndex]] = [newItems[newIndex], newItems[index]];

        // Update order values
        const updates = newItems.map((item, idx) => ({
            ...item,
            order: idx,
        }));

        setNavbarItems(updates);

        // Save the reordered items
        try {
            await Promise.all(
                updates.map(item =>
                    fetch('/api/navbar', {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(item),
                    })
                )
            );
        } catch (error) {
            console.error('Error reordering items:', error);
            fetchData(); // Reload on error
        }
    };

    const moveChildItem = async (parentId: string | number, childId: string | number, direction: 'up' | 'down') => {
        const children = navbarItems.filter(n => String(n.parent_id) === String(parentId)).sort((a, b) => a.order - b.order);
        const index = children.findIndex(c => String(c.id) === String(childId));
        if (index === -1) return;
        if (direction === 'up' && index === 0) return;
        if (direction === 'down' && index === children.length - 1) return;

        const newIndex = direction === 'up' ? index - 1 : index + 1;
        const newChildren = [...children];
        [newChildren[index], newChildren[newIndex]] = [newChildren[newIndex], newChildren[index]];
        const updates = newChildren.map((item, idx) => ({ ...item, order: idx }));

        try {
            await Promise.all(
                updates.map(item => fetch('/api/navbar', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(item) }))
            );
            fetchData();
        } catch (error) {
            console.error('Error reordering child items:', error);
            fetchData();
        }
    };

    const rootItems = navbarItems.filter(item => !item.parent_id || String(item.parent_id) === 'null');

    const filteredItems = rootItems.filter(root => {
        const q = searchQuery.toLowerCase();
        const itemMatches = (item: NavbarItem) =>
            item.label.toLowerCase().includes(q) || item.href.toLowerCase().includes(q);

        if (!q) return true;
        if (itemMatches(root)) return true;
        // if any child matches, include this root (compare parent_id as strings)
        return navbarItems.some(n => String(n.parent_id) === String(root.id) && itemMatches(n));
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
        <div className="flex-1 overflow-y-auto bg-slate-50">
            {/* Header */}
            <div className="sticky top-0 z-10 bg-white border-b border-slate-200 shadow-sm">
                <div className="px-6 py-4">
                    <h1 className="text-2xl font-bold text-slate-900">Navbar</h1>
                    <p className="text-sm text-slate-500 mt-1">Manage navigation menu items</p>
                </div>
            </div>

            <div className="w-full mx-auto px-6 py-8">
                <div className="max-w-5xl mx-auto space-y-6">
                    {/* Search and Add */}
                    <div className="flex flex-col sm:flex-row gap-4 bg-white p-4 rounded-lg shadow-sm border border-slate-200">
                        <div className="flex-1">
                            <div className="relative">
                                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl">
                                    search
                                </span>
                                <input
                                    type="text"
                                    placeholder="Search navbar items..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-11 pr-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>
                        </div>
                        <button
                            onClick={addItem}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 whitespace-nowrap"
                        >
                            <span className="material-symbols-outlined text-[18px]">add</span>
                            Add Navbar Item
                        </button>
                    </div>

                    {/* Items List */}
                    {filteredItems.length === 0 ? (
                        <div className="text-center py-16 bg-white rounded-lg border border-dashed border-slate-300">
                            <span className="material-symbols-outlined text-5xl text-slate-300 mb-3">menu</span>
                            <p className="text-slate-500 text-sm">No navbar items found</p>
                            <button
                                onClick={addItem}
                                className="mt-4 text-indigo-600 hover:text-indigo-700 text-sm font-medium"
                            >
                                Create your first navbar item
                            </button>
                        </div>
                    ) : (
                        <div className="bg-white rounded-lg border border-slate-200 divide-y divide-slate-200">
                            {filteredItems.map((item, index) => (
                                <div
                                    key={String(item.id ?? item._id)}
                                    className={`p-4 hover:bg-slate-50 transition-colors ${item.is_active === 0 ? 'opacity-50' : ''
                                        }`}
                                >
                                    <div className="flex items-center gap-4">
                                        {/* Reorder Buttons */}
                                        <div className="flex flex-col gap-1">
                                            <button
                                                onClick={() => { const iid = item.id ?? item._id; if (iid) moveItem(iid as string | number, 'up'); }}
                                                disabled={index === 0}
                                                className="p-1 text-slate-600 hover:bg-slate-200 rounded disabled:opacity-30"
                                            >
                                                <span className="material-symbols-outlined text-[16px]">arrow_upward</span>
                                            </button>
                                            <button
                                                onClick={() => { const iid = item.id ?? item._id; if (iid) moveItem(iid as string | number, 'down'); }}
                                                disabled={index === filteredItems.length - 1}
                                                className="p-1 text-slate-600 hover:bg-slate-200 rounded disabled:opacity-30"
                                            >
                                                <span className="material-symbols-outlined text-[16px]">arrow_downward</span>
                                            </button>
                                        </div>

                                        {/* Item Info */}
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className="text-base font-semibold text-slate-900">{item.label}</h3>
                                                {item.is_button === 1 && (
                                                    <span className="px-2 py-0.5 text-xs font-medium bg-indigo-100 text-indigo-700 rounded">
                                                        Button
                                                    </span>
                                                )}
                                                {item.is_active === 0 && (
                                                    <span className="px-2 py-0.5 text-xs font-medium bg-red-100 text-red-700 rounded">
                                                        Hidden
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-sm text-slate-500">{item.href}</p>
                                            {item.parent_id && (
                                                <p className="text-xs text-slate-400 mt-1">
                                                    Submenu item (Parent ID: {item.parent_id})
                                                </p>
                                            )}
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="flex gap-1">
                                            <button
                                                onClick={() => {
                                                    setSelectedItem(item);
                                                    setIsModalOpen(true);
                                                }}
                                                className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                                            >
                                                <span className="material-symbols-outlined text-[18px]">edit</span>
                                            </button>
                                            <button
                                                onClick={() => { const iid = item.id ?? item._id; if (iid) deleteItem(iid as string | number); }}
                                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                            >
                                                <span className="material-symbols-outlined text-[18px]">delete</span>
                                            </button>
                                            {item.is_dropdown === 1 && (
                                                <button
                                                    onClick={() => { const iid = item.id ?? item._id; if (iid) toggleManageChildren(iid as string | number); }}
                                                    className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                                                    title="Manage dropdown children"
                                                >
                                                    <span className="material-symbols-outlined text-[18px]">list</span>
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                    {manageChildrenId === (item.id ?? item._id) && (
                                        <div className="p-4 border-t border-slate-100 bg-slate-50">
                                            <div className="flex items-center justify-between mb-3 gap-3">
                                                <div className="text-sm font-semibold">Add categories as dropdown items</div>
                                                <div className="flex items-center gap-2">
                                                    <label className="inline-flex items-center gap-2 text-sm">
                                                        <input type="checkbox" checked={includeSubcategories} onChange={(e) => setIncludeSubcategories(e.target.checked)} className="w-4 h-4" />
                                                        <span className="text-xs text-slate-600">Include subcategories</span>
                                                    </label>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 mb-3">
                                                <input
                                                    type="text"
                                                    placeholder="Search categories..."
                                                    value={manageSearch}
                                                    onChange={(e) => setManageSearch(e.target.value)}
                                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                                />
                                                <button className="text-sm text-indigo-600 hover:underline" onClick={() => {
                                                    const newSel: Record<number, boolean> = {};
                                                    const visible = categories.filter(c => c.name.toLowerCase().includes(manageSearch.toLowerCase()));
                                                    visible.forEach((v: any) => newSel[v.id] = true);
                                                    setSelectedCategories(newSel);
                                                }}>Select all</button>
                                                <button className="text-sm text-slate-500 hover:underline" onClick={() => setSelectedCategories({})}>Clear</button>
                                            </div>
                                            <div className="mb-3 text-sm">Existing children ({navbarItems.filter(n => String(n.parent_id) === String(item.id ?? item._id)).length})</div>
                                            <div className="grid grid-cols-1 gap-2 mb-3">
                                                {navbarItems.filter(n => String(n.parent_id) === String(item.id ?? item._id)).map(child => (
                                                    <div key={child.id} className="bg-white border border-slate-200 rounded">
                                                        <div className="flex items-center justify-between gap-2 px-3 py-2 text-sm">
                                                            <div className="truncate">{child.label} <span className="text-xs text-slate-400">{child.href}</span></div>
                                                            <div className="flex gap-2">
                                                                <button
                                                                    onClick={() => { const iid = item.id ?? item._id; if (iid && child.id) moveChildItem(iid as string | number, child.id as string | number, 'up') }}
                                                                    className="p-1 text-slate-600 hover:bg-slate-200 rounded disabled:opacity-30"
                                                                >
                                                                    <span className="material-symbols-outlined text-[16px]">arrow_upward</span>
                                                                </button>
                                                                <button
                                                                    onClick={() => { const iid = item.id ?? item._id; if (iid && child.id) moveChildItem(iid as string | number, child.id as string | number, 'down') }}
                                                                    className="p-1 text-slate-600 hover:bg-slate-200 rounded disabled:opacity-30"
                                                                >
                                                                    <span className="material-symbols-outlined text-[16px]">arrow_downward</span>
                                                                </button>
                                                                <button
                                                                    onClick={() => { const cid = child.id ?? child._id; if (cid) deleteItem(cid as string | number); }}
                                                                    className="text-red-600 hover:bg-red-50 p-1 rounded"
                                                                >
                                                                    <span className="material-symbols-outlined text-[16px]">delete</span>
                                                                </button>
                                                            </div>
                                                        </div>
                                                        {navbarItems.filter(gc => String(gc.parent_id) === String(child.id)).length > 0 && (
                                                            <div className="pl-3 pr-3 pb-3 pt-1 border-t border-slate-100">
                                                                <div className="text-xs text-slate-500 mb-2">Subcategories</div>
                                                                <div className="space-y-2">
                                                                    {navbarItems.filter(gc => gc.parent_id === child.id).map(gc => (
                                                                        <div key={String(gc.id ?? gc._id)} className="flex items-center justify-between gap-2 text-sm px-2 py-1 rounded bg-slate-50">
                                                                            <div className="truncate">{gc.label} <span className="text-xs text-slate-400">{gc.href}</span></div>
                                                                            <div className="flex items-center gap-1">
                                                                                <button
                                                                                    onClick={() => child.id && gc.id && moveChildItem(child.id, gc.id, 'up')}
                                                                                    className="p-1 text-slate-600 hover:bg-slate-200 rounded disabled:opacity-30"
                                                                                >
                                                                                    <span className="material-symbols-outlined text-[16px]">arrow_upward</span>
                                                                                </button>
                                                                                <button
                                                                                    onClick={() => child.id && gc.id && moveChildItem(child.id, gc.id, 'down')}
                                                                                    className="p-1 text-slate-600 hover:bg-slate-200 rounded disabled:opacity-30"
                                                                                >
                                                                                    <span className="material-symbols-outlined text-[16px]">arrow_downward</span>
                                                                                </button>
                                                                                <button
                                                                                    onClick={() => gc.id && deleteItem(gc.id)}
                                                                                    className="text-red-600 hover:bg-red-50 p-1 rounded"
                                                                                >
                                                                                    <span className="material-symbols-outlined text-[16px]">delete</span>
                                                                                </button>
                                                                            </div>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto">
                                                {categories.filter(c => c.name.toLowerCase().includes(manageSearch.toLowerCase())).map(cat => (
                                                    <div key={cat.id} className="flex items-center justify-between gap-2 text-sm py-1">
                                                        <label className="flex items-center gap-2">
                                                            <input
                                                                type="checkbox"
                                                                checked={!!selectedCategories[cat.id]}
                                                                onChange={(e) => setSelectedCategories(prev => ({ ...prev, [cat.id]: e.target.checked }))}
                                                                className="w-4 h-4 text-indigo-600 rounded"
                                                            />
                                                            {cat.thumbnail ? (
                                                                <img src={cat.thumbnail} alt={cat.name} className="w-8 h-8 rounded object-cover" />
                                                            ) : cat.icon ? (
                                                                <span className="material-symbols-outlined text-2xl text-slate-600">{cat.icon}</span>
                                                            ) : null}
                                                            <span>{cat.name}</span>
                                                        </label>
                                                        <div className="flex items-center gap-2">
                                                            {(item.id ?? item._id) && (() => {
                                                                const existing = navbarItems.filter(n => String(n.parent_id) === String(item.id ?? item._id)).find(n => n.href === `/shop/category/${cat.slug}` || n.href === `/services/category/${cat.slug}`);
                                                                if (existing && (existing.id ?? existing._id)) {
                                                                    return (
                                                                        <div className="flex gap-2 items-center text-sm">
                                                                            <span className="text-xs text-slate-400">Order: {existing.order}</span>
                                                                            <button
                                                                                onClick={() => { setSelectedItem(existing); setIsModalOpen(true); }}
                                                                                className="text-indigo-600 hover:underline"
                                                                            >
                                                                                Edit
                                                                            </button>
                                                                            <button
                                                                                onClick={() => { const iid = existing.id ?? existing._id; if (iid) deleteItem(iid as string | number); }}
                                                                                className="text-red-600 hover:underline"
                                                                            >
                                                                                Remove
                                                                            </button>
                                                                        </div>
                                                                    );
                                                                }
                                                                return null;
                                                            })()}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="mt-3 flex gap-2">
                                                <button
                                                    onClick={() => { const iid = item.id ?? item._id; if (iid) addSelectedCategories(iid as string | number); }}
                                                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded text-sm flex items-center gap-2"
                                                >
                                                    <span>Attach selected</span>
                                                    <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded">{Object.values(selectedCategories).filter(Boolean).length}</span>
                                                </button>
                                                <button
                                                    onClick={() => { const iid = item.id ?? item._id; if (iid) removeAllChildren(iid as string | number); }}
                                                    className="bg-red-50 hover:bg-red-100 text-red-700 px-4 py-2 rounded text-sm border border-red-100"
                                                >
                                                    Remove all children
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* EDIT MODAL */}
            {isModalOpen && selectedItem && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full">
                        <div className="px-6 py-4 border-b border-slate-200">
                            <h2 className="text-xl font-bold text-slate-900">
                                {selectedItem.isNew ? "New Navbar Item" : "Edit Navbar Item"}
                            </h2>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Label</label>
                                <input
                                    type="text"
                                    value={selectedItem.label}
                                    onChange={(e) => setSelectedItem({ ...selectedItem, label: e.target.value })}
                                    placeholder="Home"
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Link (href)</label>
                                <input
                                    type="text"
                                    value={selectedItem.href}
                                    onChange={(e) => setSelectedItem({ ...selectedItem, href: e.target.value })}
                                    placeholder="/"
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Order</label>
                                    <input
                                        type="number"
                                        value={selectedItem.order}
                                        onChange={(e) => setSelectedItem({ ...selectedItem, order: Number(e.target.value) })}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Parent ID (optional)</label>
                                    <input
                                        type="text"
                                        value={selectedItem.parent_id || ''}
                                        onChange={(e) => setSelectedItem({ ...selectedItem, parent_id: e.target.value || null })}
                                        placeholder="ObjectId string"
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                            </div>
                            <div className="flex items-center gap-8 pt-2">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={selectedItem.is_button === 1}
                                        onChange={(e) => setSelectedItem({ ...selectedItem, is_button: e.target.checked ? 1 : 0 })}
                                        className="w-4 h-4 text-indigo-600 rounded focus:ring-2 focus:ring-indigo-500"
                                    />
                                    <span className="text-sm text-slate-700">Display as Button</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={selectedItem.is_active === 1}
                                        onChange={(e) => setSelectedItem({ ...selectedItem, is_active: e.target.checked ? 1 : 0 })}
                                        className="w-4 h-4 text-indigo-600 rounded focus:ring-2 focus:ring-indigo-500"
                                    />
                                    <span className="text-sm text-slate-700">Active (Visible)</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={selectedItem.is_dropdown === 1}
                                        onChange={(e) => setSelectedItem({ ...selectedItem, is_dropdown: e.target.checked ? 1 : 0 })}
                                        className="w-4 h-4 text-indigo-600 rounded focus:ring-2 focus:ring-indigo-500"
                                    />
                                    <span className="text-sm text-slate-700">Dropdown (has children)</span>
                                </label>
                            </div>
                        </div>
                        <div className="px-6 py-4 border-t border-slate-200 flex gap-3">
                            <button
                                onClick={saveItem}
                                disabled={saving}
                                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                            >
                                {saving ? 'Saving...' : 'Save Item'}
                            </button>
                            <button
                                onClick={() => {
                                    setIsModalOpen(false);
                                    setSelectedItem(null);
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
