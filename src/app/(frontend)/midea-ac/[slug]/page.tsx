import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { ProductWithRelations } from '@/types/product';
import ProductTabs from '@/components/products/ProductTabs';
import ProductGallery from '@/components/products/ProductGallery';
import Star from '@/components/icons/Star';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

async function getProductPost(slug: string): Promise<ProductWithRelations | null> {
    try {
        const res = await fetch(`${API_BASE}/api/products?slug=${encodeURIComponent(slug)}`, { cache: 'no-store' });
        if (res.ok) {
            const post = await res.json();
            if (post && (post.id || post.slug)) {
                // attempt to fetch service/detail record to enrich product with application_areas
                try {
                    const detailRes = await fetch(`${API_BASE}/api/pages/services/details?slug=${encodeURIComponent(slug)}`, { cache: 'no-store' });
                    if (detailRes.ok) {
                        const detail = await detailRes.json();
                        if (detail) {
                            // parse application_areas and features safely
                            try {
                                const areas = detail.application_areas ? (Array.isArray(detail.application_areas) ? detail.application_areas : JSON.parse(detail.application_areas)) : undefined;
                                if (areas) post.application_areas = areas;
                            } catch (e) {
                                // ignore parse errors
                            }
                            try {
                                const feats = detail.features ? (Array.isArray(detail.features) ? detail.features : JSON.parse(detail.features)) : undefined;
                                if (feats) post.features = feats;
                            } catch (e) {
                                // ignore parse errors
                            }
                            // merge content/description if missing
                            if (!post.excerpt && detail.description) post.excerpt = detail.description;
                            if (!post.content && detail.content) post.content = detail.content;
                            if (!post.thumbnail && detail.image) post.thumbnail = detail.image;
                        }
                    }
                } catch (e) {
                    // ignore
                }

                // Fetch related testimonials (reviews) for this product
                try {
                    if (post && post.id) {
                        const revRes = await fetch(`${API_BASE}/api/testimonial?product=${encodeURIComponent(String(post.id))}&limit=10`, { cache: 'no-store' });
                        if (revRes.ok) {
                            post.reviews = await revRes.json();
                        }
                    }
                } catch (e) {
                    // ignore testimonial fetch errors
                    console.error('Failed to fetch product testimonials:', (e as Error)?.message || String(e));
                }

                return post as ProductWithRelations;
            }
        }

        // fallback: try pages/details if present
        try {
            const detailRes = await fetch(`${API_BASE}/api/pages/products/details?slug=${encodeURIComponent(slug)}`, { cache: 'no-store' });
            if (detailRes.ok) {
                const detail = await detailRes.json();
                if (detail && detail.id) {
                    return {
                        slug: detail.slug || slug,
                        title: detail.title || 'Product',
                        excerpt: detail.description || '',
                        content: detail.content || `<p>${detail.description || ''}</p>`,
                        thumbnail: detail.image || null,
                    } as ProductWithRelations;
                }
            }
        } catch (e) {
            // ignore fallback errors
        }

        return null;
    } catch (error) {
        console.error('Error fetching product via API:', (error as Error)?.message || String(error));
        return null;
    }
}

const getCurrencySymbol = (currency?: string | null) => {
    const symbols: Record<string, string> = {
        'USD': '$',
        'EUR': '€',
        'GBP': '£',
        'CAD': 'C$',
        'AUD': 'A$',
        'JPY': '¥',
        'INR': '₹',
        'NRS': 'रु'
    };
    return symbols[currency || 'USD'] || '$';
};

