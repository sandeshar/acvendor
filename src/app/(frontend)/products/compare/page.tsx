import Link from 'next/link';
import CompareTableClient from '@/components/products/CompareTableClient';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export default async function ComparePage({ searchParams }: { searchParams?: { ids?: string } }) {
    // Defensive parsing because Next may pass Promise-like searchParams in dev/ssr
    let idsParam = '';
    try {
        let sp: any = searchParams;
        try {
            const initialTag = Object.prototype.toString.call(sp);
            if (initialTag === '[object Promise]') {
                try { sp = await sp; } catch (awaitErr) { console.warn('ComparePage: failed to resolve searchParams promise', awaitErr); }
            }
        } catch (tagErr) {
            // ignore
        }
        const tag = Object.prototype.toString.call(sp);
        const isSafe = tag === '[object Object]' || tag === '[object URLSearchParams]';
        if (!isSafe) {
            // eslint-disable-next-line no-console
            console.warn('ComparePage: unsafe searchParams shape detected, skipping parse', { tag, searchParams: sp });
        } else {
            try {
                if (typeof (sp as any).get === 'function') idsParam = (sp as any).get('ids') || '';
                else idsParam = (sp as any)['ids'] || '';
            } catch (err) {
                // eslint-disable-next-line no-console
                console.error('ComparePage: error accessing ids param', err, { searchParams: sp });
            }
        }
    } catch (err) {
        // eslint-disable-next-line no-console
        console.error('ComparePage: failed to inspect searchParams', err, { searchParams });
    }

    if (!idsParam) return (
        <main className="p-10">
            <div className="layout-container max-w-[900px] mx-auto">No products selected for comparison.</div>
        </main>
    );

    const res = await fetch(`${API_BASE}/api/products?ids=${encodeURIComponent(idsParam)}`, { cache: 'no-store' });
    const products = res.ok ? await res.json() : [];

    if (!Array.isArray(products) || products.length === 0) return (
        <main className="p-10">
            <div className="layout-container max-w-[900px] mx-auto">No products found for comparison.</div>
        </main>
    );

    return (
        <main className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6">
            <div className="max-w-[1400px] mx-auto">
                <div className="flex items-center gap-2 text-xs mb-8 text-slate-500 uppercase tracking-widest">
                    <Link href="/" className="hover:text-primary transition-colors">Home</Link>
                    <span className="opacity-30">/</span>
                    <Link href="/products" className="hover:text-primary transition-colors">Products</Link>
                    <span className="opacity-30">/</span>
                    <span className="font-bold text-slate-900">Compare</span>
                </div>

                <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Compare Products</h1>
                        <p className="text-slate-500 mt-1">Direct side-by-side comparison of technical specifications</p>
                    </div>
                </div>

                <CompareTableClient products={products} />
            </div>
        </main>
    );
}