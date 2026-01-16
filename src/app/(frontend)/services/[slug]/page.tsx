
import { notFound } from "next/navigation";
import TestimonialSlider from "@/components/shared/TestimonialSlider";

// Use an absolute base URL for server-side fetches.
// Relative URLs like `/api/...` can fail when executed on the server runtime.
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

import type { ServiceRecord, ServiceDetail, ServicePostPageProps } from "@/types/pages";
import { formatPrice, parsePriceNumber } from '@/utils/formatPrice';

async function getServicePost(slug: string): Promise<ServiceRecord | null> {
    try {
        // Try primary source: /api/services by slug
        const res = await fetch(`${API_BASE}/api/services?slug=${encodeURIComponent(slug)}`, { next: { tags: ['services'] } });
        if (res.ok) {
            const post = await res.json();
            if (post && post.id) return post as ServiceRecord;
        }

        // Fallback: services page details by slug or key
        const detailRes = await fetch(`${API_BASE}/api/pages/services/details?slug=${encodeURIComponent(slug)}`, { next: { tags: ['services-details'] } });
        if (detailRes.ok) {
            const detail = await detailRes.json();
            if (detail && detail.id) return normalizeDetail(detail, slug);
        }

        const detailKeyRes = await fetch(`${API_BASE}/api/pages/services/details?key=${encodeURIComponent(slug)}`, { next: { tags: ['services-details'] } });
        if (detailKeyRes.ok) {
            const detail = await detailKeyRes.json();
            if (detail && detail.id) return normalizeDetail(detail, slug);
        }

        return null;
    } catch (error) {
        console.error('Error fetching service post via API:', error);
        return null;
    }
}

function normalizeDetail(detail: any, fallbackSlug: string): ServiceRecord {
    return {
        slug: detail?.slug || detail?.key || fallbackSlug,
        title: detail?.title || "Service",
        excerpt: detail?.description || "",
        content: detail?.content || `<p>${detail?.description || ""}</p>`,
        thumbnail: detail?.image || null,
        icon: detail?.icon || null,
        meta_title: detail?.meta_title || detail?.title || null,
        meta_description: detail?.meta_description || detail?.description || null,
    };
}

async function getServiceDetailBySlug(slug: string): Promise<ServiceDetail | null> {
    try {
        // Try to find by slug first
        const detailRes = await fetch(`${API_BASE}/api/pages/services/details?slug=${encodeURIComponent(slug)}`, { cache: 'no-store' });
        if (detailRes.ok) {
            const detail = await detailRes.json();
            if (detail && detail.title !== undefined) return detail as ServiceDetail;
        }

        // Fallback to key
        const detailKeyRes = await fetch(`${API_BASE}/api/pages/services/details?key=${encodeURIComponent(slug)}`, { cache: 'no-store' });
        if (detailKeyRes.ok) {
            const detail = await detailKeyRes.json();
            if (detail && detail.title !== undefined) return detail as ServiceDetail;
        }

        return null;
    } catch (error) {
        console.error('Error fetching service detail:', error);
        return null;
    }
}

