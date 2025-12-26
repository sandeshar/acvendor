"use client";

import { useEffect, useState } from "react";
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

export default function EditProductPage({ params }: any) {
    const { id } = params;
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [product, setProduct] = useState<any>(null);

    const [categories, setCategories] = useState<any[]>([]);
    const [subcategories, setSubcategories] = useState<any[]>([]);

    const availableSubcategories = (product && product.category_id && subcategories.length) ? subcategories.filter((s: any) => s.category_id === product.category_id) : subcategories;

    // Tiptap editor helpers
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
        content: '<p></p>',
        editorProps: { attributes: { class: 'tiptap min-h-[300px] p-4 focus:outline-none', spellcheck: 'true' } },
        onUpdate: ({ editor }) => setProduct((p: any) => ({ ...p, content: editor.getHTML() })),
        immediatelyRender: false,
    });

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

    // When product loads, set editor content
    useEffect(() => {
        if (!product || !editor) return;
        const html = product.content || product.description || '';
        try { editor.commands.setContent(html); } catch (e) { console.warn('Failed to set editor content', e); }
    }, [product, editor]);

    useEffect(() => {
        if (!id) return;
        (async () => {
            setLoading(true);
            try {
                const [catsRes, subsRes] = await Promise.all([
                    fetch('/api/pages/services/categories'),
                    fetch('/api/pages/services/subcategories')
                ]);
                setCategories(catsRes.ok ? await catsRes.json() : []);
                setSubcategories(subsRes.ok ? await subsRes.json() : []);

                const postRes = await fetch(`/api/products?id=${id}`);
                const posts = postRes.ok ? await postRes.json() : [];
                const post = Array.isArray(posts) ? posts[0] : posts;
                if (!post) throw new Error('Product not found');

                // Try to load detail by slug or key
                const slug = post.slug;
                const detailRes = await fetch(`/api/pages/services/details?slug=${encodeURIComponent(slug)}`);
                const detail = detailRes.ok ? await detailRes.json() : null;

                // Merge into editable structure
                const merged = {
                    ...post,
                    ...detail,
                    images: (detail && detail.images) ? JSON.parse(detail.images) : [],
                    locations: (detail && detail.locations) ? JSON.parse(detail.locations) : [],
                    technical: (detail && detail.technical) ? JSON.parse(detail.technical) : {},
                };

                setProduct(merged);
            } catch (e) {
                console.error(e);
                showToast('Failed to load product', { type: 'error' });
            } finally {
                setLoading(false);
            }
        })();
    }, [id]);

    const save = async () => {
        if (!product) return;
        if (!product.title || !product.slug) {
            showToast('Title and slug required', { type: 'error' });
            return;
        }
        setSaving(true);
        try {
            // Update post
            const imagesPayload = (product.images || []).map((url: string, idx: number) => ({ url, alt: product.title || '', is_primary: idx === 0 ? 1 : 0, display_order: idx }));

            const postPayload: any = {
                id: product.id,
                title: product.title,
                slug: product.slug,
                excerpt: product.excerpt,
                content: product.content,
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
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(postPayload),
            });
            if (!postRes.ok) throw new Error('Failed to update post');

            // ensure category/subcategory saved on the detail as well when available
            if (product.category_id || product.subcategory_id) {
                // attach to detailPayload later (already added content) - no-op here
            }

            // Update or create detail
            const contentHtml = editor?.getHTML ? editor.getHTML() : (product.content || product.description || '');

            const detailPayload: any = {
                key: product.slug,
                slug: product.slug,
                title: product.title,
                description: product.excerpt,
                bullets: JSON.stringify([]),
                image: product.thumbnail || product.image || '/placeholder-product.png',
                image_alt: product.title,
                display_order: product.display_order ?? 0,
                is_active: product.is_active ?? 1,
                postId: product.id,
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
                content: contentHtml,
            };

            if (product.id) {
                // Try to find detail id by existing product detail id
                // If detail id available on product (from earlier merge) then include for PUT
                if (product.id && (product.id !== undefined) && (product.id !== null)) {
                    // We don't have a reliable detail id in all cases; send a POST and server side will upsert if key exists
                }
            }

            const detailRes = await fetch('/api/pages/services/details', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(detailPayload),
            });

            if (!detailRes.ok) throw new Error('Failed to save product detail');

            showToast('Product updated', { type: 'success' });
            router.push('/admin/products');
        } catch (e) {
            console.error(e);
            showToast('Save failed', { type: 'error' });
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-6">Loading...</div>;

    if (!product) return <div className="p-6">Product not found.</div>;

    return (
        <div className="p-6">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold">Edit Product — {product.title}</h1>
                <div className="flex gap-2">
                    <button onClick={() => router.back()} className="px-3 py-2 rounded border">Cancel</button>
                    <button onClick={save} className="px-4 py-2 bg-primary text-white rounded" disabled={saving}>Save</button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl p-4 border">
                    <label className="block text-sm font-medium mb-1">Title</label>
                    <input value={product.title} onChange={(e) => setProduct({ ...product, title: e.target.value })} className="w-full rounded-lg border border-gray-200 px-3 py-2 mb-3" />

                    <label className="block text-sm font-medium mb-1">Slug</label>
                    <input value={product.slug} onChange={(e) => setProduct({ ...product, slug: e.target.value })} className="w-full rounded-lg border border-gray-200 px-3 py-2 mb-3" />

                    <label className="block text-sm font-medium mb-1">Excerpt</label>
                    <textarea value={product.excerpt || ''} onChange={(e) => setProduct({ ...product, excerpt: e.target.value })} className="w-full rounded-lg border border-gray-200 px-3 py-2 mb-3" rows={3} />

                    <label className="block text-sm font-medium mb-1">Content</label>
                    <div className="mb-2 flex gap-2">
                        <Toolbar editor={editor} />
                    </div>
                    <div className="rounded-lg border border-gray-200 p-0">
                        <EditorContent editor={editor} />
                    </div>

                    <label className="block text-sm font-medium mb-1">Model</label>
                    <input value={product.model || ''} onChange={(e) => setProduct({ ...product, model: e.target.value })} className="w-full rounded-lg border border-gray-200 px-3 py-2 mb-3" />

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

                </div>

                <div className="bg-white rounded-xl p-4 border">
                    <label className="block text-sm font-medium mb-1">Thumbnail</label>
                    <ImageUploader label="Thumbnail" folder="products" value={product.thumbnail || ''} onChange={(v) => setProduct({ ...product, thumbnail: v })} />

                    <div className="mt-4">
                        <label className="block text-sm font-medium mb-1">Gallery Images</label>
                        <ImageUploader label="Gallery Image" folder="products" value={''} onChange={(v) => setProduct({ ...product, images: [...(product.images || []), v] })} />
                        <div className="flex gap-2 flex-wrap mt-3">
                            {(product.images || []).map((img: string, idx: number) => (
                                <div key={idx} className="w-24 h-24 rounded overflow-hidden border">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img src={img} className="w-full h-full object-cover" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-6 bg-white rounded-xl p-4 border">
                <h3 className="font-bold mb-3">SEO & Metadata</h3>
                <label className="block text-sm font-medium mb-1">Meta Title</label>
                <input value={product.meta_title || ''} onChange={(e) => setProduct({ ...product, meta_title: e.target.value })} className="w-full rounded-lg border border-gray-200 px-3 py-2 mb-3" />
                <label className="block text-sm font-medium mb-1">Meta Description</label>
                <textarea value={product.meta_description || ''} onChange={(e) => setProduct({ ...product, meta_description: e.target.value })} className="w-full rounded-lg border border-gray-200 px-3 py-2 mb-3" rows={3} />
            </div>
        </div>
    );
}
