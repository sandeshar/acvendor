"use client";

import { useState, useEffect } from "react";
import { showToast } from '@/components/Toast';
import ImageUploader from '@/components/shared/ImageUploader';
import IconSelector from "@/components/admin/IconSelector";

export default function HomePageUI() {
    const [activeTab, setActiveTab] = useState("hero");
    const [saving, setSaving] = useState(false);
    const [loading, setLoading] = useState(true);

    // --- State Management ---
    const [heroData, setHeroData] = useState<any>({});

    const [trustSection, setTrustSection] = useState<any>({});
    const [trustLogos, setTrustLogos] = useState<any[]>([]);

    const [expertiseSection, setExpertiseSection] = useState<any>({});
    const [expertiseItems, setExpertiseItems] = useState<any[]>([]);

    const [contactData, setContactData] = useState<any>({});
    const [productsSection, setProductsSection] = useState<any>({});
    const [projectsSection, setProjectsSection] = useState<any>({});
    const [aboutSection, setAboutSection] = useState<any>({});
    const [aboutItems, setAboutItems] = useState<any[]>([]);
    const [deletedAboutItems, setDeletedAboutItems] = useState<any[]>([]);
    const [blogSection, setBlogSection] = useState<any>({});
    const [testimonialsSection, setTestimonialsSection] = useState<any>({});
    const [heroFeatures, setHeroFeatures] = useState<any[]>([]);

    // Track deleted items
    const [deletedTrustLogos, setDeletedTrustLogos] = useState<number[]>([]);
    const [deletedExpertiseItems, setDeletedExpertiseItems] = useState<number[]>([]);
    const [deletedHeroFeatures, setDeletedHeroFeatures] = useState<any[]>([]);

    // --- Fetch Data ---
    const fetchData = async () => {
        setLoading(true);
        try {
            const [heroRes, trustSecRes, trustLogosRes, expSecRes, expItemsRes, contactRes, productsSecRes, projectsSecRes, testimonialsSecRes, heroFeaturesRes, blogSectionRes, aboutSectionRes, aboutItemsRes] = await Promise.all([
                fetch('/api/pages/homepage/hero'),
                fetch('/api/pages/homepage/trust-section'),
                fetch('/api/pages/homepage/trust-logos'),
                fetch('/api/pages/homepage/expertise-section'),
                fetch('/api/pages/homepage/expertise-items'),
                fetch('/api/pages/homepage/contact-section'),
                fetch('/api/pages/homepage/products-section'),
                fetch('/api/pages/projects/section'),
                fetch('/api/pages/homepage/testimonials-section'),
                fetch('/api/pages/homepage/hero-floats?admin=1'),
                fetch('/api/pages/homepage/blog-section'),
                fetch('/api/pages/homepage/about-section'),
                fetch('/api/pages/homepage/about-items?admin=1'),
            ]);

            if (heroRes.ok) setHeroData(await heroRes.json());
            if (trustSecRes.ok) setTrustSection(await trustSecRes.json());
            if (trustLogosRes.ok) setTrustLogos(await trustLogosRes.json());
            if (expSecRes.ok) setExpertiseSection(await expSecRes.json());
            if (expItemsRes.ok) setExpertiseItems(await expItemsRes.json());
            if (contactRes.ok) setContactData(await contactRes.json());
            if (productsSecRes.ok) setProductsSection(await productsSecRes.json() || {});
            if (projectsSecRes.ok) {
                const ps = await projectsSecRes.json();
                setProjectsSection(ps || {});
            }
            if (testimonialsSecRes.ok) setTestimonialsSection(await testimonialsSecRes.json() || {});
            if (heroFeaturesRes.ok) setHeroFeatures(await heroFeaturesRes.json());
            if (blogSectionRes.ok) setBlogSection(await blogSectionRes.json() || {});
            if (aboutSectionRes.ok) {
                const s = await aboutSectionRes.json() || {};
                try {
                    s.bullets_text = s.bullets ? JSON.parse(s.bullets).join('\n') : '';
                } catch {
                    s.bullets_text = String(s.bullets || '');
                }
                setAboutSection(s);
            }
            if (aboutItemsRes.ok) {
                const items = await aboutItemsRes.json() || [];
                const mapped = (items || []).map((it: any) => {
                    const copy = { ...it };
                    try {
                        copy.bullets_text = copy.bullets ? JSON.parse(copy.bullets).join('\n') : '';
                    } catch {
                        copy.bullets_text = String(copy.bullets || '');
                    }
                    return copy;
                });
                setAboutItems(mapped);
            }

        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // --- Handlers ---
    const handleSave = async () => {
        setSaving(true);
        try {
            const saveSection = async (url: string, data: any) => {
                // Determine entity id from either id or _id
                const entityId = data?.id ?? data?._id ?? null;
                // Skip saving if data is empty (no fields filled) and no id/_id present
                // Allow saving when only `is_active` changed so toggles are persisted even if title/description are empty
                const hasContent = Object.keys(data || {}).some(key =>
                    key !== 'id' && key !== 'is_active' && data[key] !== '' && data[key] !== null && data[key] !== undefined
                );
                const onlyToggleChange = !hasContent && Object.keys(data || {}).length === 1 && (data?.is_active !== undefined);
                if (!hasContent && !entityId && !onlyToggleChange) {
                    return null; // Skip empty sections without id
                }

                // If saving homepage hero ensure colored_word is present in title when set
                if (url === '/api/pages/homepage/hero' && data && data.colored_word) {
                    const title = data.title || '';
                    if (title && title.indexOf(data.colored_word) === -1) {
                        // Prevent saving inconsistent state and ask user to autofill or fix
                        throw new Error('Colored word must be present in Title. Use the "Autofill from title" button or update the Title.');
                    }
                }

                const method = entityId ? 'PUT' : 'POST';
                const bodyData = entityId ? { ...data, id: entityId } : { ...data };

                const res = await fetch(url, {
                    method,
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(bodyData),
                });
                if (!res.ok) {
                    const errorData = await res.json();
                    const details = errorData.details ? ` - ${errorData.details}` : '';
                    throw new Error(`Failed to save ${url}: ${errorData.error || res.statusText}${details}`);
                }
                const json = await res.json();
                return { json, url, bodyData };
            };

            const saveList = async (url: string, items: any[], deletedIds: any[]) => {
                // Ensure deletedIds contain proper id strings
                for (const id of deletedIds) {
                    let delId: string | number | undefined;
                    if (id && typeof id === 'object') delId = (id as any).id ?? (id as any)._id ?? undefined;
                    else delId = id as any;
                    if (!delId) continue;
                    await fetch(`${url}?id=${delId}`, { method: 'DELETE' });
                }
                // Save or update each item
                for (let i = 0; i < items.length; i++) {
                    const item = items[i];
                    await saveSection(url, item);
                }
            };

            // Prepare aboutSection and aboutItems for save (convert bullets_text -> bullets JSON)
            const aboutSectionToSave = { ...aboutSection };
            if (aboutSectionToSave) {
                aboutSectionToSave.bullets = aboutSectionToSave.bullets_text ? JSON.stringify(aboutSectionToSave.bullets_text.split('\n').map((l: string) => l.trim()).filter(Boolean)) : (aboutSectionToSave.bullets || '[]');
            }

            const aboutItemsToSave = aboutItems.map(it => ({
                ...it,
                bullets: it.bullets_text ? JSON.stringify(String(it.bullets_text).split('\n').map((l: string) => l.trim()).filter(Boolean)) : (it.bullets || '[]')
            }));

            // Execute saves
            await Promise.all([
                saveSection('/api/pages/homepage/hero', heroData),
                saveSection('/api/pages/homepage/trust-section', trustSection),
                saveList('/api/pages/homepage/trust-logos', trustLogos, deletedTrustLogos),
                saveSection('/api/pages/homepage/expertise-section', expertiseSection),
                saveList('/api/pages/homepage/expertise-items', expertiseItems, deletedExpertiseItems),
                saveSection('/api/pages/homepage/contact-section', contactData),
                saveSection('/api/pages/homepage/products-section', productsSection),
                saveSection('/api/pages/projects/section', projectsSection),
                saveSection('/api/pages/homepage/about-section', aboutSectionToSave),
                saveList('/api/pages/homepage/about-items', aboutItemsToSave, deletedAboutItems),
                saveSection('/api/pages/homepage/blog-section', blogSection),
                saveSection('/api/pages/homepage/testimonials-section', testimonialsSection),
                saveList('/api/pages/homepage/hero-floats', heroFeatures, deletedHeroFeatures),
            ]);

            setDeletedTrustLogos([]);
            setDeletedExpertiseItems([]);
            setDeletedHeroFeatures([]);

            showToast("Settings saved successfully!", { type: 'success' });
            // Re-fetch fresh data instead of full reload so UI shows exact current state
            await fetchData();
        } catch (error) {
            console.error("Error saving settings:", error);
            showToast(`Failed to save settings: ${error instanceof Error ? error.message : 'Unknown error'}`, { type: 'error' });
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
        { id: "hero", label: "Hero" },
        { id: "hero-features", label: "Hero Features" },
        { id: "trust", label: "Trust" },
        { id: "expertise", label: "Expertise" },
        { id: "products", label: "Products" },
        { id: "projects", label: "Projects" },
        { id: "about", label: "About" },
        { id: "blog", label: "Blog" },
        { id: "testimonials", label: "Testimonials" },
        { id: "contact", label: "Contact" },
    ];

    if (loading) return <div className="p-10 text-center">Loading...</div>;

    return (
        <div className="w-full min-h-screen bg-white pb-20">
            {/* Top Bar */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
                <div className="w-full mx-auto px-6 h-16 flex items-center justify-between">
                    <h1 className="text-xl font-bold text-gray-900">Homepage</h1>
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
                                    <span className="material-symbols-outlined text-indigo-500">web_asset</span>
                                    Hero Configuration
                                </h2>
                                <div className="space-y-5">
                                    <InputGroup label="Badge Text" value={heroData.badge_text || ''} onChange={(v) => setHeroData({ ...heroData, badge_text: v })} />
                                    <InputGroup label="Highlight Text (substring to emphasize)" value={heroData.highlight_text || ''} onChange={(v) => setHeroData({ ...heroData, highlight_text: v })} />
                                    <InputGroup label="Title" value={heroData.title || ''} onChange={(v) => setHeroData({ ...heroData, title: v })} />
                                    <TextAreaGroup label="Subtitle" value={heroData.subtitle || ''} onChange={(v) => setHeroData({ ...heroData, subtitle: v })} />

                                    <div>
                                        <InputGroup label="Colored Word (single word to color)" value={heroData.colored_word || ''} onChange={(v) => setHeroData({ ...heroData, colored_word: v })} />
                                        {heroData.colored_word && heroData.title && heroData.title.indexOf(heroData.colored_word) === -1 && (
                                            <div className="mt-2 text-sm text-yellow-700 flex items-center gap-2">
                                                <span>Colored word not found in title.</span>
                                                <button
                                                    onClick={() => {
                                                        const title = heroData.title || '';
                                                        const parts = title.trim().split(/\s+/);
                                                        const last = parts.length ? parts[parts.length - 1] : '';
                                                        setHeroData({ ...heroData, colored_word: last });
                                                    }}
                                                    className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                                                >
                                                    Autofill from title
                                                </button>
                                            </div>
                                        )}

                                        {/* Preview */}
                                        <div className="mt-4 p-3 bg-gray-50 rounded">
                                            <div className="text-sm text-gray-500 mb-2">Title Preview</div>
                                            <div className="text-2xl font-black leading-tight">
                                                {(() => {
                                                    const t = heroData.title || 'Example Title';
                                                    const cw = (heroData.colored_word || '').trim();
                                                    if (!t) return <span className="text-gray-400">No title set</span>;
                                                    return t.split('\n').map((line: string, i: number) => {
                                                        const word = cw;
                                                        if (word) {
                                                            const idx = line.indexOf(word);
                                                            if (idx !== -1) {
                                                                return (
                                                                    <span key={i} className="block">
                                                                        {line.substring(0, idx)}
                                                                        <span className="bg-clip-text text-transparent bg-linear-to-r from-primary via-blue-600 to-indigo-600">{word}</span>
                                                                        {line.substring(idx + word.length)}
                                                                    </span>
                                                                );
                                                            }
                                                        }
                                                        const trimmed = line.trim();
                                                        const parts = trimmed.split(' ');
                                                        if (parts.length === 1) return <span key={i} className="block">{trimmed}</span>;
                                                        const last = parts.pop();
                                                        const first = parts.join(' ');
                                                        return (
                                                            <span key={i} className="block">
                                                                {first} <span className="bg-clip-text text-transparent bg-linear-to-r from-primary via-blue-600 to-indigo-600">{last}</span>
                                                            </span>
                                                        );
                                                    });
                                                })()}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-5">
                                        <InputGroup label="Primary CTA Text" value={heroData.cta_text || ''} onChange={(v) => setHeroData({ ...heroData, cta_text: v })} />
                                        <InputGroup label="Primary CTA Link" value={heroData.cta_link || ''} onChange={(v) => setHeroData({ ...heroData, cta_link: v })} />
                                    </div>

                                    <div className="grid grid-cols-2 gap-5">
                                        <InputGroup label="Secondary CTA Text" value={heroData.secondary_cta_text || ''} onChange={(v) => setHeroData({ ...heroData, secondary_cta_text: v })} />
                                        <InputGroup label="Secondary CTA Link" value={heroData.secondary_cta_link || ''} onChange={(v) => setHeroData({ ...heroData, secondary_cta_link: v })} />
                                    </div>

                                    <ImageUploader label="Background Image" value={heroData.background_image || ''} onChange={(url: string) => setHeroData({ ...heroData, background_image: url })} folder="home" ratio="16:9" />
                                    <InputGroup label="Background Image Alt Text" value={heroData.hero_image_alt || ''} onChange={(v) => setHeroData({ ...heroData, hero_image_alt: v })} />

                                    {/* Trust Badges */}
                                    <div className="mt-4 p-4 bg-gray-50 rounded border border-gray-100">
                                        <h4 className="text-sm font-semibold mb-3">Trust Badges (Bottom of Hero)</h4>
                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                            <div className="p-3 bg-white rounded border border-gray-100">
                                                <div className="text-sm font-medium mb-2">Badge 1</div>
                                                <div className="mb-2">
                                                    <label className="block text-xs font-medium text-gray-500 mb-1">Icon</label>
                                                    <IconSelector value={heroData.trust_badge1_icon || ''} onChange={(v) => setHeroData({ ...heroData, trust_badge1_icon: v })} />
                                                </div>
                                                <InputGroup label="Text" value={heroData.trust_badge1_text || ''} onChange={(v) => setHeroData({ ...heroData, trust_badge1_text: v })} />
                                            </div>

                                            <div className="p-3 bg-white rounded border border-gray-100">
                                                <div className="text-sm font-medium mb-2">Badge 2</div>
                                                <div className="mb-2">
                                                    <label className="block text-xs font-medium text-gray-500 mb-1">Icon</label>
                                                    <IconSelector value={heroData.trust_badge2_icon || ''} onChange={(v) => setHeroData({ ...heroData, trust_badge2_icon: v })} />
                                                </div>
                                                <InputGroup label="Text" value={heroData.trust_badge2_text || ''} onChange={(v) => setHeroData({ ...heroData, trust_badge2_text: v })} />
                                            </div>

                                            <div className="p-3 bg-white rounded border border-gray-100">
                                                <div className="text-sm font-medium mb-2">Badge 3</div>
                                                <div className="mb-2">
                                                    <label className="block text-xs font-medium text-gray-500 mb-1">Icon</label>
                                                    <IconSelector value={heroData.trust_badge3_icon || ''} onChange={(v) => setHeroData({ ...heroData, trust_badge3_icon: v })} />
                                                </div>
                                                <InputGroup label="Text" value={heroData.trust_badge3_text || ''} onChange={(v) => setHeroData({ ...heroData, trust_badge3_text: v })} />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-4 flex items-center justify-between border-t border-gray-50 mt-6">
                                        <span className="text-sm font-medium text-gray-700">Enable Section</span>
                                        <Toggle checked={heroData.is_active === 1} onChange={(c) => setHeroData({ ...heroData, is_active: c ? 1 : 0 })} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* HERO FEATURES SECTION */}
                    {activeTab === "hero-features" && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
                                <div className="flex items-center justify-between mb-8">
                                    <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                        <span className="material-symbols-outlined text-indigo-500">featured_play_list</span>
                                        Hero Floating Features
                                    </h2>
                                    <button
                                        onClick={() => addItem(heroFeatures, setHeroFeatures, { title: "", description: "", icon_name: "", icon_bg: "bg-blue-600", is_active: 1 })}
                                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                                    >
                                        <span className="material-symbols-outlined text-[18px]">add</span>
                                        Add Feature
                                    </button>
                                </div>

                                <div className="space-y-6">
                                    {heroFeatures.map((item, idx) => (
                                        <div key={idx} className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow group relative">
                                            <button
                                                onClick={() => {
                                                    if (item._id) setDeletedHeroFeatures([...deletedHeroFeatures, item]);
                                                    setHeroFeatures(heroFeatures.filter((_, i) => i !== idx));
                                                }}
                                                className="absolute top-4 right-4 text-gray-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                                            >
                                                <span className="material-symbols-outlined">delete</span>
                                            </button>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div className="space-y-4">
                                                    <InputGroup
                                                        label="Title"
                                                        value={item.title || ''}
                                                        onChange={(v) => updateItem(idx, 'title', v, heroFeatures, setHeroFeatures)}
                                                    />
                                                    <TextAreaGroup
                                                        label="Description"
                                                        value={item.description || ''}
                                                        onChange={(v) => updateItem(idx, 'description', v, heroFeatures, setHeroFeatures)}
                                                    />
                                                </div>
                                                <div className="space-y-4">
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-2">Icon</label>
                                                        <IconSelector
                                                            value={item.icon_name || ''}
                                                            onChange={(v) => updateItem(idx, 'icon_name', v, heroFeatures, setHeroFeatures)}
                                                        />
                                                    </div>
                                                    <div className="flex items-center justify-between pt-2">
                                                        <span className="text-sm font-medium text-gray-700">Display Order</span>
                                                        <input
                                                            type="number"
                                                            value={item.display_order || 0}
                                                            onChange={(e) => updateItem(idx, 'display_order', Number(e.target.value), heroFeatures, setHeroFeatures)}
                                                            className="w-20 px-3 py-1 border border-gray-200 rounded text-right focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                                                        />
                                                    </div>
                                                    <div className="flex items-center justify-between pt-2">
                                                        <span className="text-sm font-medium text-gray-700">Active</span>
                                                        <Toggle
                                                            checked={item.is_active === 1}
                                                            onChange={(v) => updateItem(idx, 'is_active', v ? 1 : 0, heroFeatures, setHeroFeatures)}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}

                                    {heroFeatures.length === 0 && (
                                        <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                                            <span className="material-symbols-outlined text-4xl text-gray-300 mb-2">featured_video</span>
                                            <p className="text-gray-500">No feature cards added. Click "Add Feature" to get started.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* TRUST SECTION */}
                    {activeTab === "trust" && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
                                <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-blue-500">verified</span>
                                    Trust Section
                                </h2>
                                <div className="space-y-5 mb-8">
                                    <InputGroup label="Section Heading" value={trustSection.heading || ''} onChange={(v) => setTrustSection({ ...trustSection, heading: v })} />
                                    <div className="pt-4 flex items-center justify-between border-t border-gray-50 mt-6">
                                        <span className="text-sm font-medium text-gray-700">Enable Section</span>
                                        <Toggle checked={trustSection.is_active === 1} onChange={(c) => setTrustSection({ ...trustSection, is_active: c ? 1 : 0 })} />
                                    </div>
                                </div>

                                <div className="flex items-center justify-between mb-6 pt-6 border-t border-gray-100">
                                    <p className="text-sm text-gray-500">Manage Logos</p>
                                    <button onClick={() => addItem(trustLogos, setTrustLogos, { alt_text: "", logo_url: "" })} className="text-sm text-indigo-600 font-medium hover:text-indigo-700 flex items-center gap-1">
                                        <span className="material-symbols-outlined text-[18px]">add_circle</span> Add Logo
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    {trustLogos.map((logo, idx) => (
                                        <div key={idx} className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow group">
                                            <div className="flex justify-between items-start mb-4">
                                                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gray-100 text-xs font-medium text-gray-500">{idx + 1}</span>
                                                <button
                                                    onClick={() => {
                                                        const idToDelete = logo.id ?? logo._id ?? null;
                                                        if (idToDelete) setDeletedTrustLogos([...deletedTrustLogos, idToDelete]);
                                                        setTrustLogos(trustLogos.filter((_, i) => i !== idx));
                                                    }}
                                                    className="text-gray-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                                                >
                                                    <span className="material-symbols-outlined">delete</span>
                                                </button>
                                            </div>
                                            <div className="space-y-4">
                                                <InputGroup label="Alt Text" value={logo.alt_text || ''} onChange={(v) => updateItem(idx, 'alt_text', v, trustLogos, setTrustLogos)} />
                                                <ImageUploader label="Logo" value={logo.logo_url || ''} onChange={(url: string) => updateItem(idx, 'logo_url', url, trustLogos, setTrustLogos)} folder="logos" ratio="Logo" />

                                                <div className="grid grid-cols-2 gap-4">
                                                    <InputGroup label="Display Order" value={String(logo.display_order || '')} onChange={(v) => updateItem(idx, 'display_order', Number(v), trustLogos, setTrustLogos)} />
                                                    <div className="flex items-end justify-between">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-sm text-gray-600">Invert</span>
                                                            <Toggle checked={logo.invert === 1} onChange={(c) => updateItem(idx, 'invert', c ? 1 : 0, trustLogos, setTrustLogos)} />
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-sm text-gray-600">Active</span>
                                                            <Toggle checked={logo.is_active === 1} onChange={(c) => updateItem(idx, 'is_active', c ? 1 : 0, trustLogos, setTrustLogos)} />
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

                    {/* EXPERTISE SECTION */}
                    {activeTab === "expertise" && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
                                <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-green-500">psychology</span>
                                    Expertise Section
                                </h2>
                                <div className="space-y-5 mb-8">
                                    <InputGroup label="Title" value={expertiseSection.title || ''} onChange={(v) => setExpertiseSection({ ...expertiseSection, title: v })} />
                                    <TextAreaGroup label="Description" value={expertiseSection.description || ''} onChange={(v) => setExpertiseSection({ ...expertiseSection, description: v })} />
                                    <div className="pt-4 flex items-center justify-between border-t border-gray-50 mt-6">
                                        <span className="text-sm font-medium text-gray-700">Enable Section</span>
                                        <Toggle checked={expertiseSection.is_active === 1} onChange={(c) => setExpertiseSection({ ...expertiseSection, is_active: c ? 1 : 0 })} />
                                    </div>
                                </div>

                                <div className="flex items-center justify-between mb-6 pt-6 border-t border-gray-100">
                                    <p className="text-sm text-gray-500">Manage Expertise Items</p>
                                    <button onClick={() => addItem(expertiseItems, setExpertiseItems, { icon: "star", title: "", description: "" })} className="text-sm text-indigo-600 font-medium hover:text-indigo-700 flex items-center gap-1">
                                        <span className="material-symbols-outlined text-[18px]">add_circle</span> Add Item
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    {expertiseItems.map((item, idx) => (
                                        <div key={idx} className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow group">
                                            <div className="flex justify-between items-start mb-4">
                                                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gray-100 text-xs font-medium text-gray-500">{idx + 1}</span>
                                                <button
                                                    onClick={() => {
                                                        const idToDelete = item.id ?? item._id ?? null;
                                                        if (idToDelete) setDeletedExpertiseItems([...deletedExpertiseItems, idToDelete]);
                                                        setExpertiseItems(expertiseItems.filter((_, i) => i !== idx));
                                                    }}
                                                    className="text-gray-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                                                >
                                                    <span className="material-symbols-outlined">delete</span>
                                                </button>
                                            </div>
                                            <div className="space-y-4">
                                                <div className="grid grid-cols-3 gap-4">
                                                    <div className="col-span-1">
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">Icon</label>
                                                        <IconSelector value={item.icon || ''} onChange={(v) => updateItem(idx, 'icon', v, expertiseItems, setExpertiseItems)} />
                                                    </div>
                                                    <div className="col-span-2">
                                                        <InputGroup label="Title" value={item.title || ''} onChange={(v) => updateItem(idx, 'title', v, expertiseItems, setExpertiseItems)} />
                                                    </div>
                                                </div>
                                                <TextAreaGroup label="Description" value={item.description || ''} onChange={(v) => updateItem(idx, 'description', v, expertiseItems, setExpertiseItems)} />

                                                <div className="grid grid-cols-2 gap-4">
                                                    <InputGroup label="Display Order" value={String(item.display_order || '')} onChange={(v) => updateItem(idx, 'display_order', Number(v), expertiseItems, setExpertiseItems)} />
                                                    <div className="flex items-end">
                                                        <Toggle checked={item.is_active === 1} onChange={(c) => updateItem(idx, 'is_active', c ? 1 : 0, expertiseItems, setExpertiseItems)} />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* PRODUCTS SECTION */}
                    {activeTab === "products" && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
                                <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-indigo-500">inventory_2</span>
                                    Products Section
                                </h2>
                                <div className="space-y-5 mb-8">
                                    <InputGroup label="Title" value={productsSection.title || ''} onChange={(v) => setProductsSection({ ...productsSection, title: v })} />
                                    <TextAreaGroup label="Description" value={productsSection.description || ''} onChange={(v) => setProductsSection({ ...productsSection, description: v })} />
                                    <div className="pt-4 flex items-center justify-between border-t border-gray-50 mt-6">
                                        <span className="text-sm font-medium text-gray-700">Enable Section</span>
                                        <Toggle checked={productsSection.is_active === 1} onChange={(c) => setProductsSection({ ...productsSection, is_active: c ? 1 : 0 })} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* PROJECTS SECTION */}
                    {activeTab === "projects" && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
                                <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-teal-500">apartment</span>
                                    Projects Section
                                </h2>
                                <div className="space-y-5 mb-8">
                                    <InputGroup label="Title" value={projectsSection?.title || ''} onChange={(v) => setProjectsSection({ ...projectsSection, title: v })} />
                                    <TextAreaGroup label="Description" value={projectsSection?.description || ''} onChange={(v) => setProjectsSection({ ...projectsSection, description: v })} />
                                    <div className="pt-4 flex items-center justify-between border-t border-gray-50 mt-6">
                                        <span className="text-sm font-medium text-gray-700">Enable Section</span>
                                        <Toggle checked={(projectsSection?.is_active ?? 1) === 1} onChange={(c) => setProjectsSection({ ...projectsSection, is_active: c ? 1 : 0 })} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ABOUT SECTION */}
                    {activeTab === "about" && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
                                <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-orange-500">info</span>
                                    About Section
                                </h2>
                                <div className="space-y-5 mb-8">
                                    <InputGroup label="Title" value={aboutSection?.title || ''} onChange={(v) => setAboutSection({ ...aboutSection, title: v })} />
                                    <TextAreaGroup label="Description" value={aboutSection?.description || ''} onChange={(v) => setAboutSection({ ...aboutSection, description: v })} />
                                    {/* <TextAreaGroup label="Bullets (one per line)" value={aboutSection?.bullets_text || ''} onChange={(v) => setAboutSection({ ...aboutSection, bullets_text: v })} />
                                    <ImageUploader label="Image" value={aboutSection?.image_url || ''} onChange={(url: string) => setAboutSection({ ...aboutSection, image_url: url })} folder="home" ratio="4:3" />
                                    <InputGroup label="Image Alt Text" value={aboutSection?.image_alt || ''} onChange={(v) => setAboutSection({ ...aboutSection, image_alt: v })} />
                                    <div className="grid grid-cols-2 gap-5">
                                        <InputGroup label="CTA Text" value={aboutSection?.cta_text || ''} onChange={(v) => setAboutSection({ ...aboutSection, cta_text: v })} />
                                        <InputGroup label="CTA Link" value={aboutSection?.cta_link || ''} onChange={(v) => setAboutSection({ ...aboutSection, cta_link: v })} />
                                    </div> */}

                                    <div className="pt-4 flex items-center justify-between border-t border-gray-50 mt-6">
                                        <span className="text-sm font-medium text-gray-700">Enable Section</span>
                                        <Toggle checked={(aboutSection?.is_active ?? 1) === 1} onChange={(c) => setAboutSection({ ...aboutSection, is_active: c ? 1 : 0 })} />
                                    </div>
                                </div>

                                <div className="mt-8 pt-6 border-t border-gray-100">
                                    <div className="flex items-center justify-between mb-4">
                                        <p className="text-sm text-gray-500">Manage About Items</p>
                                        <button onClick={() => addItem(aboutItems, setAboutItems, { title: '', description: '', bullets: '[]', image_url: '', image_alt: '', display_order: aboutItems.length + 1, is_active: 1 })} className="text-sm text-indigo-600 font-medium hover:text-indigo-700 flex items-center gap-1">
                                            <span className="material-symbols-outlined text-[18px]">add_circle</span> Add Item
                                        </button>
                                    </div>

                                    <div className="space-y-4">
                                        {aboutItems.map((item, idx) => (
                                            <div key={idx} className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow group relative">
                                                <div className="flex justify-between items-start mb-4">
                                                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gray-100 text-xs font-medium text-gray-500">{idx + 1}</span>
                                                    <button
                                                        onClick={() => {
                                                            const idToDelete = item.id ?? item._id ?? null;
                                                            if (idToDelete) setDeletedAboutItems([...deletedAboutItems, idToDelete]);
                                                            setAboutItems(aboutItems.filter((_, i) => i !== idx));
                                                        }}
                                                        className="text-gray-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                                                    >
                                                        <span className="material-symbols-outlined">delete</span>
                                                    </button>
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    <div className="space-y-4">
                                                        <InputGroup label="Title" value={item.title || ''} onChange={(v) => updateItem(idx, 'title', v, aboutItems, setAboutItems)} />
                                                        <TextAreaGroup label="Description" value={item.description || ''} onChange={(v) => updateItem(idx, 'description', v, aboutItems, setAboutItems)} />
                                                        <TextAreaGroup label="Bullets (one per line)" value={item.bullets_text || ''} onChange={(v) => updateItem(idx, 'bullets_text', v, aboutItems, setAboutItems)} />
                                                    </div>

                                                    <div className="space-y-4">
                                                        <ImageUploader label="Image" value={item.image_url || ''} onChange={(url: string) => updateItem(idx, 'image_url', url, aboutItems, setAboutItems)} folder="home" ratio="4:3" />
                                                        <InputGroup label="Image Alt Text" value={item.image_alt || ''} onChange={(v) => updateItem(idx, 'image_alt', v, aboutItems, setAboutItems)} />
                                                        <div className="flex items-center justify-between pt-2">
                                                            <span className="text-sm font-medium text-gray-700">Display Order</span>
                                                            <input
                                                                type="number"
                                                                value={item.display_order || 0}
                                                                onChange={(e) => updateItem(idx, 'display_order', Number(e.target.value), aboutItems, setAboutItems)}
                                                                className="w-20 px-3 py-1 border border-gray-200 rounded text-right focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                                                            />
                                                        </div>
                                                        <div className="flex items-center justify-between pt-2">
                                                            <span className="text-sm font-medium text-gray-700">Active</span>
                                                            <Toggle checked={item.is_active === 1} onChange={(c) => updateItem(idx, 'is_active', c ? 1 : 0, aboutItems, setAboutItems)} />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* BLOG SECTION */}
                    {activeTab === "blog" && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
                                <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-orange-500">article</span>
                                    Blog Section
                                </h2>
                                <div className="space-y-5 mb-8">
                                    <InputGroup label="Title" value={blogSection?.title || ''} onChange={(v) => setBlogSection({ ...blogSection, title: v })} />
                                    <TextAreaGroup label="Subtitle" value={blogSection?.subtitle || ''} onChange={(v) => setBlogSection({ ...blogSection, subtitle: v })} />
                                    <div className="grid grid-cols-2 gap-5">
                                        <InputGroup label="CTA Text" value={blogSection?.cta_text || ''} onChange={(v) => setBlogSection({ ...blogSection, cta_text: v })} />
                                        <InputGroup label="CTA Link" value={blogSection?.cta_link || ''} onChange={(v) => setBlogSection({ ...blogSection, cta_link: v })} />
                                    </div>

                                    <div className="pt-4 flex items-center justify-between border-t border-gray-50 mt-6">
                                        <span className="text-sm font-medium text-gray-700">Enable Section</span>
                                        <Toggle checked={(blogSection?.is_active ?? 1) === 1} onChange={(c) => setBlogSection({ ...blogSection, is_active: c ? 1 : 0 })} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* TESTIMONIALS SECTION */}
                    {activeTab === "testimonials" && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
                                <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-yellow-500">reviews</span>
                                    Testimonials Section
                                </h2>
                                <div className="space-y-5 mb-8">
                                    <InputGroup label="Title" value={testimonialsSection?.title || ''} onChange={(v) => setTestimonialsSection({ ...testimonialsSection, title: v })} />
                                    <TextAreaGroup label="Subtitle" value={testimonialsSection?.subtitle || ''} onChange={(v) => setTestimonialsSection({ ...testimonialsSection, subtitle: v })} />
                                    <div className="pt-4 flex items-center justify-between border-t border-gray-50 mt-6">
                                        <span className="text-sm font-medium text-gray-700">Enable Section</span>
                                        <Toggle checked={(testimonialsSection?.is_active ?? 1) === 1} onChange={(c) => setTestimonialsSection({ ...testimonialsSection, is_active: c ? 1 : 0 })} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* CONTACT SECTION */}
                    {activeTab === "contact" && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
                                <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-purple-500">contact_mail</span>
                                    Contact Section
                                </h2>
                                <div className="space-y-5">
                                    <InputGroup label="Title" value={contactData.title || ''} onChange={(v) => setContactData({ ...contactData, title: v })} />
                                    <TextAreaGroup label="Description" value={contactData.description || ''} onChange={(v) => setContactData({ ...contactData, description: v })} />

                                    <div className="grid grid-cols-2 gap-5">
                                        <InputGroup label="Name Placeholder" value={contactData.name_placeholder || ''} onChange={(v) => setContactData({ ...contactData, name_placeholder: v })} />
                                        <InputGroup label="Email Placeholder" value={contactData.email_placeholder || ''} onChange={(v) => setContactData({ ...contactData, email_placeholder: v })} />
                                        <InputGroup label="Phone Placeholder" value={contactData.phone_placeholder || ''} onChange={(v) => setContactData({ ...contactData, phone_placeholder: v })} />
                                        <InputGroup label="Service Placeholder" value={contactData.service_placeholder || ''} onChange={(v) => setContactData({ ...contactData, service_placeholder: v })} />
                                        <InputGroup label="Message Placeholder" value={contactData.message_placeholder || ''} onChange={(v) => setContactData({ ...contactData, message_placeholder: v })} />
                                    </div>
                                    <InputGroup label="Submit Button Text" value={contactData.submit_button_text || ''} onChange={(v) => setContactData({ ...contactData, submit_button_text: v })} />

                                    <div className="pt-4 flex items-center justify-between border-t border-gray-50 mt-6">
                                        <span className="text-sm font-medium text-gray-700">Enable Section</span>
                                        <Toggle checked={contactData.is_active === 1} onChange={(c) => setContactData({ ...contactData, is_active: c ? 1 : 0 })} />
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
