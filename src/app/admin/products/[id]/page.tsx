"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import ImageUploader from '@/components/shared/ImageUploader';
import { showToast } from '@/components/Toast';
import { useEditor, EditorContent } from '@tiptap/react';

// Helper: safe JSON parse for fetch error responses
async function safeParseJson(res: Response) {
    try {
        return await res.json();
    } catch (err) {
        try {
            const text = await res.text();
            return { error: text || 'Invalid response body' };
        } catch (e) {
            return { error: 'Failed to parse error response' };
        }
    }
}
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import IconSelector from '@/components/admin/IconSelector';
import Image from '@tiptap/extension-image';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import Placeholder from '@tiptap/extension-placeholder';
import Highlight from '@tiptap/extension-highlight';
import { TextStyle } from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';

export default function EditProductPage() {
    const router = useRouter();
    const params = useParams();
    const productId = params?.id;
    const idStr = Array.isArray(productId) ? productId[0] : (productId || '');
    const [saving, setSaving] = useState(false);
    const [categories, setCategories] = useState<any[]>([]);
    const [subcategories, setSubcategories] = useState<any[]>([]);
    const [newArea, setNewArea] = useState('');
    const [loading, setLoading] = useState(true);

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
        capacity: '',
        warranty: '',
        rating: 0,
        reviews_count: 0,
        energy_saving: '',
        smart: false,
        filtration: false,
        technical: {
            power: '',
            iseer: '',
            refrigerant: '',
            noise: '',
            dimensions: '',
            voltage: '',
        },
        application_areas: [],
        features: [],
        meta_title: '',
        meta_description: '',
        category_id: null,
        subcategory_id: null,
        statusId: 1,
    });

    // Tiptap editor
    const [, setEditorTick] = useState(0);
    const exec = (fn: () => void) => { fn(); setEditorTick((t) => t + 1); };

    const editor = useEditor({
        extensions: [
            StarterKit.configure({ codeBlock: false }),
            Link.configure({ openOnClick: false, HTMLAttributes: { class: 'text-primary underline' } }),
            Image.configure({ HTMLAttributes: { class: 'max-w-full h-auto rounded-lg' } }),
            Underline,
            TextAlign.configure({ types: ['heading', 'paragraph'] }),
            Highlight.configure({ multicolor: true }),
            TextStyle,
            Color,
            Placeholder.configure({ placeholder: 'Start writing description...' }),
        ],
        content: product.content || '<p></p>',
        editorProps: { attributes: { class: 'tiptap min-h-[300px] p-4 focus:outline-none', spellcheck: 'true' } },
        onUpdate: ({ editor }) => setProduct((p: any) => ({ ...p, content: editor.getHTML() })),
        immediatelyRender: false,
    });

    // Simple toolbar as inline component
    function Toolbar({ editor }: any) {
        if (!editor) return null;
        return (
            <div className="inline-flex gap-1">
                <button type="button" onClick={() => exec(() => editor.chain().focus().toggleBold().run())} className={`px-2 py-1 rounded ${editor.isActive('bold') ? 'bg-gray-200' : ''}`}>B</button>
                <button type="button" onClick={() => exec(() => editor.chain().focus().toggleItalic().run())} className={`px-2 py-1 rounded ${editor.isActive('italic') ? 'bg-gray-200' : ''}`}>I</button>
                <button type="button" onClick={() => exec(() => editor.chain().focus().toggleUnderline().run())} className={`px-2 py-1 rounded ${editor.isActive('underline') ? 'bg-gray-200' : ''}`}>U</button>
                <button type="button" onClick={() => exec(() => editor.chain().focus().toggleBulletList().run())} className={`px-2 py-1 rounded ${editor.isActive('bulletList') ? 'bg-gray-200' : ''}`}>• List</button>
                <button type="button" onClick={() => exec(() => editor.chain().focus().toggleOrderedList().run())} className={`px-2 py-1 rounded ${editor.isActive('orderedList') ? 'bg-gray-200' : ''}`}>1. List</button>
                <button type="button" onClick={() => {
                    const url = prompt('Enter URL'); if (url) exec(() => editor.chain().focus().setLink({ href: url }).run());
                }} className="px-2 py-1 rounded">Link</button>
                <button type="button" onClick={() => {
                    const url = prompt('Enter image URL'); if (url) exec(() => editor.chain().focus().setImage({ src: url }).run());
                }} className="px-2 py-1 rounded">Image</button>
            </div>
        );
    }

    useEffect(() => {
        fetch('/api/pages/services/categories')
            .then(r => r.ok ? r.json() : [])
            .then(setCategories)
            .catch(() => setCategories([]));
        fetch('/api/pages/services/subcategories')
            .then(r => r.ok ? r.json() : [])
            .then(setSubcategories)
            .catch(() => setSubcategories([]));
    }, []);

    // Load existing product & its details when editing
    useEffect(() => {
        if (!idStr) return;
        setLoading(true);
        (async () => {
            try {
                const res = await fetch(`/api/products?id=${encodeURIComponent(idStr)}`);
                if (!res.ok) throw new Error('Failed to load product');
                const data = await res.json();
                console.debug('Loaded product for edit:', data);

                // normalize arrays and set initial editor content
                const populated = {
                    ...data,
                    images: data.images || [],
                    locations: data.locations ? (Array.isArray(data.locations) ? data.locations : JSON.parse(data.locations)) : [],
                    technical: data.technical ? (typeof data.technical === 'string' ? JSON.parse(data.technical) : data.technical) : (data.technical || {}),
                    application_areas: [],
                    features: [],
                    _newFeatureIcon: '',
                    _newFeatureLabel: '',
                };

                // fetch matching service detail by slug (if exists)
                let detailObj: any = null;
                if (populated.slug) {
                    try {
                        const dres = await fetch(`/api/pages/services/details?slug=${encodeURIComponent(populated.slug)}`);
                        if (dres.ok) {
                            const detail = await dres.json();
                            console.debug('Loaded service detail (by slug):', detail);
                            if (!detail?.error) {
                                detailObj = detail;
                                populated.application_areas = detail.application_areas ? (typeof detail.application_areas === 'string' ? JSON.parse(detail.application_areas) : detail.application_areas) : (populated.application_areas || []);
                                populated.features = detail.features ? (typeof detail.features === 'string' ? JSON.parse(detail.features) : detail.features) : (populated.features || []);
                                populated.images = detail.images ? (typeof detail.images === 'string' ? JSON.parse(detail.images) : detail.images) : populated.images;
                                populated.brochure_url = detail.brochure_url || populated.brochure_url;
                                populated.bullets = detail.bullets || populated.bullets;
                            }
                        }
                    } catch (e) {
                        // ignore detail fetch errors
                    }
                }

                // Merge technical info: prefer detail.technical, then data.technical, then per-column product fields
                let technicalObj: any = {};
                if (detailObj && detailObj.technical) {
                    technicalObj = typeof detailObj.technical === 'string' ? JSON.parse(detailObj.technical) : detailObj.technical;
                } else if (data.technical) {
                    technicalObj = typeof data.technical === 'string' ? JSON.parse(data.technical) : data.technical;
                } else {
                    technicalObj = {
                        power: data.power ?? '',
                        iseer: data.iseer ?? '',
                        refrigerant: data.refrigerant ?? '',
                        noise: data.noise ?? '',
                        dimensions: data.dimensions ?? '',
                        voltage: data.voltage ?? '',
                    };
                }
                populated.technical = technicalObj;

                console.debug('Populated product state to set:', populated);
                setProduct(populated as any);

                // update editor content if editor exists
                try { if (editor && populated.content) editor.commands.setContent(populated.content || '<p></p>'); } catch (e) { /* ignore */ }

            } catch (e) {
                console.error('Failed to load product for editing:', e);
                showToast('Failed to load product', { type: 'error' });
            } finally {
                setLoading(false);
            }
        })();
    }, [productId]);

    // Derived subcategories for selected category
    const availableSubcategories = (product.category_id && subcategories.length) ? subcategories.filter((s: any) => s.category_id === product.category_id) : subcategories;

    // Normalize '0'/'00' string values to null for cleaner DB storage
    const normalizeZeroToNull = (v: any) => {
        if (v === undefined || v === null) return null;
        const s = String(v).trim();
        if (s === '' || s === '0' || s === '00' || s === '0.00' || s === '00.00') return null;
        return v;
    };

    const save = async () => {
        if (!product.title || !product.slug) {
            showToast('Title and slug required', { type: 'error' });
            return;
        }
        // allow slug-based routes as long as product has an id after load
        if (!productId && !product?.id) {
            showToast('Missing product id for edit', { type: 'error' });
            return;
        }

        setSaving(true);
        try {
            const contentHtml = editor?.getHTML ? editor.getHTML() : product.content;

            // Prepare images payload for product update
            const imagesPayload = (product.images || []).map((url: string, idx: number) => ({ url, alt: product.title || '', is_primary: idx === 0 ? 1 : 0, display_order: idx }));

            // Determine numeric ID to send to API: prefer loaded product.id, fallback to route param
            const numericFromParam = Number(idStr);
            const idForPayload = (Number.isFinite(numericFromParam) && numericFromParam > 0) ? numericFromParam : (product?.id ? Number(product.id) : null);
            if (!idForPayload) {
                console.error('No numeric product ID available for update', { idStr, productId, product });
                showToast('Product numeric ID not found; could not save. Please reopen this product.', { type: 'error' });
                setSaving(false);
                return;
            }

            const updatePayload: any = {
                id: idForPayload,
                title: product.title,
                slug: product.slug,
                excerpt: product.excerpt,
                content: contentHtml,
                thumbnail: product.thumbnail || null,
                images: imagesPayload,
                statusId: product.statusId || 1,
                price: normalizeZeroToNull(product.price),
                compare_at_price: normalizeZeroToNull(product.compare_at_price),
                currency: product.currency || 'NRS',
                metaTitle: product.meta_title || product.title,
                metaDescription: product.meta_description || product.excerpt,
                category_id: product.category_id || null,
                subcategory_id: product.subcategory_id || null,
                model: product.model || null,
                capacity: product.capacity || null,
                warranty: normalizeZeroToNull(product.warranty),
                brochure_url: product.brochure_url || null,
                // technical fields also stored on products table
                power: product.technical?.power || null,
                iseer: product.technical?.iseer || null,
                refrigerant: product.technical?.refrigerant || null,
                noise: product.technical?.noise || null,
                dimensions: product.technical?.dimensions || null,
                voltage: product.technical?.voltage || null,
                locations: product.locations ? (typeof product.locations === 'string' ? product.locations : JSON.stringify(product.locations)) : null,
                inventory_status: product.inventory_status || 'in_stock',
                energy_saving: normalizeZeroToNull(product.energy_saving),
            };

            const putRes = await fetch('/api/products', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatePayload),
            });
            if (!putRes.ok) {
                // parse body as JSON if possible, otherwise text
                let errBody: any = null;
                try {
                    errBody = await putRes.json();
                } catch (e) {
                    try { errBody = await putRes.text(); } catch { errBody = null; }
                }
                console.error('Product update failed:', putRes.status, putRes.statusText, errBody, { payload: updatePayload });

                if (putRes.status === 401 || putRes.status === 403) {
                    showToast('Unauthorized. Please sign in as an admin and try again.', { type: 'error' });
                    throw new Error('Unauthorized');
                }

                const msg = errBody && (errBody.error || errBody.message || String(errBody)) ? (errBody.error || errBody.message || String(errBody)) : `Failed to update product (${putRes.status})`;
                throw new Error(msg);
            }

            // Upsert detail record (find by slug)
            // Try to find existing detail: by slug first, then fallback to lookup by postId
            let detailExists = false;
            let detailData: any = null;
            try {
                const detailSearch = await fetch(`/api/pages/services/details?slug=${encodeURIComponent(product.slug || '')}`);
                if (detailSearch.ok) {
                    const maybeDetail = await detailSearch.json();
                    if (!maybeDetail?.error && maybeDetail.id) {
                        detailExists = true;
                        detailData = maybeDetail;
                    }
                }
            } catch (e) {
                // ignore
            }

            if (!detailExists) {
                // fallback: fetch all details and match by postId using loaded product id
                try {
                    const allRes = await fetch('/api/pages/services/details');
                    if (allRes.ok) {
                        const arr = await allRes.json();
                        const match = Array.isArray(arr) ? arr.find((x: any) => Number(x.postId) === Number(product?.id || idStr)) : null;
                        if (match) {
                            detailExists = true;
                            detailData = match;
                        }
                    }
                } catch (e) {
                    // ignore
                }
            }

            const detailPayload: any = {
                key: product.slug,
                slug: product.slug,
                icon: product.icon || 'inventory_2',
                title: product.title,
                description: product.excerpt,
                bullets: JSON.stringify([]),
                image: product.thumbnail || '/placeholder-product.png',
                image_alt: product.title,
                display_order: detailData?.display_order ?? 0,
                is_active: detailData?.is_active ?? 1,
                postId: idForPayload,
                locations: JSON.stringify(product.locations || []),
                inventory_status: product.inventory_status,
                images: JSON.stringify(product.images || []),
                application_areas: JSON.stringify(product.application_areas || []),
                features: JSON.stringify(product.features || []),
                technical: product.technical ? (typeof product.technical === 'string' ? product.technical : JSON.stringify(product.technical)) : null,
            };

            let detailRes;
            if (detailExists && detailData?.id) {
                detailPayload.id = detailData.id;
                detailRes = await fetch('/api/pages/services/details', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(detailPayload),
                });
            } else {
                detailRes = await fetch('/api/pages/services/details', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(detailPayload),
                });
            }

            if (!detailRes.ok) {
                // parse body as JSON/text for better diagnostics
                let errBody: any = null;
                try { errBody = await detailRes.json(); } catch (e) { try { errBody = await detailRes.text(); } catch { errBody = null; } }
                console.error('Detail upsert failed:', detailRes.status, detailRes.statusText, errBody, { payload: detailPayload });

                if (detailRes.status === 401 || detailRes.status === 403) {
                    showToast('Unauthorized. Please sign in again to save details.', { type: 'error' });
                    throw new Error('Unauthorized');
                }

                const msg = errBody && (errBody.error || errBody.message || String(errBody)) ? (errBody.error || errBody.message || String(errBody)) : `Failed to upsert product detail (${detailRes.status})`;
                showToast(msg, { type: 'error' });
                throw new Error(msg);
            }

            showToast('Product saved', { type: 'success' });

        } catch (e: any) {
            console.error('Error saving product:', e);
            const message = e?.message || 'Failed to save product';
            showToast(message, { type: 'error' });
        } finally {
            setSaving(false);
        }
    };

    const addImage = (url: string) => {
        setProduct((p: any) => ({ ...p, images: [...(p.images || []), url] }));
    };

    if (loading) return (<div className="p-6">Loading product...</div>);

    return (
        <div className="p-6">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold">Edit Product</h1>
                <div className="flex gap-2">
                    <button onClick={() => window.history.back()} className="px-3 py-2 rounded border">Cancel</button>
                    <button onClick={save} className="px-4 py-2 bg-primary text-white rounded" disabled={saving || loading}>Save Product</button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl p-4 border">
                    <label className="block text-sm font-medium mb-1">Title</label>
                    <input value={product.title ?? ''} onChange={(e) => setProduct({ ...product, title: e.target.value })} className="w-full rounded-lg border border-gray-200 px-3 py-2 mb-3" />

                    <label className="block text-sm font-medium mb-1">Slug</label>
                    <input value={product.slug ?? ''} onChange={(e) => setProduct({ ...product, slug: e.target.value })} className="w-full rounded-lg border border-gray-200 px-3 py-2 mb-3" />

                    <h2 className="text-xl font-bold mb-3">Overview</h2>
                    <label className="block text-sm font-medium mb-1">Excerpt</label>
                    <textarea value={product.excerpt ?? ''} onChange={(e) => setProduct({ ...product, excerpt: e.target.value })} className="w-full rounded-lg border border-gray-200 px-3 py-2 mb-3" rows={3} />

                    <label className="block text-sm font-medium mb-1">Content</label>
                    {/* Editor toolbar */}
                    <div className="mb-2 flex gap-2">
                        <Toolbar editor={editor} />
                    </div>
                    <div className="rounded-lg border border-gray-200 p-0 mb-4">
                        <EditorContent editor={editor} />
                    </div>

                    <h2 className="text-xl font-bold mb-3">Specifications</h2>
                    <label className="block text-sm font-medium mb-1">Model</label>
                    <input value={product.model ?? ''} onChange={(e) => setProduct({ ...product, model: e.target.value })} className="w-full rounded-lg border border-gray-200 px-3 py-2 mb-3" />

                    <label className="block text-sm font-medium mb-1">Category</label>
                    <select value={product.category_id ?? ''} onChange={(e) => setProduct({ ...product, category_id: e.target.value ? Number(e.target.value) : null, subcategory_id: null })} className="w-full rounded-lg border border-gray-200 px-3 py-2 mb-3">
                        <option value="">Select category</option>
                        {categories.map((c: any) => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                    </select>

                    <label className="block text-sm font-medium mb-1">Subcategory</label>
                    <select value={product.subcategory_id ?? ''} onChange={(e) => setProduct({ ...product, subcategory_id: e.target.value ? Number(e.target.value) : null })} className="w-full rounded-lg border border-gray-200 px-3 py-2 mb-3">
                        <option value="">Select subcategory</option>
                        {availableSubcategories.map((s: any) => (
                            <option key={s.id} value={s.id}>{s.name}</option>
                        ))}
                    </select>

                    <label className="block text-sm font-medium mb-1">Application Areas</label>
                    <div className="flex gap-2 flex-wrap mb-3">
                        {(product.application_areas || []).map((a: string, idx: number) => (
                            <span key={idx} className="inline-flex items-center gap-2 bg-gray-100 px-2 py-1 rounded text-sm">
                                <span>{a}</span>
                                <button onClick={() => setProduct({ ...product, application_areas: (product.application_areas || []).filter((_: any, i: number) => i !== idx) })} className="text-xs text-red-500">×</button>
                            </span>
                        ))}
                    </div>
                    <div className="flex gap-2 mb-3">
                        <input value={newArea} onChange={(e) => setNewArea(e.target.value)} placeholder="Add area, e.g., Living Room" className="w-full rounded-lg border border-gray-200 px-3 py-2" />
                        <button onClick={() => { if (newArea.trim()) { setProduct({ ...product, application_areas: [...(product.application_areas || []), newArea.trim()] }); setNewArea(''); } }} className="px-3 py-2 bg-primary text-white rounded">Add</button>
                    </div>

                    <label className="block text-sm font-medium mb-1 mt-2">Features</label>
                    <div className="flex flex-col gap-2 mb-3">
                        {(product.features || []).map((f: any, idx: number) => (
                            <div key={idx} className="flex gap-2 items-center">
                                <IconSelector value={f.icon || ''} onChange={(v) => setProduct({ ...product, features: product.features.map((x: any, i: number) => i === idx ? { ...x, icon: v } : x) })} />
                                <input value={f.label || ''} onChange={(e) => setProduct({ ...product, features: product.features.map((x: any, i: number) => i === idx ? { ...x, label: e.target.value } : x) })} placeholder="Label (e.g., Smart Control)" className="flex-1 rounded-lg border border-gray-200 px-3 py-1" />
                                <button onClick={() => setProduct({ ...product, features: (product.features || []).filter((_: any, i: number) => i !== idx) })} className="text-red-500">Remove</button>
                            </div>
                        ))}
                        <div className="flex gap-2">
                            <IconSelector value={product._newFeatureIcon || ''} onChange={(v) => setProduct({ ...product, _newFeatureIcon: v })} />
                            <input id="newFeatureLabel" placeholder="label" value={product._newFeatureLabel || ''} onChange={(e) => setProduct({ ...product, _newFeatureLabel: e.target.value })} className="flex-1 rounded-lg border border-gray-200 px-3 py-1" />
                            <button onClick={() => {
                                const icon = product._newFeatureIcon || '';
                                const label = product._newFeatureLabel || '';
                                if (!label.trim()) return;
                                setProduct({ ...product, features: [...(product.features || []), { icon: icon.trim(), label: label.trim() }], _newFeatureIcon: '', _newFeatureLabel: '' });
                            }} className="px-3 py-1 bg-primary text-white rounded">Add</button>
                        </div>
                    </div>

                    <label className="block text-sm font-medium mb-1">Capacity</label>
                    <input value={product.capacity ?? ''} onChange={(e) => setProduct({ ...product, capacity: e.target.value })} className="w-full rounded-lg border border-gray-200 px-3 py-2 mb-3" />

                    <label className="block text-sm font-medium mb-1">Warranty</label>
                    <input value={product.warranty ?? ''} onChange={(e) => setProduct({ ...product, warranty: e.target.value })} className="w-full rounded-lg border border-gray-200 px-3 py-2 mb-3" />

                    <label className="block text-sm font-medium mb-1">Locations (comma separated)</label>
                    <input value={(product.locations || []).join(', ')} onChange={(e) => setProduct({ ...product, locations: e.target.value.split(',').map((s: string) => s.trim()) })} className="w-full rounded-lg border border-gray-200 px-3 py-2 mb-3" />

                    <h3 className="text-lg font-bold mt-4 mb-2">Technical</h3>
                    <label className="block text-sm font-medium mb-1">Power</label>
                    <input value={product.technical?.power || ''} onChange={(e) => setProduct({ ...product, technical: { ...product.technical, power: e.target.value } })} className="w-full rounded-lg border border-gray-200 px-3 py-2 mb-3" />

                    <label className="block text-sm font-medium mb-1">ISEER</label>
                    <input value={product.technical?.iseer || ''} onChange={(e) => setProduct({ ...product, technical: { ...product.technical, iseer: e.target.value } })} className="w-full rounded-lg border border-gray-200 px-3 py-2 mb-3" />

                    <label className="block text-sm font-medium mb-1">Refrigerant</label>
                    <input value={product.technical?.refrigerant || ''} onChange={(e) => setProduct({ ...product, technical: { ...product.technical, refrigerant: e.target.value } })} className="w-full rounded-lg border border-gray-200 px-3 py-2 mb-3" />

                    <label className="block text-sm font-medium mb-1">Noise</label>
                    <input value={product.technical?.noise || ''} onChange={(e) => setProduct({ ...product, technical: { ...product.technical, noise: e.target.value } })} className="w-full rounded-lg border border-gray-200 px-3 py-2 mb-3" />

                    <label className="block text-sm font-medium mb-1">Dimensions</label>
                    <input value={product.technical?.dimensions || ''} onChange={(e) => setProduct({ ...product, technical: { ...product.technical, dimensions: e.target.value } })} className="w-full rounded-lg border border-gray-200 px-3 py-2 mb-3" />

                    <label className="block text-sm font-medium mb-1">Voltage</label>
                    <input value={product.technical?.voltage || ''} onChange={(e) => setProduct({ ...product, technical: { ...product.technical, voltage: e.target.value } })} className="w-full rounded-lg border border-gray-200 px-3 py-2 mb-3" />

                </div>

                <div className="bg-white rounded-xl p-4 border">
                    <label className="block text-sm font-medium mb-1">Thumbnail</label>
                    <ImageUploader label="Thumbnail" folder="products" value={product.thumbnail || ''} onChange={(v) => setProduct({ ...product, thumbnail: v })} />

                    <div className="mt-4">
                        <label className="block text-sm font-medium mb-1">Gallery Images</label>
                        <ImageUploader label="Gallery Image" folder="products" value={''} onChange={(v) => addImage(v)} />
                        <div className="flex gap-2 flex-wrap mt-3">
                            {(product.images || []).map((img: string, idx: number) => (
                                <div key={idx} className="w-24 h-24 rounded overflow-hidden border">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img src={img} className="w-full h-full object-cover" />
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="mt-4">
                        <label className="block text-sm font-medium mb-1">Price</label>
                        <input value={product.price ?? ''} onChange={(e) => setProduct({ ...product, price: e.target.value })} className="w-full rounded-lg border border-gray-200 px-3 py-2 mb-3" />

                        <label className="block text-sm font-medium mb-1">Compare At Price</label>
                        <input value={product.compare_at_price ?? ''} onChange={(e) => setProduct({ ...product, compare_at_price: e.target.value })} className="w-full rounded-lg border border-gray-200 px-3 py-2 mb-3" />

                        <label className="block text-sm font-medium mb-1">Currency</label>
                        <select value={product.currency ?? 'NRS'} onChange={(e) => setProduct({ ...product, currency: e.target.value })} className="w-full rounded-lg border border-gray-200 px-3 py-2 mb-3">
                            <option value="NRS">NRS</option>
                            <option value="USD">USD</option>
                            <option value="EUR">EUR</option>
                            <option value="GBP">GBP</option>
                            <option value="AUD">AUD</option>
                            <option value="CAD">CAD</option>
                            <option value="JPY">JPY</option>
                            <option value="CNY">CNY</option>
                        </select>



                        <label className="block text-sm font-medium mb-1">Inventory Status</label>
                        <select value={product.inventory_status ?? 'in_stock'} onChange={(e) => setProduct({ ...product, inventory_status: e.target.value })} className="w-full rounded-lg border border-gray-200 px-3 py-2">
                            <option value="in_stock">In Stock</option>
                            <option value="out_of_stock">Out of Stock</option>
                            <option value="preorder">Pre-order</option>
                        </select>






                    </div>
                </div>
            </div>

            <div className="mt-6 bg-white rounded-xl p-4 border">
                <h3 className="font-bold mb-3">SEO & Metadata</h3>
                <label className="block text-sm font-medium mb-1">Meta Title</label>
                <input value={product.meta_title ?? ''} onChange={(e) => setProduct({ ...product, meta_title: e.target.value })} className="w-full rounded-lg border border-gray-200 px-3 py-2 mb-3" />
                <label className="block text-sm font-medium mb-1">Meta Description</label>
                <textarea value={product.meta_description ?? ''} onChange={(e) => setProduct({ ...product, meta_description: e.target.value })} className="w-full rounded-lg border border-gray-200 px-3 py-2 mb-3" rows={3} />
            </div>
        </div>
    );
}
