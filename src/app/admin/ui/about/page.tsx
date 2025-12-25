"use client";

import { useState, useEffect } from "react";
import ImageUploader from "@/components/shared/ImageUploader";
import { showToast } from '@/components/Toast';

export default function AboutPageUI() {
    const [activeTab, setActiveTab] = useState("hero");
    const [saving, setSaving] = useState(false);
    const [loading, setLoading] = useState(true);

    // --- State Definitions ---
    const [heroData, setHeroData] = useState<any>({});
    const [journeyData, setJourneyData] = useState<any>({});
    const [stats, setStats] = useState<any[]>([]);
    const [features, setFeatures] = useState<any[]>([]);
    const [philosophyData, setPhilosophyData] = useState<any>({});
    const [principles, setPrinciples] = useState<any[]>([]);
    const [teamSectionData, setTeamSectionData] = useState<any>({});
    const [teamMembers, setTeamMembers] = useState<any[]>([]);
    const [certifications, setCertifications] = useState<any[]>([]);
    const [certificationsSectionData, setCertificationsSectionData] = useState<any>({});
    const [badges, setBadges] = useState<any[]>([]);
    const [ctaData, setCtaData] = useState<any>({});

    // Track deleted items to remove from DB on save
    const [deletedStats, setDeletedStats] = useState<number[]>([]);
    const [deletedFeatures, setDeletedFeatures] = useState<number[]>([]);
    const [deletedPrinciples, setDeletedPrinciples] = useState<number[]>([]);
    const [deletedTeamMembers, setDeletedTeamMembers] = useState<number[]>([]);
    const [deletedCertifications, setDeletedCertifications] = useState<number[]>([]);
    const [deletedBadges, setDeletedBadges] = useState<number[]>([]);

    // --- Fetch Data ---
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [
                    heroRes,
                    journeyRes,
                    statsRes,
                    featuresRes,
                    badgesRes,
                    certSectionRes,
                    certificationsRes,
                    philosophyRes,
                    principlesRes,
                    teamSectionRes,
                    teamMembersRes,
                    ctaRes
                ] = await Promise.all([
                    fetch('/api/pages/about/hero'),
                    fetch('/api/pages/about/journey'),
                    fetch('/api/pages/about/stats'),
                    fetch('/api/pages/about/features'),
                    fetch('/api/pages/about/badges'),
                    fetch('/api/pages/about/certifications-section'),
                    fetch('/api/pages/about/certifications'),
                    fetch('/api/pages/about/philosophy'),
                    fetch('/api/pages/about/principles'),
                    fetch('/api/pages/about/team-section'),
                    fetch('/api/pages/about/team-members'),
                    fetch('/api/pages/about/cta'),
                ]);

                if (heroRes.ok) setHeroData(await heroRes.json());
                if (journeyRes.ok) setJourneyData(await journeyRes.json());
                if (statsRes.ok) setStats(await statsRes.json());
                if (featuresRes.ok) setFeatures(await featuresRes.json());
                if (badgesRes.ok) setBadges(await badgesRes.json());
                if (certSectionRes.ok) setCertificationsSectionData(await certSectionRes.json());
                if (certificationsRes.ok) setCertifications(await certificationsRes.json());
                if (philosophyRes.ok) setPhilosophyData(await philosophyRes.json());
                if (principlesRes.ok) setPrinciples(await principlesRes.json());
                if (teamSectionRes.ok) setTeamSectionData(await teamSectionRes.json());
                if (teamMembersRes.ok) setTeamMembers(await teamMembersRes.json());
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
            // Helper to save a single section (create or update)
            const saveSection = async (url: string, data: any) => {
                const method = data.id ? 'PUT' : 'POST';
                const res = await fetch(url, {
                    method,
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data),
                });
                if (!res.ok) throw new Error(`Failed to save ${url}`);
                return res.json();
            };

            // Helper to save a list of items
            const saveList = async (url: string, items: any[], deletedIds: number[]) => {
                // Delete removed items
                for (const id of deletedIds) {
                    await fetch(`${url}?id=${id}`, { method: 'DELETE' });
                }

                // If saving team members, validate required fields to provide a clearer error early
                if (url.endsWith('/team-members')) {
                    items.forEach((item, idx) => {
                        const required = ['name', 'role', 'description', 'image', 'image_alt', 'display_order'];
                        for (const field of required) {
                            if (item[field] === undefined || item[field] === null || String(item[field]).trim() === '') {
                                throw new Error(`Team member at position ${idx + 1} is missing required field: ${field}`);
                            }
                        }
                    });
                }

                // Certifications: require name at minimum
                if (url.endsWith('/certifications')) {
                    items.forEach((item, idx) => {
                        if (!item.name || String(item.name).trim() === '') {
                            throw new Error(`Certification at position ${idx + 1} is missing required field: name`);
                        }
                    });
                }

                // Badges: require name at minimum
                if (url.endsWith('/badges')) {
                    items.forEach((item, idx) => {
                        if (!item.name || String(item.name).trim() === '') {
                            throw new Error(`Badge at position ${idx + 1} is missing required field: name`);
                        }
                    });
                }

                // Save/Update current items
                for (const item of items) {
                    await saveSection(url, item);
                }
            };

            await Promise.all([
                saveSection('/api/pages/about/hero', heroData),
                saveSection('/api/pages/about/journey', journeyData),
                saveList('/api/pages/about/stats', stats, deletedStats),
                saveList('/api/pages/about/features', features, deletedFeatures),
                saveList('/api/pages/about/badges', badges, deletedBadges),
                saveSection('/api/pages/about/certifications-section', certificationsSectionData),
                saveList('/api/pages/about/certifications', certifications, deletedCertifications),
                saveSection('/api/pages/about/philosophy', philosophyData),
                saveList('/api/pages/about/principles', principles, deletedPrinciples),
                saveSection('/api/pages/about/team-section', teamSectionData),
                saveList('/api/pages/about/team-members', teamMembers, deletedTeamMembers),
                saveSection('/api/pages/about/cta', ctaData),
            ]);

            // Clear deleted lists after successful save
            setDeletedCertifications([]);
            setDeletedBadges([]);

            // Clear deleted lists after successful save
            setDeletedStats([]);
            setDeletedFeatures([]);
            setDeletedPrinciples([]);
            setDeletedTeamMembers([]);

            showToast("Settings saved successfully!", { type: 'success' });
            // Optionally refetch data to get new IDs for created items
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

    const removeItem = (id: number | undefined, list: any[], setList: any, deletedList: number[], setDeletedList: any) => {
        if (id) {
            setDeletedList([...deletedList, id]);
        }
        // If it doesn't have an ID, it's a new item not yet saved, so just remove from state
        // We filter by index if id is missing, or by id if present. 
        // Actually, let's assign a temp ID for new items to make this easier? 
        // Or just filter by object reference?
        // Let's assume we pass the index for removal if ID is missing.
        // But wait, the UI maps by index or ID.

        // Better approach:
        // If item has a real ID (from DB), add to deletedList.
        // Remove from list state.
    };

    const updateItem = (index: number, field: string, value: any, list: any[], setList: any) => {
        const newList = [...list];
        newList[index] = { ...newList[index], [field]: value };
        setList(newList);
    };

    const tabs = [
        { id: "hero", label: "Hero" },
        { id: "journey", label: "Journey" },
        { id: "badges", label: "Badges" },
        { id: "certifications", label: "Certifications" },
        { id: "philosophy", label: "Philosophy" },
        { id: "team", label: "Team" },
        { id: "cta", label: "CTA" },
    ];

    if (loading) return <div className="p-10 text-center">Loading...</div>;

    return (
        <div className="w-full min-h-screen bg-white pb-20">
            {/* Top Bar */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
                <div className="w-full mx-auto px-6 h-16 flex items-center justify-between">
                    <h1 className="text-xl font-bold text-gray-900">About Page</h1>
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

                    {/* HERO SECTION */}
                    {activeTab === "hero" && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
                                <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-indigo-500">flag</span>
                                    Hero Configuration
                                </h2>
                                <div className="space-y-5">
                                    <InputGroup label="Title" value={heroData.title || ''} onChange={(v) => setHeroData({ ...heroData, title: v })} />
                                    <TextAreaGroup label="Description" value={heroData.description || ''} onChange={(v) => setHeroData({ ...heroData, description: v })} />

                                    <div className="grid grid-cols-2 gap-5">
                                        <InputGroup label="Badge Text" value={heroData.badge_text || ''} onChange={(v) => setHeroData({ ...heroData, badge_text: v })} />
                                        <InputGroup label="Highlight Text (substring to emphasize)" value={heroData.highlight_text || ''} onChange={(v) => setHeroData({ ...heroData, highlight_text: v })} />
                                    </div>

                                    <div className="grid grid-cols-2 gap-5">
                                        <InputGroup label="Primary Button Text" value={heroData.button1_text || ''} onChange={(v) => setHeroData({ ...heroData, button1_text: v })} />
                                        <InputGroup label="Primary Button Link" value={heroData.button1_link || ''} onChange={(v) => setHeroData({ ...heroData, button1_link: v })} />
                                    </div>
                                    <div className="grid grid-cols-2 gap-5">
                                        <InputGroup label="Secondary Button Text" value={heroData.button2_text || ''} onChange={(v) => setHeroData({ ...heroData, button2_text: v })} />
                                        <InputGroup label="Secondary Button Link" value={heroData.button2_link || ''} onChange={(v) => setHeroData({ ...heroData, button2_link: v })} />
                                    </div>

                                    <ImageUploader label="Hero Image" value={heroData.hero_image || ''} onChange={(v) => setHeroData({ ...heroData, hero_image: v })} folder="about" />
                                    <InputGroup label="Hero Image Alt Text" value={heroData.hero_image_alt || ''} onChange={(v) => setHeroData({ ...heroData, hero_image_alt: v })} />

                                    {/* Floating UI Elements */}
                                    <div className="mt-4 p-4 bg-gray-50 rounded border border-gray-100">
                                        <h4 className="text-sm font-semibold mb-3">Floating UI Elements</h4>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div className="p-3 bg-white rounded border border-gray-100">
                                                <div className="flex items-center justify-between mb-3">
                                                    <div className="text-sm font-medium">Top Floating Card</div>
                                                    <Toggle checked={heroData.float_top_enabled === 1} onChange={(c) => setHeroData({ ...heroData, float_top_enabled: c ? 1 : 0 })} />
                                                </div>
                                                <InputGroup label="Icon (Material Symbol)" value={heroData.float_top_icon || ''} onChange={(v) => setHeroData({ ...heroData, float_top_icon: v })} />
                                                <InputGroup label="Title" value={heroData.float_top_title || ''} onChange={(v) => setHeroData({ ...heroData, float_top_title: v })} />
                                                <InputGroup label="Value" value={heroData.float_top_value || ''} onChange={(v) => setHeroData({ ...heroData, float_top_value: v })} />
                                            </div>

                                            <div className="p-3 bg-white rounded border border-gray-100">
                                                <div className="flex items-center justify-between mb-3">
                                                    <div className="text-sm font-medium">Bottom Floating Card</div>
                                                    <Toggle checked={heroData.float_bottom_enabled === 1} onChange={(c) => setHeroData({ ...heroData, float_bottom_enabled: c ? 1 : 0 })} />
                                                </div>
                                                <InputGroup label="Icon (Material Symbol)" value={heroData.float_bottom_icon || ''} onChange={(v) => setHeroData({ ...heroData, float_bottom_icon: v })} />
                                                <InputGroup label="Title" value={heroData.float_bottom_title || ''} onChange={(v) => setHeroData({ ...heroData, float_bottom_title: v })} />
                                                <InputGroup label="Value" value={heroData.float_bottom_value || ''} onChange={(v) => setHeroData({ ...heroData, float_bottom_value: v })} />
                                            </div>
                                        </div>
                                    </div>

                                    <InputGroup label="Rating / Trust Text" value={heroData.rating_text || ''} onChange={(v) => setHeroData({ ...heroData, rating_text: v })} />

                                    <div className="pt-4 flex items-center justify-between border-t border-gray-50 mt-6">
                                        <span className="text-sm font-medium text-gray-700">Enable Section</span>
                                        <Toggle checked={heroData.is_active === 1} onChange={(c) => setHeroData({ ...heroData, is_active: c ? 1 : 0 })} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* JOURNEY SECTION */}
                    {activeTab === "journey" && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
                                <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-purple-500">timeline</span>
                                    Journey Section
                                </h2>
                                <div className="space-y-5">
                                    <InputGroup label="Title" value={journeyData.title || ''} onChange={(v) => setJourneyData({ ...journeyData, title: v })} />
                                    <TextAreaGroup label="Paragraph 1" value={journeyData.paragraph1 || ''} onChange={(v) => setJourneyData({ ...journeyData, paragraph1: v })} />
                                    <TextAreaGroup label="Paragraph 2" value={journeyData.paragraph2 || ''} onChange={(v) => setJourneyData({ ...journeyData, paragraph2: v })} />
                                    <InputGroup label="Thinking Box Title" value={journeyData.thinking_box_title || ''} onChange={(v) => setJourneyData({ ...journeyData, thinking_box_title: v })} />
                                    <TextAreaGroup label="Thinking Box Content" value={journeyData.thinking_box_content || ''} onChange={(v) => setJourneyData({ ...journeyData, thinking_box_content: v })} />

                                    <ImageUploader label="Section Image" value={journeyData.hero_image || ''} onChange={(v) => setJourneyData({ ...journeyData, hero_image: v })} folder="about/journey" />
                                    <InputGroup label="Section Image Alt Text" value={journeyData.hero_image_alt || ''} onChange={(v) => setJourneyData({ ...journeyData, hero_image_alt: v })} />
                                </div>

                                {/* Stats List */}
                                <div className="mt-8 space-y-4">
                                    <div className="flex items-center justify-between px-2">
                                        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Stats</h3>
                                        <button onClick={() => addItem(stats, setStats, { label: "", value: "" })} className="text-sm text-indigo-600 font-medium hover:text-indigo-700 flex items-center gap-1">
                                            <span className="material-symbols-outlined text-[18px]">add_circle</span> Add Stat
                                        </button>
                                    </div>
                                    {stats.map((stat, idx) => (
                                        <div key={idx} className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow group">
                                            <div className="flex justify-between items-start mb-4">
                                                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gray-100 text-xs font-medium text-gray-500">{idx + 1}</span>
                                                <button
                                                    onClick={() => {
                                                        if (stat.id) setDeletedStats([...deletedStats, stat.id]);
                                                        setStats(stats.filter((_, i) => i !== idx));
                                                    }}
                                                    className="text-gray-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                                                >
                                                    <span className="material-symbols-outlined">delete</span>
                                                </button>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <InputGroup label="Label" value={stat.label || ''} onChange={(v) => updateItem(idx, 'label', v, stats, setStats)} />
                                                <InputGroup label="Value" value={stat.value || ''} onChange={(v) => updateItem(idx, 'value', v, stats, setStats)} />
                                            </div>
                                            <div className="grid grid-cols-2 gap-4 mt-4">
                                                <InputGroup label="Display Order" value={String(stat.display_order || '')} onChange={(v) => updateItem(idx, 'display_order', Number(v), stats, setStats)} />
                                                <div className="flex items-end">
                                                    <Toggle checked={stat.is_active === 1} onChange={(c) => updateItem(idx, 'is_active', c ? 1 : 0, stats, setStats)} />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Features List */}
                                <div className="mt-8 space-y-4">
                                    <div className="flex items-center justify-between px-2">
                                        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Features</h3>
                                        <button onClick={() => addItem(features, setFeatures, { title: "", description: "" })} className="text-sm text-indigo-600 font-medium hover:text-indigo-700 flex items-center gap-1">
                                            <span className="material-symbols-outlined text-[18px]">add_circle</span> Add Feature
                                        </button>
                                    </div>
                                    {features.map((feature, idx) => (
                                        <div key={idx} className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow group">
                                            <div className="flex justify-between items-start mb-4">
                                                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gray-100 text-xs font-medium text-gray-500">{idx + 1}</span>
                                                <button
                                                    onClick={() => {
                                                        if (feature.id) setDeletedFeatures([...deletedFeatures, feature.id]);
                                                        setFeatures(features.filter((_, i) => i !== idx));
                                                    }}
                                                    className="text-gray-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                                                >
                                                    <span className="material-symbols-outlined">delete</span>
                                                </button>
                                            </div>
                                            <div className="space-y-4">
                                                <InputGroup label="Icon (material)" value={feature.icon || ''} onChange={(v) => updateItem(idx, 'icon', v, features, setFeatures)} />
                                                <InputGroup label="Title" value={feature.title || ''} onChange={(v) => updateItem(idx, 'title', v, features, setFeatures)} />
                                                <TextAreaGroup label="Description" value={feature.description || ''} onChange={(v) => updateItem(idx, 'description', v, features, setFeatures)} />
                                                <div className="grid grid-cols-2 gap-4">
                                                    <InputGroup label="Display Order" value={String(feature.display_order || '')} onChange={(v) => updateItem(idx, 'display_order', Number(v), features, setFeatures)} />
                                                    <div className="flex items-end">
                                                        <Toggle checked={feature.is_active === 1} onChange={(c) => updateItem(idx, 'is_active', c ? 1 : 0, features, setFeatures)} />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* PHILOSOPHY SECTION */}
                    {activeTab === "philosophy" && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
                                <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-amber-500">psychology</span>
                                    Philosophy
                                </h2>
                                <div className="space-y-5">
                                    <InputGroup label="Title" value={philosophyData.title || ''} onChange={(v) => setPhilosophyData({ ...philosophyData, title: v })} />
                                    <TextAreaGroup label="Description" value={philosophyData.description || ''} onChange={(v) => setPhilosophyData({ ...philosophyData, description: v })} />
                                </div>

                                {/* Principles List */}
                                <div className="mt-8 space-y-4">
                                    <div className="flex items-center justify-between px-2">
                                        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Principles</h3>
                                        <button onClick={() => addItem(principles, setPrinciples, { title: "", description: "" })} className="text-sm text-indigo-600 font-medium hover:text-indigo-700 flex items-center gap-1">
                                            <span className="material-symbols-outlined text-[18px]">add_circle</span> Add Principle
                                        </button>
                                    </div>
                                    {principles.map((p, idx) => (
                                        <div key={idx} className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow group">
                                            <div className="flex justify-between items-start mb-4">
                                                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gray-100 text-xs font-medium text-gray-500">{idx + 1}</span>
                                                <button
                                                    onClick={() => {
                                                        if (p.id) setDeletedPrinciples([...deletedPrinciples, p.id]);
                                                        setPrinciples(principles.filter((_, i) => i !== idx));
                                                    }}
                                                    className="text-gray-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                                                >
                                                    <span className="material-symbols-outlined">delete</span>
                                                </button>
                                            </div>
                                            <div className="space-y-4">
                                                <InputGroup label="Title" value={p.title || ''} onChange={(v) => updateItem(idx, 'title', v, principles, setPrinciples)} />
                                                <TextAreaGroup label="Description" value={p.description || ''} onChange={(v) => updateItem(idx, 'description', v, principles, setPrinciples)} />
                                                <div className="grid grid-cols-2 gap-4">
                                                    <InputGroup label="Display Order" value={String(p.display_order || '')} onChange={(v) => updateItem(idx, 'display_order', Number(v), principles, setPrinciples)} />
                                                    <div className="flex items-end">
                                                        <Toggle checked={p.is_active === 1} onChange={(c) => updateItem(idx, 'is_active', c ? 1 : 0, principles, setPrinciples)} />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* TEAM SECTION */}
                    {activeTab === "team" && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
                                <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-indigo-500">groups</span>
                                    Team Section Header
                                </h2>
                                <div className="space-y-5 mb-8">
                                    <InputGroup label="Title" value={teamSectionData.title || ''} onChange={(v) => setTeamSectionData({ ...teamSectionData, title: v })} />
                                    <TextAreaGroup label="Description" value={teamSectionData.description || ''} onChange={(v) => setTeamSectionData({ ...teamSectionData, description: v })} />
                                </div>

                                <div className="flex items-center justify-between mb-6 border-t pt-6">
                                    <h3 className="text-lg font-semibold text-gray-900">Team Members</h3>
                                    <button onClick={() => addItem(teamMembers, setTeamMembers, { name: "", role: "", image: "", image_alt: "", description: "" })} className="text-sm text-indigo-600 font-medium hover:text-indigo-700 flex items-center gap-1">
                                        <span className="material-symbols-outlined text-[18px]">add_circle</span> Add Member
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    {teamMembers.map((member, idx) => (
                                        <div key={idx} className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow group">
                                            <div className="flex justify-between items-start mb-4">
                                                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gray-100 text-xs font-medium text-gray-500">{idx + 1}</span>
                                                <button
                                                    onClick={() => {
                                                        if (member.id) setDeletedTeamMembers([...deletedTeamMembers, member.id]);
                                                        setTeamMembers(teamMembers.filter((_, i) => i !== idx));
                                                    }}
                                                    className="text-gray-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                                                >
                                                    <span className="material-symbols-outlined">delete</span>
                                                </button>
                                            </div>
                                            <div className="space-y-4">
                                                <div className="grid grid-cols-2 gap-4">
                                                    <InputGroup label="Name" value={member.name || ''} onChange={(v) => updateItem(idx, 'name', v, teamMembers, setTeamMembers)} />
                                                    <InputGroup label="Role" value={member.role || ''} onChange={(v) => updateItem(idx, 'role', v, teamMembers, setTeamMembers)} />
                                                </div>
                                                <ImageUploader label="Image" value={member.image || ''} onChange={(v) => updateItem(idx, 'image', v, teamMembers, setTeamMembers)} folder="about/team" />
                                                <InputGroup label="Image Alt Text" value={member.image_alt || ''} onChange={(v) => updateItem(idx, 'image_alt', v, teamMembers, setTeamMembers)} />
                                                <TextAreaGroup label="Bio" value={member.description || ''} onChange={(v) => updateItem(idx, 'description', v, teamMembers, setTeamMembers)} />
                                                <div className="grid grid-cols-2 gap-4">
                                                    <InputGroup label="Display Order" value={String(member.display_order || '')} onChange={(v) => updateItem(idx, 'display_order', Number(v), teamMembers, setTeamMembers)} />
                                                    <div className="flex items-end">
                                                        <Toggle checked={member.is_active === 1} onChange={(c) => updateItem(idx, 'is_active', c ? 1 : 0, teamMembers, setTeamMembers)} />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Badges SECTION */}
                    {activeTab === "badges" && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
                                <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-amber-500">military_tech</span>
                                    Badges / Manufacturers
                                </h2>

                                <div className="flex items-center justify-between px-2 mb-4">
                                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Badges</h3>
                                    <button onClick={() => addItem(badges, setBadges, { name: '', logo: '', link: '' })} className="text-sm text-indigo-600 font-medium hover:text-indigo-700 flex items-center gap-1">
                                        <span className="material-symbols-outlined text-[18px]">add_circle</span> Add Badge
                                    </button>
                                </div>

                                {badges.map((b, idx) => (
                                    <div key={idx} className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow group mb-4">
                                        <div className="flex justify-between items-start mb-4">
                                            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gray-100 text-xs font-medium text-gray-500">{idx + 1}</span>
                                            <button
                                                onClick={() => {
                                                    if (badges[idx] && badges[idx].id) setDeletedBadges([...deletedBadges, badges[idx].id]);
                                                    setBadges(badges.filter((_, i) => i !== idx));
                                                }}
                                                className="text-gray-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                                            >
                                                <span className="material-symbols-outlined">delete</span>
                                            </button>
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <InputGroup label="Name" value={b.name || ''} onChange={(v) => updateItem(idx, 'name', v, badges, setBadges)} />
                                            <InputGroup label="Link" value={b.link || ''} onChange={(v) => updateItem(idx, 'link', v, badges, setBadges)} />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4 mt-4">
                                            <ImageUploader label="Logo" value={b.logo || ''} onChange={(v) => updateItem(idx, 'logo', v, badges, setBadges)} folder="about/badges" />
                                            <InputGroup label="Display Order" value={String(b.display_order || idx + 1)} onChange={(v) => updateItem(idx, 'display_order', Number(v), badges, setBadges)} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Certifications SECTION */}
                    {activeTab === "certifications" && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
                                <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-sky-500">verified</span>
                                    Certifications / Clients
                                </h2>

                                {/* Section header (title/subtitle) */}
                                <div className="space-y-4 mb-6">
                                    <InputGroup label="Section Title" value={certificationsSectionData.title || ''} onChange={(v) => setCertificationsSectionData({ ...certificationsSectionData, title: v })} />
                                    <TextAreaGroup label="Section Subtitle" value={certificationsSectionData.subtitle || ''} onChange={(v) => setCertificationsSectionData({ ...certificationsSectionData, subtitle: v })} />
                                </div>

                                <div className="mt-4">
                                    <div className="flex items-center justify-between px-2 mb-4">
                                        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Certifications</h3>
                                        <button onClick={() => addItem(certifications, setCertifications, { name: '', logo: '', link: '' })} className="text-sm text-indigo-600 font-medium hover:text-indigo-700 flex items-center gap-1">
                                            <span className="material-symbols-outlined text-[18px]">add_circle</span> Add Certification
                                        </button>
                                    </div>
                                    {certifications.map((c, idx) => (
                                        <div key={idx} className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow group mb-4">
                                            <div className="flex justify-between items-start mb-4">
                                                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gray-100 text-xs font-medium text-gray-500">{idx + 1}</span>
                                                <button
                                                    onClick={() => {
                                                        if (certifications[idx] && certifications[idx].id) setDeletedCertifications([...deletedCertifications, certifications[idx].id]);
                                                        setCertifications(certifications.filter((_, i) => i !== idx));
                                                    }}
                                                    className="text-gray-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                                                >
                                                    <span className="material-symbols-outlined">delete</span>
                                                </button>
                                            </div>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                <InputGroup label="Name" value={c.name || ''} onChange={(v) => updateItem(idx, 'name', v, certifications, setCertifications)} />
                                                <InputGroup label="Link" value={c.link || ''} onChange={(v) => updateItem(idx, 'link', v, certifications, setCertifications)} />
                                            </div>
                                            <div className="grid grid-cols-2 gap-4 mt-4">
                                                <ImageUploader label="Logo" value={c.logo || ''} onChange={(v) => updateItem(idx, 'logo', v, certifications, setCertifications)} folder="about/certifications" />
                                                <InputGroup label="Display Order" value={String(c.display_order || idx + 1)} onChange={(v) => updateItem(idx, 'display_order', Number(v), certifications, setCertifications)} />
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
                                    <span className="material-symbols-outlined text-green-500">campaign</span>
                                    CTA Section
                                </h2>
                                <div className="space-y-5">
                                    <InputGroup label="Title" value={ctaData.title || ''} onChange={(v) => setCtaData({ ...ctaData, title: v })} />
                                    <TextAreaGroup label="Description" value={ctaData.description || ''} onChange={(v) => setCtaData({ ...ctaData, description: v })} />
                                    <div className="grid grid-cols-2 gap-5">
                                        <InputGroup label="Primary Button Text" value={ctaData.primary_button_text || ''} onChange={(v) => setCtaData({ ...ctaData, primary_button_text: v })} />
                                        <InputGroup label="Primary Button Link" value={ctaData.primary_button_link || ''} onChange={(v) => setCtaData({ ...ctaData, primary_button_link: v })} />
                                    </div>
                                    <div className="grid grid-cols-2 gap-5">
                                        <InputGroup label="Secondary Button Text" value={ctaData.secondary_button_text || ''} onChange={(v) => setCtaData({ ...ctaData, secondary_button_text: v })} />
                                        <InputGroup label="Secondary Button Link" value={ctaData.secondary_button_link || ''} onChange={(v) => setCtaData({ ...ctaData, secondary_button_link: v })} />
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
