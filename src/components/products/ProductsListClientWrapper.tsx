"use client";

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import type { ComponentProps } from 'react';
import dynamic from 'next/dynamic';

const ProductsListClient = dynamic(() => import('./ProductsListClient'), { ssr: false });

export default function ProductsListClientWrapper(props: ComponentProps<typeof ProductsListClient>) {
    // Client-side wrapper: accepts server-provided `products` as initial data
    const initialProducts = (props as any).products ?? [];

    // Deep-normalize Decimal128-like objects (e.g., { $numberDecimal: '123.45' }) so React never receives objects as children
    const normalizeValue = (v: any): any => {
        if (v && typeof v === 'object') {
            if ('$numberDecimal' in v) return String(v['$numberDecimal']);
            if (Array.isArray(v)) return v.map(normalizeValue);
            const out: any = {};
            for (const k of Object.keys(v)) out[k] = normalizeValue(v[k]);
            return out;
        }
        return v;
    };

    const normalizeProducts = (list: any[]) => Array.isArray(list) ? list.map((p: any) => normalizeValue(p)) : [];

    const [products, setProducts] = useState(normalizeProducts(initialProducts));

    const searchParams = useSearchParams();

    useEffect(() => {
        // Fetch filtered products on client when query params change (category, subcategory, brand, page)
        const category = searchParams?.get('category');
        const subcategory = searchParams?.get('subcategory');
        const page = searchParams?.get('page');
        const brand = searchParams?.get('brand');
        const sort = searchParams?.get('sort');

        // If no filters and no page and no brand and no sort, keep initial products
        if (!category && !subcategory && !page && !brand && !sort) {
            setProducts(initialProducts);
            return;
        }

        let cancelled = false;
        (async () => {
            try {
                const q = new URLSearchParams();
                q.set('limit', '12');
                if (category) q.set('category', category);
                if (subcategory) q.set('subcategory', subcategory);
                if (brand) q.set('brand', brand);
                if (sort) q.set('sort', sort);
                if (page) {
                    const pNum = Math.max(1, parseInt(page) || 1);
                    const offset = (pNum - 1) * 12;
                    if (offset) q.set('offset', String(offset));
                }
                const res = await fetch(`/api/products?${q.toString()}`);
                if (!res.ok) return;
                const data = await res.json();
                if (!cancelled) setProducts(normalizeProducts(Array.isArray(data) ? data : []));
            } catch (e) {
                console.error('Error fetching filtered products (client):', (e as Error)?.message || String(e));
            }
        })();

        return () => { cancelled = true; };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchParams?.toString()]);

    // Final safety: ensure no Decimal128-like objects remain; compute a safe copy to pass downstream
    const containsDecimal = (obj: any): boolean => {
        if (obj && typeof obj === 'object') {
            if ('$numberDecimal' in obj) return true;
            if (Array.isArray(obj)) return obj.some(containsDecimal);
            return Object.values(obj).some(containsDecimal);
        }
        return false;
    };

    let safeProducts = normalizeProducts(products);
    if (containsDecimal(safeProducts)) {
        console.warn('ProductsListClientWrapper: Found Decimal-like values in products after normalization, applying replacement across objects', { example: safeProducts.find((p: any) => containsDecimal(p)) });
        const replaceDecimalObjects = (v: any): any => {
            if (v && typeof v === 'object') {
                if ('$numberDecimal' in v) return String(v['$numberDecimal']);
                if (Array.isArray(v)) return v.map(replaceDecimalObjects);
                const out: any = {};
                for (const k of Object.keys(v)) out[k] = replaceDecimalObjects(v[k]);
                return out;
            }
            return v;
        };
        safeProducts = safeProducts.map(replaceDecimalObjects);

        if (containsDecimal(safeProducts)) {
            console.error('ProductsListClientWrapper: Decimal-like values still present after replacement (unexpected)');
        }
    }

    return <ProductsListClient {...(props as any)} products={safeProducts} />;
}
