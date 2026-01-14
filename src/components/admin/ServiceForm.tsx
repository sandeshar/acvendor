"use client";

import { useState, useEffect } from "react";
import ImageUploader from '@/components/shared/ImageUploader';
import IconSelector from "@/components/admin/IconSelector";
import RichTextEditor from "@/components/admin/RichTextEditor";
import { showToast } from '@/components/Toast';
import { isValidSlug, normalizeSlug } from "@/utils/slug";

interface ServiceFormProps {
    initialData?: any;
    categories: any[];
    subcategories: any[];
    onSave: (data: any) => Promise<void>;
    onDelete?: () => Promise<void>;
    saving: boolean;
    isNew: boolean;
}

export default function ServiceForm({
    initialData,
    categories,
    subcategories,
    onSave,
    onDelete,
    saving,
    isNew
}: ServiceFormProps) {
    const [service, setService] = useState<any>({
        title: "",
        slug: "",
        icon: "design_services",
        description: "",
        excerpt: "",
        content: "",
        thumbnail: "",
        image: "",
        image_alt: "",
        statusId: 1,
        category_id: null,
        subcategory_id: null,
        price: "",
        currency: "NPR",
        price_type: "fixed",
        price_label: "",
        price_description: "",
        metaTitle: "",
        metaDescription: "",
        bullets: [],
        ...initialData
    });

    const [openSections, setOpenSections] = useState({
        details: true,
        pricing: true,
        content: true,
        seo: false,
        bullets: false,
    });

    const toggleSection = (section: keyof typeof openSections) => {
        setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
    };

    const updateItem = (field: string, value: any) => {
        setService((prev: any) => ({ ...prev, [field]: value }));
    };

    const addBullet = () => {
        const bullets = [...(service.bullets || [])];
        bullets.push("");
        updateItem('bullets', bullets);
    };

    const updateBullet = (index: number, value: string) => {
        const bullets = [...(service.bullets || [])];
        bullets[index] = value;
        updateItem('bullets', bullets);
    };

    const removeBullet = (index: number) => {
        const bullets = [...(service.bullets || [])];
        bullets.splice(index, 1);
        updateItem('bullets', bullets);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!service.title || !service.slug) {
            showToast('Title and Slug are required', { type: 'error' });
            return;
        }

        if (service.slug && !isValidSlug(service.slug)) {
            showToast('Invalid slug format. Use only letters, numbers, hyphens and underscores.', { type: 'error' });
            return;
        }

        await onSave(service);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 max-w-5xl mx-auto pb-20">
            {/* Header / Actions */}
            <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-slate-200 shadow-sm sticky top-0 z-10">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary-50 rounded-lg flex items-center justify-center">
                        <span className="material-symbols-outlined text-primary">
                            {service.icon || "design_services"}
                        </span>
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-slate-900">
                            {isNew ? "Create New Service" : "Edit Service"}
                        </h1>
                        <p className="text-xs text-slate-500">{service.slug || 'no-slug'}</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    {!isNew && onDelete && (
                        <button
                            type="button"
                            onClick={onDelete}
                            className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg text-sm font-medium transition-colors border border-red-200"
                        >
                            Delete
                        </button>
                    )}
                    <button
                        type="submit"
                        disabled={saving}
                        className="bg-primary hover:bg-primary-800 text-white px-6 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 disabled:opacity-50 shadow-sm"
                    >
                        {saving ? (
                            <>
                                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Saving...
                            </>
                        ) : (
                            <>
                                <span className="material-symbols-outlined text-[18px]">save</span>
                                Save Service
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Collapsible Sections */}

            {/* 1. Basic Details */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <button
                    type="button"
                    onClick={() => toggleSection('details')}
                    className="w-full px-6 py-4 flex items-center justify-between bg-slate-50/50 hover:bg-slate-50 transition-colors border-b border-slate-100"
                >
                    <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary">info</span>
                        <span className="font-semibold text-slate-700">Basic Details</span>
                    </div>
                    <span className={`material-symbols-outlined transition-transform ${openSections.details ? 'rotate-180' : ''}`}>
                        expand_more
                    </span>
                </button>

                {openSections.details && (
                    <div className="p-6 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
                                    <input
                                        type="text"
                                        value={service.title}
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            updateItem('title', val);
                                            if (isNew) updateItem('slug', normalizeSlug(val));
                                        }}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                                        placeholder="e.g. AC Installation"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Slug</label>
                                    <input
                                        type="text"
                                        value={service.slug}
                                        onChange={(e) => updateItem('slug', e.target.value)}
                                        className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary ${service.slug && !isValidSlug(service.slug) ? 'border-red-500' : 'border-slate-300'}`}
                                        placeholder="ac-installation"
                                        required
                                    />
                                    {service.slug && !isValidSlug(service.slug) && (
                                        <p className="text-[10px] text-red-500 mt-1">Invalid slug. Use only letters, numbers, hyphens and underscores.</p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Icon</label>
                                    <IconSelector
                                        value={service.icon}
                                        onChange={(v: string) => updateItem('icon', v)}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Category (Optional)</label>
                                        <select
                                            value={service.category_id || ''}
                                            onChange={(e) => updateItem('category_id', e.target.value || null)}
                                            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                                        >
                                            <option value="">No Category</option>
                                            {categories.map((cat: any) => (
                                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Subcategory (Optional)</label>
                                        <select
                                            value={service.subcategory_id || ''}
                                            onChange={(e) => updateItem('subcategory_id', e.target.value || null)}
                                            disabled={!service.category_id}
                                            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
                                        >
                                            <option value="">No Subcategory</option>
                                            {subcategories
                                                .filter((sub: any) => String(sub.category_id) === String(service.category_id))
                                                .map((sub: any) => (
                                                    <option key={sub.id} value={sub.id}>{sub.name}</option>
                                                ))
                                            }
                                        </select>
                                    </div>
                                </div>
                                {!isNew && (
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                                        <select
                                            value={service.statusId}
                                            onChange={(e) => updateItem('statusId', Number(e.target.value))}
                                            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                                        >
                                            <option value={1}>Draft</option>
                                            <option value={2}>Published</option>
                                            <option value={3}>In Review</option>
                                        </select>
                                    </div>
                                )}
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <ImageUploader
                                        label="Service Image"
                                        value={service.image || service.thumbnail || ''}
                                        onChange={(url: string) => {
                                            updateItem('image', url);
                                            updateItem('thumbnail', url);
                                        }}
                                        folder="services"
                                        ratio="4:3"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Image Alt Text</label>
                                    <input
                                        type="text"
                                        value={service.image_alt}
                                        onChange={(e) => updateItem('image_alt', e.target.value)}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                                        placeholder="Installation process image"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* 2. Pricing */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <button
                    type="button"
                    onClick={() => toggleSection('pricing')}
                    className="w-full px-6 py-4 flex items-center justify-between bg-slate-50/50 hover:bg-slate-50 transition-colors border-b border-slate-100"
                >
                    <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary">payments</span>
                        <span className="font-semibold text-slate-700">Pricing Information</span>
                    </div>
                    <span className={`material-symbols-outlined transition-transform ${openSections.pricing ? 'rotate-180' : ''}`}>
                        expand_more
                    </span>
                </button>

                {openSections.pricing && (
                    <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Price</label>
                                <input
                                    type="text"
                                    value={service.price || ''}
                                    onChange={(e) => updateItem('price', e.target.value)}
                                    placeholder="e.g. 500.00"
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Currency</label>
                                <select
                                    value={service.currency || 'NPR'}
                                    onChange={(e) => updateItem('currency', e.target.value)}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                                >
                                    <option value="NPR">NPR (Rs.)</option>
                                    <option value="USD">USD ($)</option>
                                    <option value="INR">INR (₹)</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Price Type</label>
                                <select
                                    value={service.price_type || 'fixed'}
                                    onChange={(e) => updateItem('price_type', e.target.value)}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                                >
                                    <option value="fixed">Fixed</option>
                                    <option value="starting">Starting At</option>
                                    <option value="hourly">Hourly</option>
                                    <option value="custom">Custom</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Price Label</label>
                                <input
                                    type="text"
                                    value={service.price_label || ''}
                                    onChange={(e) => updateItem('price_label', e.target.value)}
                                    placeholder="e.g. Per unit"
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-slate-700 mb-1">Price Description</label>
                                <textarea
                                    value={service.price_description || ''}
                                    onChange={(e) => updateItem('price_description', e.target.value)}
                                    rows={1}
                                    placeholder="e.g. Pricing varies by scope and deliverables."
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                                />
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* 3. Post Content */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <button
                    type="button"
                    onClick={() => toggleSection('content')}
                    className="w-full px-6 py-4 flex items-center justify-between bg-slate-50/50 hover:bg-slate-50 transition-colors border-b border-slate-100"
                >
                    <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary">article</span>
                        <span className="font-semibold text-slate-700">Service Content</span>
                    </div>
                    <span className={`material-symbols-outlined transition-transform ${openSections.content ? 'rotate-180' : ''}`}>
                        expand_more
                    </span>
                </button>

                {openSections.content && (
                    <div className="p-6 space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Short Excerpt</label>
                            <textarea
                                value={service.excerpt || service.description || ''}
                                onChange={(e) => {
                                    updateItem('excerpt', e.target.value);
                                    updateItem('description', e.target.value);
                                }}
                                rows={3}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                                placeholder="Brief summary of the service..."
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Full Description</label>
                            <RichTextEditor
                                value={service.content}
                                onChange={(v: string) => updateItem('content', v)}
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* 4. SEO */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <button
                    type="button"
                    onClick={() => toggleSection('seo')}
                    className="w-full px-6 py-4 flex items-center justify-between bg-slate-50/50 hover:bg-slate-50 transition-colors border-b border-slate-100"
                >
                    <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary">search</span>
                        <span className="font-semibold text-slate-700">SEO Settings</span>
                    </div>
                    <span className={`material-symbols-outlined transition-transform ${openSections.seo ? 'rotate-180' : ''}`}>
                        expand_more
                    </span>
                </button>

                {openSections.seo && (
                    <div className="p-6 space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Meta Title</label>
                            <input
                                type="text"
                                value={service.metaTitle}
                                onChange={(e) => updateItem('metaTitle', e.target.value)}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                                placeholder="SEO Title"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Meta Description</label>
                            <textarea
                                value={service.metaDescription}
                                onChange={(e) => updateItem('metaDescription', e.target.value)}
                                rows={3}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                                placeholder="SEO Description"
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* 5. Bullet Points */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div
                    role="button"
                    tabIndex={0}
                    onClick={() => toggleSection('bullets')}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleSection('bullets'); } }}
                    className="w-full px-6 py-4 flex items-center justify-between bg-slate-50/50 hover:bg-slate-50 transition-colors border-b border-slate-100"
                >
                    <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary">list_alt</span>
                        <span className="font-semibold text-slate-700">Features & Highlights</span>
                    </div>
                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            addBullet();
                            if (!openSections.bullets) toggleSection('bullets');
                        }}
                        className="text-primary hover:text-primary-800 text-sm font-medium flex items-center gap-1"
                    >
                        <span className="material-symbols-outlined text-[18px]">add</span>
                        Add Item
                    </button>
                </div>

                {openSections.bullets && (
                    <div className="p-6">
                        <div className="space-y-3">
                            {(service.bullets || []).map((bullet: string, idx: number) => (
                                <div key={idx} className="flex gap-2">
                                    <div className="flex-1">
                                        <input
                                            type="text"
                                            value={bullet}
                                            onChange={(e) => updateBullet(idx, e.target.value)}
                                            placeholder={`Feature ${idx + 1}`}
                                            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                                        />
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => removeBullet(idx)}
                                        className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors border border-rose-100"
                                    >
                                        <span className="material-symbols-outlined text-[18px]">delete</span>
                                    </button>
                                </div>
                            ))}
                            {(!service.bullets || service.bullets.length === 0) && (
                                <div className="text-center py-8 border-2 border-dashed border-slate-200 rounded-xl">
                                    <p className="text-slate-500 text-sm mb-3">No highlights added yet</p>
                                    <button
                                        type="button"
                                        onClick={addBullet}
                                        className="text-primary font-medium text-sm inline-flex items-center gap-1"
                                    >
                                        <span className="material-symbols-outlined text-[18px]">add</span>
                                        Add your first highlight
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </form>
    );
}
