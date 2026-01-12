"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { showToast } from '@/components/Toast';

export default function AddBlogCategory() {
    const [form, setForm] = useState({ name: '', slug: '', description: '', meta_title: '', meta_description: '' });
    const [saving, setSaving] = useState(false);
    const router = useRouter();

    const submit = async (e: any) => {
        e.preventDefault();
        setSaving(true);
        try {
            const res = await fetch('/api/blog/categories', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
            const body = await res.json();
            if (!res.ok) throw new Error(body.error || 'Failed');
            showToast('Category created', { type: 'success' });
            router.push('/admin/blog/categories');
        } catch (e: any) {
            console.error('Create error', e);
            showToast(e.message || 'Failed to create', { type: 'error' });
        } finally { setSaving(false); }
    };

    return (
        <main className="flex-1 p-6 overflow-y-auto">
            <div className="max-w-3xl mx-auto">
                <h1 className="text-2xl font-bold mb-4">Add Blog Category</h1>
                <form onSubmit={submit} className="bg-white p-6 rounded-lg border border-slate-200">
                    <label className="block mb-3">
                        <div className="text-sm text-slate-600 mb-1">Name</div>
                        <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-3 py-2 border rounded" required />
                    </label>
                    <label className="block mb-3">
                        <div className="text-sm text-slate-600 mb-1">Slug</div>
                        <input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} className="w-full px-3 py-2 border rounded" required />
                    </label>
                    <label className="block mb-3">
                        <div className="text-sm text-slate-600 mb-1">Description</div>
                        <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full px-3 py-2 border rounded" rows={4} />
                    </label>

                    <label className="block mb-3">
                        <div className="text-sm text-slate-600 mb-1">Meta Title</div>
                        <input value={form.meta_title} onChange={(e) => setForm({ ...form, meta_title: e.target.value })} className="w-full px-3 py-2 border rounded" maxLength={60} />
                        <p className="text-xs text-slate-500 mt-1">Optional — used for SEO title (recommended 50-60 chars)</p>
                    </label>

                    <label className="block mb-3">
                        <div className="text-sm text-slate-600 mb-1">Meta Description</div>
                        <textarea value={form.meta_description} onChange={(e) => setForm({ ...form, meta_description: e.target.value })} className="w-full px-3 py-2 border rounded" rows={3} maxLength={160} />
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
