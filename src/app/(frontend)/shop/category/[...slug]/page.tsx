import Link from 'next/link';
import ProductsListClient from '@/components/products/ProductsListClientWrapper';
import ProductsPagination from '@/components/products/ProductsPagination';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export default async function CategoryPage({ params, searchParams }: { params: { slug: string[] }, searchParams?: { page?: string, sort?: string } }) {
    const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
    const slugs = params.slug || [];
    const categorySlug = slugs[0];
    const subcategorySlug = slugs[1];

    const page = searchParams?.page ? parseInt(String(searchParams.page)) || 1 : 1;
    const limit = 12;
    const offset = (Math.max(1, page) - 1) * limit;
    const sort = searchParams?.sort || 'featured';

    // Build API URL
    const url = new URL(`${API_BASE}/api/products`);
    url.searchParams.set('category', categorySlug);
    if (subcategorySlug) url.searchParams.set('subcategory', subcategorySlug);
    url.searchParams.set('limit', limit.toString());
    url.searchParams.set('offset', offset.toString());
    url.searchParams.set('sort', sort);

    // Fetch products, categories and subcategories
    const [productsRes, catsRes, subsRes] = await Promise.all([
        fetch(url.toString(), { cache: 'no-store' }),
        fetch(`${API_BASE}/api/pages/services/categories`, { cache: 'no-store' }),
        fetch(`${API_BASE}/api/pages/services/subcategories`, { cache: 'no-store' }),
    ]);

    const products = productsRes.ok ? await productsRes.json() : [];
    const categories = catsRes.ok ? await catsRes.json() : [];
    const subcategories = subsRes.ok ? await subsRes.json() : [];

    const category = categories.find((c: any) => c.slug === categorySlug) || { name: categorySlug };
    const subcategory = subcategorySlug ? subcategories.find((s: any) => s.slug === subcategorySlug) : null;

    const hasMore = Array.isArray(products) && products.length === limit;

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
                        <Link href={`/shop/category/${categorySlug}`} className={!subcategorySlug ? 'text-primary' : 'hover:text-primary'}>
                            {category.name}
                        </Link>
                        {subcategory && (
                            <>
                                <span className="material-symbols-outlined text-[14px]">chevron_right</span>
                                <span className="text-primary">{subcategory.name}</span>
                            </>
                        )}
                    </div>

                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                        <div>
                            <h1 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight">
                                {subcategory ? subcategory.name : category.name}
                            </h1>
                            <p className="text-gray-500 mt-2 font-medium">
                                Showing {products.length} products available in Nepal
                            </p>
                        </div>

                        {/* Filters Placeholder for UI completeness */}
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
                <div className="flex flex-col lg:flex-row gap-10">
                    {/* Sidebar Filters */}
                    <aside className="lg:w-64 flex-shrink-0 space-y-8">
                        <div>
                            <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-4">Categories</h3>
                            <div className="space-y-1">
                                {categories.map((c: any) => (
                                    <Link
                                        key={c.id}
                                        href={`/shop/category/${c.slug}`}
                                        className={`block px-3 py-2 rounded-lg text-sm font-bold transition-all ${c.slug === categorySlug ? 'bg-primary/5 text-primary border-r-4 border-primary' : 'text-gray-500 hover:bg-gray-100'}`}
                                    >
                                        {c.name}
                                    </Link>
                                ))}
                            </div>
                        </div>

                        {categorySlug && (
                            <div>
                                <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-4">Sub Categories</h3>
                                <div className="space-y-1">
                                    {subcategories.filter((s: any) => s.category_id === category.id || s.category_id === category._id).map((s: any) => (
                                        <Link
                                            key={s.id}
                                            href={`/shop/category/${categorySlug}/${s.slug}`}
                                            className={`block px-3 py-2 rounded-lg text-sm font-bold transition-all ${s.slug === subcategorySlug ? 'bg-primary/5 text-primary border-r-4 border-primary' : 'text-gray-500 hover:bg-gray-100'}`}
                                        >
                                            {s.name}
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )}
                    </aside>

                    {/* Product Grid Area */}
                    <div className="flex-1">
                        <ProductsListClient products={products} productPathPrefix="/products" />

                        <div className="mt-12 pt-8 border-t border-gray-100">
                            <ProductsPagination
                                currentPage={page}
                                hasMore={hasMore}
                                basePath={`/shop/category/${slugs.join('/')}`}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
