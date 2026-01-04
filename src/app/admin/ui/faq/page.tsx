"use client";

import { useState, useEffect } from "react";
import { showToast } from '@/components/Toast';

export default function FAQPageUI() {
    const [activeTab, setActiveTab] = useState("header");
    const [saving, setSaving] = useState(false);
    const [loading, setLoading] = useState(true);

    // --- State Definitions ---
    const [headerData, setHeaderData] = useState<any>({});
    const [categories, setCategories] = useState<any[]>([]);
    const [faqItems, setFaqItems] = useState<any[]>([]);
    const [ctaData, setCtaData] = useState<any>({});

    // Track deleted items
    const [deletedCategories, setDeletedCategories] = useState<Array<string | number>>([]);
    const [deletedFaqItems, setDeletedFaqItems] = useState<Array<string | number>>([]);

    // --- Fetch Data ---
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [headerRes, categoriesRes, itemsRes, ctaRes] = await Promise.all([
                    fetch('/api/pages/faq/header'),
                    fetch('/api/pages/faq/categories'),
                    fetch('/api/pages/faq/items'),
                    fetch('/api/pages/faq/cta'),
                ]);

                if (headerRes.ok) setHeaderData(await headerRes.json());
                if (categoriesRes.ok) setCategories(await categoriesRes.json());
                if (itemsRes.ok) setFaqItems(await itemsRes.json());
                if (ctaRes.ok) setCtaData(await ctaRes.json());

            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // --- Handlers ---
    const handleSave = async () => {
        setSaving(true);
        try {
            const saveSection = async (url: string, data: any) => {
                const entityId = data?.id ?? data?._id ?? null;
                const method = entityId ? 'PUT' : 'POST';
                const bodyData = entityId ? { ...data, id: entityId } : { ...data };
                const res = await fetch(url, {
                    method,
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(bodyData),
                });
                if (!res.ok) throw new Error(`Failed to save ${url}`);
                return res.json();
            };

            const saveList = async (url: string, items: any[], deletedIds: Array<string | number>) => {
                for (const id of deletedIds) {
                    const delId = id?.id ?? id ?? id?._id ?? id;
                    if (!delId) continue;
                    await fetch(`${url}?id=${delId}`, { method: 'DELETE' });
                }
                for (const item of items) {
                    await saveSection(url, item);
                }
            };

            await Promise.all([
                saveSection('/api/pages/faq/header', headerData),
                saveList('/api/pages/faq/categories', categories, deletedCategories),
                saveList('/api/pages/faq/items', faqItems, deletedFaqItems),
                saveSection('/api/pages/faq/cta', ctaData),
            ]);

            setDeletedCategories([]);
            setDeletedFaqItems([]);

            showToast("Settings saved successfully!", { type: 'success' });
            window.location.reload();
        } catch (error) {
            console.error("Error saving settings:", error);
            showToast("Failed to save settings. Please try again.", { type: 'error' });
        } finally {
            setSaving(false);
        }
    };

    // Generic List Handlers
    const addItem = (list: any[], setList: any, defaultItem: any) => {
        setList([...list, { ...defaultItem, display_order: list.length + 1, is_active: 1 }]);
    };

    const updateItem = (index: number, field: string, value: any, list: any[], setList: any) => {
        const newList = [...list];
        newList[index] = { ...newList[index], [field]: value };
        setList(newList);
    };

    const tabs = [
        { id: "header", label: "Header" },
        { id: "categories", label: "Categories" },
        { id: "items", label: "FAQ Items" },
        { id: "cta", label: "CTA" },
    ];

    if (loading) return <div className="p-10 text-center">Loading...</div>;

    return (
        <div className="w-full min-h-screen bg-white pb-20">
            {/* Top Bar */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
                <div className="w-full mx-auto px-6 h-16 flex items-center justify-between">
                    <h1 className="text-xl font-bold text-gray-900">FAQ Page</h1>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {saving ? (
                            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <span className="material-symbols-outlined text-[18px]">save</span>
                        )}
                        {saving ? "Saving..." : "Save Changes"}
                    </button>
                </div>
            </div>

            <div className="w-full mx-auto px-6 py-8">
                {/* Tabs */}
                <div className="flex justify-center mb-10">
                    <div className="bg-white p-1.5 rounded-2xl shadow-sm border border-gray-100 inline-flex gap-1">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`px-6 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${activeTab === tab.id
                                    ? "bg-gray-900 text-white shadow-md"
                                    : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                                    }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Content */}
                <div className="max-w-4xl mx-auto">

                    {/* HEADER SECTION */}
                    {activeTab === "header" && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
                                <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-indigo-500">title</span>
                                    Header Configuration
                                </h2>
                                <div className="space-y-5">
                                    <InputGroup label="Title" value={headerData.title || ''} onChange={(v) => setHeaderData({ ...headerData, title: v })} />
                                    <TextAreaGroup label="Description" value={headerData.description || ''} onChange={(v) => setHeaderData({ ...headerData, description: v })} />
                                    <InputGroup label="Search Placeholder" value={headerData.search_placeholder || ''} onChange={(v) => setHeaderData({ ...headerData, search_placeholder: v })} />

                                    <div className="pt-4 flex items-center justify-between border-t border-gray-50 mt-6">
                                        <span className="text-sm font-medium text-gray-700">Enable Section</span>
                                        <Toggle checked={headerData.is_active === 1} onChange={(c) => setHeaderData({ ...headerData, is_active: c ? 1 : 0 })} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* CATEGORIES SECTION */}
                    {activeTab === "categories" && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
                                <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-blue-500">category</span>
                                    Categories
                                </h2>
                                <div className="flex items-center justify-between mb-6">
                                    <p className="text-sm text-gray-500">Manage FAQ categories</p>
                                    <button onClick={() => addItem(categories, setCategories, { name: "" })} className="text-sm text-indigo-600 font-medium hover:text-indigo-700 flex items-center gap-1">
                                        <span className="material-symbols-outlined text-[18px]">add_circle</span> Add Category
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    {categories.map((category, idx) => (
                                        <div key={idx} className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow group">
                                            <div className="flex justify-between items-start mb-4">
                                                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gray-100 text-xs font-medium text-gray-500">{idx + 1}</span>
                                                <button
                                                    onClick={() => {
                                                        const idToDelete = category.id ?? category._id ?? null;
                                                        if (idToDelete) setDeletedCategories([...deletedCategories, idToDelete]);
                                                        setCategories(categories.filter((_, i) => i !== idx));
                                                    }}
                                                    className="text-gray-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                                                >
                                                    <span className="material-symbols-outlined">delete</span>
                                                </button>
                                            </div>
                                            <div className="space-y-4">
                                                <InputGroup label="Name" value={category.name || ''} onChange={(v) => updateItem(idx, 'name', v, categories, setCategories)} />
                                                <div className="grid grid-cols-2 gap-4">
                                                    <InputGroup label="Display Order" value={String(category.display_order || '')} onChange={(v) => updateItem(idx, 'display_order', Number(v), categories, setCategories)} />
                                                    <div className="flex items-end">
                                                        <Toggle checked={category.is_active === 1} onChange={(c) => updateItem(idx, 'is_active', c ? 1 : 0, categories, setCategories)} />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* FAQ ITEMS SECTION */}
                    {activeTab === "items" && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
                                <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-green-500">quiz</span>
                                    FAQ Items
                                </h2>
                                <div className="flex items-center justify-between mb-6">
                                    <p className="text-sm text-gray-500">Manage questions and answers</p>
                                    <button onClick={() => addItem(faqItems, setFaqItems, { question: "", answer: "", category_id: categories[0]?.id || 0 })} className="text-sm text-indigo-600 font-medium hover:text-indigo-700 flex items-center gap-1">
                                        <span className="material-symbols-outlined text-[18px]">add_circle</span> Add Question
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    {faqItems.map((item, idx) => (
                                        <div key={idx} className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow group">
                                            <div className="flex justify-between items-start mb-4">
                                                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gray-100 text-xs font-medium text-gray-500">{idx + 1}</span>
                                                <button
                                                    onClick={() => {
                                                        const idToDelete = item.id ?? item._id ?? null;
                                                        if (idToDelete) setDeletedFaqItems([...deletedFaqItems, idToDelete]);
                                                        setFaqItems(faqItems.filter((_, i) => i !== idx));
                                                    }}
                                                    className="text-gray-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                                                >
                                                    <span className="material-symbols-outlined">delete</span>
                                                </button>
                                            </div>
                                            <div className="space-y-4">
                                                <InputGroup label="Question" value={item.question || ''} onChange={(v) => updateItem(idx, 'question', v, faqItems, setFaqItems)} />
                                                <TextAreaGroup label="Answer" value={item.answer || ''} onChange={(v) => updateItem(idx, 'answer', v, faqItems, setFaqItems)} />

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Category</label>
                                                    <select
                                                        value={item.category_id || ''}
                                                        onChange={(e) => updateItem(idx, 'category_id', e.target.value || '', faqItems, setFaqItems)}
                                                        className="block w-full rounded-lg border-gray-200 bg-gray-50 focus:bg-white focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm transition-all duration-200 py-2.5 px-4"
                                                    >
                                                        <option value="">Select Category</option>
                                                        {categories.map(cat => (
                                                            <option key={String(cat._id ?? cat.id)} value={String(cat._id ?? cat.id)}>{cat.name}</option>
                                                        ))}
                                                    </select>
                                                </div>

                                                <div className="grid grid-cols-2 gap-4">
                                                    <InputGroup label="Display Order" value={String(item.display_order || '')} onChange={(v) => updateItem(idx, 'display_order', Number(v), faqItems, setFaqItems)} />
                                                    <div className="flex items-end">
                                                        <Toggle checked={item.is_active === 1} onChange={(c) => updateItem(idx, 'is_active', c ? 1 : 0, faqItems, setFaqItems)} />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* CTA SECTION */}
                    {activeTab === "cta" && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
                                <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-purple-500">campaign</span>
                                    CTA Section
                                </h2>
                                <div className="space-y-5">
                                    <InputGroup label="Title" value={ctaData.title || ''} onChange={(v) => setCtaData({ ...ctaData, title: v })} />
                                    <TextAreaGroup label="Description" value={ctaData.description || ''} onChange={(v) => setCtaData({ ...ctaData, description: v })} />
                                    <div className="grid grid-cols-2 gap-5">
                                        <InputGroup label="Button Text" value={ctaData.button_text || ''} onChange={(v) => setCtaData({ ...ctaData, button_text: v })} />
                                        <InputGroup label="Button Link" value={ctaData.button_link || ''} onChange={(v) => setCtaData({ ...ctaData, button_link: v })} />
                                    </div>

                                    <div className="pt-4 flex items-center justify-between border-t border-gray-50 mt-6">
                                        <span className="text-sm font-medium text-gray-700">Enable Section</span>
                                        <Toggle checked={ctaData.is_active === 1} onChange={(c) => setCtaData({ ...ctaData, is_active: c ? 1 : 0 })} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

// --- Reusable Components ---

function InputGroup({ label, value, onChange, placeholder }: { label: string, value: string, onChange: (v: string) => void, placeholder?: string }) {
    return (
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
            <input
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="block w-full rounded-lg border-gray-200 bg-gray-50 focus:bg-white focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm transition-all duration-200 py-2.5 px-4"
            />
        </div>
    );
}

function TextAreaGroup({ label, value, onChange, placeholder }: { label: string, value: string, onChange: (v: string) => void, placeholder?: string }) {
    return (
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
            <textarea
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                rows={3}
                className="block w-full rounded-lg border-gray-200 bg-gray-50 focus:bg-white focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm transition-all duration-200 py-2.5 px-4 resize-none"
            />
        </div>
    );
}

function Toggle({ checked, onChange }: { checked: boolean, onChange: (c: boolean) => void }) {
    return (
        <button
            onClick={() => onChange(!checked)}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${checked ? 'bg-indigo-600' : 'bg-gray-200'
                }`}
        >
            <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${checked ? 'translate-x-5' : 'translate-x-0'
                    }`}
            />
        </button>
    );
}
