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
    const sort = resolvedSearchParams?.sort || 'featured';

    return (
        <main className="flex-1 bg-gray-50/50 min-h-screen">
            {/* Breadcrumbs & Header */}
            <div className="bg-white border-b border-gray-100">
                <div className="layout-container px-4 md:px-10 max-w-[1440px] mx-auto py-8">
                    <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gray-400 mb-4">
                        <Link href="/" className="hover:text-primary transition-colors">Home</Link>
                        <span className="material-symbols-outlined text-[14px]">chevron_right</span>
                        <Link href="/shop" className="hover:text-primary transition-colors">Shop</Link>
                        <span className="material-symbols-outlined text-[14px]">chevron_right</span>
                        <span className="text-primary uppercase">{slug}</span>
                    </div>

                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                        <div>
                            <h1 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight uppercase">
                                {slug} Brand
                            </h1>
                            <p className="text-gray-500 mt-2 font-medium">
                                Showing premium products from {slug} brand
                            </p>
                        </div>

                        <div className="flex items-center gap-2">
                            <div className="flex bg-white border border-gray-200 rounded-lg p-1 shadow-sm">
                                <Link href={`?sort=featured`} className={`px-4 py-1.5 text-xs font-bold rounded-md ${sort === 'featured' ? 'bg-primary text-white' : 'text-gray-500 hover:bg-gray-50'}`}>Featured</Link>
                                <Link href={`?sort=price_asc`} className={`px-4 py-1.5 text-xs font-bold rounded-md ${sort === 'price_asc' ? 'bg-primary text-white' : 'text-gray-500 hover:bg-gray-50'}`}>Price Low</Link>
                                <Link href={`?sort=price_desc`} className={`px-4 py-1.5 text-xs font-bold rounded-md ${sort === 'price_desc' ? 'bg-primary text-white' : 'text-gray-500 hover:bg-gray-50'}`}>Price High</Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="layout-container px-4 md:px-10 max-w-[1440px] mx-auto py-12">
                <ProductsListClient products={products} productPathPrefix="/products" searchContext={{ brand: slug }} />
                <div className="mt-12 pt-8 border-t border-gray-100">
                    <ProductsPagination currentPage={page} hasMore={hasMore} basePath={`/shop/brand/${encodeURIComponent(slug)}`} />
                </div>
            </div>
        </main>
    );
}
