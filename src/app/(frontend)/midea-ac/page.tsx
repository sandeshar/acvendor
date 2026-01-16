import Link from 'next/link';
import ProductsListClient from '@/components/products/ProductsListClientWrapper';
import CategoriesList from '@/components/products/CategoriesList';
import CategoriesPills from '@/components/products/CategoriesPills';
import ProductsPagination from '@/components/products/ProductsPagination';
import SortDropdown from '@/components/products/SortDropdown';
import MobileFilterDrawer from '@/components/products/MobileFilterDrawer';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

async function getProducts(limit = 12, brand?: string, category?: string, subcategory?: string, page: number = 1, sort?: string, qParam?: string, minPrice?: string, maxPrice?: string) {
    try {
        const q = new URLSearchParams();
        if (limit) q.set('limit', String(limit));
        if (brand) q.set('brand', brand);
        if (category) q.set('category', category);
        if (subcategory) q.set('subcategory', subcategory);
        if (sort) q.set('sort', sort);
        if (qParam) q.set('q', qParam);
        if (minPrice) q.set('minPrice', minPrice);
        if (maxPrice) q.set('maxPrice', maxPrice);
        const offset = (Math.max(1, page) - 1) * (limit || 12);
        if (offset) q.set('offset', String(offset));
        const res = await fetch(`${API_BASE}/api/products?${q.toString()}`, { cache: 'no-store', next: { tags: ['products'] } });
        if (!res.ok) return [];
        return await res.json();
    } catch (e) {
        console.error('Error fetching products:', (e as Error)?.message || String(e));
        return [];
    }
}

import type { Metadata } from 'next';

export async function generateMetadata(ctx?: { searchParams?: { category?: string } }): Promise<Metadata> {
    const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
    const categoryParam = (ctx?.searchParams as any)?.category || '';

    if (categoryParam) {
        try {
            const res = await fetch(`${API_BASE}/api/pages/services/categories?slug=${encodeURIComponent(categoryParam)}`, { cache: 'no-store' });
            if (res.ok) {
                const cat = await res.json();
                if (cat) {
                    return {
                        title: cat.meta_title || `${cat.name} | Midea AC`,
                        description: cat.meta_description || `Browse ${cat.name} products and parts`,
                        openGraph: {
                            title: cat.meta_title || `${cat.name} | Midea AC`,
                            description: cat.meta_description || `Browse ${cat.name} products and parts`,
                        }
                    };
                }
            }
        } catch (e) {
            // ignore and fall back
        }
    }

    return { title: 'Midea AC', description: 'Browse Midea AC products and parts' };
}

