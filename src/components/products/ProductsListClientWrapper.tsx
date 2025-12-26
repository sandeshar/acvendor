"use client";

import dynamic from 'next/dynamic';
import type { ComponentProps } from 'react';

const ProductsListClient = dynamic(() => import('./ProductsListClient'), { ssr: false });

export default function ProductsListClientWrapper(props: ComponentProps<typeof ProductsListClient>) {
    // This component is a thin client wrapper so the server page can import it safely.
    return <ProductsListClient {...props} />;
}
