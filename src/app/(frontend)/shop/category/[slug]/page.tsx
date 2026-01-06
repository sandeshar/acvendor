import Link from 'next/link';
import ProductsListClient from '@/components/products/ProductsListClientWrapper';
import ProductsPagination from '@/components/products/ProductsPagination';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export default async function CategoryPage({ params, searchParams }: { params: { slug: string }, searchParams?: { page?: string } }) {
    const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
    const { slug } = params;
    const page = searchParams?.page ? parseInt(String(searchParams.page)) || 1 : 1;
    const limit = 12;
    const offset = (Math.max(1, page) - 1) * limit;

    // Fetch products for this category (category accepts slug)
    const [productsRes, catsRes] = await Promise.all([
        fetch(`${API_BASE}/api/products?category=${encodeURIComponent(slug)}&limit=${limit}&offset=${offset}`, { cache: 'no-store' }),
        fetch(`${API_BASE}/api/pages/services/categories`, { cache: 'no-store' }),
    ]);

    const products = productsRes.ok ? await productsRes.json() : [];
    const categories = catsRes.ok ? await catsRes.json() : [];
    const category = (Array.isArray(categories) ? categories.find((c: any) => c.slug === slug) : null) || { name: slug };
    const hasMore = Array.isArray(products) && products.length === limit;

    return (
        <main className="flex-1">
            <div className="layout-container px-4 md:px-10 max-w-[1440px] mx-auto py-12">
                <div className="flex items-center gap-2 text-sm mb-4">
                    <Link href="/" className="text-[#617589] font-medium leading-normal hover:text-primary transition-colors">Home</Link>
                    <span className="text-[#617589]">/</span>
                    <Link href="/shop" className="text-[#617589] font-medium leading-normal hover:text-primary">Shop</Link>
                    <span className="text-[#617589]">/</span>
                    <span className="text-[#111418] font-medium leading-normal">{category.name}</span>
                </div>

                <h1 className="text-3xl font-bold mb-2">{category.name} Products</h1>
                <ProductsListClient products={products} productPathPrefix="/products" />
                <ProductsPagination currentPage={page} hasMore={hasMore} basePath={`/shop/category/${encodeURIComponent(slug)}`} />
            </div>
        </main>
    );
}
