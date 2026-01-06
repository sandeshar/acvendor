"use client";

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { formatPrice, parsePriceNumber } from '@/utils/formatPrice';

export default function CompareTableClient({ products }: { products: any[] }) {
    const [showOnlyDifferences, setShowOnlyDifferences] = useState(false);

    const attributeRows = [
        { key: 'compare_at_price', label: 'Compare At Price' },
        { key: 'currency', label: 'Currency' },
        { key: 'category', label: 'Category' },
        { key: 'subcategory', label: 'Subcategory' },
        { key: 'warranty', label: 'Warranty' },
        { key: 'energy_saving', label: 'Energy Saving' },
        { key: 'smart', label: 'Smart (has app)' },
        { key: 'filtration', label: 'Has Filtration' },
        { key: 'brochure_url', label: 'Brochure' },
        { key: 'power', label: 'Power' },
        { key: 'iseer', label: 'ISEER' },
        { key: 'refrigerant', label: 'Refrigerant' },
        { key: 'noise', label: 'Noise' },
        { key: 'dimensions', label: 'Dimensions' },
        { key: 'voltage', label: 'Voltage' },
        { key: 'locations', label: 'Locations' },
        { key: 'inventory_status', label: 'Stock Status' },
        { key: 'rating', label: 'Rating' },
        { key: 'reviews_count', label: 'Reviews' },
        { key: 'excerpt', label: 'Short Description' },
    ];

    // helper: get raw value for checking presence/comparison
    function getRaw(p: any, key: string) {
        switch (key) {
            case 'compare_at_price': return parsePriceNumber(p.compare_at_price);
            case 'currency': return p.currency;
            case 'category': return p.category?.name;
            case 'subcategory': return p.subcategory?.name;
            case 'warranty': return p.warranty;
            case 'energy_saving': return p.energy_saving;
            case 'smart': return p.smart;
            case 'filtration': return p.filtration;
            case 'brochure_url': return p.brochure_url;
            case 'power': return p.power;
            case 'iseer': return p.iseer;
            case 'refrigerant': return p.refrigerant;
            case 'noise': return p.noise;
            case 'dimensions': return p.dimensions;
            case 'voltage': return p.voltage;
            case 'locations': return p.locations;
            case 'inventory_status': return p.inventory_status;
            case 'rating': return (p.rating != null && p.rating !== 0) ? p.rating : null;
            case 'reviews_count': return (p.reviews_count != null && p.reviews_count !== 0) ? p.reviews_count : null;
            case 'excerpt': return p.excerpt;
            case 'content': return p.content;
            default: return p[key];
        }
    }

    function renderField(p: any, key: string) {
        switch (key) {
            case 'compare_at_price': return p.compare_at_price ? `NPR ${formatPrice(p.compare_at_price)}` : '-';
            case 'currency': return p.currency || '-';
            case 'category': return p.category?.name || '-';
            case 'subcategory': return p.subcategory?.name || '-';
            case 'warranty': return p.warranty || '-';
            case 'energy_saving': return p.energy_saving || '-';
            case 'smart': return p.smart ? 'Yes' : 'No';
            case 'filtration': return p.filtration ? 'Yes' : 'No';
            case 'brochure_url': return p.brochure_url ? <a href={p.brochure_url} className="text-primary" target="_blank" rel="noreferrer">Download</a> : '-';
            case 'power': return p.power || '-';
            case 'iseer': return p.iseer || '-';
            case 'refrigerant': return p.refrigerant || '-';
            case 'noise': return p.noise || '-';
            case 'dimensions': return p.dimensions || '-';
            case 'voltage': return p.voltage || '-';
            case 'locations': return p.locations || '-';
            case 'inventory_status': return p.inventory_status || '-';
            case 'rating': return p.rating ? String(p.rating) : '-';
            case 'reviews_count': return p.reviews_count != null ? String(p.reviews_count) : '-';
            case 'excerpt': return p.excerpt || '-';
            case 'content': return p.content || '-';
            default: return p[key] ?? '-';
        }
    }

    const visibleRows = useMemo(() => {
        return attributeRows.filter(row => {
            return products.some(p => {
                const v = getRaw(p, row.key);
                if (v === undefined || v === null) return false;
                if (typeof v === 'boolean') return v === true;
                const s = String(v).trim();
                return s !== '';
            });
        });
    }, [products]);

    const diffInfo = useMemo(() => {
        // compute for each row whether values differ and mostCommon value
        const map: Record<string, { differs: boolean, mostCommon?: string }> = {};
        visibleRows.forEach(row => {
            const vals = products.map(p => {
                const r = getRaw(p, row.key);
                if (r === undefined || r === null) return '';
                if (typeof r === 'boolean') return r ? 'true' : 'false';
                return String(r).trim();
            });
            const uniq = Array.from(new Set(vals));
            const differs = uniq.length > 1;
            // find most common
            const freq: Record<string, number> = {};
            vals.forEach(v => { freq[v] = (freq[v] || 0) + 1; });
            let mostCommon = '';
            let best = -1;
            Object.keys(freq).forEach(k => { if (freq[k] > best) { best = freq[k]; mostCommon = k; } });
            map[row.key] = { differs, mostCommon };
        });
        return map;
    }, [visibleRows, products]);

    const rowsToShow = useMemo(() => {
        let rows = visibleRows;
        if (showOnlyDifferences) rows = visibleRows.filter(r => diffInfo[r.key]?.differs);
        return rows;
    }, [visibleRows, showOnlyDifferences, diffInfo]);

    if (!products || products.length === 0) return (
        <div className="bg-white rounded-3xl p-20 text-center shadow-sm border border-slate-100">
            <span className="material-symbols-outlined text-6xl text-slate-200 mb-4">compare_arrows</span>
            <h3 className="text-xl font-bold text-slate-900">No products to compare</h3>
            <p className="text-slate-500 mt-2 mb-6">Select products from the shop to see their differences here.</p>
            <Link href="/products" className="bg-primary text-white px-6 py-3 rounded-full font-bold hover:shadow-lg transition-all inline-block">Browse Products</Link>
        </div>
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
                <div className="flex items-center gap-6">
                    <label className="inline-flex items-center gap-3 cursor-pointer group">
                        <div className={`w-10 h-6 rounded-full transition-colors relative ${showOnlyDifferences ? 'bg-primary' : 'bg-slate-200'}`}>
                            <input type="checkbox" className="hidden" checked={showOnlyDifferences} onChange={(e) => setShowOnlyDifferences(e.target.checked)} />
                            <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${showOnlyDifferences ? 'translate-x-4' : ''}`} />
                        </div>
                        <span className="text-sm font-bold text-slate-700 group-hover:text-primary transition-colors">Show only differences</span>
                    </label>
                    <div className="text-sm text-slate-400 font-medium">
                        Comparing <span className="text-slate-900 font-bold">{products.length}</span> items
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={() => window.print()} className="px-4 py-2 rounded-xl border border-slate-200 text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-2">
                        <span className="material-symbols-outlined text-sm">print</span>
                        Print
                    </button>
                    <Link href="/products" className="px-4 py-2 rounded-xl border border-primary text-primary text-sm font-bold hover:bg-primary/5 transition-colors flex items-center gap-2">
                        <span className="material-symbols-outlined text-sm">add</span>
                        Add More
                    </Link>
                </div>
            </div>

            <div className="overflow-hidden bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100">
                <div className="overflow-x-auto">
                    <table className="w-full table-fixed border-collapse min-w-[1000px]">
                        <thead>
                            <tr className="bg-slate-50/50">
                                <th className="w-64 p-6 sticky left-0 z-30 bg-slate-50 border-b border-slate-100 shadow-[2px_0_5px_rgba(0,0,0,0.02)]">
                                    <div className="text-left">
                                        <div className="text-[10px] uppercase tracking-[0.2em] font-black text-slate-400 mb-1">Specifications</div>
                                        <div className="text-lg font-black text-slate-900">Feature List</div>
                                    </div>
                                </th>
                                {products.map((p: any) => (
                                    <th key={p.id} className="p-6 border-b border-slate-100 align-top relative group">
                                        <div className="flex flex-col h-full">
                                            <div className="relative aspect-square w-full mb-4 bg-white rounded-2xl p-4 border border-slate-50 shadow-sm group-hover:shadow-md transition-shadow flex items-center justify-center overflow-hidden">
                                                <img src={p.thumbnail || '/placeholder-product.png'} alt={p.title} className="max-h-full max-w-full object-contain group-hover:scale-110 transition-transform duration-500" />
                                                {p.featured === 1 && (
                                                    <div className="absolute top-2 left-2 bg-yellow-400 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter shadow-sm text-yellow-900 border border-yellow-300">Popular</div>
                                                )}
                                            </div>
                                            <div className="text-left">
                                                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 truncate">{p.category?.name || 'AC UNIT'}</div>
                                                <h3 className="font-black text-slate-900 text-sm leading-tight line-clamp-2 h-10 mb-2 group-hover:text-primary transition-colors">{p.title}</h3>
                                                <div className="mt-auto">
                                                    <div className="text-primary font-black text-lg">
                                                        {p.price ? `NPR ${formatPrice(p.price)}` : 'Contact for Price'}
                                                    </div>
                                                    <Link href={`/products/${p.slug}`} className="mt-4 block w-full text-center py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-primary transition-colors">
                                                        View Details
                                                    </Link>
                                                </div>
                                            </div>
                                        </div>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {rowsToShow.map((row) => {
                                const isDiff = diffInfo[row.key]?.differs;
                                return (
                                    <tr key={row.key} className={`group/row transition-colors ${isDiff ? 'bg-amber-50/20' : 'hover:bg-slate-50/50'}`}>
                                        <td className={`p-5 font-bold text-xs align-top sticky left-0 z-20 shadow-[2px_0_5px_rgba(0,0,0,0.02)] transition-colors border-b border-slate-50 ${isDiff ? 'bg-amber-50 text-amber-900' : 'bg-white text-slate-500 group-hover/row:text-slate-900'}`}>
                                            <div className="flex items-center gap-2">
                                                {isDiff && <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse shrink-0" />}
                                                {row.label}
                                            </div>
                                        </td>
                                        {products.map((p: any) => {
                                            const isMostCommon = !isDiff || getRaw(p, row.key) === diffInfo[row.key]?.mostCommon;
                                            return (
                                                <td key={p.id + '_' + row.key} className={`p-5 align-top text-sm border-b border-slate-50 transition-colors ${isDiff && !isMostCommon ? 'bg-amber-50/30 font-semibold text-slate-900' : 'text-slate-600'}`}>
                                                    {renderField(p, row.key)}
                                                </td>
                                            );
                                        })}
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
            <div className="text-center pb-12">
                <p className="text-slate-400 text-xs italic">Prices and specifications are subject to change without notice.</p>
            </div>
        </div>
    );
}
