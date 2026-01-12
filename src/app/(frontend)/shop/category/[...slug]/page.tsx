import Link from 'next/link';
import ProductsListClient from '@/components/products/ProductsListClientWrapper';
import ProductsPagination from '@/components/products/ProductsPagination';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export async function generateMetadata({ params }: { params: Promise<{ slug: string[] }> }) {
    const p = await params;
    const categorySlug = (p.slug || [])[0];
    const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

    if (categorySlug) {
        try {
            const res = await fetch(`${API_BASE}/api/pages/services/categories?slug=${encodeURIComponent(categorySlug)}`, { cache: 'no-store' });
            if (res.ok) {
                const cat = await res.json();
                if (cat) {
                    return {
                        title: cat.meta_title || `${cat.name} | Shop`,
                        description: cat.meta_description || `Shop ${cat.name} products`,
                        openGraph: {
                            title: cat.meta_title || `${cat.name} | Shop`,
                            description: cat.meta_description || `Shop ${cat.name} products`,
                        }
                    };
                }
            }
        } catch (e) {
            // ignore
        }
    }

    return { title: 'Shop' };
}

export default async function CategoryPage(props: { params: Promise<{ slug: string[] }>, searchParams?: Promise<{ page?: string, sort?: string, minPrice?: string, maxPrice?: string, status?: string }> }) {
    const params = await props.params;
    const searchParams = await props.searchParams;
    const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
    const slugs = params.slug || [];
    const categorySlug = slugs[0];
    const subcategorySlug = slugs[1];

    const page = searchParams?.page ? parseInt(String(searchParams.page)) || 1 : 1;
    const limit = 12;
    const offset = (Math.max(1, page) - 1) * limit;
    const sort = searchParams?.sort || 'featured';
    const minPrice = searchParams?.minPrice;
    const maxPrice = searchParams?.maxPrice;
    const status = searchParams?.status;

    // Build API URL
    const url = new URL(`${API_BASE}/api/products`);
    url.searchParams.set('category', categorySlug);
    if (subcategorySlug) url.searchParams.set('subcategory', subcategorySlug);
    url.searchParams.set('limit', limit.toString());
    url.searchParams.set('offset', offset.toString());
    url.searchParams.set('sort', sort);
    if (minPrice) url.searchParams.set('minPrice', minPrice);
    if (maxPrice) url.searchParams.set('maxPrice', maxPrice);
    if (status) url.searchParams.set('status', status);
    // propagate free-text q if present in page search params
    const qParam = (searchParams as any)?.q || undefined;
    if (qParam) url.searchParams.set('q', qParam);

    // Fetch products, categories, subcategories and optional category-hero
    const [productsRes, catsRes, subsRes, heroRes] = await Promise.all([
        fetch(url.toString(), { cache: 'no-store' }),
        fetch(`${API_BASE}/api/pages/services/categories`, { cache: 'no-store' }),
        fetch(`${API_BASE}/api/pages/services/subcategories`, { cache: 'no-store' }),
        fetch(`${API_BASE}/api/pages/shop/category-hero?category=${categorySlug}`, { cache: 'no-store' }),
    ]);

    const products = productsRes.ok ? await productsRes.json() : [];
    const categories = catsRes.ok ? await catsRes.json() : [];
    const subcategories = subsRes.ok ? await subsRes.json() : [];
    const categoryHero = heroRes.ok ? await heroRes.json() : null;

    const category = categories.find((c: any) => c.slug === categorySlug) || { name: categorySlug };
    const subcategory = subcategorySlug ? subcategories.find((s: any) => s.slug === subcategorySlug) : null;

    const hasMore = Array.isArray(products) && products.length === limit;

    const renderTitle = (title: string, highlight?: string) => {
        const t = String(title || '');
        const hRaw = String(highlight || '').trim();
        if (!hRaw) return t;
        const h = hRaw.toLowerCase();
        if (!t.toLowerCase().includes(h)) return t;

        const parts = t.split(new RegExp(`(${hRaw})`, 'gi'));
        return parts.map((part, i) =>
            part.toLowerCase() === h ? (
                <span key={i} className="text-primary">{part}</span>
            ) : (
                part
            )
        );
    };

    return (
        <main className="flex-1 bg-gray-50/50 min-h-screen">
            {/* Category Hero Section (Optional) */}
            {categoryHero && Object.keys(categoryHero).length > 0 && !subcategory && (
                <div className="bg-white border-b border-gray-100">
                    <div className="layout-container px-4 md:px-10 max-w-[1440px] mx-auto py-12">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                            <div className="space-y-6">
                                {categoryHero.badge_text && (
                                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 w-fit backdrop-blur-sm shadow-sm transition-all hover:bg-primary/15">
                                        <span className="material-symbols-outlined text-primary text-sm font-semibold">verified</span>
                                        <span className="text-primary text-[11px] font-extrabold uppercase tracking-[0.1em] leading-none">{categoryHero.badge_text}</span>
                                    </div>
                                )}
                                <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight leading-[1.1]">
                                    {renderTitle(categoryHero.title, categoryHero.highlight_text)}
                                </h1>
                                <p className="text-lg text-gray-600 leading-relaxed max-w-xl">
                                    {categoryHero.description}
                                </p>
                                <div className="flex flex-wrap gap-4 pt-2">
                                    {categoryHero.cta_text && (
                                        <Link href={categoryHero.cta_link || '#'} className="bg-primary text-white px-8 py-4 rounded-xl font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20">
                                            {categoryHero.cta_text}
                                        </Link>
                                    )}
                                    {categoryHero.cta2_text && (
                                        <Link href={categoryHero.cta2_link || '#'} className="bg-white text-gray-900 border border-gray-200 px-8 py-4 rounded-xl font-bold hover:bg-gray-50 transition-all">
                                            {categoryHero.cta2_text}
                                        </Link>
                                    )}
                                </div>
                            </div>
                            {categoryHero.background_image && (
                                <div className="relative aspect-4/3 rounded-2xl overflow-hidden shadow-2xl shadow-gray-200 group">
                                    <img
                                        src={categoryHero.background_image}
                                        alt={categoryHero.hero_image_alt || category.name}
                                        className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                                    />
                                    {categoryHero.card_overlay_text && (
                                        <div className="absolute bottom-4 left-4 right-4 p-5 md:p-6 rounded-2xl bg-black/40 backdrop-blur-xl border border-white/20 text-white flex flex-col items-start shadow-2xl transition-all duration-300 group-hover:bottom-5">
                                            <p className="text-xs md:text-sm font-bold text-white leading-relaxed opacity-90">{categoryHero.card_overlay_text}</p>
                                            {categoryHero.card_cta_text && (
                                                <Link
                                                    href={categoryHero.card_cta_link || '#'}
                                                    className="inline-flex items-center gap-2 text-primary font-black text-[11px] uppercase tracking-widest mt-3 hover:gap-3 transition-all focus:outline-none group/link"
                                                >
                                                    {categoryHero.card_cta_text}
                                                    <span className="material-symbols-outlined text-sm transition-transform group-hover/link:translate-x-1">arrow_forward</span>
                                                </Link>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Breadcrumbs & Header (Always shown if no hero or if subcategory) */}
            {(!categoryHero || Object.keys(categoryHero).length === 0 || subcategory) && (
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

                            <div className="flex items-center gap-2">
                                <div className="flex bg-white border border-gray-200 rounded-lg p-1 shadow-sm">
                                    <Link href={`?${new URLSearchParams({ ...Object.fromEntries(new URLSearchParams(String(searchParams))), sort: 'featured' })}`} className={`px-4 py-1.5 text-xs font-bold rounded-md ${sort === 'featured' ? 'bg-primary text-white' : 'text-gray-500 hover:bg-gray-50'}`}>Featured</Link>
                                    <Link href={`?${new URLSearchParams({ ...Object.fromEntries(new URLSearchParams(String(searchParams))), sort: 'price_asc' })}`} className={`px-4 py-1.5 text-xs font-bold rounded-md ${sort === 'price_asc' ? 'bg-primary text-white' : 'text-gray-500 hover:bg-gray-50'}`}>Price Low</Link>
                                    <Link href={`?${new URLSearchParams({ ...Object.fromEntries(new URLSearchParams(String(searchParams))), sort: 'price_desc' })}`} className={`px-4 py-1.5 text-xs font-bold rounded-md ${sort === 'price_desc' ? 'bg-primary text-white' : 'text-gray-500 hover:bg-gray-50'}`}>Price High</Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="layout-container px-4 md:px-10 max-w-[1440px] mx-auto py-12">
                <div className="flex flex-col lg:flex-row gap-10">
                    {/* Sidebar Filters */}
                    <aside className="lg:w-72 shrink-0 space-y-10">
                        {/* Categories Section */}
                        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                            <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-6 flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary text-lg">grid_view</span>
                                Categories
                            </h3>
                            <div className="space-y-2">
                                {categories.map((c: any) => (
                                    <Link
                                        key={c.id}
                                        href={`/shop/category/${c.slug}${String(new URLSearchParams(String(searchParams))) ? `?${String(new URLSearchParams(String(searchParams)))}` : ''}`}
                                        className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-bold transition-all ${c.slug === categorySlug ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-gray-500 hover:bg-gray-50'}`}
                                    >
                                        {c.name}
                                        {c.slug === categorySlug && <span className="material-symbols-outlined text-sm">chevron_right</span>}
                                    </Link>
                                ))}
                            </div>
                        </div>

                        {/* Subcategories Section */}
                        {categorySlug && (
                            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                                <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-6 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-primary text-lg">account_tree</span>
                                    Sub Categories
                                </h3>
                                <div className="space-y-2">
                                    <Link
                                        href={`/shop/category/${categorySlug}${String(new URLSearchParams(String(searchParams))) ? `?${String(new URLSearchParams(String(searchParams)))}` : ''}`}
                                        className={`block px-4 py-3 rounded-xl text-sm font-bold transition-all ${!subcategorySlug ? 'bg-gray-100 text-gray-900' : 'text-gray-500 hover:bg-gray-50'}`}
                                    >
                                        All {category.name}
                                    </Link>
                                    {subcategories.filter((s: any) => s.category_id === category.id || s.category_id === category._id).map((s: any) => (
                                        <Link
                                            key={s.id}
                                            href={`/shop/category/${categorySlug}/${s.slug}${String(new URLSearchParams(String(searchParams))) ? `?${String(new URLSearchParams(String(searchParams)))}` : ''}`}
                                            className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-bold transition-all ${s.slug === subcategorySlug ? 'bg-gray-100 text-gray-900' : 'text-gray-500 hover:bg-gray-50'}`}
                                        >
                                            {s.name}
                                            {s.slug === subcategorySlug && <span className="material-symbols-outlined text-sm">check</span>}
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Price Filter */}
                        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                            <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-6 flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary text-lg">payments</span>
                                Price Range
                            </h3>
                            <form className="space-y-4">                                {Object.entries(Object.fromEntries(new URLSearchParams(String(searchParams))))
                                .filter(([k]) => k !== 'minPrice' && k !== 'maxPrice' && k !== 'page')
                                .map(([k, v]) => (
                                    <input key={k} type="hidden" name={k} value={v as string} />
                                ))
                            }                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">Min Price</label>
                                        <input
                                            type="number"
                                            name="minPrice"
                                            defaultValue={minPrice}
                                            placeholder="0"
                                            className="w-full px-3 py-2 bg-gray-50 border border-gray-100 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">Max Price</label>
                                        <input
                                            type="number"
                                            name="maxPrice"
                                            defaultValue={maxPrice}
                                            placeholder="Any"
                                            className="w-full px-3 py-2 bg-gray-50 border border-gray-100 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                                        />
                                    </div>
                                </div>
                                <button
                                    type="submit"
                                    className="w-full py-2.5 bg-gray-900 text-white text-xs font-bold rounded-xl hover:bg-black transition-all"
                                >
                                    Apply Range
                                </button>
                                {(minPrice || maxPrice) && (
                                    <Link
                                        href={`?${new URLSearchParams(Object.fromEntries(Object.entries(Object.fromEntries(new URLSearchParams(String(searchParams)))).filter(([k]) => k !== 'minPrice' && k !== 'maxPrice')))}`}
                                        className="block text-center text-xs font-bold text-primary hover:underline pt-2"
                                    >
                                        Clear Price Filter
                                    </Link>
                                )}
                            </form>
                        </div>

                        {/* Availability Filter */}
                        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                            <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-6 flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary text-lg">inventory_2</span>
                                Availability
                            </h3>
                            <div className="space-y-2">
                                <Link
                                    href={`?${new URLSearchParams({ ...Object.fromEntries(new URLSearchParams(String(searchParams))), status: 'in_stock' })}`}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${status === 'in_stock' ? 'bg-green-50 text-green-700' : 'text-gray-500 hover:bg-gray-50'}`}
                                >
                                    <span className={`w-2 h-2 rounded-full ${status === 'in_stock' ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                                    In Stock
                                </Link>
                                <Link
                                    href={`?${new URLSearchParams({ ...Object.fromEntries(new URLSearchParams(String(searchParams))), status: 'out_of_stock' })}`}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${status === 'out_of_stock' ? 'bg-red-50 text-red-700' : 'text-gray-500 hover:bg-gray-50'}`}
                                >
                                    <span className={`w-2 h-2 rounded-full ${status === 'out_of_stock' ? 'bg-red-500' : 'bg-gray-300'}`}></span>
                                    Out of Stock
                                </Link>
                                {status && (
                                    <Link
                                        href={`?${new URLSearchParams(Object.fromEntries(Object.entries(Object.fromEntries(new URLSearchParams(String(searchParams)))).filter(([k]) => k !== 'status')))}`}
                                        className="block text-center text-xs font-bold text-primary hover:underline pt-4 border-t border-gray-50"
                                    >
                                        Show All Availability
                                    </Link>
                                )}
                            </div>
                        </div>
                    </aside>

                    {/* Product Grid Area */}
                    <div className="flex-1">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-xl font-bold text-gray-900">
                                {products.length} {products.length === 1 ? 'Product' : 'Products'} Found
                            </h2>
                            {/* Mobile Filters Trigger Placeholder */}
                            <button className="lg:hidden flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-bold">
                                <span className="material-symbols-outlined text-sm">tune</span>
                                Filters
                            </button>
                        </div>

                        <ProductsListClient
                            products={products}
                            productPathPrefix="/products"
                            searchContext={{ category: categorySlug, subcategory: subcategorySlug, minPrice, maxPrice, status }}
                        />

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
