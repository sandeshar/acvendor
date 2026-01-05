'use client';

import { useState, useEffect } from 'react';
import ImageUploader from '@/components/shared/ImageUploader';
import { showToast } from '@/components/Toast';

interface HeroData {
    id?: number;
    badge_text: string;
    tagline: string;
    title: string;
    highlight_text: string;
    subtitle: string;
    description: string;
    cta_text: string;
    cta_link: string;
    background_image: string;
    hero_image_alt: string;
    is_active: number;
}

interface BrandHeroData extends HeroData {
    brand_slug: string;
    display_order: number;
}

export default function AdminShopPage() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [brands, setBrands] = useState<any[]>([]);
    const [selectedBrand, setSelectedBrand] = useState('');

    // Global Hero State
    const [globalHero, setGlobalHero] = useState<HeroData>({
        badge_text: '',
        tagline: '',
        title: '',
        highlight_text: '',
        subtitle: '',
        description: '',
        cta_text: '',
        cta_link: '',
        background_image: '',
        hero_image_alt: '',
        is_active: 1
    });

    // Brand Hero State
    const [brandHero, setBrandHero] = useState<BrandHeroData>({
        brand_slug: '',
        badge_text: '',
        tagline: '',
        title: '',
        highlight_text: '',
        subtitle: '',
        description: '',
        cta_text: '',
        cta_link: '',
        background_image: '',
        hero_image_alt: '',
        display_order: 0,
        is_active: 1
    });

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        setLoading(true);
        try {
            const [heroRes, brandsRes] = await Promise.all([
                fetch('/api/pages/shop/hero'),
                fetch('/api/pages/services/brands')
            ]);

            const heroData = await heroRes.json();
            const brandsData = await brandsRes.json();

            if (heroData?.id) setGlobalHero(heroData);
            setBrands(brandsData || []);

            // Default to 'midea' if it exists
            const midea = (brandsData || []).find((b: any) => b.slug === 'midea');
            if (midea) {
                setSelectedBrand('midea');
                fetchBrandHero('midea');
            }
        } catch (error) {
            console.error('Error fetching initial data:', error);
            showToast('Failed to load data', { type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const fetchBrandHero = async (slug: string) => {
        if (!slug) {
            setBrandHero({
                brand_slug: '',
                badge_text: '',
                tagline: '',
                title: '',
                subtitle: '',
                description: '',
                cta_text: '',
                cta_link: '',
                background_image: '',
                hero_image_alt: '',
                display_order: 0,
                is_active: 1
            });
            return;
        }

        try {
            const res = await fetch(`/api/pages/shop/brand-hero?brand=${slug}`);
            const data = await res.json();
            if (data?.id) {
                setBrandHero(data);
            } else {
                setBrandHero({
                    brand_slug: slug,
                    badge_text: '',
                    tagline: '',
                    title: '',
                    subtitle: '',
                    description: '',
                    cta_text: '',
                    cta_link: '',
                    background_image: '',
                    hero_image_alt: '',
                    display_order: 0,
                    is_active: 1
                });
            }
        } catch (error) {
            console.error('Error fetching brand hero:', error);
        }
    };

    const handleSaveGlobalHero = async () => {
        setSaving(true);
        try {
            const method = globalHero.id ? 'PUT' : 'POST';
            const res = await fetch('/api/pages/shop/hero', {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(globalHero)
            });

            if (res.ok) {
                const data = await res.json();
                if (method === 'POST') setGlobalHero({ ...globalHero, id: data.id });
                showToast('Global hero updated', { type: 'success' });
            } else {
                throw new Error('Save failed');
            }
        } catch (error) {
            showToast('Failed to save global hero', { type: 'error' });
        } finally {
            setSaving(false);
        }
    };

    const handleSaveBrandHero = async () => {
        if (!selectedBrand) {
            showToast('Please select a brand', { type: 'error' });
            return;
        }
        setSaving(true);
        try {
            const method = brandHero.id ? 'PUT' : 'POST';
            const res = await fetch('/api/pages/shop/brand-hero', {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...brandHero, brand_slug: selectedBrand })
            });

            if (res.ok) {
                const data = await res.json();
                if (method === 'POST') setBrandHero({ ...brandHero, id: data.id });
                showToast(`Hero for ${selectedBrand} updated`, { type: 'success' });
            } else {
                throw new Error('Save failed');
            }
        } catch (error) {
            showToast('Failed to save brand hero', { type: 'error' });
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-8">Loading...</div>;

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-12">
            <div className="flex flex-col gap-2">
                <h1 className="text-2xl font-bold text-slate-900 font-display">Shop Management</h1>
                <p className="text-slate-500">Manage global and brand-specific hero sections for the shop page.</p>
            </div>

            {/* Global Shop Hero */}
            <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between mb-8 border-b border-slate-100 pb-4">
                    <div>
                        <h2 className="text-lg font-bold text-slate-800">Global Shop Hero</h2>
                        <p className="text-xs text-slate-400 mt-1 uppercase tracking-wider font-bold">Default content for the Shop page</p>
                    </div>
                    <button
                        onClick={handleSaveGlobalHero}
                        disabled={saving}
                        className="bg-primary text-white px-6 py-2 rounded-lg font-bold hover:bg-indigo-700 disabled:opacity-50 transition-all shadow-lg shadow-primary/20"
                    >
                        {saving ? 'Saving...' : 'Save Global Hero'}
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 tracking-wide">Badge Text</label>
                            <input
                                type="text"
                                placeholder="e.g. Official Distributor"
                                value={globalHero.badge_text}
                                onChange={e => setGlobalHero({ ...globalHero, badge_text: e.target.value })}
                                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 tracking-wide">Tagline</label>
                            <input
                                type="text"
                                placeholder="e.g. Premium Air Conditioning"
                                value={globalHero.tagline}
                                onChange={e => setGlobalHero({ ...globalHero, tagline: e.target.value })}
                                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 tracking-wide">Title</label>
                            <input
                                type="text"
                                placeholder="Hero Title"
                                value={globalHero.title}
                                onChange={e => setGlobalHero({ ...globalHero, title: e.target.value })}
                                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-bold"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 tracking-wide">Highlight Text</label>
                            <input
                                type="text"
                                placeholder="Substring to highlight"
                                value={globalHero.highlight_text}
                                onChange={e => setGlobalHero({ ...globalHero, highlight_text: e.target.value })}
                                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 tracking-wide">Subtitle</label>
                            <input
                                type="text"
                                placeholder="Hero Subtitle"
                                value={globalHero.subtitle}
                                onChange={e => setGlobalHero({ ...globalHero, subtitle: e.target.value })}
                                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 tracking-wide">CTA Text</label>
                                <input
                                    type="text"
                                    value={globalHero.cta_text}
                                    onChange={e => setGlobalHero({ ...globalHero, cta_text: e.target.value })}
                                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 tracking-wide">CTA Link</label>
                                <input
                                    type="text"
                                    value={globalHero.cta_link}
                                    onChange={e => setGlobalHero({ ...globalHero, cta_link: e.target.value })}
                                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
                                />
                            </div>
                        </div>
                    </div>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 tracking-wide">Description</label>
                            <textarea
                                value={globalHero.description}
                                onChange={e => setGlobalHero({ ...globalHero, description: e.target.value })}
                                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all h-24 text-sm"
                                placeholder="Enter hero description..."
                            />
                        </div>
                        <ImageUploader
                            value={globalHero.background_image}
                            onChange={url => setGlobalHero({ ...globalHero, background_image: url })}
                            folder="shop"
                            label="Background Image"
                        />
                    </div>
                </div>
            </section>

            {/* Brand Hero Selection */}
            <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between mb-8 border-b border-slate-100 pb-4">
                    <div className="flex flex-col gap-1">
                        <h2 className="text-lg font-bold text-slate-800">midea-ac Hero Section</h2>
                        <p className="text-xs text-slate-400 mt-1 uppercase tracking-wider font-bold">Manage branding for the /midea-ac page</p>
                        <div className="flex items-center gap-3 mt-3">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Select Brand:</label>
                            <select
                                value={selectedBrand}
                                onChange={(e) => {
                                    setSelectedBrand(e.target.value);
                                    fetchBrandHero(e.target.value);
                                }}
                                className="px-3 py-1.5 border border-slate-200 rounded-lg bg-slate-50 text-sm font-bold text-slate-700"
                            >
                                <option value="">Select a Brand</option>
                                {brands.map((b) => <option key={b.id} value={b.slug}>{b.name}</option>)}
                            </select>
                        </div>
                    </div>
                    <button
                        onClick={handleSaveBrandHero}
                        disabled={saving || !selectedBrand}
                        className="bg-primary text-white px-6 py-2 rounded-lg font-bold hover:bg-indigo-700 disabled:opacity-50 transition-all shadow-lg shadow-primary/20"
                    >
                        {saving ? 'Saving...' : 'Save Brand Hero'}
                    </button>
                </div>

                {!selectedBrand ? (
                    <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                        <span className="material-symbols-outlined text-4xl mb-2">branding_watermark</span>
                        <p>Select a brand to manage its unique hero content</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in duration-300">
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 tracking-wide">Badge Text</label>
                                <input
                                    type="text"
                                    value={brandHero.badge_text}
                                    onChange={e => setBrandHero({ ...brandHero, badge_text: e.target.value })}
                                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
                                    placeholder="e.g. Authorized Partner"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 tracking-wide">Tagline</label>
                                <input
                                    type="text"
                                    value={brandHero.tagline}
                                    onChange={e => setBrandHero({ ...brandHero, tagline: e.target.value })}
                                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 tracking-wide">Title</label>
                                <input
                                    type="text"
                                    value={brandHero.title}
                                    onChange={e => setBrandHero({ ...brandHero, title: e.target.value })}
                                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-bold"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 tracking-wide">Highlight Text</label>
                                <input
                                    type="text"
                                    value={brandHero.highlight_text}
                                    onChange={e => setBrandHero({ ...brandHero, highlight_text: e.target.value })}
                                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 tracking-wide">Subtitle</label>
                                <input
                                    type="text"
                                    value={brandHero.subtitle}
                                    onChange={e => setBrandHero({ ...brandHero, subtitle: e.target.value })}
                                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
                                />
                            </div>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 tracking-wide">Description</label>
                                <textarea
                                    value={brandHero.description}
                                    onChange={e => setBrandHero({ ...brandHero, description: e.target.value })}
                                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all h-24 text-sm"
                                />
                            </div>
                            <ImageUploader
                                value={brandHero.background_image}
                                onChange={url => setBrandHero({ ...brandHero, background_image: url })}
                                folder="shop"
                                label="Brand Background"
                            />
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 tracking-wide">Display Order</label>
                                    <input
                                        type="number"
                                        value={brandHero.display_order}
                                        onChange={e => setBrandHero({ ...brandHero, display_order: parseInt(e.target.value) })}
                                        className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
                                    />
                                </div>
                                <div className="flex items-center gap-2 mt-6">
                                    <input
                                        type="checkbox"
                                        id="bh-active"
                                        checked={brandHero.is_active === 1}
                                        onChange={e => setBrandHero({ ...brandHero, is_active: e.target.checked ? 1 : 0 })}
                                    />
                                    <label htmlFor="bh-active" className="text-sm font-bold text-slate-700">Active</label>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </section>
        </div>
    );
}
