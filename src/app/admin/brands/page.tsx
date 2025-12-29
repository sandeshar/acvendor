"use client";

import { useEffect, useState } from 'react';
import ImageUploader from '@/components/shared/ImageUploader';
import { showToast } from '@/components/Toast';

export default function AdminBrandsPage() {
    const [brands, setBrands] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState<any | null>(null);
    const [name, setName] = useState('');
    const [slug, setSlug] = useState('');
    const [logo, setLogo] = useState('');

    useEffect(() => { fetchBrands(); }, []);

    const fetchBrands = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/pages/services/brands');
            const data = await res.json();
            setBrands(data || []);
        } catch (e) {
            console.error('Failed to fetch brands', e);
        } finally { setLoading(false); }
    };

    const save = async () => {
        try {
            const payload: any = { name, slug, logo };
            if (editing) payload.id = editing.id;
            const url = '/api/pages/services/brands';
            const method = editing ? 'PUT' : 'POST';
            const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
            const json = await res.json();
            if (!res.ok) throw new Error(json?.error || 'Failed to save');
            showToast('Saved', { type: 'success' });
            setEditing(null); setName(''); setSlug(''); setLogo('');
            fetchBrands();
        } catch (e) {
            console.error('Failed to save brand', e);
            showToast('Save failed', { type: 'error' });
        }
    };

    const edit = (b: any) => { setEditing(b); setName(b.name || ''); setSlug(b.slug || ''); setLogo(b.logo || ''); };
    const del = async (id: number) => {
        if (!confirm('Delete this brand?')) return;
        try {
            const res = await fetch(`/api/pages/services/brands?id=${id}`, { method: 'DELETE' });
            if (!res.ok) throw new Error('Delete failed');
            showToast('Deleted');
            fetchBrands();
        } catch (e) { console.error('Delete failed', e); showToast('Delete failed', { type: 'error' }); }
    };

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Manage Brands</h1>
            <div className="mb-6">
                <label className="block text-sm font-medium">Name</label>
                <input value={name} onChange={e => setName(e.target.value)} className="mt-1 p-2 border rounded w-full" />
                <label className="block text-sm font-medium mt-3">Slug</label>
                <input value={slug} onChange={e => setSlug(e.target.value)} className="mt-1 p-2 border rounded w-full" placeholder="lowercase-slug" />
                <label className="block text-sm font-medium mt-3">Logo (URL)</label>
                <div className="flex gap-2 items-center">
                    <input value={logo} onChange={e => setLogo(e.target.value)} className="mt-1 p-2 border rounded w-full" />
                    <div style={{width:120}}>
                        <ImageUploader label="Logo" value={logo} onChange={(url:string) => setLogo(url)} folder="brands" />
                    </div>
                </div>
                <div className="mt-4">
                    <button className="px-4 py-2 bg-primary text-white rounded" onClick={save}>{editing ? 'Update' : 'Add Brand'}</button>
                    {editing && <button className="ml-3 px-4 py-2 border rounded" onClick={() => { setEditing(null); setName(''); setSlug(''); setLogo(''); }}>Cancel</button>}
                </div>
            </div>

            <div>
                <h2 className="text-xl font-semibold mb-2">Existing Brands</h2>
                {loading ? <p>Loading…</p> : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {brands.map(b => (
                            <div key={b.id} className="p-4 border rounded flex items-center justify-between">
                                <div>
                                    <div className="font-bold">{b.name} <span className="text-xs text-gray-500">{b.slug ? `(${b.slug})` : ''}</span></div>
                                    <div className="text-sm text-gray-500">{b.link}</div>
                                </div>
                                <div className="flex gap-2">
                                    <button className="px-3 py-1 border rounded" onClick={() => edit(b)}>Edit</button>
                                    <button className="px-3 py-1 border rounded text-red-600" onClick={() => del(b.id)}>Delete</button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}