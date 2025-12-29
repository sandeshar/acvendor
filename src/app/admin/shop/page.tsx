"use client";

import { useEffect, useState } from 'react';
import ImageUploader from '@/components/shared/ImageUploader';
import { showToast } from '@/components/Toast';

export default function AdminShopPage() {
    const [hero, setHero] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [tagline, setTagline] = useState('');
    const [title, setTitle] = useState('');
    const [subtitle, setSubtitle] = useState('');
    const [description, setDescription] = useState('');
    const [ctaText, setCtaText] = useState('');
    const [ctaLink, setCtaLink] = useState('');
    const [backgroundImage, setBackgroundImage] = useState('');

    useEffect(() => { fetchHero(); }, []);

    const fetchHero = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/pages/shop/hero');
            const j = await res.json();
            setHero(j || null);
            setTagline(j?.tagline || ''); setTitle(j?.title || ''); setSubtitle(j?.subtitle || ''); setDescription(j?.description || ''); setCtaText(j?.cta_text || ''); setCtaLink(j?.cta_link || ''); setBackgroundImage(j?.background_image || '');
        } catch (e) { console.error('Failed to fetch shop hero', e); }
        finally { setLoading(false); }
    };

    const save = async () => {
        setSaving(true);
        try {
            const payload: any = { tagline, title, subtitle, description, cta_text: ctaText, cta_link: ctaLink, background_image: backgroundImage };
            let res;
            if (hero?.id) {
                payload.id = hero.id;
                res = await fetch('/api/pages/shop/hero', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
            } else {
                res = await fetch('/api/pages/shop/hero', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
            }
            const json = await res.json();
            if (!res.ok) throw new Error(json?.error || 'Save failed');
            showToast('Shop hero saved', { type: 'success' });
            fetchHero();
        } catch (e) { console.error('Failed to save shop hero', e); showToast('Save failed', { type: 'error' }); }
        finally { setSaving(false); }
    };

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Shop Page Settings</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium">Tagline</label>
                    <input value={tagline} onChange={e => setTagline(e.target.value)} className="mt-1 p-2 border rounded w-full" />
                    <label className="block text-sm font-medium mt-3">Title</label>
                    <input value={title} onChange={e => setTitle(e.target.value)} className="mt-1 p-2 border rounded w-full" />
                    <label className="block text-sm font-medium mt-3">Subtitle</label>
                    <input value={subtitle} onChange={e => setSubtitle(e.target.value)} className="mt-1 p-2 border rounded w-full" />
                    <label className="block text-sm font-medium mt-3">Description</label>
                    <textarea value={description} onChange={e => setDescription(e.target.value)} className="mt-1 p-2 border rounded w-full" rows={6} />
                    <div className="mt-4">
                        <button className="px-4 py-2 bg-primary text-white rounded" onClick={save} disabled={saving}>{saving ? 'Saving…' : 'Save'}</button>
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium">CTA Text</label>
                    <input value={ctaText} onChange={e => setCtaText(e.target.value)} className="mt-1 p-2 border rounded w-full" />
                    <label className="block text-sm font-medium mt-3">CTA Link</label>
                    <input value={ctaLink} onChange={e => setCtaLink(e.target.value)} className="mt-1 p-2 border rounded w-full" />
                    <label className="block text-sm font-medium mt-3">Background Image</label>
                    <div className="flex gap-2 items-center">
                        <input value={backgroundImage} onChange={e => setBackgroundImage(e.target.value)} className="mt-1 p-2 border rounded w-full" />
                        <div style={{width:120}}>
                            <ImageUploader label="Background" value={backgroundImage} onChange={(url:string) => setBackgroundImage(url)} folder="shop" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}