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
        <main className="p-10">
            <div className="layout-container max-w-[1200px] mx-auto">
                <div className="flex items-center gap-2 text-sm mb-6">
                    <Link href="/" className="text-[#617589]">Home</Link>
                    <span className="text-[#617589]">/</span>
                    <Link href="/products" className="text-[#617589]">Products</Link>
                    <span className="text-[#617589]">/</span>
                    <span className="font-medium">Compare</span>
                </div>

                <h1 className="text-2xl font-bold mb-4">Compare Products</h1>

                <CompareTableClient products={products} />
            </div>
        </main>
    );
}