"use client";

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { showToast } from '@/components/Toast';

export default function EditBlogCategory() {
    const params = useParams();
    const slug = params.slug as string;
    const router = useRouter();
    const [form, setForm] = useState<any>({ name: '', slug: '', description: '', meta_title: '', meta_description: '' });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        (async () => {
            try {
                setLoading(true);
                const res = await fetch('/api/blog/categories');
                const body = await res.json();
                const c = (Array.isArray(body) ? body.find((x: any) => x.slug === slug) : null);
                if (!c) throw new Error('Category not found');
                setForm(c);
            } catch (e: any) {
                console.error('Could not load category', e);
                showToast(e.message || 'Failed to load', { type: 'error' });
                router.push('/admin/blog/categories');
            } finally { setLoading(false); }
        })();
    }, [slug]);

    const submit = async (e: any) => {
        e.preventDefault();
        setSaving(true);
        try {
            const payload = { ...form, id: form.id || form._id };
            const res = await fetch('/api/blog/categories', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
            const body = await res.json();
            if (!res.ok) throw new Error(body.error || 'Failed');
            showToast('Category updated', { type: 'success' });
            router.push('/admin/blog/categories');
        } catch (e: any) {
            console.error('Update error', e);
            showToast(e.message || 'Failed to update', { type: 'error' });
        } finally { setSaving(false); }
    };

    if (loading) return <div className="p-6">Loading...</div>;

    return (
        <main className="flex-1 p-6 overflow-y-auto">
            <div className="max-w-3xl mx-auto">
                <h1 className="text-2xl font-bold mb-4">Edit Blog Category</h1>
                <form onSubmit={submit} className="bg-white p-6 rounded-lg border border-slate-200">
                    <label className="block mb-3">
                        <div className="text-sm text-slate-600 mb-1">Name</div>
                        <input value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} className="w-full px-3 py-2 border rounded" required />
                    </label>
                    <label className="block mb-3">
                        <div className="text-sm text-slate-600 mb-1">Slug</div>
                        <input value={form.slug} onChange={(e) => setForm({...form, slug: e.target.value})} className="w-full px-3 py-2 border rounded" required />
                    </label>
                    <label className="block mb-3">
                        <div className="text-sm text-slate-600 mb-1">Description</div>
                        <textarea value={form.description} onChange={(e) => setForm({...form, description: e.target.value})} className="w-full px-3 py-2 border rounded" rows={4} />
                    </label>

                    <label className="block mb-3">
                        <div className="text-sm text-slate-600 mb-1">Meta Title</div>
                        <input value={form.meta_title} onChange={(e) => setForm({...form, meta_title: e.target.value})} className="w-full px-3 py-2 border rounded" maxLength={60} />
                        <p className="text-xs text-slate-500 mt-1">Optional — used for SEO title (recommended 50-60 chars)</p>
                    </label>

                    <label className="block mb-3">
                        <div className="text-sm text-slate-600 mb-1">Meta Description</div>
                        <textarea value={form.meta_description} onChange={(e) => setForm({...form, meta_description: e.target.value})} className="w-full px-3 py-2 border rounded" rows={3} maxLength={160} />
                        <p className="text-xs text-slate-500 mt-1">Optional — used for search engines and social previews (recommended 150-160 chars)</p>
                    </label>

                    <div className="flex gap-2">
                        <button type="button" onClick={() => history.back()} className="px-4 py-2 border rounded">Cancel</button>
                        <button className="bg-primary text-white px-4 py-2 rounded" disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
                    </div>
                </form>
            </div>
        </main>
    );
}
