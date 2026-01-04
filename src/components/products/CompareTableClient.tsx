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

    if (!products || products.length === 0) return <div className="text-sm text-gray-500">No products to compare</div>;

    return (
        <div>
            <div className="flex items-center justify-between gap-4 mb-4">
                <div className="flex items-center gap-3">
                    <label className="inline-flex items-center gap-2">
                        <input type="checkbox" checked={showOnlyDifferences} onChange={(e) => setShowOnlyDifferences(e.target.checked)} />
                        <span className="text-sm">Show only differences</span>
                    </label>
                </div>
                <div className="flex items-center gap-3">
                    <button onClick={() => window.print()} className="px-3 py-1 rounded border text-sm">Print</button>
                    <Link href="/products" className="px-3 py-1 rounded border text-sm">Back to products</Link>
                </div>
            </div>

            <div className="overflow-auto border rounded-lg">
                <table className="w-full table-fixed border-collapse min-w-[900px]">
                    <thead>
                        <tr>
                            <th className="w-48 text-left px-4 py-2 sticky left-0 bg-white z-30"></th>
                            {products.map((p: any) => (
                                <th key={p.id} className="px-4 py-4 border-b align-top">
                                    <div className="flex flex-col items-center gap-2">
                                        <img src={p.thumbnail || '/placeholder-product.png'} alt={p.title} className="h-24 w-24 object-contain rounded" />
                                        <div className="font-bold text-center">{p.title}</div>
                                        <div className="text-xs text-gray-500">{p.model || p.capacity}</div>
                                        <div className="text-sm font-semibold mt-1">{p.price ? `NPR ${formatPrice(p.price)}` : 'NPR 0'}</div>
                                        <div className="mt-2"><Link href={`/products/${p.slug}`} className="text-sm text-primary">View</Link></div>
                                    </div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {rowsToShow.map((row) => (
                            <tr key={row.key} className="border-t">
                                <td className="px-4 py-3 font-medium text-sm align-top bg-surface-light sticky left-0 z-20">{row.label}</td>
                                {products.map((p: any) => {
                                    const raw = (() => {
                                        const r = getRaw(p, row.key);
                                        if (r === undefined || r === null) return '';
                                        if (typeof r === 'boolean') return r ? 'true' : 'false';
                                        return String(r).trim();
                                    })();
                                    return (
                                        <td key={p.id + '_' + row.key} className="px-4 py-3 align-top">
                                            {renderField(p, row.key)}
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
