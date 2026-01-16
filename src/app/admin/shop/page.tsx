'use client';

import { useState, useEffect } from 'react';
import ImageUploader from '@/components/shared/ImageUploader';
import { showToast } from '@/components/Toast';

interface HeroData {
    id?: number | string;
    badge_text: string;
    tagline: string;
    title: string;
    highlight_text: string;
    subtitle: string;
    description: string;
    /** Short text used in the image card overlay on the hero image */
    card_overlay_text?: string;
    /** Optional CTA specific to the image card overlay */
    card_cta_text?: string;
    card_cta_link?: string;
    cta_text: string;
    cta_link: string;
    cta2_text?: string;
    cta2_link?: string;
    background_image: string;
    hero_image_alt: string;
    is_active: number;
}

interface BrandHeroData extends HeroData {
    brand_slug: string;
    display_order: number;
}

interface ShopCTAData {
    id?: string;
    title: string;
    description: string;
    bullets: string;
    button1_text: string;
    button1_link: string;
    button2_text: string;
    button2_link: string;
    is_active: number;
}

interface CategoryCTAData {
    id?: string;
    category_slug: string;
    title: string;
    description: string;
    bullets: string;
    button1_text: string;
    button1_link: string;
    button2_text: string;
    button2_link: string;
    is_active: number;
}

