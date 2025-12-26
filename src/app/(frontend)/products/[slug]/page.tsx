import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { ProductWithRelations } from '@/types/product';
import ProductTabs from '@/components/products/ProductTabs';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

async function getProductPost(slug: string): Promise<ProductWithRelations | null> {
    try {
        const res = await fetch(`${API_BASE}/api/products?slug=${encodeURIComponent(slug)}`, { cache: 'no-store' });
        if (res.ok) {
            const post = await res.json();
            if (post && (post.id || post.slug)) return post as ProductWithRelations;
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
            <div className="layout-content-container flex flex-col w-full max-w-[1280px] px-4 md:px-10 flex-1 gap-8">
                {/* Breadcrumbs */}
                <div className="flex flex-wrap gap-2 px-0 text-sm md:text-base">
                    <Link href="/" className="text-[#617589] font-medium leading-normal hover:text-primary">Home</Link>
                    <span className="text-[#617589] font-medium leading-normal">/</span>
                    <Link href="/products" className="text-[#617589] font-medium leading-normal hover:text-primary">{post.category?.name || 'Residential'}</Link>
                    <span className="text-[#617589] font-medium leading-normal">/</span>
                    <span className="text-[#617589] font-medium leading-normal">{post.subcategory?.name || 'Inverter Series'}</span>
                    <span className="text-[#617589] font-medium leading-normal">/</span>
                    <span className="text-[#111418] font-medium leading-normal">{post.title}</span>
                </div>

                {/* Product Hero Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mt-4">
                    {/* Left: Gallery */}
                    <div className="flex flex-col gap-4">
                        <div className="w-full aspect-[4/3] rounded-xl bg-white border border-gray-100 flex items-center justify-center p-8 relative overflow-hidden group">
                            <div className="w-full h-full bg-contain bg-center bg-no-repeat" data-alt={post.title} style={{ backgroundImage: `url("${images[0]}")` }} />
                            {post.inventory_status === 'in_stock' && <div className="absolute top-4 left-4 bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">In Stock</div>}
                        </div>

                        {/* Thumbnails (Carousel Strip) */}
                        <div className="flex overflow-x-auto gap-3 pb-2 no-scrollbar">
                            {images.map((img: string, i: number) => (
                                <button key={i} className={`min-w-24 h-24 rounded-lg border ${i === 0 ? 'border-2 border-primary' : 'border-gray-200'} bg-white p-2 cursor-pointer`}>
                                    <div className="w-full h-full bg-contain bg-center bg-no-repeat" style={{ backgroundImage: `url("${img}")` }} />
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Right: Product Details */}
                    <div className="flex flex-col gap-6">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <span className="material-symbols-outlined text-yellow-500 text-sm">star</span>
                                {post.rating !== undefined && post.rating !== null ? <span className="text-sm font-bold text-[#111418]">{post.rating}</span> : null}
                                {post.reviews_count ? <span className="text-sm text-[#617589]">({post.reviews_count} Reviews)</span> : null}
                            </div>
                            <h1 className="text-[#111418] text-3xl md:text-4xl font-black leading-tight tracking-[-0.033em] mb-2">{post.title}</h1>
                            <p className="text-[#617589] text-base md:text-lg">{post.model || post.excerpt || ''}</p>
                            {post.locations && <p className="text-primary text-sm font-medium mt-1">Available for installation in {Array.isArray(post.locations) ? post.locations.join(', ') : post.locations}</p>}
                        </div>

                        {/* Price & Tags */}
                        <div className="flex flex-col gap-2">
                            <div className="flex items-baseline gap-2">
                                {post.price ? (
                                    <span className="text-3xl font-bold text-[#111418]">{getCurrencySymbol(post.currency)}{post.price}</span>
                                ) : (
                                    <span className="text-3xl font-bold text-[#111418]">Contact for price</span>
                                )}
                                {post.compare_at_price && <span className="text-lg text-[#617589] line-through decoration-1">{getCurrencySymbol(post.currency)}{post.compare_at_price}</span>}
                            </div>
                            <p className="text-sm text-[#617589]">Price includes VAT. Installation charges calculated separately.</p>
                        </div>

                        {/* Feature Badges */}
                        <div className="flex flex-wrap gap-2">
                            {post.energy_saving && <div className="inline-flex items-center px-3 py-1 rounded-full bg-green-50 text-green-700 border border-green-100 text-sm font-medium"><span className="material-symbols-outlined text-[18px] mr-1">eco</span>{post.energy_saving}</div>}
                            {post.smart && <div className="inline-flex items-center px-3 py-1 rounded-full bg-blue-50 text-primary border border-blue-100 text-sm font-medium"><span className="material-symbols-outlined text-[18px] mr-1">wifi</span>Smart Control</div>}
                            {post.filtration && <div className="inline-flex items-center px-3 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-100 text-sm font-medium"><span className="material-symbols-outlined text-[18px] mr-1">air</span>Dual Filtration</div>}
                            {post.warranty && <div className="inline-flex items-center px-3 py-1 rounded-full bg-orange-50 text-orange-700 border border-orange-100 text-sm font-medium"><span className="material-symbols-outlined text-[18px] mr-1">bolt</span>{post.warranty}</div>}
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
            </div>
        </main>
    );
}
