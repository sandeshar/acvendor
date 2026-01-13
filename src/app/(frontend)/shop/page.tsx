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
    // Fetch Shop hero content and categories
    const [heroRes, categoriesRes] = await Promise.all([
        fetch(`${API_BASE}/api/pages/shop/hero`, { cache: 'no-store', next: { tags: ['shop-hero'] } }),
        fetch(`${API_BASE}/api/pages/services/categories`, { cache: 'no-store' }),
    ]);
    const hero = heroRes.ok ? await heroRes.json() : null;
    const categories = categoriesRes.ok ? await categoriesRes.json() : [];

    // Simple category listing - no more brand-specific overrides here
    const categorySet = Array.from(new Set(categories.map((c: any) => c.slug).filter(Boolean))) as string[];

    // For each category slug, fetch up to 4 products
    const categoryProductsMap: Record<string, any[]> = {};
    await Promise.all(categorySet.map(async (slug: string) => {
        try {
            const pRes = await fetch(`${API_BASE}/api/products?category=${encodeURIComponent(slug)}&limit=4`, { cache: 'no-store' });
            const productsForCat = pRes.ok ? await pRes.json() : [];
            categoryProductsMap[slug] = Array.isArray(productsForCat) ? productsForCat : [];
        } catch (e) { categoryProductsMap[slug] = []; }
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
                                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 w-fit backdrop-blur-sm shadow-sm transition-all hover:bg-primary/15">
                                    <span className="material-symbols-outlined text-primary text-sm font-semibold">verified</span>
                                    <span className="text-primary text-[11px] font-extrabold uppercase tracking-widest leading-none">{hero.badge_text}</span>
                                </div>
                            )}
                            <h1 data-hero-title={hero?.title} data-hero-highlight={hero?.highlight_text} className="text-4xl md:text-5xl lg:text-6xl font-black leading-[1.1] tracking-tight text-text-main-light">
                                {renderTitle(hero?.title || '', hero?.highlight_text || '')}
                            </h1>
                            {hero?.subtitle && (
                                <p className="text-xl md:text-2xl font-bold text-gray-700/80 tracking-tight -mt-4">
                                    {hero.subtitle}
                                </p>
                            )}

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
                            <div className="relative z-10 w-full aspect-4/3 rounded-2xl overflow-hidden shadow-2xl shadow-black/10 bg-gray-100 border border-gray-200/50">
                                <div className="absolute inset-0 bg-cover bg-center transform transition-transform duration-1000 group-hover:scale-110" data-alt={hero?.hero_image_alt || ''} style={{ backgroundImage: `url('${hero?.background_image || ''}')` }} />
                                <div className="absolute inset-0 bg-linear-to-t from-black/40 via-transparent to-transparent opacity-60"></div>
                                <div className="absolute bottom-4 left-4 right-4 p-5 md:p-6 rounded-2xl bg-black/40 backdrop-blur-xl border border-white/20 text-white flex justify-between items-center shadow-2xl transition-all duration-300 group-hover:bottom-5">
                                    <div className="max-w-[70%]">
                                        <p className="font-black text-xl tracking-tight leading-tight">{hero?.tagline}</p>
                                        <p className="text-xs md:text-sm font-medium opacity-80 mt-1.5 line-clamp-2 leading-relaxed">
                                            {hero?.card_overlay_text || hero?.subtitle || hero?.description}
                                        </p>
                                    </div>
                                    {(hero?.card_cta_text || hero?.cta_text) ? (
                                        <Link
                                            href={hero?.card_cta_link || hero?.cta_link || '/shop'}
                                            className="shrink-0 ml-4 h-11 px-6 inline-flex items-center justify-center bg-white text-black hover:bg-primary rounded-xl font-bold text-sm transition-all duration-300 shadow-lg active:scale-95"
                                        >
                                            {hero.card_cta_text || hero.cta_text}
                                        </Link>
                                    ) : null}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Category Filter Bar */}
            <div className="sticky top-[65px] z-40 bg-background-light/95 backdrop-blur-sm border-b border-[#e5e7eb] py-4 overflow-x-auto hide-scrollbar">
                <div className="layout-container px-4 md:px-10 max-w-[1440px] mx-auto">
                    <div className="flex items-center gap-4 min-w-max">
                        <span className="text-sm font-semibold text-text-sub-light mr-2">Jump to:</span>
                        {categorySet.map((slug: string) => {
                            const cat = categories.find((c: any) => c.slug === slug);
                            return (
                                <a key={slug} className="flex items-center gap-2 px-4 py-2 rounded-full bg-surface-light border border-gray-200 text-text-main-light hover:border-primary hover:text-primary transition-colors" href={`#${slug}`}>
                                    <span className="font-medium">{cat?.name || slug.toUpperCase()}</span>
                                </a>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Category Sections */}
            {categorySet.map((slug) => {
                const cat = categories.find((c: any) => c.slug === slug);
                return (
                    <section key={slug} className="py-12 bg-white" id={slug}>
                        <div className="layout-container px-4 md:px-10 max-w-[1440px] mx-auto">
                            <div className="flex items-end justify-between mb-8">
                                <div>
                                    <h2 className="text-3xl font-bold text-text-main-light">{cat?.name || slug.toUpperCase()}</h2>
                                    <p className="text-text-sub-light mt-1">{cat?.description || 'Explore popular models and best sellers'}</p>
                                </div>
                                <Link href={`/shop/category/${encodeURIComponent(slug)}`} className="hidden sm:flex items-center gap-1 text-primary font-bold text-sm hover:gap-2 transition-all">
                                    View All {cat?.name || slug.toUpperCase()} <span className="material-symbols-outlined text-sm">arrow_forward</span>
                                </Link>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                {(categoryProductsMap[slug] || []).length ? (categoryProductsMap[slug] || []).map((p: any, pIdx: number) => (
                                    <div key={`${p._id ?? p.id ?? p.slug ?? pIdx}`} className="group bg-surface-light rounded-xl border border-[#f0f2f4] overflow-hidden hover:shadow-xl hover:shadow-primary/10 transition-all duration-300">
                                        <Link href={`/products/${p.slug || p.id}`} className="block">
                                            <div className="relative aspect-square overflow-hidden bg-gray-50">
                                                <div className="w-full h-full bg-center bg-cover transition-transform duration-500 group-hover:scale-110" style={{ backgroundImage: `url('${p.thumbnail || '/placeholder-product.png'}')` }} />
                                            </div>
                                            <div className="p-4 flex flex-col gap-2">
                                                <h3 className="font-bold text-lg text-text-main-light line-clamp-1">{p.title}</h3>
                                                <div className="flex items-center gap-2 text-xs text-text-sub-light">
                                                    {p.capacity && p.capacity !== 'N/A' && (
                                                        <span className="bg-background-light px-2 py-1 rounded border border-gray-200">{p.capacity}</span>
                                                    )}
                                                    <span className="bg-background-light px-2 py-1 rounded border border-gray-200">{cat?.name || 'Category'}</span>
                                                    <span className="bg-background-light px-2 py-1 rounded border border-gray-200">{p.subcategory?.name || ''}</span>
                                                </div>
                                            </div>
                                        </Link>
                                        <div className="p-4 border-t border-[#f0f2f4] flex items-center justify-between">
                                            <span className="text-primary font-bold text-lg">{p.price ? `NPR ${formatPrice(p.price)}` : 'NPR 0'}</span>
                                            <div className="relative z-10">
                                                <CompareAddButton product={p} />
                                            </div>
                                        </div>
                                    </div>
                                )) : (<div className="text-sm text-slate-500">No products found for {cat?.name || slug}</div>)}
                            </div>
                        </div>
                    </section>
                );
            })}

            {/* Consultation Banner */}
            <section className="py-16 px-4 md:px-10">
                {/* Compare tray (client) */}
                <CompareTrayWrapper />
                <div className="max-w-[1440px] mx-auto bg-primary rounded-2xl p-8 md:p-12 overflow-hidden relative shadow-2xl shadow-primary/20">
                    <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
                        <div className="max-w-xl text-white">
                            <h2 className="text-3xl font-black mb-4">Unsure which brand fits your room?</h2>
                            <p className="text-primary-100 text-lg mb-8">Get a free professional site survey. Our experts will inspect your space and recommend the perfect cooling solution.</p>
                            <ul className="flex flex-col sm:flex-row gap-4 sm:gap-8 mb-8 text-primary-50 font-medium">
                                <li className="flex items-center gap-2"><span className="material-symbols-outlined">check_circle</span> <span>Free Consultation</span></li>
                                <li className="flex items-center gap-2"><span className="material-symbols-outlined">check_circle</span> <span>Accurate BTU Sizing</span></li>
                            </ul>
                            <button className="bg-white text-primary hover:bg-primary-50 px-8 py-3 rounded-lg font-bold transition-colors shadow-lg">Book Site Survey</button>
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
