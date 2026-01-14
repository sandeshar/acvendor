import Link from 'next/link';
import ProductsListClient from '@/components/products/ProductsListClientWrapper';
import ProductsPagination from '@/components/products/ProductsPagination';
import MobileFilterDrawer from '@/components/products/MobileFilterDrawer';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export async function generateMetadata({ params }: { params: Promise<{ slug: string[] }> }) {
    const p = await params;
    const slugs = p.slug || [];
    const categorySlug = slugs[0];
    const subcategorySlug = slugs[1];
    const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

    if (subcategorySlug) {
        try {
            const res = await fetch(`${API_BASE}/api/pages/services/subcategories?slug=${encodeURIComponent(subcategorySlug)}`, { cache: 'no-store' });
            if (res.ok) {
                const sub = await res.json();
                // Subcategories API usually returns an array unless fetched specifically by slug as a query param
                const subObj = Array.isArray(sub) ? sub.find((s: any) => s.slug === subcategorySlug) : sub;
                if (subObj) {
                    return {
                        title: subObj.meta_title || `${subObj.name} | ${categorySlug.toUpperCase()} | Shop`,
                        description: subObj.meta_description || `Shop ${subObj.name} products`,
                        openGraph: {
                            title: subObj.meta_title || `${subObj.name} | ${categorySlug.toUpperCase()} | Shop`,
                            description: subObj.meta_description || `Shop ${subObj.name} products`,
                        }
                    };
                }
            }
        } catch (e) { /* ignore */ }
    }

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

    // Fetch products, categories, subcategories and optional category-hero/cta
    const [productsRes, catsRes, subsRes, heroRes, ctaRes] = await Promise.all([
        fetch(url.toString(), { cache: 'no-store' }),
        fetch(`${API_BASE}/api/pages/services/categories`, { cache: 'no-store' }),
        fetch(`${API_BASE}/api/pages/services/subcategories`, { cache: 'no-store' }),
        fetch(`${API_BASE}/api/pages/shop/category-hero?category=${categorySlug}`, { cache: 'no-store', next: { tags: ['shop-category-hero'] } }),
        fetch(`${API_BASE}/api/pages/shop/category-cta?category=${categorySlug}`, { cache: 'no-store', next: { tags: ['category-cta'] } }),
    ]);

    const products = productsRes.ok ? await productsRes.json() : [];
    const categories = catsRes.ok ? await catsRes.json() : [];
    const subcategories = subsRes.ok ? await subsRes.json() : [];
    const categoryHero = heroRes.ok ? await heroRes.json() : null;
    const categoryCTA = ctaRes.ok ? await ctaRes.json() : null;

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

    const filtersContent = (
        <>
            {/* Categories & Subcategories Section */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-6 flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-lg">grid_view</span>
                    Shop by Category
                </h3>
                <div className="space-y-4">
                    {categories.map((c: any) => {
                        const isActiveCategory = c.slug === categorySlug;
                        const categorySubs = subcategories.filter((s: any) => s.category_id === (c.id || c._id));

                        return (
                            <div key={c.id || c._id} className="space-y-1">
                                <Link
                                    href={`/shop/category/${c.slug}${String(new URLSearchParams(String(searchParams))) ? `?${String(new URLSearchParams(String(searchParams)))}` : ''}`}
                                    className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-bold transition-all ${isActiveCategory ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-gray-500 hover:bg-gray-50'}`}
                                >
                                    {c.name}
                                    <span className={`material-symbols-outlined text-sm transition-transform ${isActiveCategory ? 'rotate-90' : ''}`}>chevron_right</span>
                                </Link>

                                {isActiveCategory && (
                                    <div className="pl-4 mt-2 space-y-1 border-l-2 border-gray-100 ml-4 animate-in slide-in-from-top-2 duration-300">
                                        <Link
                                            href={`/shop/category/${c.slug}${String(new URLSearchParams(String(searchParams))) ? `?${String(new URLSearchParams(String(searchParams)))}` : ''}`}
                                            className={`block px-4 py-2 rounded-lg text-xs font-bold transition-all ${!subcategorySlug ? 'text-primary bg-primary/5' : 'text-gray-400 hover:text-gray-600'}`}
                                        >
                                            All {c.name}
                                        </Link>
                                        {categorySubs.map((s: any) => (
                                            <Link
                                                key={s.id || s._id}
                                                href={`/shop/category/${c.slug}/${s.slug}${String(new URLSearchParams(String(searchParams))) ? `?${String(new URLSearchParams(String(searchParams)))}` : ''}`}
                                                className={`flex items-center justify-between px-4 py-2 rounded-lg text-xs font-bold transition-all ${s.slug === subcategorySlug ? 'text-primary bg-primary/5' : 'text-gray-400 hover:text-gray-600'}`}
                                            >
                                                {s.name}
                                                {s.slug === subcategorySlug && <span className="material-symbols-outlined text-xs">check</span>}
                                            </Link>
                                        ))}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

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
        </>
    );

    return (
        <main className="flex-1 bg-gray-50/50 min-h-screen">
            {/* Category Hero Section (Optional) */}
            {categoryHero && Object.keys(categoryHero).length > 0 && !subcategory && (
                <div className="bg-surface-light border-b border-gray-100">
                    <div className="layout-container px-4 md:px-10 max-w-[1440px] mx-auto py-12 lg:py-16">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                            <div className="space-y-6">
                                <div className="flex flex-col gap-2">
                                    {categoryHero.badge_text && (
                                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 w-fit backdrop-blur-sm shadow-sm transition-all hover:bg-primary/15">
                                            <span className="material-symbols-outlined text-primary text-sm font-semibold">verified</span>
                                            <span className="text-primary text-[11px] font-extrabold uppercase tracking-widest leading-none">{categoryHero.badge_text}</span>
                                        </div>
                                    )}
                                    {categoryHero.tagline && (
                                        <div className="text-primary font-bold text-sm uppercase tracking-widest">{categoryHero.tagline}</div>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight leading-[1.1]">
                                        {renderTitle(categoryHero.title, categoryHero.highlight_text)}
                                    </h1>
                                    {categoryHero.subtitle && (
                                        <p className="text-xl md:text-2xl font-bold text-gray-700/80 tracking-tight">
                                            {categoryHero.subtitle}
                                        </p>
                                    )}
                                </div>
                                <p className="text-lg text-gray-600 leading-relaxed max-w-xl">
                                    {categoryHero.description}
                                </p>
                                <div className="flex flex-wrap gap-4 pt-4">
                                    {categoryHero.cta_text && (
                                        <Link href={categoryHero.cta_link || '#'} className="h-12 px-6 rounded-lg bg-primary hover:bg-primary-600 text-white font-bold text-base transition-all shadow-lg flex items-center gap-2">
                                            <span>{categoryHero.cta_text}</span>
                                            <span className="material-symbols-outlined">arrow_forward</span>
                                        </Link>
                                    )}
                                    {categoryHero.cta2_text && (
                                        <Link href={categoryHero.cta2_link || '#'} className="h-12 px-6 rounded-lg bg-background-light hover:bg-gray-200 text-text-main-light font-bold text-base transition-all flex items-center gap-2">
                                            <span className="material-symbols-outlined">grid_view</span>
                                            <span>{categoryHero.cta2_text}</span>
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
                                    {(categoryHero.card_overlay_text || categoryHero.tagline || categoryHero.card_cta_text || categoryHero.cta_text) && (
                                        <div className="absolute bottom-4 left-4 right-4 p-5 md:p-6 rounded-2xl bg-black/40 backdrop-blur-xl border border-white/20 text-white flex justify-between items-center shadow-2xl transition-all duration-300 group-hover:bottom-5">
                                            <div className="max-w-[70%]">
                                                {categoryHero.tagline && <p className="text-xs font-black uppercase tracking-widest text-primary mb-1">{categoryHero.tagline}</p>}
                                                <p className="text-xs md:text-sm font-bold text-white leading-relaxed opacity-90">{categoryHero.card_overlay_text || categoryHero.subtitle || categoryHero.description}</p>
                                            </div>
                                            {(categoryHero.card_cta_text || categoryHero.cta_text) ? (
                                                <Link
                                                    href={categoryHero.card_cta_link || categoryHero.cta_link || '#'}
                                                    className="shrink-0 ml-4 h-11 px-6 inline-flex items-center justify-center bg-white text-black hover:bg-primary hover:text-white rounded-xl font-bold text-sm transition-all duration-300 shadow-lg active:scale-95"
                                                >
                                                    {categoryHero.card_cta_text || categoryHero.cta_text}
                                                </Link>
                                            ) : null}
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
                    {/* Sidebar Filters - Hidden on Mobile */}
                    <aside className="hidden lg:flex lg:w-72 shrink-0 flex-col space-y-10">
                        {filtersContent}
                    </aside>

                    {/* Product Grid Area */}
                    <div className="flex-1">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-xl font-bold text-gray-900">
                                {products.length} {products.length === 1 ? 'Product' : 'Products'} Found
                            </h2>
                            <MobileFilterDrawer>
                                {filtersContent}
                            </MobileFilterDrawer>
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

                        {/* Category CTA */}
                        {categoryCTA?.is_active && (
                            <div className="mt-16 bg-primary rounded-2xl p-8 md:p-12 overflow-hidden relative shadow-2xl shadow-primary/20">
                                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                                    <div className="max-w-xl text-white">
                                        <h3 className="text-3xl font-black mb-4">{categoryCTA.title}</h3>
                                        <p className="text-primary-100 text-lg mb-8">{categoryCTA.description}</p>
                                        {categoryCTA.bullets && (
                                            <ul className="flex flex-col sm:flex-row flex-wrap gap-4 sm:gap-6 mb-8 text-primary-50 font-medium">
                                                {(typeof categoryCTA.bullets === 'string' ? JSON.parse(categoryCTA.bullets) : categoryCTA.bullets).map((bullet: string, i: number) => (
                                                    <li key={i} className="flex items-center gap-2">
                                                        <span className="material-symbols-outlined text-sm">check_circle</span>
                                                        <span>{bullet}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                        <Link href={categoryCTA.button_link || '/contact'} className="inline-block bg-white text-primary hover:bg-primary-50 px-8 py-3 rounded-lg font-bold transition-colors shadow-lg">
                                            {categoryCTA.button_text || 'Contact Now'}
                                        </Link>
                                    </div>
                                    <div className="hidden lg:block relative z-10">
                                        <div className="w-48 h-48 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20">
                                            <span className="material-symbols-outlined text-white text-7xl">shopping_cart_checkout</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4"></div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </main>
    );
}
