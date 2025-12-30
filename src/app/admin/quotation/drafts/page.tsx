"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Quotation } from '@/types/quotation';
import { showToast } from '@/components/Toast';

export default function DraftsPage() {
    const [loading, setLoading] = useState(true);
    const [drafts, setDrafts] = useState<Quotation[]>([]);
    const router = useRouter();

    const load = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/quotations');
            if (!res.ok) throw new Error('Failed to fetch');
            const arr: Quotation[] = await res.json();
            setDrafts((arr || []).filter(a => (a.status || 'draft') === 'draft'));
        } catch (e: any) {
            console.error('Failed to load drafts', e);
            showToast('Failed to load drafts', { type: 'error' });
        } finally { setLoading(false); }
    };

    useEffect(() => { load(); }, []);

    const send = async (id: number) => {
        try {
            const res = await fetch('/api/admin/quotations', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, status: 'sent' }) });
            if (!res.ok) {
                const body = await res.text();
                throw new Error(body || 'Failed');
            }
            const json = await res.json();
            showToast('Quotation sent', { type: 'success' });
            router.push(`/admin/quotation/print?id=${json.id}`);
        } catch (e: any) {
            console.error('Send failed', e);
            showToast(e?.message || 'Send failed', { type: 'error' });
        }
    };

    const remove = async (id: number) => {
        if (!confirm('Delete this draft?')) return;
        try {
            const res = await fetch(`/api/admin/quotations?id=${id}`, { method: 'DELETE' });
            if (!res.ok) throw new Error('Delete failed');
            showToast('Draft deleted', { type: 'success' });
            load();
        } catch (e: any) { console.error(e); showToast(e?.message || 'Delete failed', { type: 'error' }); }
    };

    return (
        <main className="max-w-[1100px] mx-auto p-6">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold">Draft Quotations</h1>
                    <p className="text-sm text-gray-500">Manage your saved drafts</p>
                </div>
                <div className="flex gap-2">
                    <Link href="/admin/quotation" className="px-3 py-2 bg-primary text-white rounded">Create New</Link>
                </div>
            </div>

            <div className="bg-white rounded shadow-sm border">
                <table className="w-full table-auto">
                    <thead>
                        <tr className="text-sm text-gray-500 bg-gray-50">
                            <th className="px-4 py-3 text-left">#</th>
                            <th className="px-4 py-3 text-left">Quotation</th>
                            <th className="px-4 py-3 text-left">Client</th>
                            <th className="px-4 py-3 text-left">Date</th>
                            <th className="px-4 py-3 text-right">Total</th>
                            <th className="px-4 py-3 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={6} className="p-6 text-center">Loading...</td></tr>
                        ) : drafts.length === 0 ? (
                            <tr><td colSpan={6} className="p-6 text-center text-sm text-gray-500">No drafts found.</td></tr>
                        ) : drafts.map((d) => (
                            <tr key={d.id} className="border-t hover:bg-gray-50">
                                <td className="px-4 py-3">{d.id}</td>
                                <td className="px-4 py-3">{d.number || '-'} {d.referenceNo ? `(${d.referenceNo})` : ''}</td>
                                <td className="px-4 py-3">{d.client?.name || '-'}</td>
                                <td className="px-4 py-3">{d.dateIssued?.substring(0, 10) || '-'}</td>
                                <td className="px-4 py-3 text-right">{d.totals ? `$${Number(d.totals.grandTotal || 0).toLocaleString()}` : '-'}</td>
                                <td className="px-4 py-3 text-right flex gap-2 justify-end">
                                    <Link href={`/admin/quotation?id=${d.id}`} className="px-3 py-1 bg-white border rounded text-sm">Edit</Link>
                                    <button onClick={() => send(d.id!)} className="px-3 py-1 bg-green-600 text-white rounded text-sm">Send</button>
                                    <Link href={`/admin/quotation/print?id=${d.id}`} className="px-3 py-1 bg-gray-200 rounded text-sm">Print</Link>
                                    <button onClick={() => remove(d.id!)} className="px-3 py-1 bg-red-50 text-red-600 rounded text-sm">Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </main>
    );
}