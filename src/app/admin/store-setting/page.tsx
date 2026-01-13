"use client";

import { useEffect, useState, useRef } from "react";
import { showToast } from '@/components/Toast';

export default function StoreSettingPage() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [formData, setFormData] = useState({
        storeName: "",
        storeDescription: "",
        contactEmail: "",
        contactPhone: "",
        address: "",
        facebook: "",
        twitter: "",
        instagram: "",
        linkedin: "",
        metaTitle: "",
        metaDescription: "",
        metaKeywords: "",
        logo: "",
        logoSize: "small",
        favicon: "",
        footerLogo: "",
        theme: "default",
        hideSiteNameOnMobile: false,
        hideSiteName: false,
        pan: "",
        authorizedPerson: "",
    });

    // Theme select UI state
    const [themeOpen, setThemeOpen] = useState(false);
    const themeRef = useRef<HTMLDivElement | null>(null);


    // Preset themes for quick selection (colors mirror globals.css variables)
    const presetThemes = [
        { id: 'default', name: 'Default', colors: { primary: '#293a6f', background: '#f8fafc', card: '#ffffff' } },
        { id: 'ocean', name: 'Ocean', colors: { primary: '#0ea5a4', background: '#ecfeff', card: '#ffffff' } },
        { id: 'corporate', name: 'Corporate', colors: { primary: '#0f172a', background: '#f8fafc', card: '#ffffff' } },
        { id: 'sunset', name: 'Sunset', colors: { primary: '#ff6b6b', background: '#fff7f5', card: '#fff1f0' } },
        { id: 'forest', name: 'Forest', colors: { primary: '#16a34a', background: '#f0fff5', card: '#ffffff' } },
        { id: 'lavender', name: 'Lavender', colors: { primary: '#7c3aed', background: '#fbf5ff', card: '#ffffff' } },
        { id: 'minimal', name: 'Minimal', colors: { primary: '#293a6f', background: '#ffffff', card: '#ffffff' } },
    ];

    useEffect(() => {
        const load = async () => {
            try {
                const resStore = await fetch('/api/store-settings', { cache: 'no-store' });
                const jsonStore = await resStore.json();

                if (jsonStore?.success && jsonStore.data) {
                    const d = jsonStore.data;
                    setFormData({
                        storeName: d.storeName || "",
                        storeDescription: d.storeDescription || "",
                        contactEmail: d.contactEmail || "",
                        contactPhone: d.contactPhone || "",
                        address: d.address || "",
                        facebook: d.facebook || "",
                        twitter: d.twitter || "",
                        instagram: d.instagram || "",
                        linkedin: d.linkedin || "",
                        metaTitle: d.metaTitle || "",
                        metaDescription: d.metaDescription || "",
                        metaKeywords: d.metaKeywords || "",
                        logo: d.storeLogo || "",
                        logoSize: d.logoSize || "small",
                        favicon: d.favicon || "",
                        footerLogo: d.footer_logo || "",
                        theme: d.theme || "default",
                        hideSiteNameOnMobile: !!d.hideSiteNameOnMobile,
                        hideSiteName: !!d.hideSiteName,
                        pan: d.pan || "",
                        authorizedPerson: d.authorizedPerson || "",
                    });
                }


            } catch (e) {
                console.error('Failed to load settings/themes', e);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    // Apply live preview of selected theme while on the admin page
    useEffect(() => {
        if (typeof document === 'undefined') return;
        const html = document.documentElement;
        const body = document.body;

        const removeThemeClasses = (el: Element) => {
            Array.from(el.classList)
                .filter((c) => c.startsWith('theme-'))
                .forEach((c) => el.classList.remove(c));
        };

        // Clear previous state
        removeThemeClasses(html);
        removeThemeClasses(body);

        // Apply selected theme class to body and html
        body.classList.add(`theme-${formData.theme}`);
        html.classList.add(`theme-${formData.theme}`);

        // Close the dropup if open when theme changes externally
        setThemeOpen(false);

        return () => {
            // cleanup
            removeThemeClasses(html);
            removeThemeClasses(body);
        };
    }, [formData.theme]);

    // Close dropup when clicking outside
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (!themeRef.current) return;
            if (!themeRef.current.contains(e.target as Node)) {
                setThemeOpen(false);
            }
        };
        if (themeOpen) {
            document.addEventListener('mousedown', handler);
        }
        return () => document.removeEventListener('mousedown', handler);
    }, [themeOpen]);



    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const payload = {
                storeName: formData.storeName,
                storeDescription: formData.storeDescription,
                storeLogo: formData.logo,
                logoSize: formData.logoSize,
                favicon: formData.favicon,
                footer_logo: formData.footerLogo,
                contactEmail: formData.contactEmail,
                contactPhone: formData.contactPhone,
                address: formData.address,
                facebook: formData.facebook,
                twitter: formData.twitter,
                instagram: formData.instagram,
                linkedin: formData.linkedin,
                metaTitle: formData.metaTitle,
                metaDescription: formData.metaDescription,
                metaKeywords: formData.metaKeywords,
                theme: formData.theme,
                hideSiteNameOnMobile: !!formData.hideSiteNameOnMobile,
                hideSiteName: !!formData.hideSiteName,
                pan: formData.pan,
                authorizedPerson: formData.authorizedPerson,
            };
            const res = await fetch('/api/store-settings', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            const json = await res.json();
            if (!res.ok || !json?.success) {
                throw new Error(json?.error || 'Failed to save');
            }
            showToast('Settings saved successfully', { type: 'success' });
            // Reload to apply theme/site-wide changes immediately
            window.location.reload();
        } catch (e: any) {
            console.error('Save failed', e);
            showToast(e.message || 'Failed to save', { type: 'error' });
        } finally {
            setSaving(false);
        }
    };

    return (
        <main className="flex-1 flex flex-col">
            <div className="flex-1 p-8 overflow-y-auto">
                <div className="max-w-5xl mx-auto">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-slate-900">Store Settings</h1>
                        <p className="text-slate-500 mt-1">Manage your store information, contact details, and preferences.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {loading && (
                            <div className="text-slate-500">Loading current settings…</div>
                        )}
                        {/* General Information */}
                        <div className="bg-white rounded-lg shadow-sm border border-slate-200">
                            <div className="px-6 py-4 border-b border-slate-200">
                                <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                                    <span className="material-symbols-outlined">store</span>
                                    General Information
                                </h2>
                            </div>
                            <div className="p-6 space-y-6">
                                <div>
                                    <label htmlFor="storeName" className="block text-sm font-medium text-slate-700 mb-2">
                                        Store Name
                                    </label>
                                    <input
                                        type="text"
                                        id="storeName"
                                        value={formData.storeName}
                                        onChange={(e) => setFormData({ ...formData, storeName: e.target.value })}
                                        className="w-full px-4 py-2 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-primary focus:border-primary"
                                        placeholder="Enter store name"
                                        required
                                    />

                                    <div className="mt-3 flex flex-col gap-2">
                                        <label className="flex items-center gap-2 text-sm">
                                            <input
                                                type="checkbox"
                                                checked={!!formData.hideSiteNameOnMobile}
                                                onChange={(e) => setFormData({ ...formData, hideSiteNameOnMobile: e.target.checked })}
                                                className="h-4 w-4 rounded border-slate-300"
                                            />
                                            <span className="text-slate-700">Hide site name on mobile</span>
                                        </label>

                                        <label className="flex items-center gap-2 text-sm">
                                            <input
                                                type="checkbox"
                                                checked={!!formData.hideSiteName}
                                                onChange={(e) => setFormData({ ...formData, hideSiteName: e.target.checked })}
                                                className="h-4 w-4 rounded border-slate-300"
                                            />
                                            <span className="text-slate-700">Remove site name (hide on all screens)</span>
                                        </label>

                                        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <label className="flex flex-col gap-2 text-sm">
                                                <span className="text-sm font-medium text-slate-700">Authorized Signatory (Optional)</span>
                                                <input type="text" value={formData.authorizedPerson} onChange={(e) => setFormData({ ...formData, authorizedPerson: e.target.value })} className="w-full px-3 py-2 border rounded" placeholder="e.g. John Doe" />
                                            </label>

                                            <label className="flex flex-col gap-2 text-sm">
                                                <span className="text-sm font-medium text-slate-700">PAN (Tax ID)</span>
                                                <input type="text" value={formData.pan} onChange={(e) => setFormData({ ...formData, pan: e.target.value })} className="w-full px-3 py-2 border rounded" placeholder="e.g. 601234567" />
                                            </label>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="storeDescription" className="block text-sm font-medium text-slate-700 mb-2">
                                        Store Description
                                    </label>
                                    <textarea
                                        id="storeDescription"
                                        rows={3}
                                        value={formData.storeDescription}
                                        onChange={(e) => setFormData({ ...formData, storeDescription: e.target.value })}
                                        className="w-full px-4 py-2 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-primary focus:border-primary"
                                        placeholder="Brief description of your store"
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label htmlFor="logo" className="block text-sm font-medium text-slate-700 mb-2">
                                            Store Logo
                                        </label>
                                        <div className="flex items-center gap-4">
                                            <div className="flex-1">
                                                <input
                                                    type="file"
                                                    id="logo"
                                                    accept="image/*"
                                                    onChange={async (e) => {
                                                        const file = e.target.files?.[0];
                                                        if (file) {
                                                            try {
                                                                const fd = new FormData();
                                                                fd.append('file', file);
                                                                fd.append('folder', 'logos');
                                                                const res = await fetch('/api/upload', { method: 'POST', body: fd });
                                                                const json = await res.json();
                                                                if (!res.ok || !json?.url) throw new Error(json?.error || 'Upload failed');
                                                                setFormData({ ...formData, logo: json.url });
                                                            } catch (err: any) {
                                                                console.error('Logo upload failed', err);
                                                                showToast(err.message || 'Logo upload failed', { type: 'error' });
                                                            }
                                                        }
                                                    }}
                                                    className="w-full px-4 py-2 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-primary focus:border-primary file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary-800"
                                                />
                                            </div>
                                            {formData.logo && (
                                                <img src={formData.logo} alt="Logo preview" className="w-16 h-16 object-contain border border-slate-200 rounded-lg" />
                                            )}
                                        </div>

                                        <div>
                                            <label htmlFor="logoSize" className="block text-sm font-medium text-slate-700 mb-2">
                                                Logo Size
                                            </label>
                                            <select
                                                id="logoSize"
                                                value={formData.logoSize}
                                                onChange={(e) => setFormData({ ...formData, logoSize: e.target.value })}
                                                className="w-full px-4 py-2 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-primary focus:border-primary"
                                            >
                                                <option value="small">Small (32px height)</option>
                                                <option value="medium">Medium (48px height)</option>
                                                <option value="large">Large (64px height)</option>
                                            </select>
                                        </div>
                                    </div>



                                    <div>
                                        <label htmlFor="favicon" className="block text-sm font-medium text-slate-700 mb-2">
                                            Favicon
                                        </label>
                                        <div className="flex items-center gap-4">
                                            <div className="flex-1">
                                                <input
                                                    type="file"
                                                    id="favicon"
                                                    accept="image/*"
                                                    onChange={async (e) => {
                                                        const file = e.target.files?.[0];
                                                        if (file) {
                                                            try {
                                                                const fd = new FormData();
                                                                fd.append('file', file);
                                                                fd.append('folder', 'favicons');
                                                                const res = await fetch('/api/upload', { method: 'POST', body: fd });
                                                                const json = await res.json();
                                                                if (!res.ok || !json?.url) throw new Error(json?.error || 'Upload failed');
                                                                setFormData({ ...formData, favicon: json.url });
                                                            } catch (err: any) {
                                                                console.error('Favicon upload failed', err);
                                                                showToast(err.message || 'Favicon upload failed', { type: 'error' });
                                                            }
                                                        }
                                                    }}
                                                    className="w-full px-4 py-2 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-primary focus:border-primary file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary-800"
                                                />
                                            </div>
                                            {formData.favicon && (
                                                <img src={formData.favicon} alt="Favicon preview" className="w-8 h-8 object-contain border border-slate-200 rounded-lg" />
                                            )}
                                        </div>
                                    </div>

                                    <div>
                                        <label htmlFor="footerLogo" className="block text-sm font-medium text-slate-700 mb-2">
                                            Footer Logo (Optional)
                                        </label>
                                        <div className="flex items-center gap-4">
                                            <div className="flex-1">
                                                <input
                                                    type="file"
                                                    id="footerLogo"
                                                    accept="image/*"
                                                    onChange={async (e) => {
                                                        const file = e.target.files?.[0];
                                                        if (file) {
                                                            try {
                                                                const fd = new FormData();
                                                                fd.append('file', file);
                                                                fd.append('folder', 'logos');
                                                                const res = await fetch('/api/upload', { method: 'POST', body: fd });
                                                                const json = await res.json();
                                                                if (!res.ok || !json?.url) throw new Error(json?.error || 'Upload failed');
                                                                setFormData({ ...formData, footerLogo: json.url });
                                                            } catch (err: any) {
                                                                console.error('Footer logo upload failed', err);
                                                                showToast(err.message || 'Footer logo upload failed', { type: 'error' });
                                                            }
                                                        }
                                                    }}
                                                    className="w-full px-4 py-2 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-primary focus:border-primary file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary-800"
                                                />
                                            </div>
                                            {formData.footerLogo && (
                                                <img src={formData.footerLogo} alt="Footer logo preview" className="w-16 h-16 object-contain border border-slate-200 rounded-lg" />
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Contact Information */}
                        <div className="bg-white rounded-lg shadow-sm border border-slate-200">
                            <div className="px-6 py-4 border-b border-slate-200">
                                <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                                    <span className="material-symbols-outlined">contact_mail</span>
                                    Contact Information
                                </h2>
                            </div>
                            <div className="p-6 space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label htmlFor="contactEmail" className="block text-sm font-medium text-slate-700 mb-2">
                                            Contact Email
                                        </label>
                                        <input
                                            type="email"
                                            id="contactEmail"
                                            value={formData.contactEmail}
                                            onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                                            className="w-full px-4 py-2 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-primary focus:border-primary"
                                            placeholder="contact@example.com"
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="contactPhone" className="block text-sm font-medium text-slate-700 mb-2">
                                            Contact Phone
                                        </label>
                                        <input
                                            type="tel"
                                            id="contactPhone"
                                            value={formData.contactPhone}
                                            onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                                            className="w-full px-4 py-2 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-primary focus:border-primary"
                                            placeholder="+1 234 567 8900"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="address" className="block text-sm font-medium text-slate-700 mb-2">
                                        Address
                                    </label>
                                    <textarea
                                        id="address"
                                        rows={2}
                                        value={formData.address}
                                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                        className="w-full px-4 py-2 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-primary focus:border-primary"
                                        placeholder="Street address, City, State, Zip"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Social Media Links */}
                        <div className="bg-white rounded-lg shadow-sm border border-slate-200">
                            <div className="px-6 py-4 border-b border-slate-200">
                                <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                                    <span className="material-symbols-outlined">share</span>
                                    Social Media Links
                                </h2>
                            </div>
                            <div className="p-6 space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label htmlFor="facebook" className="block text-sm font-medium text-slate-700 mb-2">
                                            Facebook
                                        </label>
                                        <input
                                            type="url"
                                            id="facebook"
                                            value={formData.facebook}
                                            onChange={(e) => setFormData({ ...formData, facebook: e.target.value })}
                                            className="w-full px-4 py-2 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-primary focus:border-primary"
                                            placeholder="https://facebook.com/yourpage"
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="twitter" className="block text-sm font-medium text-slate-700 mb-2">
                                            Twitter
                                        </label>
                                        <input
                                            type="url"
                                            id="twitter"
                                            value={formData.twitter}
                                            onChange={(e) => setFormData({ ...formData, twitter: e.target.value })}
                                            className="w-full px-4 py-2 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-primary focus:border-primary"
                                            placeholder="https://twitter.com/yourhandle"
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="instagram" className="block text-sm font-medium text-slate-700 mb-2">
                                            Instagram
                                        </label>
                                        <input
                                            type="url"
                                            id="instagram"
                                            value={formData.instagram}
                                            onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
                                            className="w-full px-4 py-2 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-primary focus:border-primary"
                                            placeholder="https://instagram.com/yourprofile"
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="linkedin" className="block text-sm font-medium text-slate-700 mb-2">
                                            LinkedIn
                                        </label>
                                        <input
                                            type="url"
                                            id="linkedin"
                                            value={formData.linkedin}
                                            onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                                            className="w-full px-4 py-2 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-primary focus:border-primary"
                                            placeholder="https://linkedin.com/company/yourcompany"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* SEO Settings */}
                        <div className="bg-white rounded-lg shadow-sm border border-slate-200">
                            <div className="px-6 py-4 border-b border-slate-200">
                                <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                                    <span className="material-symbols-outlined">search</span>
                                    SEO Settings
                                </h2>
                            </div>
                            <div className="p-6 space-y-6">
                                <div>
                                    <label htmlFor="metaTitle" className="block text-sm font-medium text-slate-700 mb-2">
                                        Meta Title
                                    </label>
                                    <input
                                        type="text"
                                        id="metaTitle"
                                        value={formData.metaTitle}
                                        onChange={(e) => setFormData({ ...formData, metaTitle: e.target.value })}
                                        className="w-full px-4 py-2 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-primary focus:border-primary"
                                        placeholder="Page title for search engines"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="metaDescription" className="block text-sm font-medium text-slate-700 mb-2">
                                        Meta Description
                                    </label>
                                    <textarea
                                        id="metaDescription"
                                        rows={3}
                                        value={formData.metaDescription}
                                        onChange={(e) => setFormData({ ...formData, metaDescription: e.target.value })}
                                        className="w-full px-4 py-2 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-primary focus:border-primary"
                                        placeholder="Brief description for search engines"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="metaKeywords" className="block text-sm font-medium text-slate-700 mb-2">
                                        Meta Keywords
                                    </label>
                                    <input
                                        type="text"
                                        id="metaKeywords"
                                        value={formData.metaKeywords}
                                        onChange={(e) => setFormData({ ...formData, metaKeywords: e.target.value })}
                                        className="w-full px-4 py-2 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-primary focus:border-primary"
                                        placeholder="keyword1, keyword2, keyword3"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Theme Management */}
                        <div className="bg-white rounded-lg shadow-sm border border-slate-200">
                            <div className="px-6 py-4 border-b border-slate-200">
                                <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                                    <span className="material-symbols-outlined">palette</span>
                                    Theme Management
                                </h2>
                            </div>
                            <div className="p-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">Active Theme</label>
                                        <div className="flex items-center gap-4">
                                            <div className="relative w-full" ref={themeRef}>
                                                <button
                                                    type="button"
                                                    aria-expanded={themeOpen}
                                                    onClick={() => setThemeOpen((s) => !s)}
                                                    onKeyDown={(e) => { if (e.key === 'Escape') setThemeOpen(false); }}
                                                    className="w-full text-left px-4 py-2 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-primary focus:border-primary flex items-center justify-between"
                                                >
                                                    <span>{formData.theme.charAt(0).toUpperCase() + formData.theme.slice(1)}</span>
                                                    <span className="material-symbols-outlined">{themeOpen ? 'arrow_drop_up' : 'arrow_drop_down'}</span>
                                                </button>

                                                {themeOpen && (
                                                    <ul
                                                        role="listbox"
                                                        aria-label="Theme options"
                                                        className="absolute right-0 bottom-full mb-2 w-full bg-white border border-slate-200 rounded-md shadow-lg z-50 max-h-60 overflow-auto"
                                                    >
                                                        {['default', 'ocean', 'corporate', 'forest', 'sunset', 'lavender', 'minimal'].map((t) => (
                                                            <li
                                                                key={t}
                                                                role="option"
                                                                aria-selected={formData.theme === t}
                                                                onClick={() => { setFormData({ ...formData, theme: t }); setThemeOpen(false); }}
                                                                className={`px-4 py-2 cursor-pointer hover:bg-slate-50 ${formData.theme === t ? 'bg-slate-100 font-semibold' : ''}`}
                                                            >
                                                                {t.charAt(0).toUpperCase() + t.slice(1)}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                )}
                                            </div>

                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-md border" style={{ background: 'var(--color-primary)' }} aria-hidden></div>
                                                <div className="w-10 h-10 rounded-md border" style={{ background: 'var(--color-card)', boxShadow: '0 1px 0 rgba(0,0,0,0.04)' }} aria-hidden></div>
                                                <div className="px-2 py-1 rounded text-sm border" style={{ color: 'var(--color-text)', background: 'transparent' }}>Aa</div>
                                            </div>
                                        </div>



                                        <div className="mt-4 text-sm text-slate-500">Choose a preset theme above and click Save Settings to apply it site-wide.</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Additional Settings moved to Footer Manager */}

                        {/* Action Buttons */}
                        <div className="flex items-center justify-end gap-3 pb-8">
                            <button
                                type="button"
                                onClick={() => window.location.reload()}
                                className="px-6 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-500"
                            >
                                Reset
                            </button>
                            <button
                                type="submit"
                                disabled={saving}
                                className="bg-primary text-white px-6 py-2 rounded-lg flex items-center gap-2 font-medium hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-60"
                            >
                                <span className="material-symbols-outlined text-lg">save</span>
                                {saving ? 'Saving…' : 'Save Settings'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </main>
    );
}
