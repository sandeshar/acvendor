import Link from 'next/link';
import ProductsListClient from '@/components/products/ProductsListClientWrapper';
import ProductsPagination from '@/components/products/ProductsPagination';
import { formatPrice } from '@/utils/formatPrice';
import dynamicImport from 'next/dynamic';

const CompareAddButton = dynamicImport(() => import('@/components/products/CompareAddButton'));
const CompareTrayWrapper = dynamicImport(() => import('@/components/products/CompareTrayWrapper'));


export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export default async function ShopPage({ searchParams }: { searchParams?: { brand?: string, page?: string } }) {
    const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
    // Fetch Shop hero content, brands and categories
    const [heroRes, brandsRes, categoriesRes] = await Promise.all([
        fetch(`${API_BASE}/api/pages/shop/hero`, { cache: 'no-store', next: { tags: ['shop-hero'] } }),
        fetch(`${API_BASE}/api/pages/services/brands`, { cache: 'no-store' }),
        fetch(`${API_BASE}/api/pages/services/categories`, { cache: 'no-store' }),
    ]);
    const hero = heroRes.ok ? await heroRes.json() : null;
    const brands = brandsRes.ok ? await brandsRes.json() : [];
    const categories = categoriesRes.ok ? await categoriesRes.json() : [];

    // If a brand is requested, render a brand-specific listing view
    let brandParam: string | null = null;

    // QUICK SAFETY: avoid accessing properties on potentially hostile Proxy-like objects that throw
    try {
        // Handle Promise-shaped searchParams that Next may pass in dev/server: await if necessary
        let sp: any = searchParams;
        try {
            const initialTag = Object.prototype.toString.call(sp);
            if (initialTag === '[object Promise]') {
                try {
                    sp = await sp;
                } catch (awaitErr) {
                    // eslint-disable-next-line no-console
                    console.warn('ShopPage: failed to resolve searchParams promise', awaitErr);
                }
            }
        } catch (tagErr) {
            // proceed - will be handled below
        }

        const tag = Object.prototype.toString.call(sp);
        const isSafe = tag === '[object Object]' || tag === '[object URLSearchParams]';
        if (!isSafe) {
            // eslint-disable-next-line no-console
            console.warn('ShopPage: unsafe searchParams shape detected, skipping brand parsing', { tag, searchParams: sp });
        } else {
            try {
                // Safe-path: URLSearchParams-like object with .get or plain object
                if (typeof (sp as any).get === 'function') {
                    const v = (sp as any).get('brand');
                    brandParam = v == null ? null : String(v);
                } else {
                    const raw = (sp as any)['brand'];
                    brandParam = raw == null ? null : String(raw);
                }
            } catch (errInner) {
                // Last-resort catch; log and move on without throwing
                // eslint-disable-next-line no-console
                console.error('Error accessing searchParams brand in ShopPage', errInner, { searchParams: sp });
                brandParam = null;
            }
        }
    } catch (errTag) {
        // If even Object.prototype.toString.call throws, bail silently and avoid throwing
        // eslint-disable-next-line no-console
        console.error('ShopPage: failed to inspect searchParams', errTag, { searchParams });
        brandParam = null;
    }

    if (brandParam) {
        const page = (() => {
            try {
                let rawPage: any = undefined;
                try {
                    rawPage = (searchParams as any)['page'];
                } catch (e) {
                    try {
                        const getter = (searchParams as any).get;
                        if (typeof getter === 'function') rawPage = getter.call(searchParams, 'page');
                    } catch (e2) {
                        rawPage = undefined;
                    }
                }
                return rawPage ? parseInt(String(rawPage)) || 1 : 1;
            } catch (e) {
                return 1;
            }
        })();
        const limit = 12;
        const offset = (Math.max(1, page) - 1) * limit;
        const productsRes = await fetch(`${API_BASE}/api/products?brand=${encodeURIComponent(brandParam)}&limit=${limit}&offset=${offset}`, { cache: 'no-store' });
        const brandProducts = productsRes.ok ? await productsRes.json() : [];
        const hasMore = Array.isArray(brandProducts) && brandProducts.length === limit;

        return (
            <main className="flex-1">
                <div className="layout-container px-4 md:px-10 max-w-[1440px] mx-auto">
                    <div className="flex items-center gap-2 text-sm mb-4">
                        <Link href="/" className="text-[#617589] font-medium leading-normal hover:text-primary transition-colors">Home</Link>
                        <span className="text-[#617589]">/</span>
                        <span className="text-[#111418] font-medium leading-normal">Shop</span>
                        <span className="text-[#617589]">/</span>
                        <span className="text-[#111418] font-medium leading-normal">{brandParam.toUpperCase()}</span>
                    </div>
                    <h1 className="text-3xl font-bold mb-2">{brandParam.toUpperCase()} Products</h1>
                    <ProductsListClient products={brandProducts} productPathPrefix="/products" />
                    <ProductsPagination currentPage={page} hasMore={hasMore} />
                </div>
            </main>
        );
    }

    // Build brand map from categories.brand -> category row
    const brandSet = Array.from(new Set(categories.map((c: any) => c.brand).filter(Boolean))) as string[];

    // For each brand slug, fetch up to 4 products
    const brandProductsMap: Record<string, any[]> = {};
    await Promise.all(brandSet.map(async (slug: string) => {
        try {
            const pRes = await fetch(`${API_BASE}/api/products?brand=${encodeURIComponent(slug)}&limit=4`, { cache: 'no-store' });
            const productsForBrand = pRes.ok ? await pRes.json() : [];
            brandProductsMap[slug] = Array.isArray(productsForBrand) ? productsForBrand : [];
        } catch (e) { brandProductsMap[slug] = []; }
    }));

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

    return (
        <main className="flex-1">
            <section className="relative bg-surface-light py-8 lg:py-16 overflow-hidden">
                <div className="layout-container px-4 md:px-10 max-w-[1440px] mx-auto">
                    <div className="flex flex-col-reverse lg:flex-row items-center gap-12">
                        <div className="flex-1 flex flex-col gap-6 text-left z-10">
                            {hero?.badge_text && (
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 w-fit bg-blue-100 text-blue-500">
                                    <span className="material-symbols-outlined text-primary text-sm">verified</span>
                                    <span className="text-primary text-xs font-bold uppercase tracking-wide">{hero.badge_text}</span>
                                </div>
                            )}
                            <h1 data-hero-title={hero?.title} data-hero-highlight={hero?.highlight_text} className="text-4xl md:text-5xl lg:text-6xl font-black leading-[1.1] tracking-tight text-text-main-light">
                                {renderTitle(hero?.title || '', hero?.highlight_text || '')}
                                {hero?.subtitle && (
                                    <>
                                        <br />
                                        <span className="text-primary">{hero.subtitle}</span>
                                    </>
                                )}
                            </h1>

                            <p className="text-lg text-text-sub-light max-w-xl leading-relaxed">
                                {hero?.description}
                            </p>

                            {/* CTAs */}
                            <div className="flex flex-wrap gap-4 pt-4">
                                {hero?.cta_text && (
                                    <a href={hero.cta_link || '#'} className="h-12 px-6 rounded-lg bg-primary hover:bg-primary-600 text-white font-bold text-base transition-all shadow-lg flex items-center gap-2">
                                        <span>{hero.cta_text}</span>
                                        <span className="material-symbols-outlined">arrow_forward</span>
                                    </a>
                                )}
                                {hero?.cta2_text && (
                                    <a href={hero.cta2_link || '#'} className="h-12 px-6 rounded-lg bg-background-light hover:bg-gray-200 text-text-main-light font-bold text-base transition-all flex items-center gap-2">
                                        <span className="material-symbols-outlined">grid_view</span>
                                        <span>{hero.cta2_text}</span>
                                    </a>
                                )}
                            </div>
                        </div>

                        <div className="flex-1 w-full relative group perspective-1000">
                            <div className="relative z-10 w-full aspect-4/3 rounded-2xl overflow-hidden shadow-2xl shadow-black/10 bg-gray-100">
                                <div className="absolute inset-0 bg-cover bg-center transform transition-transform duration-700 group-hover:scale-105" data-alt={hero?.hero_image_alt || ''} style={{ backgroundImage: `url('${hero?.background_image || ''}')` }} />
                                <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent opacity-60"></div>
                                <div className="absolute bottom-6 left-6 right-6 p-4 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-white flex justify-between items-center">
                                    <div>
                                        <p className="font-bold text-lg">{hero?.tagline}</p>
                                        <p className="text-sm opacity-80">{hero?.card_overlay_text || hero?.subtitle || hero?.description}</p>
                                    </div>
                                    {(hero?.card_cta_text || hero?.cta_text) ? (
                                        <Link href={hero?.card_cta_link || hero?.cta_link || '/shop'} className="ml-4 inline-flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-full font-bold">
                                            {hero.card_cta_text || hero.cta_text}
                                        </Link>
                                    ) : null}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Brand Filter Bar */}
            <div className="sticky top-[65px] z-40 bg-background-light/95 backdrop-blur-sm border-b border-[#e5e7eb] py-4 overflow-x-auto hide-scrollbar">
                <div className="layout-container px-4 md:px-10 max-w-[1440px] mx-auto">
                    <div className="flex items-center gap-4 min-w-max">
                        <span className="text-sm font-semibold text-text-sub-light mr-2">Jump to:</span>
                        {brandSet.map((b: string) => (
                            <a key={b} className="flex items-center gap-2 px-4 py-2 rounded-full bg-surface-light border border-gray-200 text-text-main-light hover:border-primary hover:text-primary transition-colors" href={`#${b}`}>
                                <span className="font-medium">{b.toUpperCase()}</span>
                            </a>
                        ))}
                        <a className="flex items-center gap-2 px-4 py-2 rounded-full bg-surface-light border border-gray-200 text-text-main-light hover:border-primary hover:text-primary transition-colors" href="#all">
                            <span className="font-medium">All Brands</span>
                        </a>
                    </div>
                </div>
            </div>

            {/* Brand Sections */}
            {brandSet.map((slug) => (
                <section key={slug} className="py-12 bg-white" id={slug}>
                    <div className="layout-container px-4 md:px-10 max-w-[1440px] mx-auto">
                        <div className="flex items-end justify-between mb-8">
                            <div>
                                {/* <div className="flex items-center gap-2 text-primary mb-2">
                                    <span className="material-symbols-outlined">star</span>
                                    <span className="font-bold text-sm tracking-widest uppercase">Featured Brand</span>
                                </div> */}
                                <h2 className="text-3xl font-bold text-text-main-light">{(slug || '').toUpperCase()} Series</h2>
                                <p className="text-text-sub-light mt-1">Explore popular models and best sellers</p>
                            </div>
                            <Link href={`/shop/brand/${encodeURIComponent(slug)}`} className="hidden sm:flex items-center gap-1 text-primary font-bold text-sm hover:gap-2 transition-all">
                                View All {slug.toUpperCase()} <span className="material-symbols-outlined text-sm">arrow_forward</span>
                            </Link>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {(brandProductsMap[slug] || []).length ? (brandProductsMap[slug] || []).map((p: any, pIdx: number) => (
                                <div key={`${p._id ?? p.id ?? p.slug ?? pIdx}`} className="group bg-surface-light rounded-xl border border-[#f0f2f4] overflow-hidden hover:shadow-xl hover:shadow-primary/10 transition-all duration-300">
                                    <Link href={`/products/${p.slug || p.id}`} className="block">
                                        <div className="relative aspect-square overflow-hidden bg-gray-50">
                                            <div className="w-full h-full bg-center bg-cover transition-transform duration-500 group-hover:scale-110" style={{ backgroundImage: `url('${p.thumbnail || '/placeholder-product.png'}')` }} />
                                        </div>
                                        <div className="p-4 flex flex-col gap-2">
                                            <h3 className="font-bold text-lg text-text-main-light line-clamp-1">{p.title}</h3>
                                            <div className="flex items-center gap-2 text-xs text-text-sub-light">
                                                <span className="bg-background-light px-2 py-1 rounded border border-gray-200">{p.capacity || 'N/A'}</span>                                            {p.category?.slug ? (
                                                    <span className="bg-background-light px-2 py-1 rounded border border-gray-200">{p.category?.name || 'Category'}</span>
                                                ) : (
                                                    <span className="bg-background-light px-2 py-1 rounded border border-gray-200">{p.category?.name || ''}</span>
                                                )}                                                <span className="bg-background-light px-2 py-1 rounded border border-gray-200">{p.subcategory?.name || ''}</span>
                                            </div>
                                        </div>
                                    </Link>
                                    <div className="p-4 border-t border-[#f0f2f4] flex items-center justify-between">
                                        <span className="text-primary font-bold text-lg">{p.price ? `NPR ${formatPrice(p.price)}` : 'NPR 0'}</span>
                                        {/* Compare add button (client) */}
                                        <div className="relative z-10">
                                            <CompareAddButton product={p} />
                                        </div>
                                    </div>
                                </div>
                            )) : (<div className="text-sm text-slate-500">No products found for {slug}</div>)}
                        </div>
                    </div>
                </section>
            ))}

            {/* Consultation Banner */}
            <section className="py-16 px-4 md:px-10">
                {/* Compare tray (client) */}
                <CompareTrayWrapper />
                <div className="max-w-[1440px] mx-auto bg-primary rounded-2xl p-8 md:p-12 overflow-hidden relative shadow-2xl shadow-blue-500/20">
                    <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
                        <div className="max-w-xl text-white">
                            <h2 className="text-3xl font-black mb-4">Unsure which brand fits your room?</h2>
                            <p className="text-blue-100 text-lg mb-8">Get a free professional site survey. Our experts will inspect your space and recommend the perfect cooling solution.</p>
                            <ul className="flex flex-col sm:flex-row gap-4 sm:gap-8 mb-8 text-blue-50 font-medium">
                                <li className="flex items-center gap-2"><span className="material-symbols-outlined">check_circle</span> <span>Free Consultation</span></li>
                                <li className="flex items-center gap-2"><span className="material-symbols-outlined">check_circle</span> <span>Accurate BTU Sizing</span></li>
                            </ul>
                            <button className="bg-white text-primary hover:bg-blue-50 px-8 py-3 rounded-lg font-bold transition-colors shadow-lg">Book Site Survey</button>
                        </div>
                        <div className="hidden md:block">
                            <div className="w-64 h-64 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20">
                                <span className="material-symbols-outlined text-white text-8xl">support_agent</span>
                            </div>
                        </div>
                    </div>
                    <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4"></div>
                </div>
            </section>
        </main>
    );
}
