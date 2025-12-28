"use client";

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import type { ComponentProps } from 'react';
import dynamic from 'next/dynamic';

const ProductsListClient = dynamic(() => import('./ProductsListClient'), { ssr: false });

export default function ProductsListClientWrapper(props: ComponentProps<typeof ProductsListClient>) {
    // Client-side wrapper: accepts server-provided `products` as initial data
    const initialProducts = (props as any).products ?? [];
    const [products, setProducts] = useState(initialProducts);

    const searchParams = useSearchParams();

    useEffect(() => {
        // Fetch filtered products on client when query params change (category, subcategory, page)
        const category = searchParams?.get('category');
        const subcategory = searchParams?.get('subcategory');
        const page = searchParams?.get('page');

        // If no filters and no page, keep initial products
        if (!category && !subcategory && !page) {
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
                if (page) {
                    const pNum = Math.max(1, parseInt(page) || 1);
                    const offset = (pNum - 1) * 12;
                    if (offset) q.set('offset', String(offset));
                }
                const res = await fetch(`/api/products?${q.toString()}`);
                if (!res.ok) return;
                const data = await res.json();
                if (!cancelled) setProducts(data);
            } catch (e) {
                console.error('Error fetching filtered products (client):', (e as Error)?.message || String(e));
            }
        })();

        return () => { cancelled = true; };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchParams?.toString()]);

    return <ProductsListClient products={products} />;
}