export default async function ServicePostPage({ params }: ServicePostPageProps) {
    const { slug } = await params;

    // Helper function to get currency symbol
    const getCurrencySymbol = (currency?: string | null) => {
        const symbols: Record<string, string> = {
            'USD': '$',
            'EUR': '€',
            'GBP': '£',
            'CAD': 'C$',
            'AUD': 'A$',
            'JPY': '¥',
            'INR': '₹',
            'NPR': 'Rs.'
        };
        return symbols[currency || 'NPR'] || 'Rs.';
    };
    const [post, serviceDetail, servicesCTA] = await Promise.all([
        getServicePost(slug),
        getServiceDetailBySlug(slug),
        fetch(`${API_BASE}/api/pages/services/cta`, { next: { tags: ['services-cta'] } }).then(res => res.ok ? res.json() : null)
    ]);

    if (!post) notFound();

    return (
        <main className="flex flex-col items-center page-bg">
            <div className="flex flex-col w-full max-w-7xl">
                {/* Hero Section */}
                <section className="relative py-10 sm:py-20">
                    <div className="absolute inset-0 -z-10 bg-linear-to-br from-slate-50 to-slate-100" />
                    <div className="mx-auto w-full max-w-6xl">
                        <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
                            {/* Left Content */}
                            <div className="flex-1">
                                {post.icon && (
                                    <div className="inline-flex items-center justify-center w-16 h-16 md:w-20 md:h-20 bg-primary/10 rounded-2xl mb-6">
                                        <span className="material-symbols-outlined text-4xl md:text-5xl text-primary">{post.icon}</span>
                                    </div>
                                )}
                                <h1 className="text-4xl md:text-5xl font-bold text-[#0f172a] mb-4 leading-tight">
                                    {post.title}
                                </h1>
                                <p className="text-lg text-[#4b5563] leading-relaxed mb-6">
                                    {post.excerpt}
                                </p>
                                <div className="flex flex-col sm:flex-row gap-4">
                                    <a
                                        href={`/contact?service=${encodeURIComponent(post.slug)}`}
                                        className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white font-semibold rounded-lg hover:bg-primary/90 transition"
                                    >
                                        <span className="material-symbols-outlined">arrow_forward</span>
                                        Get Started
                                    </a>
                                    <a
                                        href="#details"
                                        className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-slate-300 text-[#0f172a] font-semibold rounded-lg hover:bg-slate-50 transition"
                                    >
                                        Learn More
                                    </a>
                                </div>
                            </div>
                            {/* Right Image */}
                            {post.thumbnail && (
                                <div className="flex-1">
                                    <div className="relative">
                                        <div className="absolute inset-0 bg-primary/20 rounded-2xl blur-3xl -z-10" />
                                        <img
                                            src={post.thumbnail}
                                            alt={post.title}
                                            className="w-full rounded-2xl shadow-2xl"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </section>

                {/* Details Section */}
                <section id="details" className="pt-12 pb-10 sm:pt-16 sm:pb-14">
                    <div className="mx-auto w-full max-w-6xl">
                        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-10">
                            {/* Main Content */}
                            <div className="space-y-12">
                                {/* About Section */}
                                <div>
                                    {/* <h2 className="text-3xl font-bold text-[#0f172a] mb-6">How It Works</h2> */}
                                    <div
                                        className="prose prose-lg max-w-none 
                                            prose-headings:font-bold prose-headings:text-[#0f172a] prose-headings:mt-6 prose-headings:mb-3
                                            prose-p:text-[#475569] prose-p:mb-4
                                            prose-a:text-primary prose-a:no-underline hover:prose-a:underline
                                            prose-strong:text-[#0f172a] prose-strong:font-semibold
                                            prose-li:text-[#475569] prose-li:marker:text-primary"
                                        dangerouslySetInnerHTML={{ __html: post.content }}
                                    />
                                </div>
                            </div>
                            {/* Sidebar */}
                            <aside className="space-y-6 sticky top-20 self-start">
                                {/* Pricing Card */}
                                {/* Combined Pricing + CTA Card (or Ready CTA when no pricing) */}
                                {post.price ? (
                                    <div className="bg-primary rounded-xl p-6 text-white shadow-lg ring-1 ring-muted">
                                        <div className="flex items-center justify-between gap-4 mb-4">
                                            <div>
                                                <div className="text-sm font-semibold uppercase tracking-wide mb-1 text-white/90">{post.price_label || 'Pricing'}</div>
                                                {parsePriceNumber(post.price) > 0 ? (
                                                    <div className="text-3xl font-extrabold text-white">
                                                        {getCurrencySymbol(post.currency)}{formatPrice(post.price)}
                                                    </div>
                                                ) : (
                                                    <div className="text-lg font-semibold text-white">Pricing on request</div>
                                                )}
                                                {post.price_description && (
                                                    <p className="text-sm text-white/90 mt-2">{post.price_description}</p>
                                                )}
                                            </div>
                                            <div className="hidden sm:block text-sm text-white/90">{/* reserved for future summary */}</div>
                                        </div>
                                        <div className="mt-4">
                                            <a
                                                href={`/contact?service=${encodeURIComponent(post.slug)}`}
                                                aria-label={`Contact us about ${post.title}`}
                                                className="inline-flex w-full items-center justify-center gap-2 px-4 py-3 bg-card text-primary-var font-semibold rounded-lg hover:shadow-lg transition focus:outline-none focus-visible:ring-2 focus-visible:ring-muted"
                                            >
                                                <span className="material-symbols-outlined">call</span>
                                                Contact Us
                                            </a>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="bg-primary rounded-xl p-6 text-white shadow-lg ring-1 ring-muted">
                                        <h3 className="text-xl font-bold mb-2">Ready?</h3>
                                        <p className="text-white/90 text-sm mb-6">Let's discuss your project needs.</p>
                                        <a
                                            href={`/contact?service=${encodeURIComponent(post.slug)}`}
                                            aria-label="Contact us"
                                            className="inline-flex w-full items-center justify-center gap-2 px-4 py-3 bg-card text-primary-var font-semibold rounded-lg hover:shadow-lg transition focus:outline-none focus-visible:ring-2 focus-visible:ring-muted"
                                        >
                                            <span className="material-symbols-outlined text-[20px]">call</span>
                                            Contact Us
                                        </a>
                                    </div>
                                )}
                                {/* Quick Action Card */}
                                {/* Removed duplicated "Ready?" card as combined card covers CTA */}
                                {/* Service Benefits */}
                                {serviceDetail && (() => {
                                    let bullets: string[] = [];
                                    try {
                                        bullets = JSON.parse(serviceDetail.bullets);
                                    } catch (e) {
                                        console.error('Error parsing bullets:', e);
                                    }
                                    if (bullets.length > 0) {
                                        return (
                                            <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
                                                <h4 className="text-sm font-bold text-[#0f172a] mb-4 flex items-center gap-2">
                                                    <span className="material-symbols-outlined text-primary">star</span>
                                                    Key Benefits
                                                </h4>
                                                <ul className="space-y-3 text-sm text-[#475569]">
                                                    {bullets.map((bullet, idx) => (
                                                        <li key={idx} className="flex gap-3">
                                                            <span className="material-symbols-outlined text-primary text-base shrink-0">check_circle</span>
                                                            <span>{bullet}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        );
                                    }
                                    return null;
                                })()}
                            </aside>
                        </div>
                    </div>
                </section>

                {/* Testimonials */}
                {post.id && (
                    <section className="py-10 sm:py-14">
                        <TestimonialSlider
                            filter={String(post.id)}
                            title={`Success Stories for ${post.title}`}
                            subtitle="See how we've helped clients succeed with this service"
                        />
                    </section>
                )}


            </div>
            {/* CTA Section */}
            {servicesCTA?.is_active === 1 && (
                <section className="py-12 sm:py-20 bg-primary border-y border-slate-200 w-full">
                    <div className="mx-auto w-full max-w-3xl text-center">
                        <h4 className="text-3xl md:text-4xl font-bold text-white mb-4">
                            {servicesCTA.title}
                        </h4>
                        <p className="text-lg text-primary-100 mb-8 text-white/80">
                            {servicesCTA.description}
                        </p>
                        <a
                            href={servicesCTA.button_link || '/contact'}
                            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-primary font-bold rounded-lg hover:bg-primary-50 transition shadow-lg active:scale-95"
                        >
                            {/* <span className="material-symbols-outlined">call</span> */}
                            {servicesCTA.button_text}
                        </a>
                    </div>
                </section>
            )}
        </main>
    );
}

export async function generateMetadata({ params }: ServicePostPageProps) {
    const { slug } = await params;
    const post = await getServicePost(slug);

    if (!post) {
        return { title: "Service Not Found" };
    }

    return {
        title: post.meta_title || post.title,
        description: post.meta_description || post.excerpt,
    };
}
