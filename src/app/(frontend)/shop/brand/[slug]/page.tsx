import Link from 'next/link';
import { notFound } from 'next/navigation';
import ProductsListClient from '@/components/products/ProductsListClientWrapper';
import ProductsPagination from '@/components/products/ProductsPagination';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export default async function BrandPage({ params, searchParams }: { params?: { slug?: string }, searchParams?: { page?: string } }) {
    const resolvedParams = params ? await (params as any) : {};
    const resolvedSearchParams = searchParams ? await (searchParams as any) : {};
    const slug = resolvedParams?.slug;
    console.log('BrandPage params:', { resolvedParams, resolvedSearchParams, slug });
    if (!slug) return notFound();

    const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
    const page = resolvedSearchParams?.page ? parseInt(String(resolvedSearchParams.page)) || 1 : 1;
    const limit = 12;
    const offset = (Math.max(1, page) - 1) * limit;

    // Make fetching robust: catch network errors and render empty product list instead of crashing
    let products: any[] = [];
    try {
        const productsRes = await fetch(`${API_BASE}/api/products?brand=${encodeURIComponent(slug)}&limit=${limit}&offset=${offset}`, { cache: 'no-store' });
        products = productsRes.ok ? await productsRes.json() : [];
    } catch (e) {
        console.error('Failed to fetch brand products:', e);
        products = [];
    }
    const hasMore = Array.isArray(products) && products.length === limit;

    return (
        <main className="flex-1">
            <div className="layout-container px-4 md:px-10 max-w-[1440px] mx-auto">
                <div className="flex items-center gap-2 text-sm mb-4">
                    <Link href="/" className="text-[#617589] font-medium leading-normal hover:text-primary transition-colors">Home</Link>
                    <span className="text-[#617589]">/</span>
                    <Link href="/shop" className="text-[#617589] font-medium leading-normal hover:text-primary">Shop</Link>
                    <span className="text-[#617589]">/</span>
                    <span className="text-[#111418] font-medium leading-normal">{slug.toUpperCase()}</span>
                </div>

                <h1 className="text-3xl font-bold mb-2">{slug.toUpperCase()} Products</h1>

                <ProductsListClient products={products} productPathPrefix="/products" />
                <ProductsPagination currentPage={page} hasMore={hasMore} basePath={`/shop/brand/${encodeURIComponent(slug)}`} />
            </div>
        </main>
    );
}
