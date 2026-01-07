"use client";

import { useState, useEffect } from "react";
import ImageUploader from '@/components/shared/ImageUploader';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import Placeholder from '@tiptap/extension-placeholder';
import Highlight from '@tiptap/extension-highlight';
import { TextStyle } from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import IconSelector from '@/components/admin/IconSelector';

interface ProductFormProps {
    initialData?: any;
    onSave: (data: any) => Promise<void>;
    saving: boolean;
    title: string;
}

export default function ProductForm({ initialData, onSave, saving, title }: ProductFormProps) {
    const [activeTab, setActiveTab] = useState<'general' | 'specs' | 'media' | 'seo'>('general');
    const [categories, setCategories] = useState<any[]>([]);
    const [subcategories, setSubcategories] = useState<any[]>([]);

    const [product, setProduct] = useState<any>({
        title: '',
        slug: '',
        excerpt: '',
        content: '',
        thumbnail: '',
        images: [],
        inventory_status: 'in_stock',
        locations: [],
        price: '',
        compare_at_price: '',
        currency: 'NRS',
        model: '',
        technical: {
            power: '',
            iseer: '',
            refrigerant: '',
            noise: '',
            customSpecs: [], // flexible additional specs (array of { name, value })
        },
        features: [],
        meta_title: '',
        meta_description: '',
        category_id: null,
        subcategory_id: null,
        statusId: 1,
        ...initialData
    });

    useEffect(() => {
        if (initialData) {
            setProduct((prev: any) => ({ ...prev, ...initialData }));
            if (editor && initialData.content) {
                editor.commands.setContent(initialData.content);
            }
        }
    }, [initialData]);

    const editor = useEditor({
        extensions: [
            StarterKit.configure({ codeBlock: false }),
            Link.configure({ openOnClick: false }),
            Image,
            Underline,
            TextAlign.configure({ types: ['heading', 'paragraph'] }),
            Highlight,
            TextStyle,
            Color,
            Placeholder.configure({ placeholder: 'Description...' }),
        ],
        content: product.content || '',
        editorProps: { attributes: { class: 'tiptap min-h-[300px] p-4 focus:outline-none prose max-w-none text-sm', spellcheck: 'true' } },
        onUpdate: ({ editor }) => setProduct((p: any) => ({ ...p, content: editor.getHTML() })),
        immediatelyRender: false,
    });

    useEffect(() => {
        fetch('/api/pages/services/categories').then(r => r.json()).then(setCategories).catch(() => { });
        fetch('/api/pages/services/subcategories').then(r => r.json()).then(setSubcategories).catch(() => { });
    }, []);

    const tabs = [
        { id: 'general', label: 'General', icon: 'description' },
        { id: 'specs', label: 'Specs', icon: 'settings' },
        { id: 'media', label: 'Gallery', icon: 'image' },
        { id: 'seo', label: 'SEO & Price', icon: 'trending_up' },
    ];

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Simple Header */}
            <div className="sticky top-0 z-30 bg-white border-b border-gray-200 h-16 flex items-center">
                <div className="max-w-7xl mx-auto w-full px-6 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button onClick={() => window.history.back()} className="text-gray-400 hover:text-gray-900">
                            <span className="material-symbols-outlined">arrow_back</span>
                        </button>
                        <h1 className="text-xl font-bold text-gray-900">{title}</h1>
                    </div>
                    <button
                        onClick={() => onSave(product)}
                        disabled={saving}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-md text-sm font-semibold transition-colors disabled:opacity-50"
                    >
                        {saving ? 'Saving...' : 'Save Product'}
                    </button>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-8">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Navigation Sidebar */}
                    <aside className="lg:w-64 flex-shrink-0">
                        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden sticky top-24">
                            {tabs.map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id as any)}
                                    className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium border-l-2 transition-all ${activeTab === tab.id
                                        ? 'bg-blue-50 border-blue-600 text-blue-700'
                                        : 'border-transparent text-gray-500 hover:bg-gray-50'
                                        }`}
                                >
                                    <span className="material-symbols-outlined text-[18px]">{tab.icon}</span>
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                    </aside>

                    {/* Form Body */}
                    <main className="flex-1">
                        <div className="bg-white border border-gray-200 rounded-lg p-8 min-h-[500px]">
                            {activeTab === 'general' && (
                                <div className="space-y-6 animate-in fade-in duration-300">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-1">
                                            <label className="text-xs font-bold text-gray-500 uppercase">Product Name</label>
                                            <input
                                                value={product.title}
                                                onChange={e => setProduct({ ...product, title: e.target.value })}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:border-blue-500 outline-none transition-all"
                                                placeholder="e.g. Panasonic 1.5 Ton AC"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-xs font-bold text-gray-500 uppercase">URL Slug</label>
                                            <input
                                                value={product.slug}
                                                onChange={e => setProduct({ ...product, slug: e.target.value })}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:border-blue-500 outline-none transition-all font-mono text-sm"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-gray-500 uppercase">Brief Description</label>
                                        <textarea
                                            value={product.excerpt}
                                            onChange={e => setProduct({ ...product, excerpt: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:border-blue-500 outline-none transition-all resize-none text-sm"
                                            rows={2}
                                        />
                                    </div>

                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-gray-500 uppercase">Availability Label</label>
                                        <input
                                            value={product.availabilityLabel || ''}
                                            onChange={e => setProduct({ ...product, availabilityLabel: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:border-blue-500 outline-none transition-all text-sm"
                                            placeholder="e.g. Available for installation in"
                                        />
                                        <p className="text-xs text-gray-400">Optional text shown before the locations list on the product page.</p>
                                    </div>

                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-gray-500 uppercase">Product Content</label>
                                        <div className="border border-gray-300 rounded-md overflow-hidden">
                                            <div className="bg-gray-50 border-b border-gray-200 p-2 flex gap-1">
                                                <button type="button" onClick={() => editor?.chain().focus().toggleBold().run()} className={`p-1.5 rounded ${editor?.isActive('bold') ? 'bg-gray-200' : 'hover:bg-gray-100'}`}><span className="material-symbols-outlined text-[18px]">format_bold</span></button>
                                                <button type="button" onClick={() => editor?.chain().focus().toggleBulletList().run()} className={`p-1.5 rounded ${editor?.isActive('bulletList') ? 'bg-gray-200' : 'hover:bg-gray-100'}`}><span className="material-symbols-outlined text-[18px]">format_list_bulleted</span></button>
                                            </div>
                                            <EditorContent editor={editor} />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'specs' && (
                                <div className="space-y-8 animate-in fade-in duration-300">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div className="space-y-1">
                                            <label className="text-xs font-bold text-gray-500 uppercase">Model</label>
                                            <input value={product.model} onChange={e => setProduct({ ...product, model: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-xs font-bold text-gray-500 uppercase">Category</label>
                                            <select value={product.category_id ?? ''} onChange={e => setProduct({ ...product, category_id: e.target.value || null, subcategory_id: null })} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm">
                                                <option value="">Select Category</option>
                                                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                            </select>
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-xs font-bold text-gray-500 uppercase">Subcategory</label>
                                            <select value={product.subcategory_id ?? ''} onChange={e => setProduct({ ...product, subcategory_id: e.target.value || null })} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm font-medium">
                                                <option value="">Select Subcategory</option>
                                                {subcategories.filter((s: any) => s.category_id === product.category_id).map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                            </select>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4 border-t border-gray-100">
                                        <div className="space-y-4">
                                            <h3 className="text-xs font-bold text-gray-900 uppercase">Technical Specs</h3>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-1"><label className="text-[10px] font-bold text-gray-400 uppercase">Power</label><input value={product.technical?.power || ''} onChange={e => setProduct({ ...product, technical: { ...product.technical, power: e.target.value } })} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm font-medium" /></div>
                                                <div className="space-y-1"><label className="text-[10px] font-bold text-gray-400 uppercase">ISEER</label><input value={product.technical?.iseer || ''} onChange={e => setProduct({ ...product, technical: { ...product.technical, iseer: e.target.value } })} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm font-medium" /></div>
                                                <div className="space-y-1"><label className="text-[10px] font-bold text-gray-400 uppercase">Capacity</label><input value={product.technical?.capacity || ''} onChange={e => setProduct({ ...product, technical: { ...product.technical, capacity: e.target.value } })} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm font-medium" /></div>
                                                <div className="space-y-1"><label className="text-[10px] font-bold text-gray-400 uppercase">Refrigerant</label><input value={product.technical?.refrigerant || ''} onChange={e => setProduct({ ...product, technical: { ...product.technical, refrigerant: e.target.value } })} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm font-medium" /></div>
                                                <div className="space-y-1"><label className="text-[10px] font-bold text-gray-400 uppercase">Noise Level</label><input value={product.technical?.noise || ''} onChange={e => setProduct({ ...product, technical: { ...product.technical, noise: e.target.value } })} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm font-medium" /></div>
                                                <div className="space-y-1"><label className="text-[10px] font-bold text-gray-400 uppercase">Dimensions</label><input value={product.technical?.dimensions || ''} onChange={e => setProduct({ ...product, technical: { ...product.technical, dimensions: e.target.value } })} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm font-medium" /></div>
                                                <div className="space-y-1"><label className="text-[10px] font-bold text-gray-400 uppercase">Voltage</label><input value={product.technical?.voltage || ''} onChange={e => setProduct({ ...product, technical: { ...product.technical, voltage: e.target.value } })} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm font-medium" /></div>
                                                <div className="space-y-1"><label className="text-[10px] font-bold text-gray-400 uppercase">Warranty</label><input value={product.technical?.warranty || ''} onChange={e => setProduct({ ...product, technical: { ...product.technical, warranty: e.target.value } })} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm font-medium" /></div>
                                            </div>

                                            {/* Custom technical specs */}
                                            <div className="pt-4">
                                                <h3 className="text-xs font-bold text-gray-900 uppercase">Custom Specs</h3>
                                                <div className="space-y-2 mt-3">
                                                    {(product.technical?.customSpecs || []).map((spec: any, idx: number) => (
                                                        <div key={idx} className="flex gap-2 items-center">
                                                            <input
                                                                value={spec.name || ''}
                                                                onChange={(e) => setProduct({ ...product, technical: { ...product.technical, customSpecs: (product.technical?.customSpecs || []).map((s: any, i: number) => i === idx ? { ...s, name: e.target.value } : s) } })}
                                                                placeholder="Spec name"
                                                                className="px-3 py-2 border border-gray-300 rounded-md text-sm w-1/3"
                                                            />
                                                            <input
                                                                value={spec.value || ''}
                                                                onChange={(e) => setProduct({ ...product, technical: { ...product.technical, customSpecs: (product.technical?.customSpecs || []).map((s: any, i: number) => i === idx ? { ...s, value: e.target.value } : s) } })}
                                                                placeholder="Spec value"
                                                                className="px-3 py-2 border border-gray-300 rounded-md text-sm flex-1"
                                                            />
                                                            <button onClick={() => setProduct({ ...product, technical: { ...product.technical, customSpecs: (product.technical?.customSpecs || []).filter((_: any, i: number) => i !== idx) } })} className="text-gray-400 hover:text-red-600"><span className="material-symbols-outlined text-[18px]">delete</span></button>
                                                        </div>
                                                    ))}

                                                    <button onClick={() => setProduct({ ...product, technical: { ...product.technical, customSpecs: [...(product.technical?.customSpecs || []), { name: '', value: '' }] } })} className="w-full py-2 border border-dashed border-gray-300 rounded text-xs font-bold text-gray-400 hover:bg-gray-50 transition-colors uppercase">+ Add Item</button>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="space-y-4">
                                            <h3 className="text-xs font-bold text-gray-900 uppercase">Key Features</h3>
                                            <div className="space-y-2">
                                                {(product.features || []).map((f: any, idx: number) => (
                                                    <div key={idx} className="flex gap-2 items-center">
                                                        <IconSelector value={f.icon || ''} onChange={(v) => setProduct({ ...product, features: product.features.map((x: any, i: number) => i === idx ? { ...x, icon: v } : x) })} />
                                                        <input value={f.label || ''} onChange={(e) => setProduct({ ...product, features: product.features.map((x: any, i: number) => i === idx ? { ...x, label: e.target.value } : x) })} className="flex-1 px-3 py-2 bg-gray-50 border-none outline-none text-sm font-medium rounded-md" />
                                                        <button onClick={() => setProduct({ ...product, features: (product.features || []).filter((_: any, i: number) => i !== idx) })} className="text-gray-400 hover:text-red-600"><span className="material-symbols-outlined text-[18px]">delete</span></button>
                                                    </div>
                                                ))}
                                                <button onClick={() => setProduct({ ...product, features: [...(product.features || []), { icon: 'star', label: '' }] })} className="w-full py-2 border border-dashed border-gray-300 rounded text-xs font-bold text-gray-400 hover:bg-gray-50 transition-colors uppercase">+ Add Item</button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'media' && (
                                <div className="space-y-8 animate-in fade-in duration-300">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-900 uppercase">Thumbnail</label>
                                        <div className="max-w-xs"><ImageUploader label="" folder="products" value={product.thumbnail || ''} onChange={(v) => setProduct({ ...product, thumbnail: v })} /></div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-900 uppercase">Image Gallery</label>
                                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
                                            {(product.images || []).map((img: string, idx: number) => (
                                                <div key={idx} className="group relative aspect-square rounded-md overflow-hidden bg-gray-100 border border-gray-200">
                                                    <img src={img} className="w-full h-full object-cover" />
                                                    <button onClick={() => setProduct({ ...product, images: (product.images || []).filter((_: any, i: number) => i !== idx) })} className="absolute top-1 right-1 bg-white/80 rounded p-1 shadow invisible group-hover:visible"><span className="material-symbols-outlined text-red-600 text-[18px]">delete</span></button>
                                                </div>
                                            ))}
                                            <div className="aspect-square rounded-md border border-dashed border-gray-300 flex items-center justify-center bg-gray-50">
                                                <ImageUploader label="" folder="products" value={''} onChange={(v) => setProduct({ ...product, images: [...(product.images || []), v] })} buttonText="Upload" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'seo' && (
                                <div className="space-y-8 animate-in fade-in duration-300">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                        <div className="space-y-6">
                                            <h3 className="text-xs font-bold text-gray-900 uppercase border-b pb-2">Pricing</h3>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-1"><label className="text-xs font-bold text-gray-500 uppercase">Selling Price</label><input value={product.price} onChange={e => setProduct({ ...product, price: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-md font-bold" /></div>
                                                <div className="space-y-1"><label className="text-xs font-bold text-gray-500 uppercase">Status</label>
                                                    <select value={product.inventory_status} onChange={e => setProduct({ ...product, inventory_status: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-md text-sm font-bold">
                                                        <option value="in_stock">In Stock</option>
                                                        <option value="out_of_stock">Out of Stock</option>
                                                        <option value="preorder">Pre-order</option>
                                                    </select>
                                                </div>
                                            </div>
                                            <div className="pt-4 flex gap-3">
                                                <button onClick={() => setProduct({ ...product, statusId: 1 })} className={`flex-1 py-2 text-xs font-bold uppercase rounded border ${product.statusId === 1 ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-gray-300 text-gray-400'}`}>Public</button>
                                                <button onClick={() => setProduct({ ...product, statusId: 2 })} className={`flex-1 py-2 text-xs font-bold uppercase rounded border ${product.statusId === 2 ? 'bg-gray-800 border-gray-800 text-white' : 'bg-white border-gray-300 text-gray-400'}`}>Draft</button>
                                            </div>
                                        </div>
                                        <div className="space-y-6">
                                            <h3 className="text-xs font-bold text-gray-900 uppercase border-b pb-2">SEO Meta</h3>
                                            <div className="space-y-4">
                                                <div className="space-y-1"><label className="text-xs font-bold text-gray-500">Meta Title</label><input value={product.meta_title} onChange={e => setProduct({ ...product, meta_title: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm font-medium" /></div>
                                                <div className="space-y-1"><label className="text-xs font-bold text-gray-500">Meta Description</label><textarea value={product.meta_description} onChange={e => setProduct({ ...product, meta_description: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm font-medium resize-none" rows={4} /></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </main>
                </div>
            </div>
        </div>
    );
}