export default async function MideaPage({ searchParams }: { searchParams?: { subcategory?: string, page?: string, category?: string, sort?: string } }) {
    // Force brand to 'midea' for this page
    const brand = 'midea';

    // Defensive parsing of searchParams because it can be a Proxy-like object that throws
    let category: string = '';
    let subcategory: string | undefined = undefined;
    let page: number = 1;
    let sort: string = '';
    let minPrice: string = '';
    let maxPrice: string = '';
    try {
        // If searchParams is a Promise, try to await it
        let sp: any = searchParams;
        try {
            const initialTag = Object.prototype.toString.call(sp);
            if (initialTag === '[object Promise]') {
                try {
                    sp = await sp;
                } catch (awaitErr) {
                    // eslint-disable-next-line no-console
                    console.warn('MideaPage: failed to resolve searchParams promise', awaitErr);
                }
            }
        } catch (tagErr) {
            // ignore
        }

        const tag = Object.prototype.toString.call(sp);
        const isSafe = tag === '[object Object]' || tag === '[object URLSearchParams]';
        if (!isSafe) {
            // eslint-disable-next-line no-console
            console.warn('MideaPage: unsafe searchParams shape detected, skipping parse', { tag, searchParams: sp });
        } else {
            try {
                if (typeof (sp as any).get === 'function') {
                    const c = (sp as any).get('category');
                    category = c == null ? '' : String(c);
                    const sc = (sp as any).get('subcategory');
                    subcategory = sc == null ? undefined : String(sc);
                    const p = (sp as any).get('page');
                    page = p ? parseInt(String(p)) || 1 : 1;
                    const s = (sp as any).get('sort');
                    sort = s == null ? '' : String(s);
                    const minP = (sp as any).get('minPrice');
                    minPrice = minP == null ? '' : String(minP);
                    const maxP = (sp as any).get('maxPrice');
                    maxPrice = maxP == null ? '' : String(maxP);
                } else {
                    const rawC = (sp as any)['category'];
                    category = rawC == null ? '' : String(rawC);
                    const rawSC = (sp as any)['subcategory'];
                    subcategory = rawSC == null ? undefined : String(rawSC);
                    const rawP = (sp as any)['page'];
                    page = rawP ? parseInt(String(rawP)) || 1 : 1;
                    const rawS = (sp as any)['sort'];
                    sort = rawS == null ? '' : String(rawS);
                    const rawMinP = (sp as any)['minPrice'];
                    minPrice = rawMinP == null ? '' : String(rawMinP);
                    const rawMaxP = (sp as any)['maxPrice'];
                    maxPrice = rawMaxP == null ? '' : String(rawMaxP);
                }
            } catch (innerErr) {
                // eslint-disable-next-line no-console
                console.error('Error accessing MideaPage searchParams properties', innerErr, { searchParams: sp });
            }
        }
    } catch (err) {
        // eslint-disable-next-line no-console
        console.error('MideaPage: failed to inspect searchParams', err, { searchParams });
    }

    const qParam = (searchParams as any)?.q || undefined;
    const products = await getProducts(12, brand, category || undefined, subcategory, page, sort, qParam, minPrice, maxPrice);

    const hasMore = (products || []).length === 12;

    const buildHref = (newPage: number) => {
        const params = new URLSearchParams();
        if (category) params.set('category', category);
        if (subcategory) params.set('subcategory', subcategory);
        if (sort) params.set('sort', sort);
        if (qParam) params.set('q', qParam);
        if (newPage && newPage > 1) params.set('page', String(newPage));
        const qs = params.toString();
        return `/midea-ac${qs ? `?${qs}` : ''}`;
    };

    // Fetch category-specific hero (fallback to global shop hero if not present)
    let brandHero: any = null;
    try {
        const res = await fetch(`${API_BASE}/api/pages/shop/category-hero?category=${brand}`, { cache: 'no-store', next: { tags: ['shop-category-hero'] } });
        if (res.ok) brandHero = await res.json();
    } catch (e) { /* ignore */ }

    // Fetch global shop hero as fallback
    let shopHero: any = null;
    try {
        const res = await fetch(`${API_BASE}/api/pages/shop/hero`, { cache: 'no-store', next: { tags: ['shop-hero'] } });
        if (res.ok) shopHero = await res.json();
    } catch (e) { /* ignore */ }

    // Fetch Midea CTA
    let mideaCTA: any = null;
    try {
        const res = await fetch(`${API_BASE}/api/pages/shop/category-cta?category=${brand}`, { cache: 'no-store', next: { tags: ['category-cta'] } });
        if (res.ok) mideaCTA = await res.json();
    } catch (e) { /* ignore */ }

    const escapeRegExp = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    const renderTitle = (title: string, highlight?: string) => {
        const t = String(title || '');
        const hRaw = String(highlight || '').trim();
        if (!hRaw) return t;
        const h = hRaw.toLowerCase();
        if (!t.toLowerCase().includes(h)) return t;

        const escaped = escapeRegExp(hRaw);
        const parts = t.split(new RegExp(`(${escaped})`, 'gi'));
        return parts.map((part, i) =>
            part.toLowerCase() === h ? (
                <span key={i} className="text-primary">{part}</span>
            ) : (
                part
            )
        );
    };

    const filtersContent = (
        <div className="flex flex-col gap-6">
            <div className="bg-white rounded-xl border border-[#e5e7eb] p-4 shadow-sm">
                <div className="flex flex-col gap-4">
                    <div className="flex flex-col pb-2 border-b border-[#f0f2f4]">
                        <h1 className="text-[#111418] text-lg font-bold leading-normal">{brand ? `${brand.toUpperCase()} Categories` : 'Brand Categories'}</h1>
                        <p className="text-[#617589] text-xs font-normal leading-normal">Browse {brand ? brand.toUpperCase() : 'brand'} AC by Type</p>
                    </div>
                    <CategoriesList brand={brand} selectedCategory={category} selectedSubcategory={subcategory ?? ''} />
                </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-6 flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-lg">payments</span>
                    Price Range
                </h3>
                <form className="space-y-4">
                    {/* Preserve existing search params */}
                    {Object.entries(searchParams || {})
                        .filter(([k]) => k !== 'minPrice' && k !== 'maxPrice' && k !== 'page')
                        .map(([k, v]) => (
                            <input key={k} type="hidden" name={k} value={v as string} />
                        ))
                    }
                    <div className="grid grid-cols-2 gap-3">
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
                            href={`/midea-ac?${new URLSearchParams(Object.fromEntries(Object.entries(searchParams || {}).filter(([k]) => k !== 'minPrice' && k !== 'maxPrice')))}`}
                            className="block text-center text-xs font-bold text-primary hover:underline pt-2"
                        >
                            Clear Price Filter
                        </Link>
                    )}
                </form>
            </div>
        </div>
    );

    return (
        <div className="layout-container flex flex-col md:flex-row grow max-w-[1440px] mx-auto w-full px-4 sm:px-6 lg:px-8 py-5 gap-6">
            <aside className="hidden md:flex flex-col w-64 shrink-0 gap-6">
                <div className="sticky top-24">
                    {filtersContent}
                </div>
            </aside>

            <main className="flex flex-col flex-1 gap-6 w-full min-w-0">
                <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap gap-2 text-sm">
                        <Link href="/" className="text-[#617589] font-medium leading-normal hover:text-primary transition-colors">Home</Link>
                        <span className="text-[#617589] font-medium leading-normal">/</span>
                        <span className="text-[#111418] font-medium leading-normal">Midea AC</span>
                    </div>
                    <div className="md:hidden">
                        <MobileFilterDrawer>
                            {filtersContent}
                        </MobileFilterDrawer>
                    </div>
                </div>

                <div className="relative w-full overflow-hidden rounded-xl">
                    {(() => {
                        const h = brandHero && Object.keys(brandHero).length ? brandHero : (shopHero && Object.keys(shopHero).length ? shopHero : null);
                        const bg = h?.background_image || '';
                        const badge = h?.badge_text || '';
                        const title = h?.title || '';
                        const subtitle = h?.subtitle || '';
                        const cta = h?.cta_text || '';

                        return (
                            <div className="flex min-h-[280px] sm:min-h-80 flex-col gap-6 bg-cover bg-center bg-no-repeat items-start justify-end px-6 py-8 sm:px-10 relative" style={{ backgroundImage: `linear-gradient(rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.6) 100%), url("${bg || 'https://lh3.googleusercontent.com/aida-public/AB6AXuD2Tz9Tfqhk4mbHJCHiu0oDVp0NoXhq3FZ4FWT4t4oDgBFElAQqkLaNHkgOgYoVOjKiBbaVk4_2Z46NME9AfESb3afunhjert5tbwt2krROCRsTP9Ssqtqrki6QQeOl7CUyVEehH4okoN8LNauFDea_eB75lRLxkyNTB6XkInLUTMDAFO4f3S2vYllrBQ7AQveBrZbVOdB_7IP7nyivJ35_FSeVmR1Wr-oP_OHeGZUqfpGdK6-WYiXL_W139SClaNhVh78ewkn9X9k'}")` }}>
                                <div className="flex flex-col gap-2 text-left max-w-lg">
                                    {badge && <span className="inline-flex w-fit items-center gap-1 rounded-full bg-primary/90 px-3 py-1 text-xs font-bold text-white backdrop-blur-sm">{badge}</span>}
                                    <h1 data-hero-title={title} data-hero-highlight={h?.highlight_text} className="text-white text-3xl sm:text-4xl font-black leading-tight tracking-[-0.033em]">
                                        {renderTitle(title, h?.highlight_text || '')}
                                    </h1>
                                    <h2 className="text-gray-100 text-sm sm:text-base font-normal leading-relaxed">{subtitle}</h2>
                                </div>

                                {cta && (
                                    <div className="flex gap-3">
                                        <a href={h?.cta_link || '/midea-ac'} className="flex cursor-pointer items-center justify-center rounded-lg h-10 px-5 bg-primary hover:bg-blue-600 text-white text-sm font-bold transition-colors">{cta}</a>
                                        {h?.cta2_text && (
                                            <a href={h?.cta2_link || '/midea-ac'} className="flex items-center justify-center rounded-lg h-10 px-5 bg-white border border-gray-200 text-[#111418] text-sm font-bold transition-colors">{h.cta2_text}</a>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })()}
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-2">
                    <h2 className="text-xl font-bold text-[#111418]">Featured {brand ? brand.toUpperCase() : 'Brand'} Products</h2>
                    <div className="flex gap-2">
                        <SortDropdown currentSort={sort} />
                    </div>
                </div>

                {/* Interactive client-side list with cleaner UI */}
                <ProductsListClient products={products} productPathPrefix="/midea-ac" />

                {/* Client-driven pagination component ensures category/subcategory are preserved during navigation */}
                <ProductsPagination currentPage={page} hasMore={hasMore} />

                {mideaCTA?.is_active ? (
                    <div className="bg-primary rounded-xl p-8 md:p-12 mt-4 overflow-hidden relative shadow-2xl shadow-primary/20">
                        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                            <div className="max-w-xl text-white text-center md:text-left">
                                <h3 className="text-3xl font-black mb-4">{mideaCTA.title}</h3>
                                <p className="text-primary-100 text-lg mb-8">{mideaCTA.description}</p>
                                {mideaCTA.bullets && (
                                    <ul className="flex flex-col sm:flex-row flex-wrap gap-4 sm:gap-6 mb-8 text-primary-50 font-medium justify-center md:justify-start">
                                        {(() => {
                                            try {
                                                const b = typeof mideaCTA.bullets === 'string' ? JSON.parse(mideaCTA.bullets) : mideaCTA.bullets;
                                                return Array.isArray(b) ? b.map((bullet: string, i: number) => (
                                                    <li key={i} className="flex items-center gap-2">
                                                        <span className="material-symbols-outlined text-sm">check_circle</span>
                                                        <span>{bullet}</span>
                                                    </li>
                                                )) : null;
                                            } catch (e) { return null; }
                                        })()}
                                    </ul>
                                )}
                                <Link href={mideaCTA.button1_link || mideaCTA.button_link || '/contact'} className="inline-block bg-white text-primary hover:bg-primary-50 px-8 py-3 rounded-lg font-bold transition-colors shadow-lg">
                                    {mideaCTA.button1_text || mideaCTA.button_text || 'Contact Sales'}
                                </Link>
                            </div>
                            <div className="hidden lg:block relative z-10">
                                <div className="w-48 h-48 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20">
                                    <span className="material-symbols-outlined text-white text-7xl">ac_unit</span>
                                </div>
                            </div>
                        </div>
                        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4"></div>
                    </div>
                ) : (
                    <div className="bg-primary/5 rounded-xl p-8 mt-4 flex flex-col md:flex-row items-center justify-between gap-6 border border-primary/20">
                        <div className="flex flex-col gap-2">
                            <h3 className="text-2xl font-bold text-[#111418]">Need a custom cooling solution?</h3>
                            <p className="text-[#617589] text-base">Contact us for bulk orders, project installations, or specific requirement consultations.</p>
                        </div>
                        <div className="flex gap-4">
                            <Link href={mideaCTA.button2_link || "/contact"} className="flex min-w-[140px] cursor-pointer items-center justify-center rounded-lg h-12 px-6 bg-white border border-gray-200 text-[#111418] text-base font-bold shadow-sm hover:shadow transition-shadow">{mideaCTA.button2_text || "Contact Sales"}</Link>
                            {/* If there was a third button or something else, it would go here */}
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
