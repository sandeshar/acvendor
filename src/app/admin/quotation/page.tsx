"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Quotation, QuotationItem, ClientInfo } from '@/types/quotation';
import { showToast } from '@/components/Toast';
import { parsePriceNumber, formatPrice } from '@/utils/formatPrice';

function formatCurrency(n: number) { return n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }

export default function AdminQuotationPage() {
    const router = useRouter();
    const search = useSearchParams();
    const editId = search?.get('id') || undefined;
    const productIdsParam = search?.get('productIds');

    const [saving, setSaving] = useState(false);
    const [id, setId] = useState<string | number | undefined>(editId);
    const [number, setNumber] = useState<string | undefined>(undefined);
    const [status, setStatus] = useState<'draft' | 'sent' | 'cancelled'>('draft');

    const [client, setClient] = useState<ClientInfo>({});
    const [dateIssued, setDateIssued] = useState(() => new Date().toISOString().substring(0, 10));
    const [validUntil, setValidUntil] = useState(() => {
        const d = new Date(); d.setDate(d.getDate() + 30); return d.toISOString().substring(0, 10);
    });
    const [referenceNo, setReferenceNo] = useState('');
    const [notes, setNotes] = useState('');
    const [includeSignature, setIncludeSignature] = useState(false);
    const [items, setItems] = useState<QuotationItem[]>([]);
    const [globalDiscount, setGlobalDiscount] = useState<number>(0);
    const [taxPercent, setTaxPercent] = useState<number>(13);

    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<any[]>([]);

    useEffect(() => {
        if (!searchQuery) return setSearchResults([]);
        const t = setTimeout(async () => {
            try {
                const res = await fetch(`/api/products?q=${encodeURIComponent(searchQuery)}&limit=6`);
                if (res.ok) {
                    const arr = await res.json();
                    setSearchResults(arr);
                    console.debug('product search results', arr.length, arr.slice(0, 3));
                    if (!arr.length) showToast('No products found', { type: 'info' });
                } else { console.error('Product search returned non-OK', res.status); showToast('Product search returned status ' + res.status, { type: 'error' }); }
            } catch (e) { console.error('Product search failed', e); showToast('Product search failed', { type: 'error' }); }
        }, 250);
        return () => clearTimeout(t);
    }, [searchQuery]);

    useEffect(() => {
        if (!editId) return;
        (async () => {
            try {
                const res = await fetch(`/api/admin/quotations?id=${editId}`);
                if (!res.ok) return;
                const q: Quotation = await res.json();
                setId(q.id);
                setNumber(q.number);
                setStatus(q.status || 'draft');
                setClient(q.client || {});
                setDateIssued(q.dateIssued ? q.dateIssued.substring(0, 10) : new Date().toISOString().substring(0, 10));
                setValidUntil(q.validUntil ? q.validUntil.substring(0, 10) : (() => { const d = new Date(); d.setDate(d.getDate() + 30); return d.toISOString().substring(0, 10); })());
                setReferenceNo(q.referenceNo || '');
                setNotes(q.notes || '');
                setIncludeSignature(q.include_signature || false);
                // normalize items so inputs are always controlled (no undefined values)
                setItems((q.items || []).map(it => ({ description: it.description ?? '', qty: (it.qty ?? 1), unitPrice: (it.unitPrice ?? 0), discountPercent: (it.discountPercent ?? 0) })));
                setGlobalDiscount(q.totals?.discount ? Number((q.totals?.discount / (q.totals?.subtotal || 1) * 100).toFixed(2)) : 0);
                setTaxPercent(q.totals && q.totals.tax ? Math.round((q.totals.tax / ((q.totals.subtotal - (q.totals.discount || 0)) || 1)) * 100) : 10);
            } catch (e) { console.error(e); }
        })();
    }, [editId]);

    // If productIds query is present (from products > Make a Quotation), fetch and prepopulate items
    useEffect(() => {
        if (!productIdsParam || editId) return;
        (async () => {
            try {
                const res = await fetch(`/api/products?ids=${encodeURIComponent(productIdsParam)}`);
                if (!res.ok) return;
                const arr = await res.json();
                if (Array.isArray(arr) && arr.length) {
                    const mapped = arr.map((p: any) => ({ description: p.title || p.slug, qty: 1, unitPrice: p.price ? parsePriceNumber(p.price) : 0, discountPercent: 0 }));
                    setItems(prev => [...mapped, ...prev]);
                }
            } catch (e) { console.error(e); }
        })();
    }, [productIdsParam, editId]);

    const addProduct = (p: any) => {
        const price = p.price ? parsePriceNumber(p.price) : 0;
        const desc = p.title || p.name || (p.slug || 'Product');
        setItems(prev => [...prev, { description: desc, qty: 1, unitPrice: price, discountPercent: 0 }]);
        setSearchQuery('');
        setSearchResults([]);
        console.debug('addProduct:', desc, price);
        showToast(`Added ${desc}`, { type: 'success' });
    };

    const addCustomItem = () => setItems(prev => [...prev, { description: '', qty: 1, unitPrice: 0, discountPercent: 0 }]);
    const removeItem = (idx: number) => setItems(prev => prev.filter((_, i) => i !== idx));
    const updateItem = (idx: number, changes: Partial<QuotationItem>) => setItems(prev => prev.map((it, i) => i === idx ? { ...it, ...changes } : it));

    const totals = useMemo(() => {
        const subtotal = items.reduce((s, it) => s + (Number(it.qty || 0) * Number(it.unitPrice || 0) * (1 - (Number(it.discountPercent || 0) / 100))), 0);
        const discount = subtotal * (Number(globalDiscount || 0) / 100);
        const taxable = Math.max(0, subtotal - discount);
        const tax = taxable * (Number(taxPercent || 0) / 100);
        const grandTotal = taxable + tax;
        return { subtotal, discount, tax, grandTotal };
    }, [items, globalDiscount, taxPercent]);

    const saveDraft = async () => {
        setSaving(true);
        try {
            // normalize client and payload to ensure fields are persisted
            const normalizedClient = {
                name: client.name || '',
                company: (client as any).company || '',
                email: client.email || '',
                phone: client.phone || '',
                address: client.address || '',
                pan: client.pan || ''
            };
            const payload: Quotation = {
                id,
                number,
                status: 'draft',
                client: normalizedClient,
                dateIssued: dateIssued || new Date().toISOString().substring(0, 10),
                validUntil: validUntil || (() => { const d = new Date(); d.setDate(d.getDate() + 30); return d.toISOString().substring(0, 10); })(),
                referenceNo: referenceNo || '',
                items,
                notes: notes || '',
                include_signature: includeSignature,
                totals: { subtotal: totals.subtotal, discount: totals.discount, tax: totals.tax, grandTotal: totals.grandTotal }
            };
            console.debug('Saving quotation payload', payload);
            const res = id ? await fetch('/api/admin/quotations', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }) : await fetch('/api/admin/quotations', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
            if (!res.ok) {
                let msg = 'Failed to save';
                try { const body = await res.json(); if (body?.error) msg = body.error; else msg = JSON.stringify(body); } catch (_e) { try { const t = await res.text(); if (t) msg = t; } catch (_e) { } }
                throw new Error(msg);
            }
            const json = await res.json();
            setId(json.id);
            setNumber(json.number);
            showToast('Draft saved', { type: 'success' });
            return json;
        } catch (e: any) {
            console.error('Save draft error', e);
            showToast(e?.message || 'Save failed', { type: 'error' });
            return null;
        } finally { setSaving(false); }
    };

    const saveAndSend = async () => {
        setSaving(true);
        try {
            // ensure current edits are saved first (capture saved record)
            const saved = await saveDraft();
            const quoteId = saved?.id || id;
            if (!quoteId) throw new Error('Missing id after save');

            // test connectivity to API before marking sent
            try {
                const test = await fetch('/api/admin/quotations');
                if (!test.ok) throw new Error('API returned ' + test.status);
                // ok continue
            } catch (e) {
                console.error('API connectivity test failed', e);
                throw new Error('API connectivity test failed: ' + (e as any)?.message);
            }

            // mark quotation as sent and get the updated record
            const res = await fetch('/api/admin/quotations', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: quoteId, status: 'sent' }) });
            if (!res.ok) {
                let msg = 'Failed to update status';
                try { const body = await res.json(); if (body?.error) msg = body.error; else msg = JSON.stringify(body); } catch (_e) { try { const t = await res.text(); if (t) msg = t; } catch (_e) { } }
                throw new Error(msg);
            }
            const json = await res.json();
            setStatus('sent');
            showToast('Quotation sent', { type: 'success' });
            // navigate to print preview (same tab)
            router.push(`/admin/quotation/print?id=${json.id}`);
        } catch (e: any) { console.error('Send error', e); showToast(e?.message || 'Failed to send', { type: 'error' }); } finally { setSaving(false); }
    };

    return (
        <main className="flex-1 w-full max-w-[1200px] mx-auto p-4 md:p-8 flex flex-col gap-6">
            {/* Page Heading & Actions */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                        <h1 className="text-3xl md:text-4xl font-black leading-tight tracking-tight">Create Quotation</h1>
                        <Link href="/admin/quotation/drafts" className="text-xs font-bold text-primary hover:underline ml-4 mt-2">View All Drafts</Link>
                    </div>
                    <p className="text-[#616f89] text-base font-normal">{number ? `Quotation ${number}` : 'New Quotation'}</p>
                </div>

                <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${status === 'draft' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>{status === 'draft' ? 'Draft' : 'Sent'}</span>
                </div>
            </div>

            {/* Client Information Card */}
            <section className="bg-white rounded-xl shadow-sm border border-[#f0f2f4] p-6">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">person</span>
                    Client Details
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* Client Info */}
                    <div className="flex flex-col gap-2 md:col-span-2">
                        <label className="flex flex-col gap-2">
                            <span className="text-sm font-medium text-[#616f89]">Client Name</span>
                            <input value={client.name ?? ''} onChange={(e) => setClient(prev => ({ ...prev, name: e.target.value }))} className="w-full rounded-lg border border-[#dbdfe6] bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all" placeholder="Client name" type="text" />
                        </label>



                        <div className="flex gap-2">
                            <input value={client.email ?? ''} onChange={(e) => setClient(prev => ({ ...prev, email: e.target.value }))} className="w-1/2 rounded-lg border border-[#dbdfe6] bg-white px-4 py-2 text-sm" placeholder="Email" type="email" />
                            <input value={client.phone ?? ''} onChange={(e) => setClient(prev => ({ ...prev, phone: e.target.value }))} className="w-1/2 rounded-lg border border-[#dbdfe6] bg-white px-4 py-2 text-sm" placeholder="Phone" type="text" />
                        </div>
                    </div>

                    {/* Quotation Date */}
                    <label className="flex flex-col gap-2">
                        <span className="text-sm font-medium text-[#616f89]">Date Issued</span>
                        <input value={dateIssued} onChange={(e) => setDateIssued(e.target.value)} className="w-full rounded-lg border border-[#dbdfe6] bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all" type="date" />
                    </label>

                    {/* Valid Until */}
                    <label className="flex flex-col gap-2">
                        <span className="text-sm font-medium text-[#616f89]">Valid Until</span>
                        <input value={validUntil} onChange={(e) => setValidUntil(e.target.value)} className="w-full rounded-lg border border-[#dbdfe6] bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all" type="date" />
                    </label>

                    {/* Reference Number */}
                    <label className="flex flex-col gap-2 md:col-span-1">
                        <span className="text-sm font-medium text-[#616f89]">Reference No. (Optional)</span>
                        <input value={referenceNo} onChange={(e) => setReferenceNo(e.target.value)} className="w-full rounded-lg border border-[#dbdfe6] bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all" placeholder="e.g. PO-55912" type="text" />
                    </label>

                    {/* Address and PAN (new row) */}
                    <label className="flex flex-col gap-2 md:col-span-2">
                        <span className="text-sm font-medium text-[#616f89]">Address</span>
                        <input value={client.address ?? ''} onChange={(e) => setClient(prev => ({ ...prev, address: e.target.value }))} className="w-full rounded-lg border border-[#dbdfe6] bg-white px-4 py-3 text-sm" placeholder="Client address" type="text" />
                    </label>

                    <label className="flex flex-col gap-2 md:col-span-1">
                        <span className="text-sm font-medium text-[#616f89]">PAN</span>
                        <input value={client.pan ?? ''} onChange={(e) => setClient(prev => ({ ...prev, pan: e.target.value }))} className="w-full rounded-lg border border-[#dbdfe6] bg-white px-4 py-3 text-sm" placeholder="PAN" type="text" />
                    </label>
                </div>
            </section>

            {/* Product & Line Items Section */}
            <section className="bg-white rounded-xl shadow-sm border border-[#f0f2f4] flex flex-col overflow-hidden">
                {/* Search Header */}
                <div className="p-6 border-b border-[#f0f2f4] bg-gray-50/50">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <h3 className="text-lg font-bold flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary">shopping_cart</span>
                            Items &amp; Products
                        </h3>

                        <div className="relative w-full md:max-w-md">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <span className="material-symbols-outlined text-gray-400">add_circle</span>
                            </div>
                            <input value={searchQuery} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); if (searchResults.length) addProduct(searchResults[0]); else addCustomItem(); } }} onChange={(e) => setSearchQuery(e.target.value)} className="block w-full rounded-lg border-0 py-2.5 pl-10 pr-4 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6 bg-white shadow-sm" placeholder="Search products to add..." type="text" />
                            <button onClick={() => { if (searchResults.length) addProduct(searchResults[0]); else addCustomItem(); }} className="absolute inset-y-0 right-0 px-4 py-1 m-1 bg-primary text-white text-xs font-bold rounded hover:bg-primary/90 transition-colors">Add</button>

                            {searchResults.length > 0 && (
                                <div className="absolute left-0 right-0 mt-12 bg-white border border-[#e6e9ef] rounded shadow-md z-10 max-h-60 overflow-auto">
                                    {searchResults.map((p, i) => (
                                        <button key={i} onClick={() => addProduct(p)} className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-3">
                                            <div className="text-sm font-medium">{p.title || p.name || p.slug}</div>
                                            <div className="ml-auto text-xs text-gray-500">{p.model ? `${p.model}${p.price ? ' • ' : ''}` : ''}{p.price ? `NPR ${formatPrice(p.price)}` : ''}</div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 text-[#616f89] text-xs font-semibold uppercase tracking-wider border-b border-[#f0f2f4]">
                                <th className="px-6 py-4 w-[40%]">Item Description</th>
                                <th className="px-6 py-4 w-[10%]">Qty</th>
                                <th className="px-6 py-4 w-[15%]">Unit Price</th>
                                <th className="px-6 py-4 w-[15%]">Discount</th>
                                <th className="px-6 py-4 w-[15%] text-right">Amount</th>
                                <th className="px-6 py-4 w-[5%] text-center"></th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-[#f0f2f4]">
                            {items.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-center text-sm text-gray-500">No items yet. Use the search box above or click "Add Custom Item".</td>
                                </tr>
                            ) : items.map((it, idx) => (
                                <tr key={idx} className="group hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <input value={it.description ?? ''} onChange={(e) => updateItem(idx, { description: e.target.value })} className="w-full rounded border border-gray-200 bg-white px-2 py-1 text-sm focus:ring-1 focus:ring-primary" />
                                        {(it.description ?? '') !== '' && <div className="text-xs text-gray-500 mt-1">{/* details */}</div>}
                                    </td>
                                    <td className="px-6 py-4">
                                        <input min={1} type="number" value={it.qty ?? 0} onChange={(e) => updateItem(idx, { qty: Number(e.target.value) || 0 })} className="w-20 rounded border border-gray-200 bg-white px-2 py-1.5 text-sm text-center" />
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="relative">
                                            <span className="absolute left-2 top-1.5 text-gray-400 text-xs">NPR</span>
                                            <input type="number" value={it.unitPrice ?? 0} onChange={(e) => updateItem(idx, { unitPrice: Number(e.target.value) || 0 })} className="w-full rounded border border-gray-200 bg-white pl-10 pr-2 py-1.5 text-sm text-right" />
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="relative">
                                            <input type="number" value={it.discountPercent ?? 0} onChange={(e) => updateItem(idx, { discountPercent: Number(e.target.value) || 0 })} className="w-full rounded border border-gray-200 bg-white pl-2 pr-6 py-1.5 text-sm text-right text-green-600 font-medium" />
                                            <span className="absolute right-2 top-1.5 text-gray-400 text-xs">%</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right font-bold text-sm">{formatCurrency((Number(it.qty || 0) * Number(it.unitPrice || 0) * (1 - (Number(it.discountPercent || 0) / 100))))}</td>
                                    <td className="px-6 py-4 text-center">
                                        <button onClick={() => removeItem(idx)} className="text-gray-400 hover:text-red-500 transition-colors p-1 rounded-full hover:bg-red-50">
                                            <span className="material-symbols-outlined text-[20px]">delete</span>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* Table Footer */}
                    <div className="p-4 bg-gray-50/50 border-t border-[#f0f2f4]">
                        <button onClick={addCustomItem} className="text-primary text-sm font-bold flex items-center gap-1 hover:underline">
                            <span className="material-symbols-outlined text-[18px]">add</span> Add Custom Item
                        </button>
                    </div>
                </div>
            </section>

            {/* Summary & Totals */}
            <div className="flex flex-col md:flex-row gap-6 justify-end items-start md:items-end">
                {/* Notes Section (Optional Left Side) */}
                <div className="w-full md:flex-1">
                    <div className="mb-4 flex items-center gap-3">
                        <input
                            id="includeSignature"
                            type="checkbox"
                            checked={includeSignature}
                            onChange={(e) => setIncludeSignature(e.target.checked)}
                            className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                        />
                        <label htmlFor="includeSignature" className="text-sm font-semibold text-gray-700 cursor-pointer">
                            Include Digital Signature on Print
                        </label>
                    </div>
                    <label className="block mb-2 text-sm font-medium text-[#616f89]">Notes / Payment Terms</label>
                    <textarea value={notes} onChange={(e) => setNotes(e.target.value)} className="w-full rounded-xl border border-[#dbdfe6] bg-white p-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all resize-none" placeholder="Enter notes for the client..." rows={4}></textarea>                    </div>                {/* Calculation Card */}
                <div className="w-full md:w-[400px] bg-white rounded-xl shadow-sm border border-[#f0f2f4] p-6 flex flex-col gap-4">
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-[#616f89]">Subtotal</span>
                        <span className="font-medium">NPR {formatCurrency(totals.subtotal)}</span>
                    </div>

                    <div className="flex justify-between items-center text-sm">
                        <span className="text-[#616f89] flex items-center gap-1">
                            Global Discount
                            <span className="material-symbols-outlined text-[16px] text-gray-400 cursor-help" title="Applied to subtotal">help</span>
                        </span>
                        <div className="flex items-center gap-2">
                            <div className="relative w-24">
                                <input className="w-full rounded border border-gray-200 bg-white pl-2 pr-6 py-1 text-right text-xs focus:ring-primary focus:border-primary" type="number" value={globalDiscount} onChange={(e) => setGlobalDiscount(Number(e.target.value) || 0)} />
                                <span className="absolute right-2 top-1 text-gray-400 text-xs">%</span>
                            </div>
                            <span className="font-medium text-red-500">-NPR {formatCurrency(totals.discount)}</span>
                        </div>
                    </div>

                    <div className="flex justify-between items-center text-sm">
                        <span className="text-[#616f89]">Tax / VAT ({taxPercent}%)</span>
                        <div className="flex items-center gap-2">
                            <input className="w-20 rounded border border-gray-200 bg-white pl-2 pr-2 py-1 text-right text-xs focus:ring-primary focus:border-primary" type="number" value={taxPercent} onChange={(e) => setTaxPercent(Number(e.target.value) || 0)} />
                            <span className="font-medium">NPR {formatCurrency(totals.tax)}</span>
                        </div>
                    </div>

                    <div className="border-t border-dashed border-gray-200 my-2"></div>

                    <div className="flex justify-between items-center">
                        <span className="text-lg font-bold text-[#111318]">Grand Total</span>
                        <span className="text-2xl font-black text-primary">NPR {formatCurrency(totals.grandTotal)}</span>
                    </div>

                    <div className="mt-4 flex flex-col gap-3">
                        <button onClick={saveAndSend} disabled={saving} className="w-full flex items-center justify-center gap-2 rounded-lg h-12 px-6 bg-primary text-white text-base font-bold shadow-lg shadow-primary/30 hover:bg-primary/90 hover:shadow-xl transition-all active:scale-[0.98]">
                            <span className="material-symbols-outlined text-[20px]">send</span>
                            {saving ? 'Saving...' : 'Save'}
                        </button>

                        <button onClick={() => router.back()} className="w-full text-center text-sm font-medium text-[#616f89] hover:text-[#111318] transition-colors">
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        </main>
    );
}
