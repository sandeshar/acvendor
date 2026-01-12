"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { showToast } from '@/components/Toast';

export default function BlogCategoriesManager() {
    const [cats, setCats] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchCats = async () => {
        try {
            setLoading(true);
            const res = await fetch('/api/blog/categories');
            const body = await res.json();
            setCats(Array.isArray(body) ? body : []);
        } catch (e) {
            console.error('Error fetching blog categories', e);
            showToast('Failed to fetch categories', { type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchCats(); }, []);

    const del = async (id: string) => {
        if (!confirm('Delete category?')) return;
        try {
            const res = await fetch('/api/blog/categories', { method: 'DELETE', body: JSON.stringify({ id }), headers: { 'Content-Type': 'application/json' } });
            const body = await res.json();
            if (!res.ok) throw new Error(body.error || 'Failed');
            showToast('Deleted', { type: 'success' });
            fetchCats();
        } catch (e: any) {
            console.error('Delete error', e);
            showToast(e.message || 'Failed to delete', { type: 'error' });
        }
    };

    const [query, setQuery] = useState('');

    const filtered = cats.filter(c => {
        const q = query.trim().toLowerCase();
        if (!q) return true;
        return (c.name || '').toLowerCase().includes(q) || (c.slug || '').toLowerCase().includes(q);
    });

    return (
        <main className="flex-1 p-6 overflow-y-auto">
            <div className="max-w-5xl mx-auto">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-bold">Blog Categories</h1>
                        <p className="text-sm text-slate-500 mt-1">Manage categories used across your blog — <span className="font-medium">{cats.length}</span> total</p>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <span className="material-symbols-outlined text-slate-400 absolute left-3 top-1/2 -translate-y-1/2">search</span>
                            <input
                                value={query}
                                onChange={e => setQuery(e.target.value)}
                                placeholder="Search categories by name or slug"
                                className="pl-10 pr-4 py-2 rounded bg-white border border-slate-200 shadow-sm text-sm w-72"
                                aria-label="Search categories"
                            />
                        </div>
                        <Link href="/admin/blog/categories/add" className="inline-flex items-center gap-2 bg-primary text-white px-4 py-2 rounded shadow-sm hover:brightness-105 transition">
                            <span className="material-symbols-outlined">add</span>
                            Add Category
                        </Link>
                    </div>
                </div>

                <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-4">
                    {loading ? (
                        <div className="flex items-center gap-3">
                            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                            <p className="text-slate-600">Loading categories…</p>
                        </div>
                    ) : (!cats || cats.length === 0) ? (
                        <div className="text-center py-12">
                            <div className="text-4xl">📂</div>
                            <h2 className="mt-4 text-lg font-semibold">No categories yet</h2>
                            <p className="text-sm text-slate-500 mt-2">Create categories to organize your blog posts.</p>
                            <div className="mt-4">
                                <Link href="/admin/blog/categories/add" className="bg-primary text-white px-4 py-2 rounded">Add your first category</Link>
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {filtered.map(c => (
                                <div key={c._id} className="flex items-center justify-between gap-4 p-3 rounded-lg border border-slate-100 hover:shadow-md transition bg-white">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                                            <span className="material-symbols-outlined">category</span>
                                        </div>
                                        <div>
                                            <div className="font-medium text-slate-900">{c.name}</div>
                                            <div className="text-xs text-slate-500">{c.slug}</div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <Link href={`/admin/blog/categories/edit/${c.slug}`} className="text-sm text-primary px-2 py-1 rounded hover:bg-primary/5">Edit</Link>
                                        <button onClick={() => del(c._id)} className="text-sm text-red-500 px-2 py-1 rounded hover:bg-red-50">Delete</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
}
