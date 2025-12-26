"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import ImageUploader from '@/components/shared/ImageUploader';
import { showToast } from '@/components/Toast';
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

export default function NewProductPage() {
    const router = useRouter();
    const [saving, setSaving] = useState(false);
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

    // Derived subcategories for selected category
    const availableSubcategories = (product.category_id && subcategories.length) ? subcategories.filter((s: any) => s.category_id === product.category_id) : subcategories;

    const save = async () => {
        if (!product.title || !product.slug) {
            showToast('Title and slug required', { type: 'error' });
            return;
        }
        setSaving(true);
        try {
            // Ensure we use the editor content to avoid stale state
            const contentHtml = editor?.getHTML ? editor.getHTML() : product.content;

            // Save post first
            const imagesPayload = (product.images || []).map((url: string, idx: number) => ({ url, alt: product.title || '', is_primary: idx === 0 ? 1 : 0, display_order: idx }));

            const postPayload: any = {
                title: product.title,
                slug: product.slug,
                excerpt: product.excerpt,
                content: contentHtml,
                thumbnail: product.thumbnail || null,
                images: imagesPayload,
                statusId: product.statusId || 1,
                price: product.price || null,
                meta_title: product.meta_title || product.title,
                meta_description: product.meta_description || product.excerpt,
                category_id: product.category_id || null,
                subcategory_id: product.subcategory_id || null,
            };

            const postRes = await fetch('/api/products', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(postPayload),
            });
            if (!postRes.ok) throw new Error('Failed to create post');
            const postData = await postRes.json();

            // Create detail record
            const detailPayload: any = {
                key: product.slug,
                slug: product.slug,
                title: product.title,
                description: product.excerpt,
                bullets: JSON.stringify([]),
                image: product.thumbnail || postData.thumbnail || '/placeholder-product.png',
                image_alt: product.title,
                display_order: 0,
                is_active: 1,
                postId: postData.id,
                locations: JSON.stringify(product.locations || []),
                inventory_status: product.inventory_status,
                images: JSON.stringify(product.images || []),
                price: product.price || null,
                compare_at_price: product.compare_at_price || null,
                currency: product.currency || 'NRS',
                model: product.model || null,
                capacity: product.capacity || null,
                warranty: product.warranty || null,
                technical: JSON.stringify(product.technical || {}),
                meta_title: product.meta_title || product.title,
                meta_description: product.meta_description || product.excerpt,
            };

            const detailRes = await fetch('/api/pages/services/details', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(detailPayload),
            });

            if (!detailRes.ok) throw new Error('Failed to create product detail');

            showToast('Product created successfully', { type: 'success' });
            router.push('/admin/products');
        } catch (e) {
            console.error(e);
            showToast('Failed to create product', { type: 'error' });
        } finally {
            setSaving(false);
        }
    };

    const addImage = (url: string) => {
        setProduct((p: any) => ({ ...p, images: [...(p.images || []), url] }));
    };

    return (
        <div className="p-6">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold">Add New Product</h1>
                <div className="flex gap-2">
                    <button onClick={() => window.history.back()} className="px-3 py-2 rounded border">Cancel</button>
                    <button onClick={save} className="px-4 py-2 bg-primary text-white rounded" disabled={saving}>Save Product</button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl p-4 border">
                    <label className="block text-sm font-medium mb-1">Title</label>
                    <input value={product.title} onChange={(e) => setProduct({ ...product, title: e.target.value })} className="w-full rounded-lg border border-gray-200 px-3 py-2 mb-3" />

                    <label className="block text-sm font-medium mb-1">Slug</label>
                    <input value={product.slug} onChange={(e) => setProduct({ ...product, slug: e.target.value })} className="w-full rounded-lg border border-gray-200 px-3 py-2 mb-3" />

                    <label className="block text-sm font-medium mb-1">Excerpt</label>
                    <textarea value={product.excerpt} onChange={(e) => setProduct({ ...product, excerpt: e.target.value })} className="w-full rounded-lg border border-gray-200 px-3 py-2 mb-3" rows={3} />

                    <label className="block text-sm font-medium mb-1">Content</label>
                    {/* Editor toolbar */}
                    <div className="mb-2 flex gap-2">
                        <Toolbar editor={editor} />
                    </div>
                    <div className="rounded-lg border border-gray-200 p-0">
                        <EditorContent editor={editor} />
                    </div>

                    <label className="block text-sm font-medium mb-1">Model</label>
                    <input value={product.model} onChange={(e) => setProduct({ ...product, model: e.target.value })} className="w-full rounded-lg border border-gray-200 px-3 py-2 mb-3" />

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

                    <label className="block text-sm font-medium mb-1">Capacity</label>
                    <input value={product.capacity} onChange={(e) => setProduct({ ...product, capacity: e.target.value })} className="w-full rounded-lg border border-gray-200 px-3 py-2 mb-3" />

                    <label className="block text-sm font-medium mb-1">Warranty</label>
                    <input value={product.warranty} onChange={(e) => setProduct({ ...product, warranty: e.target.value })} className="w-full rounded-lg border border-gray-200 px-3 py-2 mb-3" />

                    <label className="block text-sm font-medium mb-1">Locations (comma separated)</label>
                    <input value={(product.locations || []).join(', ')} onChange={(e) => setProduct({ ...product, locations: e.target.value.split(',').map((s: string) => s.trim()) })} className="w-full rounded-lg border border-gray-200 px-3 py-2 mb-3" />

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
                        <input value={product.price} onChange={(e) => setProduct({ ...product, price: e.target.value })} className="w-full rounded-lg border border-gray-200 px-3 py-2 mb-3" />

                        <label className="block text-sm font-medium mb-1">Compare At Price</label>
                        <input value={product.compare_at_price} onChange={(e) => setProduct({ ...product, compare_at_price: e.target.value })} className="w-full rounded-lg border border-gray-200 px-3 py-2 mb-3" />

                        <label className="block text-sm font-medium mb-1">Currency</label>
                        <input value={product.currency} onChange={(e) => setProduct({ ...product, currency: e.target.value })} className="w-full rounded-lg border border-gray-200 px-3 py-2 mb-3" />

                        <label className="block text-sm font-medium mb-1">Inventory Status</label>
                        <select value={product.inventory_status} onChange={(e) => setProduct({ ...product, inventory_status: e.target.value })} className="w-full rounded-lg border border-gray-200 px-3 py-2">
                            <option value="in_stock">In Stock</option>
                            <option value="out_of_stock">Out of Stock</option>
                            <option value="preorder">Pre-order</option>
                        </select>

                        <label className="block text-sm font-medium mb-1 mt-3">Technical: Power</label>
                        <input value={product.technical.power} onChange={(e) => setProduct({ ...product, technical: { ...product.technical, power: e.target.value } })} className="w-full rounded-lg border border-gray-200 px-3 py-2 mb-3" />
                        <label className="block text-sm font-medium mb-1">Technical: ISEER</label>
                        <input value={product.technical.iseer} onChange={(e) => setProduct({ ...product, technical: { ...product.technical, iseer: e.target.value } })} className="w-full rounded-lg border border-gray-200 px-3 py-2 mb-3" />

                    </div>
                </div>
            </div>

            <div className="mt-6 bg-white rounded-xl p-4 border">
                <h3 className="font-bold mb-3">SEO & Metadata</h3>
                <label className="block text-sm font-medium mb-1">Meta Title</label>
                <input value={product.meta_title} onChange={(e) => setProduct({ ...product, meta_title: e.target.value })} className="w-full rounded-lg border border-gray-200 px-3 py-2 mb-3" />
                <label className="block text-sm font-medium mb-1">Meta Description</label>
                <textarea value={product.meta_description} onChange={(e) => setProduct({ ...product, meta_description: e.target.value })} className="w-full rounded-lg border border-gray-200 px-3 py-2 mb-3" rows={3} />
            </div>
        </div>
    );
}