export default async function ProductPage({ params }: { params: { slug: string } }) {
    const { slug } = await params;
    const post = await getProductPost(slug);

    if (!post) notFound();

    const images = (post.images && post.images.length) ? post.images.map(i => i.url) : (post.thumbnail ? [post.thumbnail] : ['/placeholder-product.png']);

    return (
        <main className="flex flex-1 flex-col items-center py-5 md:py-10">
            <div className="layout-content-container flex flex-col w-full max-w-7xl px-4 md:px-10 flex-1 gap-8">
                {/* Breadcrumbs */}
                <div className="flex flex-wrap gap-2 px-0 text-sm md:text-base">
                    <Link href="/" className="text-[#617589] font-medium leading-normal hover:text-primary">Home</Link>
                    <span className="text-[#617589] font-medium leading-normal">/</span>
                    <Link href={post.category?.slug ? `/midea-ac?category=${encodeURIComponent(post.category.slug)}` : '/midea-ac'} className="text-[#617589] font-medium leading-normal hover:text-primary">{post.category?.name || 'Residential'}</Link>
                    <span className="text-[#617589] font-medium leading-normal">/</span>
                    {post.subcategory?.slug ? (
                        <Link href={`/midea-ac?category=${encodeURIComponent(post.category?.slug || '')}&subcategory=${encodeURIComponent(post.subcategory.slug)}`} className="text-[#617589] font-medium leading-normal hover:text-primary">{post.subcategory?.name || 'Inverter Series'}</Link>
                    ) : (
                        <span className="text-[#617589] font-medium leading-normal">{post.subcategory?.name || 'Inverter Series'}</span>
                    )}
                    <span className="text-[#617589] font-medium leading-normal">/</span>
                    <span className="text-[#111418] font-medium leading-normal">{post.title}</span>
                </div>

                {/* Product Hero Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mt-4">
                    {/* Left: Gallery */}
                    {/* Client-side interactive gallery */}
                    <div className="flex flex-col gap-4">
                        {/* ProductGallery handles active image selection */}
                        {/* eslint-disable-next-line @next/next/no-assign-module-exports */}
                        {/* Importing dynamically to avoid server/client mismatch in SSR */}
                        <ProductGallery images={images} inventory_status={post.inventory_status} />
                    </div>

                    {/* Right: Product Details */}
                    <div className="flex flex-col gap-6">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <Star variant="full" className="text-yellow-500" size={18} title="Star" />
                                {post.rating !== undefined && post.rating !== null ? <span className="text-sm font-bold text-[#111418]">{post.rating}</span> : null}
                                {post.reviews_count ? <span className="text-sm text-[#617589]">({post.reviews_count} Reviews)</span> : null}
                            </div>
                            <h1 className="text-[#111418] text-3xl md:text-4xl font-black leading-tight tracking-[-0.033em] mb-2">{post.title}</h1>
                            <p className="text-[#617589] text-base md:text-lg">{post.model || post.excerpt || ''}</p>
                        </div>

                        {/* Price & Tags */}
                        <div className="flex flex-col gap-2">
                            <div className="flex items-baseline gap-2">
                                {(post.price && Number(String(post.price).replace(/[^0-9.-]/g, '')) > 0) ? (
                                    <span className="text-3xl font-bold text-[#111418]">{getCurrencySymbol(post.currency)}{post.price}</span>
                                ) : (
                                    <span className="text-3xl font-bold text-[#111418]">Contact for price</span>
                                )}
                                {post.compare_at_price && Number(String(post.compare_at_price).replace(/[^0-9.-]/g, '')) > 0 ? <span className="text-lg text-[#617589] line-through decoration-1">{getCurrencySymbol(post.currency)}{post.compare_at_price}</span> : null}
                            </div>
                            <p className="text-sm text-[#617589]">Price includes VAT. Installation charges calculated separately.</p>
                        </div>

                        {/* Feature Badges */}
                        <div className="flex flex-wrap gap-2">
                            {/* Render custom features first (if any) */}
                            {post.features && Array.isArray(post.features) && post.features.map((f: any, idx: number) => (
                                <div key={idx} className="inline-flex items-center px-3 py-1 rounded-full bg-white text-[#111418] border border-gray-100 text-sm font-medium">
                                    {f.icon ? <span className="material-symbols-outlined text-[18px] mr-1">{f.icon}</span> : null}
                                    {f.label}
                                </div>
                            ))}

                            {/* fallback / legacy badges */}
                            {(post.energy_saving !== undefined && post.energy_saving !== null && String(post.energy_saving).trim() !== '00' && String(post.energy_saving).trim() !== '0') ? (
                                <div className="inline-flex items-center px-3 py-1 rounded-full bg-green-50 text-green-700 border border-green-100 text-sm font-medium"><span className="material-symbols-outlined text-[18px] mr-1">eco</span>{post.energy_saving}</div>
                            ) : null}
                            {!!post.smart ? (
                                <div className="inline-flex items-center px-3 py-1 rounded-full bg-blue-50 text-primary border border-blue-100 text-sm font-medium"><span className="material-symbols-outlined text-[18px] mr-1">wifi</span>Smart Control</div>
                            ) : null}
                            {!!post.filtration ? (
                                <div className="inline-flex items-center px-3 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-100 text-sm font-medium"><span className="material-symbols-outlined text-[18px] mr-1">air</span>Dual Filtration</div>
                            ) : null}
                            {post.warranty && String(post.warranty).trim() !== '00' && String(post.warranty).trim() !== '0' && <div className="inline-flex items-center px-3 py-1 rounded-full bg-orange-50 text-orange-700 border border-orange-100 text-sm font-medium"><span className="material-symbols-outlined text-[18px] mr-1">bolt</span>{post.warranty}</div>}
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col sm:flex-row gap-4 mt-4 pt-6 border-t border-gray-100">
                            <Link className="flex-1 h-12 bg-primary hover:bg-blue-600 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20" href={`/contact?product=${encodeURIComponent(post.slug)}`}>
                                <span className="material-symbols-outlined">request_quote</span> Request Quote
                            </Link>
                            {post.brochure_url ? (
                                <a className="flex-1 h-12 bg-white border border-gray-200 hover:bg-gray-50 text-[#111418] font-bold rounded-lg transition-colors flex items-center justify-center gap-2" href={post.brochure_url}>
                                    <span className="material-symbols-outlined">download</span> Download Brochure
                                </a>
                            ) : null}
                        </div>
                    </div>
                </div>

                {/* Info Tabs Navigation */}
                {/* Tabs component (Overview, Specs, Docs, Reviews) */}
                <ProductTabs post={post} />

                {/* Reviews Section (RatingSummary) */}
                <div className="mt-8 pt-8 border-t border-gray-200">
                    <h3 className="text-2xl font-bold text-[#111418] mb-6">Customer Reviews</h3>
                    <div className="flex flex-wrap gap-x-12 gap-y-8">
                        <div className="flex flex-col gap-2 min-w-[150px]">
                            <p className="text-[#111418] text-5xl font-black leading-tight tracking-[-0.033em]">{post.rating ?? '--'}</p>
                            <div className="flex gap-1 text-yellow-500">
                                {(() => {
                                    const r = Number(post.rating || 0);
                                    const stars = [1, 2, 3, 4, 5];
                                    return stars.map((s) => {
                                        if (r >= s) return <Star key={s} variant="full" className="text-yellow-500" size={18} />;
                                        if (r >= s - 0.5) return <Star key={s} variant="half" className="text-yellow-500" size={18} />;
                                        return <Star key={s} variant="empty" className="text-yellow-500" size={18} />;
                                    });
                                })()}
                            </div>
                            <p className="text-[#617589] text-base font-medium">{post.reviews_count ? `Based on ${post.reviews_count} reviews` : 'No reviews yet'}</p>
                        </div>

                        <div className="grid min-w-[280px] max-w-[500px] flex-1 grid-cols-[20px_1fr_40px] items-center gap-y-3">
                            {/* Simple heuristic distribution based on rating: 5-star proportion scales with rating */}
                            {([5, 4, 3, 2, 1] as number[]).map((star) => {
                                const breakdown = (post.reviews_breakdown as Record<number, number> | undefined) ?? undefined;
                                const count = breakdown ? (breakdown[star] || 0) : (post.reviews ? post.reviews.filter((r: any) => Number(r.rating) === star).length : 0);
                                const displayPct = (post.reviews_count && post.reviews_count > 0) ? Math.round((count / (post.reviews_count || (post.reviews ? post.reviews.length : 0))) * 100) : 0;
                                return (
                                    <React.Fragment key={`star-${star}`}>
                                        <p className="text-[#111418] text-sm font-bold">{star}</p>
                                        <div className="flex h-2 flex-1 overflow-hidden rounded-full bg-[#dbe0e6]">
                                            <div className="rounded-full bg-primary" style={{ width: `${displayPct}%` }} />
                                        </div>
                                        <p className="text-[#617589] text-sm font-medium text-right">{displayPct}%</p>
                                    </React.Fragment>
                                );
                            })}
                        </div>
                    </div>

                    {/* Review list: real testimonials */}
                    <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                        {post.reviews && post.reviews.length > 0 ? (
                            post.reviews.map((r: any) => (
                                <div key={r.id} className="bg-white p-4 rounded-lg border">
                                    <div className="flex items-center gap-3 mb-3">
                                        {r.url ? <img src={r.url} alt={r.name} className="w-12 h-12 rounded-full object-cover" /> : <div className="w-12 h-12 rounded-full bg-gray-100" />}
                                        <div>
                                            <div className="font-bold text-sm">{r.name}</div>
                                            <div className="text-xs text-[#617589]">{r.role}</div>
                                        </div>
                                        <div className="ml-auto text-yellow-500 font-bold flex items-center gap-1">
                                            {(() => {
                                                const rr = Number(r.rating || 0);
                                                return [1, 2, 3, 4, 5].map((s) => {
                                                    if (rr >= s) return <Star key={s} variant="full" className="text-yellow-500" size={14} />;
                                                    if (rr >= s - 0.5) return <Star key={s} variant="half" className="text-yellow-500" size={14} />;
                                                    return <Star key={s} variant="empty" className="text-yellow-500" size={14} />;
                                                });
                                            })()}
                                        </div>
                                    </div>
                                    <div className="text-sm text-[#111418]">{r.content}</div>
                                </div>
                            ))
                        ) : (
                            <div className="text-[#617589]">No reviews yet. Be the first to leave a review!</div>
                        )}
                    </div>
                </div>
            </div>
        </main>
    );
}