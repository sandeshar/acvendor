"use client";

import { useEffect, useState } from 'react';
import { showToast } from '@/components/Toast';

type FooterLink = { id?: number; label: string; href: string; isExternal?: boolean; order?: number };
type FooterSection = { id?: number; title: string; order?: number; links?: FooterLink[] };

export default function FooterManagerPage() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [sections, setSections] = useState<FooterSection[]>([]);
    const [footerText, setFooterText] = useState('');

    useEffect(() => {
        fetchSections();
    }, []);

    const fetchSections = async () => {
        setLoading(true);
        try {
            // Prefer unified store settings which contains footerSections and footerText
            const resStore = await fetch('/api/store-settings', { cache: 'no-store' });
            const storeJson = await resStore.json();
            if (storeJson?.success && storeJson.data) {
                setSections(storeJson.data.footerSections || []);
                setFooterText(storeJson.data.footerText || storeJson.data.footer_text || '');
                setLoading(false);
                return;
            }

            // Fallback to footer-sections endpoint
            const res = await fetch('/api/footer-sections', { cache: 'no-store' });
            const json = await res.json();
            if (json?.success) {
                setSections(json.data || []);
            }
        } catch (e) {
            console.error('Failed to load footer sections', e);
        } finally {
            setLoading(false);
        }
    };

    const addSection = () => {
        setSections((s) => [...s, { title: 'New Section', links: [], order: s.length }]);
    };

    const deleteSection = async (id?: number, idx?: number) => {
        if (id && confirm('Delete this section?')) {
            try {
                const res = await fetch('/api/footer-sections', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) });
                const json = await res.json();
                if (!json?.success) throw new Error(json?.error || 'Delete failed');
                showToast('Section deleted', { type: 'success' });
                fetchSections();
                return;
            } catch (e: any) {
                console.error('Delete failed', e);
                showToast(e.message || 'Delete failed', { type: 'error' });
                return;
            }
        }
        // local-only removal for unsaved sections
        if (typeof idx === 'number') {
            setSections((s) => s.filter((_, i) => i !== idx));
        }
    };

    const addLink = (sectionIdx: number) => {
        setSections((s) => {
            const copy = [...s];
            copy[sectionIdx].links = copy[sectionIdx].links || [];
            copy[sectionIdx].links!.push({ label: 'New Link', href: '#', order: copy[sectionIdx].links!.length });
            return copy;
        });
    };

    const removeLink = (sectionIdx: number, linkIdx: number) => {
        setSections((s) => {
            const copy = [...s];
            if (!copy[sectionIdx].links) return copy;
            copy[sectionIdx].links = copy[sectionIdx].links!.filter((_, i) => i !== linkIdx);
            return copy;
        });
    };

    const move = (arr: any[], from: number, to: number) => {
        if (to < 0 || to >= arr.length) return arr;
        const a = [...arr];
        const [item] = a.splice(from, 1);
        a.splice(to, 0, item);
        return a;
    };

    const moveSection = (idx: number, dir: 'up' | 'down') => {
        setSections((s) => move(s, idx, dir === 'up' ? idx - 1 : idx + 1).map((sec, i) => ({ ...sec, order: i })));
    };

    const moveLink = (sectionIdx: number, linkIdx: number, dir: 'up' | 'down') => {
        setSections((s) => {
            const copy = [...s];
            if (!copy[sectionIdx].links) return copy;
            copy[sectionIdx].links = move(copy[sectionIdx].links!, linkIdx, dir === 'up' ? linkIdx - 1 : linkIdx + 1).map((l, i) => ({ ...l, order: i }));
            return copy;
        });
    };

    const saveAll = async () => {
        setSaving(true);
        try {
            // Fetch current store settings so we don't accidentally wipe other fields
            const storeRes = await fetch('/api/store-settings', { cache: 'no-store' });
            const storeJson = await storeRes.json();
            const currentStore = storeJson?.data || {};

            const payload = {
                ...currentStore,
                footerSections: sections.map((sec, sIdx) => ({ title: sec.title, order: sIdx, links: (sec.links || []).map((l: any, i: number) => ({ label: l.label, href: l.href, isExternal: !!l.isExternal, order: i })) })),
                footerText: footerText,
            };

            const res = await fetch('/api/store-settings', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
            const json = await res.json();
            if (!json?.success) throw new Error(json?.error || 'Save failed');
            showToast('Footer sections saved', { type: 'success' });
            setSections(json.data?.footerSections || []);
            setFooterText(json.data?.footerText || json.data?.footer_text || '');
        } catch (e: any) {
            console.error('Save failed', e);
            showToast(e.message || 'Save failed', { type: 'error' });
        } finally {
            setSaving(false);
        }
    };

    return (
        <main className="flex-1 flex flex-col">
            <div className="flex-1 p-8 overflow-y-auto">
                <div className="max-w-5xl mx-auto">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-slate-900">Footer Manager</h1>
                        <p className="text-slate-500 mt-1">Manage footer sections and links displayed on the site.</p>
                    </div>

                    <div className="mb-6 flex items-center gap-3">
                        <button onClick={addSection} className="px-4 py-2 bg-primary text-white rounded">Add Section</button>
                        <button onClick={saveAll} disabled={saving} className="px-4 py-2 bg-indigo-700 text-white rounded disabled:opacity-60">{saving ? 'Saving…' : 'Save All'}</button>
                        <button onClick={fetchSections} className="px-4 py-2 border rounded">Reload</button>
                    </div>

                    <div className="mb-6">
                        <label className="block text-sm font-medium text-slate-700 mb-2">Footer Text</label>
                        <input value={footerText} onChange={(e) => setFooterText(e.target.value)} className="w-full px-4 py-2 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-primary focus:border-primary" placeholder="Copyright text or footer message" />
                    </div>

                    {loading ? (
                        <div className="text-slate-500">Loading…</div>
                    ) : (
                        <div className="space-y-4">
                            {sections.map((section, sIdx) => (
                                <div key={section.id || sIdx} className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
                                    <div className="flex items-center gap-3">
                                        <div className="flex-1">
                                            <input value={section.title} onChange={(e) => setSections((s) => s.map((sec, i) => i === sIdx ? { ...sec, title: e.target.value } : sec))} className="w-full px-3 py-2 border rounded" />
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button title="Move up" onClick={() => moveSection(sIdx, 'up')} className="px-2 py-1 border rounded">↑</button>
                                            <button title="Move down" onClick={() => moveSection(sIdx, 'down')} className="px-2 py-1 border rounded">↓</button>
                                            <button title="Delete" onClick={() => deleteSection(section.id, sIdx)} className="px-2 py-1 border rounded text-red-600">Delete</button>
                                        </div>
                                    </div>

                                    <div className="mt-4">
                                        <h3 className="text-sm font-semibold text-slate-700">Links</h3>
                                        <div className="space-y-2 mt-2">
                                            {(section.links || []).map((ln, lIdx) => (
                                                <div key={ln.id || lIdx} className="flex items-center gap-2">
                                                    <input value={ln.label} onChange={(e) => setSections((s) => s.map((sec, i) => i === sIdx ? { ...sec, links: (sec.links || []).map((l, j) => j === lIdx ? { ...l, label: e.target.value } : l) } : sec))} className="px-3 py-2 border rounded flex-1" />
                                                    <input value={ln.href} onChange={(e) => setSections((s) => s.map((sec, i) => i === sIdx ? { ...sec, links: (sec.links || []).map((l, j) => j === lIdx ? { ...l, href: e.target.value } : l) } : sec))} className="px-3 py-2 border rounded flex-1" />
                                                    <button title="Move up" onClick={() => moveLink(sIdx, lIdx, 'up')} className="px-2 py-1 border rounded">↑</button>
                                                    <button title="Move down" onClick={() => moveLink(sIdx, lIdx, 'down')} className="px-2 py-1 border rounded">↓</button>
                                                    <button title="Remove" onClick={() => removeLink(sIdx, lIdx)} className="px-2 py-1 border rounded text-red-600">Remove</button>
                                                </div>
                                            ))}

                                            <div>
                                                <button onClick={() => addLink(sIdx)} className="px-3 py-1 border rounded">Add Link</button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {sections.length === 0 && <div className="text-slate-500">No footer sections set yet.</div>}
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
}