"use client";

import { useState, useEffect } from "react";
import { showToast } from '@/components/Toast';

export default function TermsPageUI() {
    const [activeTab, setActiveTab] = useState("header");
    const [saving, setSaving] = useState(false);
    const [loading, setLoading] = useState(true);

    // --- State Management ---
    const [headerData, setHeaderData] = useState<any>({});
    const [sections, setSections] = useState<any[]>([]);

    // Track deleted items
    const [deletedSections, setDeletedSections] = useState<Array<string | number>>([]);

    // --- Fetch Data ---
    const fetchData = async () => {
        setLoading(true);
        try {
            const [headerRes, sectionsRes] = await Promise.all([
                fetch('/api/pages/terms/header'),
                fetch('/api/pages/terms/sections'),
            ]);

            if (headerRes.ok) setHeaderData(await headerRes.json());
            if (sectionsRes.ok) setSections(await sectionsRes.json());

        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

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
                    let delId: string | number | undefined;
                    if (id && typeof id === 'object') delId = (id as any).id ?? (id as any)._id ?? undefined;
                    else delId = id as any;
                    if (!delId) continue;
                    await fetch(`${url}?id=${delId}`, { method: 'DELETE' });
                }
                for (const item of items) {
                    await saveSection(url, item);
                }
            };

            await Promise.all([
                saveSection('/api/pages/terms/header', headerData),
                saveList('/api/pages/terms/sections', sections, deletedSections),
            ]);

            setDeletedSections([]);

            showToast("Settings saved successfully!", { type: 'success' });
            await fetchData();
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
        { id: "sections", label: "Content Sections" },
    ];

    if (loading) return <div className="p-10 text-center">Loading...</div>;

    return (
        <div className="w-full min-h-screen bg-white pb-20">
            {/* Top Bar */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
                <div className="w-full mx-auto px-6 h-16 flex items-center justify-between">
                    <h1 className="text-xl font-bold text-gray-900">Terms & Conditions</h1>
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
                                    <span className="material-symbols-outlined text-indigo-500">article</span>
                                    Header Configuration
                                </h2>
                                <div className="space-y-5">
                                    <InputGroup label="Title" value={headerData.title || ''} onChange={(v) => setHeaderData({ ...headerData, title: v })} />
                                    <InputGroup label="Last Updated Text" value={headerData.last_updated || ''} onChange={(v) => setHeaderData({ ...headerData, last_updated: v })} />

                                    <div className="pt-4 flex items-center justify-between border-t border-gray-50 mt-6">
                                        <span className="text-sm font-medium text-gray-700">Enable Section</span>
                                        <Toggle checked={headerData.is_active === 1} onChange={(c) => setHeaderData({ ...headerData, is_active: c ? 1 : 0 })} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* SECTIONS */}
                    {activeTab === "sections" && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
                                <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-blue-500">segment</span>
                                    Content Sections
                                </h2>
                                <div className="flex items-center justify-between mb-6">
                                    <p className="text-sm text-gray-500">Manage terms sections</p>
                                    <button onClick={() => addItem(sections, setSections, { title: "", content: "", has_email: 0 })} className="text-sm text-indigo-600 font-medium hover:text-indigo-700 flex items-center gap-1">
                                        <span className="material-symbols-outlined text-[18px]">add_circle</span> Add Section
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    {sections.map((section, idx) => (
                                        <div key={idx} className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow group">
                                            <div className="flex justify-between items-start mb-4">
                                                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gray-100 text-xs font-medium text-gray-500">{idx + 1}</span>
                                                <button
                                                    onClick={() => {
                                                        const idToDelete = section.id ?? section._id ?? null;
                                                        if (idToDelete) setDeletedSections([...deletedSections, idToDelete]);
                                                        setSections(sections.filter((_, i) => i !== idx));
                                                    }}
                                                    className="text-gray-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                                                >
                                                    <span className="material-symbols-outlined">delete</span>
                                                </button>
                                            </div>
                                            <div className="space-y-4">
                                                <InputGroup label="Title" value={section.title || ''} onChange={(v) => updateItem(idx, 'title', v, sections, setSections)} />
                                                <TextAreaGroup label="Content" value={section.content || ''} onChange={(v) => updateItem(idx, 'content', v, sections, setSections)} />

                                                <div className="grid grid-cols-2 gap-4">
                                                    <InputGroup label="Display Order" value={String(section.display_order || '')} onChange={(v) => updateItem(idx, 'display_order', Number(v), sections, setSections)} />
                                                    <div className="flex items-end justify-between">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-sm text-gray-600">Has Email</span>
                                                            <Toggle checked={section.has_email === 1} onChange={(c) => updateItem(idx, 'has_email', c ? 1 : 0, sections, setSections)} />
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-sm text-gray-600">Active</span>
                                                            <Toggle checked={section.is_active === 1} onChange={(c) => updateItem(idx, 'is_active', c ? 1 : 0, sections, setSections)} />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
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
                rows={5}
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
