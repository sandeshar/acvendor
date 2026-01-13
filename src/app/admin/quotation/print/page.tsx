"use client";

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Quotation } from '@/types/quotation';

function formatCurrency(n: number) { return n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }

export default function AdminQuotationPrintPage() {
    const search = useSearchParams();
    const id = search?.get('id');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [quotation, setQuotation] = useState<Quotation | null>(null);
    const [storeSettings, setStoreSettings] = useState<any>(null);

    useEffect(() => {
        if (!id) return setLoading(false);
        (async () => {
            try {
                const res = await fetch(`/api/admin/quotations?id=${id}`);
                if (!res.ok) {
                    const data = await res.json().catch(() => ({}));
                    setError(data.error || `Error ${res.status}`);
                    setQuotation(null);
                    return;
                }
                const json = await res.json();
                setQuotation(json as Quotation);
            } catch (e) {
                console.error(e);
                setError("Failed to fetch quotation");
            } finally { setLoading(false); }
        })();
    }, [id]);

    useEffect(() => {
        (async () => {
            try {
                const res = await fetch('/api/store-settings');
                if (!res.ok) return;
                const json = await res.json();
                // API returns { success: true, data }
                setStoreSettings(json?.data || null);
            } catch (e) {
                console.warn('Failed to fetch store settings', e);
            }
        })();
    }, []);

    const router = useRouter();
    const handlePrint = () => { if (typeof window !== 'undefined') window.print(); };

    if (!id) return <div className="p-6">Missing quotation id</div>;

    return (
        <div>
            <style>{`@media print { body * { visibility: hidden !important; } #quotation-paper, #quotation-paper * { visibility: visible !important; } #quotation-paper { position: absolute !important; left: 0; top: 0; width: 100% !important; } .no-print { display: none !important; } }`}</style>
            <div className="sticky top-0 z-50 w-full border-b border-[#e5e7eb] bg-white px-4 py-3 no-print">
                <div className="mx-auto flex max-w-[1200px] flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <button onClick={() => router.back()} className="w-10 h-10 flex items-center justify-center rounded-lg bg-white border text-[#111418] hover:bg-gray-100">
                            <span className="material-symbols-outlined text-[20px]">arrow_back</span>
                        </button>
                        <div className="flex flex-col gap-1">
                            <h1 className="text-xl font-bold leading-tight tracking-tight text-[#111418]">Quotation Preview</h1>
                            <p className="text-sm text-[#617589]">Review details before sending to client</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <Link href={quotation ? `/admin/quotation?id=${quotation.id}` : '/admin/quotation'} className="flex h-10 cursor-pointer items-center justify-center gap-2 rounded-lg bg-[#e5e7eb] px-4 text-sm font-bold text-[#111418] transition hover:bg-[#d1d5db]">
                            <span className="material-symbols-outlined text-[20px]">edit</span>
                            <span className="hidden sm:inline">Edit</span>
                        </Link>

                        <button onClick={handlePrint} className="flex h-10 cursor-pointer items-center justify-center gap-2 rounded-lg bg-[#e5e7eb] px-4 text-sm font-bold text-[#111418] transition hover:bg-[#d1d5db]">
                            <span className="material-symbols-outlined text-[20px]">print</span>
                            <span className="hidden sm:inline">Print</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex grow justify-center overflow-y-auto p-4 sm:p-8">
                {/* A4 Paper Container */}
                <div id="quotation-paper" className="relative flex min-h-[1123px] w-full max-w-[794px] flex-col bg-white p-8 shadow-2xl sm:p-12 text-slate-900">
                    {loading ? (
                        <div className="py-12 text-center">Loading...</div>
                    ) : error ? (
                        <div className="py-12 text-center flex flex-col items-center gap-4">
                            <span className="material-symbols-outlined text-red-500 text-5xl">error</span>
                            <div className="text-xl font-bold">{error}</div>
                            <p className="text-gray-500">The quotation you are looking for could not be retrieved.</p>
                            <Link href="/admin/quotation/drafts" className="text-primary hover:underline font-bold">Back to Drafts</Link>
                        </div>
                    ) : !quotation ? (
                        <div className="py-12 text-center">Quotation not found</div>
                    ) : (
                        <>
                            {/* Company Header */}
                            <div className="mb-8 flex flex-col justify-between gap-6 border-b border-slate-200 pb-8 sm:flex-row">
                                <div className="flex flex-col gap-2">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-20 w-20 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                            {storeSettings?.storeLogo || storeSettings?.favicon ? (
                                                <img src={storeSettings?.storeLogo || storeSettings?.favicon} alt={storeSettings?.storeName || 'Site logo'} className="h-20 w-20 object-contain" />
                                            ) : (
                                                <span className="material-symbols-outlined text-[32px]">ac_unit</span>
                                            )}
                                        </div>
                                        <div className="flex flex-col">
                                            <h2 className="text-2xl font-black tracking-tight text-slate-900">{storeSettings?.storeName || 'Nepal Cooling'}</h2>
                                            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">{storeSettings?.storeDescription || 'Solutions Pvt. Ltd.'}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex flex-col gap-1 text-right sm:items-end">
                                    <p className="text-sm font-semibold text-slate-900">{storeSettings?.storeName ? (storeSettings.storeName + (storeSettings?.officeName ? ' - ' + storeSettings.officeName : '')) : 'Corporate Office'}</p>
                                    <p className="text-sm text-slate-500">{storeSettings?.address || 'New Baneshwor, Kathmandu, Nepal'}</p>
                                    <p className="text-sm text-slate-500">{storeSettings?.contactPhone || '+977-01-44XXXXX'}{(storeSettings?.contactPhone || storeSettings?.contactEmail) ? ' | ' : ''}{storeSettings?.contactEmail || 'info@nepalcooling.com'}</p>
                                    <p className="text-sm text-slate-500">PAN: {storeSettings?.pan || '601234567'}</p>
                                </div>
                            </div>

                            {/* Client & Meta Info */}
                            <div className="mb-10 flex flex-col justify-between gap-8 sm:flex-row">
                                <div className="flex flex-1 flex-col gap-3 rounded-lg bg-slate-50 p-4 border border-slate-100">
                                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Bill To</p>
                                    <div className="flex flex-col gap-1">
                                        <p className="text-lg font-bold text-slate-900">{quotation.client?.name || '-'}</p>
                                        <p className="text-sm text-slate-600">{quotation.client?.company || ''}</p>
                                        <p className="text-sm text-slate-600">{quotation.client?.address || ''}</p>                                        <p className="text-sm text-slate-600">Email: {quotation.client?.email || '-'}</p>
                                        <p className="text-sm text-slate-600">Phone: {quotation.client?.phone || '-'}</p>                                        <p className="text-sm text-slate-600">PAN: {quotation.client?.pan || '-'}</p>
                                    </div>
                                </div>

                                <div className="flex flex-1 flex-col gap-4 sm:items-end">
                                    <div className="flex w-full max-w-[280px] flex-col gap-2">
                                        <div className="flex justify-between border-b border-slate-100 py-2">
                                            <span className="text-sm font-medium text-slate-500">Quotation #</span>
                                            <span className="text-sm font-bold text-slate-900">{quotation.number}</span>
                                        </div>
                                        <div className="flex justify-between border-b border-slate-100 py-2">
                                            <span className="text-sm font-medium text-slate-500">Date</span>
                                            <span className="text-sm font-bold text-slate-900">{quotation.dateIssued || ''}</span>
                                        </div>
                                        <div className="flex justify-between border-b border-slate-100 py-2">
                                            <span className="text-sm font-medium text-slate-500">Valid Until</span>
                                            <span className="text-sm font-bold text-slate-900">{quotation.validUntil || ''}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Items Table */}
                            <div className="mb-8 overflow-hidden rounded-lg border border-slate-200">
                                <table className="w-full min-w-full table-auto text-left text-sm">
                                    <thead>
                                        <tr className="bg-primary text-white">
                                            <th className="px-4 py-3 font-bold uppercase tracking-wider text-xs w-12 text-center">SN</th>
                                            <th className="px-4 py-3 font-bold uppercase tracking-wider text-xs">Description</th>
                                            <th className="px-4 py-3 font-bold uppercase tracking-wider text-xs text-right">Qty</th>
                                            <th className="px-4 py-3 font-bold uppercase tracking-wider text-xs text-right">Rate</th>
                                            <th className="px-4 py-3 font-bold uppercase tracking-wider text-xs text-right">Disc.</th>
                                            <th className="px-4 py-3 font-bold uppercase tracking-wider text-xs text-right">Total</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {quotation.items?.map((it, idx) => (
                                            <tr key={idx} className="hover:bg-slate-50">
                                                <td className="px-4 py-4 text-center text-slate-500">{idx + 1}</td>
                                                <td className="px-4 py-4">
                                                    <p className="font-bold text-slate-900">{it.description}</p>
                                                    <p className="text-xs text-slate-500 mt-1">&nbsp;</p>
                                                </td>
                                                <td className="px-4 py-4 text-right font-medium">{it.qty}</td>
                                                <td className="px-4 py-4 text-right font-medium">{it.unitPrice}</td>
                                                <td className="px-4 py-4 text-right text-slate-500">{it.discountPercent ? `${it.discountPercent}%` : '-'}</td>
                                                <td className="px-4 py-4 text-right font-bold text-slate-900">{formatCurrency((Number(it.qty || 0) * Number(it.unitPrice || 0)) * (1 - (Number(it.discountPercent || 0) / 100)))}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Financial Summary */}
                            <div className="mb-12 flex flex-col gap-8 sm:flex-row">
                                <div className="flex-1">
                                    <div className="rounded-lg bg-slate-50 p-4 border border-slate-100">
                                        <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-400">Payment Terms</p>
                                        <p className="text-sm text-slate-600">{quotation.notes || '50% Advance along with Purchase Order.'}</p>
                                        <p className="text-sm text-slate-600">{quotation.notes ? '' : 'Remaining 50% after successful installation.'}</p>
                                    </div>
                                </div>
                                <div className="flex w-full max-w-sm flex-col">
                                    <div className="flex justify-between py-2 text-sm">
                                        <span className="text-slate-600">Subtotal</span>
                                        <span className="font-bold text-slate-900">{formatCurrency(quotation.totals?.subtotal || 0)}</span>
                                    </div>
                                    <div className="flex justify-between py-2 text-sm border-b border-slate-100">
                                        <span className="text-slate-600">Total Discount</span>
                                        <span className="font-medium text-green-600">- {formatCurrency(quotation.totals?.discount || 0)}</span>
                                    </div>
                                    <div className="flex justify-between py-2 text-sm">
                                        <span className="text-slate-600">Taxable Amount</span>
                                        <span className="font-bold text-slate-900">{formatCurrency((quotation.totals?.subtotal || 0) - (quotation.totals?.discount || 0))}</span>
                                    </div>
                                    <div className="flex justify-between py-2 text-sm border-b border-slate-200">
                                        <span className="text-slate-600">VAT (13%)</span>
                                        <span className="font-bold text-slate-900">{formatCurrency(quotation.totals?.tax || 0)}</span>
                                    </div>
                                    <div className="mt-2 flex items-center justify-between rounded bg-primary/5 p-3">
                                        <span className="text-base font-bold text-primary">Grand Total</span>
                                        <span className="text-xl font-black text-primary">NPR {formatCurrency(quotation.totals?.grandTotal || 0)}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Footer: Signature */}
                            <div className="mt-auto flex flex-col gap-12">
                                <div className="flex justify-between pt-8">
                                    <div className="flex flex-col gap-8">
                                        <div className="h-16 w-32 border-b border-dashed border-slate-300"></div>
                                        <div className="flex flex-col">
                                            <p className="text-sm font-bold text-slate-900">{quotation?.client?.name || 'Customer Signature'}</p>
                                            <p className="text-xs text-slate-500">{quotation?.client?.company || ''}</p>
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-8 text-right items-end">
                                        <div className="min-h-20 w-48 border-b border-dashed border-slate-300 relative flex items-end justify-end">
                                            {/* Digital Signature */}
                                            {quotation.include_signature && (quotation.created_by as any)?.signature ? (
                                                <img
                                                    src={(quotation.created_by as any).signature}
                                                    alt="Authorized Signature"
                                                    className="max-h-24 max-w-full object-contain mb-1"
                                                />
                                            ) : (
                                                <div className="absolute bottom-2 right-0 opacity-20" data-alt="Company Stamp Placeholder">
                                                    <span className="material-symbols-outlined text-[64px] text-primary">verified</span>
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex flex-col">
                                            <p className="text-sm font-bold text-slate-900">
                                                {quotation.include_signature && (quotation.created_by as any)?.name
                                                    ? (quotation.created_by as any).name
                                                    : (storeSettings?.authorizedPerson || storeSettings?.officeName || storeSettings?.storeName || 'Nepal Cooling Solutions')}
                                            </p>
                                            {quotation.include_signature && (quotation.created_by as any)?.designation && (
                                                <p className="text-xs text-slate-600 font-medium">{(quotation.created_by as any).designation}</p>
                                            )}
                                            <p className="text-xs text-slate-500">{storeSettings?.contactEmail || 'Authorized Signature'}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Watermark (Decorative) */}
                            <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.03]" data-alt="Company Logo Watermark">
                                {storeSettings?.storeLogo || storeSettings?.favicon ? (
                                    <img src={storeSettings?.storeLogo || storeSettings?.favicon} alt="Company Logo Watermark" className="h-[400px] w-[400px] object-contain" />
                                ) : (
                                    <span className="material-symbols-outlined text-[400px]">ac_unit</span>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

function AdminQuotationPrintLegacy() {
    const search = useSearchParams();
    const id = search?.get('id');
    const [loading, setLoading] = useState(true);
    const [quotation, setQuotation] = useState<Quotation | null>(null);
    const [storeSettings, setStoreSettings] = useState<any>(null);
    const router = useRouter();

    useEffect(() => {
        if (!id) return setLoading(false);
        (async () => {
            try {
                const res = await fetch(`/api/admin/quotations?id=${id}`);
                if (!res.ok) { setQuotation(null); return; }
                const json = await res.json();
                setQuotation(json as Quotation);
            } catch (e) {
                console.error(e);
            } finally { setLoading(false); }
        })();
    }, [id]);

    useEffect(() => {
        (async () => {
            try {
                const res = await fetch('/api/store-settings');
                if (!res.ok) return;
                const json = await res.json();
                setStoreSettings(json?.data || null);
            } catch (e) {
                console.warn('Failed to fetch store settings', e);
            }
        })();
    }, []);

    const handlePrint = () => { if (typeof window !== 'undefined') window.print(); };

    return (
        <div>
            <div className="sticky top-0 z-50 w-full border-b border-[#e5e7eb] bg-white px-4 py-3 no-print">
                <div className="mx-auto flex max-w-[1200px] flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <button onClick={() => router.back()} className="w-10 h-10 flex items-center justify-center rounded-lg bg-white border text-[#111418] hover:bg-gray-100">
                            <span className="material-symbols-outlined text-[20px]">arrow_back</span>
                        </button>
                        <div className="flex flex-col gap-1">
                            <h1 className="text-xl font-bold leading-tight tracking-tight text-[#111418]">Quotation Preview</h1>
                            <p className="text-sm text-[#617589]">Review details before sending to client</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">

                        <button className="flex h-10 cursor-pointer items-center justify-center gap-2 rounded-lg bg-[#e5e7eb] px-4 text-sm font-bold text-[#111418] transition hover:bg-[#d1d5db]">
                            <span className="material-symbols-outlined text-[20px]">edit</span>
                            <span className="hidden sm:inline">Edit</span>
                        </button>

                        <button onClick={handlePrint} className="flex h-10 cursor-pointer items-center justify-center gap-2 rounded-lg bg-[#e5e7eb] px-4 text-sm font-bold text-[#111418] transition hover:bg-[#d1d5db]">
                            <span className="material-symbols-outlined text-[20px]">print</span>
                            <span className="hidden sm:inline">Print</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex grow justify-center overflow-y-auto p-4 sm:p-8">
                {/* A4 Paper Container */}
                <div id="quotation-paper" className="relative flex min-h-[1123px] w-full max-w-[794px] flex-col bg-white p-8 shadow-2xl sm:p-12 text-slate-900">
                    {/* Company Header */}
                    <div className="mb-8 flex flex-col justify-between gap-6 border-b border-slate-200 pb-8 sm:flex-row">
                        <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-3">
                                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                    {storeSettings?.storeLogo || storeSettings?.favicon ? (
                                        <img src={storeSettings?.storeLogo || storeSettings?.favicon} alt={storeSettings?.storeName || 'Site logo'} className="h-10 w-10 object-contain" />
                                    ) : (
                                        <span className="material-symbols-outlined text-[32px]">ac_unit</span>
                                    )}
                                </div>
                                <div className="flex flex-col">
                                    <h2 className="text-2xl font-black tracking-tight text-slate-900">{storeSettings?.storeName || 'Nepal Cooling'}</h2>
                                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">{storeSettings?.storeDescription || 'Solutions Pvt. Ltd.'}</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-col gap-1 text-right sm:items-end">
                            <p className="text-sm font-semibold text-slate-900">Corporate Office</p>
                            <p className="text-sm text-slate-500">New Baneshwor, Kathmandu, Nepal</p>
                            <p className="text-sm text-slate-500">+977-01-44XXXXX | info@nepalcooling.com</p>
                            <p className="text-sm text-slate-500">PAN: 601234567</p>
                        </div>
                    </div>

                    {/* Client & Meta Info */}
                    <div className="mb-10 flex flex-col justify-between gap-8 sm:flex-row">
                        <div className="flex flex-1 flex-col gap-3 rounded-lg bg-slate-50 p-4 border border-slate-100">
                            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Bill To</p>
                            <div className="flex flex-col gap-1">
                                <p className="text-lg font-bold text-slate-900">Mr. Rajesh Hamal</p>
                                <p className="text-sm text-slate-600">Everest Hotel &amp; Spa</p>
                                <p className="text-sm text-slate-600">Lazimpat, Kathmandu</p>
                                <p className="text-sm text-slate-600">PAN: 300123987</p>
                            </div>
                        </div>

                        <div className="flex flex-1 flex-col gap-4 sm:items-end">
                            <div className="flex w-full max-w-[280px] flex-col gap-2">
                                <div className="flex justify-between border-b border-slate-100 py-2">
                                    <span className="text-sm font-medium text-slate-500">Quotation #</span>
                                    <span className="text-sm font-bold text-slate-900">QT-2023-849</span>
                                </div>
                                <div className="flex justify-between border-b border-slate-100 py-2">
                                    <span className="text-sm font-medium text-slate-500">Date</span>
                                    <span className="text-sm font-bold text-slate-900">Oct 25, 2023</span>
                                </div>
                                <div className="flex justify-between border-b border-slate-100 py-2">
                                    <span className="text-sm font-medium text-slate-500">Valid Until</span>
                                    <span className="text-sm font-bold text-slate-900">Nov 25, 2023</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Items Table */}
                    <div className="mb-8 overflow-hidden rounded-lg border border-slate-200">
                        <table className="w-full min-w-full table-auto text-left text-sm">
                            <thead>
                                <tr className="bg-primary text-white">
                                    <th className="px-4 py-3 font-bold uppercase tracking-wider text-xs w-12 text-center">SN</th>
                                    <th className="px-4 py-3 font-bold uppercase tracking-wider text-xs">Description</th>
                                    <th className="px-4 py-3 font-bold uppercase tracking-wider text-xs text-right">Qty</th>
                                    <th className="px-4 py-3 font-bold uppercase tracking-wider text-xs text-right">Rate</th>
                                    <th className="px-4 py-3 font-bold uppercase tracking-wider text-xs text-right">Disc.</th>
                                    <th className="px-4 py-3 font-bold uppercase tracking-wider text-xs text-right">Total</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {/* Item 1 */}
                                <tr className="hover:bg-slate-50">
                                    <td className="px-4 py-4 text-center text-slate-500">1</td>
                                    <td className="px-4 py-4">
                                        <p className="font-bold text-slate-900">Midea Wall Mount AC (1.5 Ton)</p>
                                        <p className="text-xs text-slate-500 mt-1">Inverter Series, R32 Refrigerant, 5 Star Energy Rating. Includes wireless remote.</p>
                                    </td>
                                    <td className="px-4 py-4 text-right font-medium">2</td>
                                    <td className="px-4 py-4 text-right font-medium">65,000</td>
                                    <td className="px-4 py-4 text-right text-slate-500">5%</td>
                                    <td className="px-4 py-4 text-right font-bold text-slate-900">1,23,500</td>
                                </tr>

                                {/* Item 2 */}
                                <tr className="hover:bg-slate-50">
                                    <td className="px-4 py-4 text-center text-slate-500">2</td>
                                    <td className="px-4 py-4">
                                        <p className="font-bold text-slate-900">Copper Piping &amp; Insulation</p>
                                        <p className="text-xs text-slate-500 mt-1">Standard gauge copper pipes with heavy duty insulation.</p>
                                    </td>
                                    <td className="px-4 py-4 text-right font-medium">15 ft</td>
                                    <td className="px-4 py-4 text-right font-medium">450</td>
                                    <td className="px-4 py-4 text-right text-slate-500">-</td>
                                    <td className="px-4 py-4 text-right font-bold text-slate-900">6,750</td>
                                </tr>

                                {/* Item 3 */}
                                <tr className="hover:bg-slate-50">
                                    <td className="px-4 py-4 text-center text-slate-500">3</td>
                                    <td className="px-4 py-4">
                                        <p className="font-bold text-slate-900">Outdoor Stand (Heavy Duty)</p>
                                        <p className="text-xs text-slate-500 mt-1">Galvanized iron wall mount brackets for outdoor units.</p>
                                    </td>
                                    <td className="px-4 py-4 text-right font-medium">2</td>
                                    <td className="px-4 py-4 text-right font-medium">1,500</td>
                                    <td className="px-4 py-4 text-right text-slate-500">-</td>
                                    <td className="px-4 py-4 text-right font-bold text-slate-900">3,000</td>
                                </tr>

                                {/* Item 4 */}
                                <tr className="hover:bg-slate-50">
                                    <td className="px-4 py-4 text-center text-slate-500">4</td>
                                    <td className="px-4 py-4">
                                        <p className="font-bold text-slate-900">Installation Charges</p>
                                        <p className="text-xs text-slate-500 mt-1">Standard installation, testing and commissioning.</p>
                                    </td>
                                    <td className="px-4 py-4 text-right font-medium">2</td>
                                    <td className="px-4 py-4 text-right font-medium">2,500</td>
                                    <td className="px-4 py-4 text-right text-slate-500">10%</td>
                                    <td className="px-4 py-4 text-right font-bold text-slate-900">4,500</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    {/* Financial Summary */}
                    <div className="mb-12 flex flex-col gap-8 sm:flex-row">
                        <div className="flex-1">
                            <div className="rounded-lg bg-slate-50 p-4 border border-slate-100">
                                <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-400">Payment Terms</p>
                                <p className="text-sm text-slate-600">50% Advance along with Purchase Order.</p>
                                <p className="text-sm text-slate-600">Remaining 50% after successful installation.</p>
                            </div>
                        </div>
                        <div className="flex w-full max-w-sm flex-col">
                            <div className="flex justify-between py-2 text-sm">
                                <span className="text-slate-600">Subtotal</span>
                                <span className="font-bold text-slate-900">NPR 1,37,750</span>
                            </div>
                            <div className="flex justify-between py-2 text-sm border-b border-slate-100">
                                <span className="text-slate-600">Total Discount</span>
                                <span className="font-medium text-green-600">- NPR 7,000</span>
                            </div>
                            <div className="flex justify-between py-2 text-sm">
                                <span className="text-slate-600">Taxable Amount</span>
                                <span className="font-bold text-slate-900">NPR 1,30,750</span>
                            </div>
                            <div className="flex justify-between py-2 text-sm border-b border-slate-200">
                                <span className="text-slate-600">VAT (13%)</span>
                                <span className="font-bold text-slate-900">NPR 16,997.50</span>
                            </div>
                            <div className="mt-2 flex items-center justify-between rounded bg-primary/5 p-3">
                                <span className="text-base font-bold text-primary">Grand Total</span>
                                <span className="text-xl font-black text-primary">NPR 1,47,747.50</span>
                            </div>
                        </div>
                    </div>

                    {/* Footer: Signature */}
                    <div className="mt-auto flex flex-col gap-12">
                        <div className="flex justify-between pt-8">
                            <div className="flex flex-col gap-8">
                                <div className="h-16 w-32 border-b border-dashed border-slate-300"></div>
                                <div className="flex flex-col">
                                    <p className="text-sm font-bold text-slate-900">{quotation?.client?.name || 'Customer Signature'}</p>
                                    <p className="text-xs text-slate-500">{quotation?.client?.company || ''}</p>
                                </div>
                            </div>
                            <div className="flex flex-col gap-8 text-right items-end">
                                <div className="h-16 w-32 border-b border-dashed border-slate-300 relative">
                                    {/* Placeholder for digital stamp/signature */}
                                    <div className="absolute bottom-2 right-0 opacity-20" data-alt="Company Stamp Placeholder">
                                        <span className="material-symbols-outlined text-[64px] text-primary">verified</span>
                                    </div>
                                </div>
                                <div className="flex flex-col">
                                    <p className="text-sm font-bold text-slate-900">{storeSettings?.authorizedPerson || storeSettings?.officeName || storeSettings?.storeName || 'Nepal Cooling Solutions'}</p>
                                    <p className="text-xs text-slate-500">{storeSettings?.contactEmail || 'Authorized Signature'}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Watermark (Decorative) */}
                    <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.03]" data-alt="Company Logo Watermark">
                        {storeSettings?.storeLogo || storeSettings?.favicon ? (
                            <img src={storeSettings?.storeLogo || storeSettings?.favicon} alt="Company Logo Watermark" className="h-[400px] w-[400px] object-contain" />
                        ) : (
                            <span className="material-symbols-outlined text-[400px]">ac_unit</span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