export default function AdminShopPage() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [categories, setCategories] = useState<any[]>([]);
    const [selectedCategory, setSelectedCategory] = useState('');

    // Global Hero State
    const [globalHero, setGlobalHero] = useState<HeroData>({
        badge_text: '',
        tagline: '',
        title: '',
        highlight_text: '',
        subtitle: '',
        description: '',
        card_overlay_text: '',
        cta_text: '',
        cta_link: '',
        cta2_text: '',
        cta2_link: '',
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
        card_overlay_text: '',
        cta_text: '',
        cta_link: '',
        cta2_text: '',
        cta2_link: '',
        background_image: '',
        hero_image_alt: '',
        display_order: 0,
        is_active: 1
    });

    // Dedicated Midea Hero State (for /midea-ac page)
    const [mideaHero, setMideaHero] = useState<BrandHeroData>({
        brand_slug: 'midea',
        badge_text: '',
        tagline: '',
        title: 'Midea Air Conditioning',
        highlight_text: 'Midea',
        subtitle: '',
        description: '',
        card_overlay_text: '',
        cta_text: '',
        cta_link: '',
        cta2_text: '',
        cta2_link: '',
        background_image: '',
        hero_image_alt: 'Midea Hero Image',
        display_order: 0,
        is_active: 1
    });

    // Shop CTA State
    const [shopCTA, setShopCTA] = useState<ShopCTAData>({
        title: '',
        description: '',
        bullets: '[]',
        button1_text: '',
        button1_link: '',
        button2_text: '',
        button2_link: '',
        is_active: 1
    });

    // Midea CTA State
    const [mideaCTA, setMideaCTA] = useState<CategoryCTAData>({
        category_slug: 'midea',
        title: '',
        description: '',
        bullets: '[]',
        button1_text: '',
        button1_link: '',
        button2_text: '',
        button2_link: '',
        is_active: 1
    });

    // Category CTA State
    const [categoryCTA, setCategoryCTA] = useState<CategoryCTAData>({
        category_slug: '',
        title: '',
        description: '',
        bullets: '[]',
        button1_text: '',
        button1_link: '',
        button2_text: '',
        button2_link: '',
        is_active: 1
    });

    // UI Tab state: controls which editor panel is visible
    const bulletsToLines = (bullets: string) => {
        try {
            let parsed = JSON.parse(bullets);
            // Handle secondary stringification if it exists
            if (typeof parsed === 'string' && parsed.startsWith('[')) {
                parsed = JSON.parse(parsed);
            }
            if (Array.isArray(parsed)) return parsed.join('\n');
            return bullets;
        } catch (e) {
            return bullets;
        }
    };

    const linesToBullets = (lines: string) => {
        const array = lines.split('\n').map(l => l.trim()).filter(l => l !== '');
        return JSON.stringify(array);
    };

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        setLoading(true);
        try {
            const [heroRes, categoriesRes, shopCtaRes] = await Promise.all([
                fetch('/api/pages/shop/hero'),
                fetch('/api/pages/services/categories?admin=1'),
                fetch('/api/pages/shop/cta')
            ]);

            const heroData = await heroRes.json();
            const categoriesData = await categoriesRes.json();
            const shopCtaData = await shopCtaRes.json();

            if (heroData?._id || heroData?.id) setGlobalHero({ ...heroData, id: heroData.id ?? heroData._id });
            if (shopCtaData?._id || shopCtaData?.id) setShopCTA({ ...shopCtaData, id: shopCtaData.id ?? shopCtaData._id });

            const finalCategories = categoriesData || [];
            // Exclude 'midea' from the general category list â€” it has a dedicated editor
            const adminCategories = finalCategories.filter((c: any) => String(c.slug).toLowerCase() !== 'midea');
            setCategories(adminCategories);

            // Default to first non-midea category if available
            if (adminCategories.length > 0) {
                setSelectedCategory(adminCategories[0].slug);
                fetchCategoryContent(adminCategories[0].slug);
            }

            // Fetch dedicated Midea hero (for /midea-ac)
            try {
                const [mRes, mCtaRes] = await Promise.all([
                    fetch(`/api/pages/shop/category-hero?category=midea`),
                    fetch(`/api/pages/shop/category-cta?category=midea`)
                ]);

                if (mRes.ok) {
                    const mData = await mRes.json();
                    if (mData?._id || mData?.id) {
                        setMideaHero({ ...mData, id: mData.id ?? mData._id });
                    }
                }
                if (mCtaRes.ok) {
                    const mCtaData = await mCtaRes.json();
                    if (mCtaData?._id || mCtaData?.id) {
                        setMideaCTA({ ...mCtaData, id: mCtaData.id ?? mCtaData._id });
                    }
                }
            } catch (err) {
                console.error('Error fetching midea content:', err);
            }
        } catch (error) {
            console.error('Error fetching initial data:', error);
            showToast('Failed to load data', { type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const fetchCategoryContent = async (slug: string) => {
        if (!slug) {
            setBrandHero({
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
            setCategoryCTA({
                category_slug: '',
                title: '',
                description: '',
                bullets: '[]',
                button1_text: '',
                button1_link: '',
                button2_text: '',
                button2_link: '',
                is_active: 1
            });
            return;
        }

        try {
            const [heroRes, ctaRes] = await Promise.all([
                fetch(`/api/pages/shop/category-hero?category=${slug}`),
                fetch(`/api/pages/shop/category-cta?category=${slug}`)
            ]);

            const data = await heroRes.json();
            if (data?._id || data?.id) {
                setBrandHero({ ...data, id: data.id ?? data._id });
            } else {
                // Find category name from the categories list
                const catObj = categories.find(b => b.slug === slug);
                const catName = catObj?.name || slug.toUpperCase();

                // Autofill with global hero data as a starting point if no category-specific data exists
                setBrandHero({
                    brand_slug: slug,
                    badge_text: globalHero.badge_text || '',
                    tagline: globalHero.tagline || '',
                    title: `${catName} Air Conditioning`,
                    highlight_text: catName,
                    subtitle: globalHero.subtitle || '',
                    description: globalHero.description || '',
                    cta_text: globalHero.cta_text || '',
                    cta_link: globalHero.cta_link || '', cta2_text: globalHero.cta2_text || '',
                    cta2_link: globalHero.cta2_link || '', background_image: globalHero.background_image || '',
                    hero_image_alt: `${catName} Hero Image`,
                    display_order: 0,
                    is_active: 1
                });
            }

            const ctaData = await ctaRes.json();
            if (ctaData?._id || ctaData?.id) {
                setCategoryCTA({ ...ctaData, id: ctaData.id ?? ctaData._id });
            } else {
                setCategoryCTA({
                    category_slug: slug,
                    title: '',
                    description: '',
                    bullets: '[]',
                    button1_text: '',
                    button1_link: '',
                    button2_text: '',
                    button2_link: '',
                    is_active: 1
                });
            }
        } catch (error) {
            console.error('Error fetching category content:', error);
        }
    };

    const handleSaveGlobalHero = async () => {
        setSaving(true);
        try {
            // Save Hero
            const method = globalHero.id ? 'PUT' : 'POST';
            const res = await fetch('/api/pages/shop/hero', {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(globalHero)
            });

            // Save CTA - bullets are already a JSON string in state due to onChange handler
            const ctaRes = await fetch('/api/pages/shop/cta', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(shopCTA)
            });

            if (res.ok && ctaRes.ok) {
                const data = await res.json();
                if (method === 'POST') setGlobalHero({ ...globalHero, id: data.id });
                showToast('Global shop content updated', { type: 'success' });
            } else {
                throw new Error('Save failed');
            }
        } catch (error) {
            showToast('Failed to save global shop content', { type: 'error' });
        } finally {
            setSaving(false);
        }
    };

    const handleSaveCategoryHero = async () => {
        if (!selectedCategory) {
            showToast('Please select a category', { type: 'error' });
            return;
        }
        setSaving(true);
        try {
            const method = brandHero.id ? 'PUT' : 'POST';
            const res = await fetch('/api/pages/shop/category-hero', {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...brandHero, brand_slug: selectedCategory })
            });

            // Bullets are already a JSON string in state
            const ctaRes = await fetch('/api/pages/shop/category-cta', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...categoryCTA, category_slug: selectedCategory })
            });

            if (res.ok && ctaRes.ok) {
                const data = await res.json();
                if (method === 'POST') setBrandHero({ ...brandHero, id: data.id });
                showToast(`Content for ${selectedCategory} updated`, { type: 'success' });
            } else {
                throw new Error('Save failed');
            }
        } catch (error) {
            showToast('Failed to save category content', { type: 'error' });
        } finally {
            setSaving(false);
        }
    };

    // Save handler specifically for the dedicated /midea-ac hero
    const handleSaveMideaHero = async () => {
        setSaving(true);
        try {
            const method = mideaHero.id ? 'PUT' : 'POST';
            const res = await fetch('/api/pages/shop/category-hero', {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...mideaHero, brand_slug: 'midea' })
            });

            // Bullets are already a JSON string in state
            const ctaRes = await fetch('/api/pages/shop/category-cta', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...mideaCTA, category_slug: 'midea' })
            });

            if (res.ok && ctaRes.ok) {
                const data = await res.json();
                if (method === 'POST') setMideaHero({ ...mideaHero, id: data.id });
                showToast('Midea content updated', { type: 'success' });
            } else {
                throw new Error('Save failed');
            }
        } catch (error) {
            showToast('Failed to save Midea content', { type: 'error' });
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-8">Loading...</div>;

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-12">
            <div className="flex flex-col gap-2">
                <h1 className="text-2xl font-bold text-slate-900 font-display">Shop Management</h1>
                <p className="text-slate-500">Manage global and category-specific hero sections for the shop page.</p>
            </div>

            {/* Tabs */}
            <div role="tablist" aria-label="Shop editors" className="flex gap-3">
                <button role="tab" aria-selected={activeTab === 'global'} onClick={() => setActiveTab('global')} className={`px-4 py-2 rounded-lg font-bold ${activeTab === 'global' ? 'bg-primary text-white' : 'bg-white border border-slate-200 text-slate-700'}`}>
                    Global Shop
                </button>
                <button role="tab" aria-selected={activeTab === 'midea'} onClick={() => setActiveTab('midea')} className={`px-4 py-2 rounded-lg font-bold ${activeTab === 'midea' ? 'bg-primary text-white' : 'bg-white border border-slate-200 text-slate-700'}`}>
                    Midea AC
                </button>
                <button role="tab" aria-selected={activeTab === 'category'} onClick={() => setActiveTab('category')} className={`px-4 py-2 rounded-lg font-bold ${activeTab === 'category' ? 'bg-primary text-white' : 'bg-white border border-slate-200 text-slate-700'}`}>
                    Category Hero
                </button>
            </div>

            {/* Global Shop Section */}
            {activeTab === 'global' && (
                <div className="space-y-8">
                    {/* Global Hero Section */}
                    <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                        <div className="flex items-center justify-between mb-8 border-b border-slate-100 pb-4">
                            <div>
                                <h2 className="text-lg font-bold text-slate-800">Global Shop Hero</h2>
                                <p className="text-xs text-slate-400 mt-1 uppercase tracking-wider font-bold">Default content for the Shop page</p>
                            </div>
                            <button
                                onClick={handleSaveGlobalHero}
                                disabled={saving}
                                className="bg-primary text-white px-6 py-2 rounded-lg font-bold hover:bg-primary/90 disabled:opacity-50 transition-all shadow-lg shadow-primary/20"
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
                                        value={globalHero.badge_text}
                                        onChange={e => setGlobalHero({ ...globalHero, badge_text: e.target.value })}
                                        className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
                                        placeholder="e.g. Premium Quality"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 tracking-wide">Title</label>
                                    <input
                                        type="text"
                                        value={globalHero.title}
                                        onChange={e => setGlobalHero({ ...globalHero, title: e.target.value })}
                                        className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-bold"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 tracking-wide">Subtitle</label>
                                    <input
                                        type="text"
                                        value={globalHero.subtitle}
                                        onChange={e => setGlobalHero({ ...globalHero, subtitle: e.target.value })}
                                        className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-bold"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 tracking-wide">Highlight Text</label>
                                    <input
                                        type="text"
                                        value={globalHero.highlight_text}
                                        onChange={e => setGlobalHero({ ...globalHero, highlight_text: e.target.value })}
                                        className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-bold"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 tracking-wide">Description</label>
                                    <textarea
                                        value={globalHero.description}
                                        onChange={e => setGlobalHero({ ...globalHero, description: e.target.value })}
                                        className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all h-24 text-sm"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4 mt-3">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1 tracking-wide">Primary CTA Text</label>
                                        <input
                                            type="text"
                                            value={globalHero.cta_text}
                                            onChange={e => setGlobalHero({ ...globalHero, cta_text: e.target.value })}
                                            className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1 tracking-wide">Primary CTA Link</label>
                                        <input
                                            type="text"
                                            value={globalHero.cta_link}
                                            onChange={e => setGlobalHero({ ...globalHero, cta_link: e.target.value })}
                                            className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1 tracking-wide">Secondary CTA Text</label>
                                        <input
                                            type="text"
                                            value={globalHero.cta2_text}
                                            onChange={e => setGlobalHero({ ...globalHero, cta2_text: e.target.value })}
                                            className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1 tracking-wide">Secondary CTA Link</label>
                                        <input
                                            type="text"
                                            value={globalHero.cta2_link}
                                            onChange={e => setGlobalHero({ ...globalHero, cta2_link: e.target.value })}
                                            className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <ImageUploader
                                    value={globalHero.background_image}
                                    onChange={url => setGlobalHero({ ...globalHero, background_image: url })}
                                    folder="shop"
                                    label="Background Image"
                                    ratio="16:9"
                                />

                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1 mt-4 tracking-wide">Image Alt Text</label>
                                <input
                                    type="text"
                                    placeholder="Alt text for the hero image (accessibility)"
                                    value={globalHero.hero_image_alt}
                                    onChange={e => setGlobalHero({ ...globalHero, hero_image_alt: e.target.value })}
                                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
                                />

                                <div className="flex items-center gap-2 mt-6">
                                    <input
                                        type="checkbox"
                                        id="gh-active"
                                        checked={globalHero.is_active === 1}
                                        onChange={e => setGlobalHero({ ...globalHero, is_active: e.target.checked ? 1 : 0 })}
                                    />
                                    <label htmlFor="gh-active" className="text-sm font-bold text-slate-700">Hero Active</label>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Global Shop CTA Section */}
                    <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                        <div className="flex items-center justify-between mb-8 border-b border-slate-100 pb-4">
                            <div>
                                <h2 className="text-lg font-bold text-slate-800">Bottom CTA Section (Global Shop)</h2>
                                <p className="text-xs text-slate-400 mt-1 uppercase tracking-wider font-bold">Manage the call-to-action section at the bottom of the shop page</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 tracking-wide">CTA Title</label>
                                    <input
                                        type="text"
                                        value={shopCTA.title}
                                        onChange={e => setShopCTA({ ...shopCTA, title: e.target.value })}
                                        className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-bold"
                                        placeholder="Ready to experience ultimate comfort?"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 tracking-wide">CTA Description</label>
                                    <textarea
                                        value={shopCTA.description}
                                        onChange={e => setShopCTA({ ...shopCTA, description: e.target.value })}
                                        className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all h-24 text-sm"
                                        placeholder="Join thousands of satisfied customers who trust AC Vendor for their cooling needs."
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 tracking-wide">Bullet Points (one per line)</label>
                                    <textarea
                                        value={bulletsToLines(shopCTA.bullets)}
                                        onChange={e => setShopCTA({ ...shopCTA, bullets: linesToBullets(e.target.value) })}
                                        className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm h-32"
                                        placeholder={"Expert Installation\n24/7 Support\nGenuine Parts"}
                                    />
                                    <p className="text-[10px] text-slate-400 mt-1">Enter each point on a new line.</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 tracking-wide">Primary Button Text</label>
                                        <input
                                            type="text"
                                            value={shopCTA.button1_text}
                                            onChange={e => setShopCTA({ ...shopCTA, button1_text: e.target.value })}
                                            className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
                                            placeholder="Contact Us"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 tracking-wide">Primary Button Link</label>
                                        <input
                                            type="text"
                                            value={shopCTA.button1_link}
                                            onChange={e => setShopCTA({ ...shopCTA, button1_link: e.target.value })}
                                            className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
                                            placeholder="/contact"
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 tracking-wide">Secondary Button Text</label>
                                        <input
                                            type="text"
                                            value={shopCTA.button2_text}
                                            onChange={e => setShopCTA({ ...shopCTA, button2_text: e.target.value })}
                                            className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
                                            placeholder="See Products"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 tracking-wide">Secondary Button Link</label>
                                        <input
                                            type="text"
                                            value={shopCTA.button2_link}
                                            onChange={e => setShopCTA({ ...shopCTA, button2_link: e.target.value })}
                                            className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
                                            placeholder="/shop"
                                        />
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 mt-6 p-3 bg-slate-50 rounded-lg">
                                    <input
                                        type="checkbox"
                                        id="shop-cta-active"
                                        className="w-4 h-4 text-primary border-slate-300 rounded focus:ring-primary"
                                        checked={shopCTA.is_active === 1}
                                        onChange={e => setShopCTA({ ...shopCTA, is_active: e.target.checked ? 1 : 0 })}
                                    />
                                    <label htmlFor="shop-cta-active" className="text-sm font-bold text-slate-700 select-none cursor-pointer">Section is Active</label>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>
            )}

            {/* Dedicated Midea Section */}
            {activeTab === 'midea' && (
                <div className="space-y-8">
                    {/* Midea Hero Section */}
                    <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                        <div className="flex items-center justify-between mb-8 border-b border-slate-100 pb-4">
                            <div>
                                <h2 className="text-lg font-bold text-slate-800">Midea AC Page (Dedicated)</h2>
                                <p className="text-xs text-slate-400 mt-1 uppercase tracking-wider font-bold">Manage hero content specifically for <code>/midea-ac</code></p>
                            </div>
                            <button
                                onClick={handleSaveMideaHero}
                                disabled={saving}
                                className="bg-primary text-white px-6 py-2 rounded-lg font-bold hover:bg-primary/90 disabled:opacity-50 transition-all shadow-lg shadow-primary/20"
                            >
                                {saving ? 'Saving...' : 'Save Midea Content'}
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 tracking-wide">Badge Text</label>
                                    <input
                                        type="text"
                                        value={mideaHero.badge_text}
                                        onChange={e => setMideaHero({ ...mideaHero, badge_text: e.target.value })}
                                        className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
                                        placeholder="e.g. Authorized Partner"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 tracking-wide">Title</label>
                                    <input
                                        type="text"
                                        value={mideaHero.title}
                                        onChange={e => setMideaHero({ ...mideaHero, title: e.target.value })}
                                        className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-bold"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 tracking-wide">Subtitle</label>
                                    <input
                                        type="text"
                                        value={mideaHero.subtitle}
                                        onChange={e => setMideaHero({ ...mideaHero, subtitle: e.target.value })}
                                        className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-bold"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 tracking-wide">Highlight Text</label>
                                    <input
                                        type="text"
                                        value={mideaHero.highlight_text}
                                        onChange={e => setMideaHero({ ...mideaHero, highlight_text: e.target.value })}
                                        className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 tracking-wide">Description</label>
                                    <textarea
                                        value={mideaHero.description}
                                        onChange={e => setMideaHero({ ...mideaHero, description: e.target.value })}
                                        className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all h-24 text-sm"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4 mt-3">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1 tracking-wide">Primary CTA Text</label>
                                        <input
                                            type="text"
                                            value={mideaHero.cta_text}
                                            onChange={e => setMideaHero({ ...mideaHero, cta_text: e.target.value })}
                                            className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1 tracking-wide">Primary CTA Link</label>
                                        <input
                                            type="text"
                                            value={mideaHero.cta_link}
                                            onChange={e => setMideaHero({ ...mideaHero, cta_link: e.target.value })}
                                            className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1 tracking-wide">Secondary CTA Text</label>
                                        <input
                                            type="text"
                                            value={mideaHero.cta2_text}
                                            onChange={e => setMideaHero({ ...mideaHero, cta2_text: e.target.value })}
                                            className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1 tracking-wide">Secondary CTA Link</label>
                                        <input
                                            type="text"
                                            value={mideaHero.cta2_link}
                                            onChange={e => setMideaHero({ ...mideaHero, cta2_link: e.target.value })}
                                            className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <ImageUploader
                                    value={mideaHero.background_image}
                                    onChange={url => setMideaHero({ ...mideaHero, background_image: url })}
                                    folder="shop"
                                    label="Background Image"
                                    ratio="16:9"
                                />
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 tracking-wide">Display Order</label>
                                        <input
                                            type="number"
                                            value={mideaHero.display_order}
                                            onChange={e => setMideaHero({ ...mideaHero, display_order: parseInt(e.target.value) })}
                                            className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
                                        />
                                    </div>
                                    <div className="flex items-center gap-2 mt-6">
                                        <input
                                            type="checkbox"
                                            id="mh-active"
                                            checked={mideaHero.is_active === 1}
                                            onChange={e => setMideaHero({ ...mideaHero, is_active: e.target.checked ? 1 : 0 })}
                                        />
                                        <label htmlFor="mh-active" className="text-sm font-bold text-slate-700">Active</label>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Midea CTA Section */}
                    <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                        <div className="flex items-center justify-between mb-8 border-b border-slate-100 pb-4">
                            <div>
                                <h2 className="text-lg font-bold text-slate-800">Bottom CTA Section (Midea AC)</h2>
                                <p className="text-xs text-slate-400 mt-1 uppercase tracking-wider font-bold">Manage the call-to-action section specifically for the Midea page</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 tracking-wide">CTA Title</label>
                                    <input
                                        type="text"
                                        value={mideaCTA.title}
                                        onChange={e => setMideaCTA({ ...mideaCTA, title: e.target.value })}
                                        className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-bold"
                                        placeholder="Ready to experience ultimate comfort with Midea?"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 tracking-wide">CTA Description</label>
                                    <textarea
                                        value={mideaCTA.description}
                                        onChange={e => setMideaCTA({ ...mideaCTA, description: e.target.value })}
                                        className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all h-24 text-sm"
                                        placeholder="Discover the latest Midea cooling technology for your home."
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 tracking-wide">Bullet Points (one per line)</label>
                                    <textarea
                                        value={bulletsToLines(mideaCTA.bullets)}
                                        onChange={e => setMideaCTA({ ...mideaCTA, bullets: linesToBullets(e.target.value) })}
                                        className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm h-32"
                                        placeholder={"Energy Efficient\nSmart Control\nQuiet Operation"}
                                    />
                                    <p className="text-[10px] text-slate-400 mt-1">Enter each point on a new line.</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 tracking-wide">Primary Button Text</label>
                                        <input
                                            type="text"
                                            value={mideaCTA.button1_text}
                                            onChange={e => setMideaCTA({ ...mideaCTA, button1_text: e.target.value })}
                                            className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
                                            placeholder="View Midea Range"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 tracking-wide">Primary Button Link</label>
                                        <input
                                            type="text"
                                            value={mideaCTA.button1_link}
                                            onChange={e => setMideaCTA({ ...mideaCTA, button1_link: e.target.value })}
                                            className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
                                            placeholder="/midea-ac"
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 tracking-wide">Secondary Button Text</label>
                                        <input
                                            type="text"
                                            value={mideaCTA.button2_text}
                                            onChange={e => setMideaCTA({ ...mideaCTA, button2_text: e.target.value })}
                                            className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
                                            placeholder="Contact Us"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 tracking-wide">Secondary Button Link</label>
                                        <input
                                            type="text"
                                            value={mideaCTA.button2_link}
                                            onChange={e => setMideaCTA({ ...mideaCTA, button2_link: e.target.value })}
                                            className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
                                            placeholder="/contact"
                                        />
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 mt-6 p-3 bg-slate-50 rounded-lg">
                                    <input
                                        type="checkbox"
                                        id="midea-cta-active"
                                        className="w-4 h-4 text-primary border-slate-300 rounded focus:ring-primary"
                                        checked={mideaCTA.is_active === 1}
                                        onChange={e => setMideaCTA({ ...mideaCTA, is_active: e.target.checked ? 1 : 0 })}
                                    />
                                    <label htmlFor="midea-cta-active" className="text-sm font-bold text-slate-700 select-none cursor-pointer">Section is Active</label>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>
            )}

            {/* Category Hero Section */}
            {activeTab === 'category' && (
                <div className="space-y-8">
                    {/* Category Hero Selection */}
                    <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                        <div className="flex items-center justify-between mb-8 border-b border-slate-100 pb-4">
                            <div className="flex flex-col gap-1">
                                <h2 className="text-lg font-bold text-slate-800">{selectedCategory ? `${selectedCategory.toUpperCase()} Hero Section` : 'Category Hero Section'}</h2>
                                <p className="text-xs text-slate-400 mt-1 uppercase tracking-wider font-bold">Manage hero content for {selectedCategory ? `/shop/category/${selectedCategory}` : 'category-specific'} pages</p>
                                <div className="flex items-center gap-3 mt-3">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Select Category:</label>
                                    <select
                                        value={selectedCategory}
                                        onChange={(e) => {
                                            setSelectedCategory(e.target.value);
                                            fetchCategoryContent(e.target.value);
                                        }}
                                        className="px-3 py-1.5 border border-slate-200 rounded-lg bg-slate-50 text-sm font-bold text-slate-700"
                                    >
                                        <option value="">Select a Category</option>
                                        {categories.map((b) => <option key={b.id} value={b.slug}>{b.name}</option>)}
                                    </select>
                                </div>
                            </div>
                            <button
                                onClick={handleSaveCategoryHero}
                                disabled={saving || !selectedCategory}
                                className="bg-primary text-white px-6 py-2 rounded-lg font-bold hover:bg-primary/90 disabled:opacity-50 transition-all shadow-lg shadow-primary/20"
                            >
                                {saving ? 'Saving...' : 'Save Category Content'}
                            </button>
                        </div>

                        {!selectedCategory ? (
                            <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                                <span className="material-symbols-outlined text-4xl mb-2">category</span>
                                <p>Select a category to manage its unique hero content</p>
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
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 tracking-wide">Title</label>
                                        <input
                                            type="text"
                                            value={brandHero.title}
                                            onChange={e => setBrandHero({ ...brandHero, title: e.target.value })}
                                            className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-bold"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 tracking-wide">Subtitle</label>
                                        <input
                                            type="text"
                                            value={brandHero.subtitle}
                                            onChange={e => setBrandHero({ ...brandHero, subtitle: e.target.value })}
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
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 tracking-wide">Description</label>
                                        <textarea
                                            value={brandHero.description}
                                            onChange={e => setBrandHero({ ...brandHero, description: e.target.value })}
                                            className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all h-24 text-sm"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 mt-3">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1 tracking-wide">Primary CTA Text</label>
                                            <input
                                                type="text"
                                                value={brandHero.cta_text}
                                                onChange={e => setBrandHero({ ...brandHero, cta_text: e.target.value })}
                                                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1 tracking-wide">Primary CTA Link</label>
                                            <input
                                                type="text"
                                                value={brandHero.cta_link}
                                                onChange={e => setBrandHero({ ...brandHero, cta_link: e.target.value })}
                                                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 mt-3">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1 tracking-wide">Secondary CTA Text</label>
                                            <input
                                                type="text"
                                                value={brandHero.cta2_text || ''}
                                                onChange={e => setBrandHero({ ...brandHero, cta2_text: e.target.value })}
                                                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1 tracking-wide">Secondary CTA Link</label>
                                            <input
                                                type="text"
                                                value={brandHero.cta2_link || ''}
                                                onChange={e => setBrandHero({ ...brandHero, cta2_link: e.target.value })}
                                                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <ImageUploader
                                        value={brandHero.background_image}
                                        onChange={url => setBrandHero({ ...brandHero, background_image: url })}
                                        folder="shop"
                                        label="Background Image"
                                        ratio="16:9"
                                    />
                                    <div className="grid grid-cols-2 gap-4 mt-4">
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

                    {/* Category CTA Section */}
                    {selectedCategory && (
                        <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                            <div className="flex items-center justify-between mb-8 border-b border-slate-100 pb-4">
                                <div>
                                    <h2 className="text-lg font-bold text-slate-800">Bottom CTA Section ({selectedCategory.toUpperCase()})</h2>
                                    <p className="text-xs text-slate-400 mt-1 uppercase tracking-wider font-bold">Manage the call-to-action section at the bottom of the page</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 tracking-wide">CTA Title</label>
                                        <input
                                            type="text"
                                            value={categoryCTA.title}
                                            onChange={e => setCategoryCTA({ ...categoryCTA, title: e.target.value })}
                                            className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-bold"
                                            placeholder={`Premium ${selectedCategory} Solutions`}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 tracking-wide">CTA Description</label>
                                        <textarea
                                            value={categoryCTA.description}
                                            onChange={e => setCategoryCTA({ ...categoryCTA, description: e.target.value })}
                                            className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all h-24 text-sm"
                                            placeholder={`Explore the best ${selectedCategory} products for your needs.`}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 tracking-wide">Bullet Points (one per line)</label>
                                        <textarea
                                            value={bulletsToLines(categoryCTA.bullets)}
                                            onChange={e => setCategoryCTA({ ...categoryCTA, bullets: linesToBullets(e.target.value) })}
                                            className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm h-32"
                                            placeholder={"Expert Installation\nGenuine Parts\nWarranty Support"}
                                        />
                                        <p className="text-[10px] text-slate-400 mt-1">Enter each point on a new line.</p>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 tracking-wide">Primary Button Text</label>
                                            <input
                                                type="text"
                                                value={categoryCTA.button1_text}
                                                onChange={e => setCategoryCTA({ ...categoryCTA, button1_text: e.target.value })}
                                                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
                                                placeholder="View More"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 tracking-wide">Primary Button Link</label>
                                            <input
                                                type="text"
                                                value={categoryCTA.button1_link}
                                                onChange={e => setCategoryCTA({ ...categoryCTA, button1_link: e.target.value })}
                                                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
                                                placeholder={`/shop/category/${selectedCategory}`}
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 tracking-wide">Secondary Button Text</label>
                                            <input
                                                type="text"
                                                value={categoryCTA.button2_text}
                                                onChange={e => setCategoryCTA({ ...categoryCTA, button2_text: e.target.value })}
                                                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
                                                placeholder="Contact Us"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 tracking-wide">Secondary Button Link</label>
                                            <input
                                                type="text"
                                                value={categoryCTA.button2_link}
                                                onChange={e => setCategoryCTA({ ...categoryCTA, button2_link: e.target.value })}
                                                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
                                                placeholder="/contact"
                                            />
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 mt-6 p-3 bg-slate-50 rounded-lg">
                                        <input
                                            type="checkbox"
                                            id="cat-cta-active"
                                            className="w-4 h-4 text-primary border-slate-300 rounded focus:ring-primary"
                                            checked={categoryCTA.is_active === 1}
                                            onChange={e => setCategoryCTA({ ...categoryCTA, is_active: e.target.checked ? 1 : 0 })}
                                        />
                                        <label htmlFor="cat-cta-active" className="text-sm font-bold text-slate-700 select-none cursor-pointer">Section is Active</label>
                                    </div>
                                </div>
                            </div>
                        </section>
                    )}
                </div>
            )}
        </div>
    );
}
