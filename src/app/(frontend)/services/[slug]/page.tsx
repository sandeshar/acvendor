
import { notFound } from "next/navigation";
import TestimonialSlider from "@/components/shared/TestimonialSlider";

// Use an absolute base URL for server-side fetches.
// Relative URLs like `/api/...` can fail when executed on the server runtime.
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

import type { ServiceRecord, ServiceDetail, ServicePostPageProps } from "@/types/pages";

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
            'NRS': 'रु'
        };
        return symbols[currency || 'USD'] || '$';
    };
    const [post, serviceDetail] = await Promise.all([
        getServicePost(slug),
        getServiceDetailBySlug(slug)
    ]);

    if (!post) notFound();

    const images = (post.images && post.images.length) ? post.images : (post.thumbnail ? [post.thumbnail] : []);

    return (
        <main className="flex flex-1 flex-col items-center py-5 md:py-10">
            <div className="layout-content-container flex flex-col w-full max-w-[1280px] px-4 md:px-10 flex-1 gap-8">
                {/* Breadcrumbs */}
                <div className="flex flex-wrap gap-2 px-0 text-sm md:text-base">
                    <a className="text-[#617589] font-medium leading-normal hover:text-primary" href="#">Home</a>
                    <span className="text-[#617589] font-medium leading-normal">/</span>
                    <a className="text-[#617589] font-medium leading-normal hover:text-primary" href="#">Residential</a>
                    <span className="text-[#617589] font-medium leading-normal">/</span>
                    <a className="text-[#617589] font-medium leading-normal hover:text-primary" href="#">Inverter Series</a>
                    <span className="text-[#617589] font-medium leading-normal">/</span>
                    <span className="text-[#111418] font-medium leading-normal">Xtreme Save 1.5 Ton</span>
                </div>

                {/* Product Hero Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mt-4">
                    {/* Left: Gallery */}
                    <div className="flex flex-col gap-4">
                        <div className="w-full aspect-[4/3] rounded-xl bg-white border border-gray-100 flex items-center justify-center p-8 relative overflow-hidden group">
                            <div className="w-full h-full bg-contain bg-center bg-no-repeat" data-alt="Midea Xtreme Save Split AC wall mounted unit front view clean white" style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuCo9fcsTWt4yrhasK7TrvB98Cs3veIKWXSEtE1xWmWijS0ZmeIJi4iIvPtlbOVOn5NhVRalOZu_8SvPY-DAXf_99zeG06LwznMj6Qn8-l8iH4O3MFoiM0o7fUk7sHdGwmihsawVNBC5dzQ-B07oVxLGu2j8J3kU_Uay0rnEbHY8qsMfcka9vlck8C86zyDaV3wktulQBFxkPtCpQCEzG6ZLfPtkb1_8UE3pDclZYlwtrsW-czKLWhxeLpH-lrHGAMOXCoNz4-jBo74" )' }} />
                            <div className="absolute top-4 left-4 bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">In Stock</div>
                        </div>

                        {/* Thumbnails (Carousel Strip) */}
                        <div className="flex overflow-x-auto gap-3 pb-2 no-scrollbar">
                            <button className="min-w-24 h-24 rounded-lg border-2 border-primary bg-white p-2 cursor-pointer">
                                <div className="w-full h-full bg-contain bg-center bg-no-repeat" data-alt="Midea AC unit front view" style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuBHArwRzoEUnL9AKnFOt_H3_o5R-g6I91kPsELEZYN4b_0b-lZCoecVM3InoRtCRn5PwotioRpB4WZphMIpjBfFYahLrH0XDTUUtTNf2Ayrt9hrd1kMgN6Os1PXYaLcS_MOlw81wFVJTm5y1D8aOEzw1-AQSsnvMjGJ76SeWuOBLhi_JaUOe6dxJjcmatjard3ddVym0s4HTscqn3PaH3tDIUoiXwGfeNUMX3wymvZ7CO4fDzh6cYEYv4Srh9qvaGyvotNwbcSJqrs" )' }} />
                            </button>
                            <button className="min-w-24 h-24 rounded-lg border border-gray-200 bg-white p-2 cursor-pointer hover:border-gray-400">
                                <div className="w-full h-full bg-contain bg-center bg-no-repeat" data-alt="Modern living room with AC installed" style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuASK9iEh0iNq0uIcxg65lmD7BAhXXuD7-C10DhUsk8l9F74X10qhAZYLE3f4OfO3DTP2G-QOsQW0d_rnDB0ENIQZxIqnrLpadSPkAwaxpI69djS0fGErzHlCUXZZWTpxp3u5bPHU_yyc-ztlHwvmOjhN8My_aD2KRGgzZ6N-ZCcm0asQ0tUMfSSeTykczqSZwChudb_CsLJ0mHNGG4Z2N2oJ5AJ8xQd9OPAGd8TA4DmtaNesdEY9umyPTS8g0mHHKHf0_QEDCDzGwY" )' }} />
                            </button>
                            <button className="min-w-24 h-24 rounded-lg border border-gray-200 bg-white p-2 cursor-pointer hover:border-gray-400">
                                <div className="w-full h-full bg-contain bg-center bg-no-repeat" data-alt="Close up of AC Remote control" style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuAmNl6sB0R8HOnc28NFfibJWJ1TFFdoy5E25XWTM_nU_6nCFyDWDDvTxekVFU7NBqIHUESP1bQ-PJiyRF8_2s0AwiF5IlDnfTBdgK-2IC3qc90sYOEdEcjvPz24xTyPl_cnamRZ6iiIBBTUZBliuSrzgrKjaIRfpfDniYuQZfN_wZ1AcPHQU4ylSwnKRnVOgaAOHo4spRLi6vO97z_r5dCFHEy-ssVgkuey3DZ3cw69P5P8VMy7UzubTXxf5-1iTpJ02sbrFCjXzfg" )' }} />
                            </button>
                            <button className="min-w-24 h-24 rounded-lg border border-gray-200 bg-white p-2 cursor-pointer hover:border-gray-400">
                                <div className="w-full h-full bg-contain bg-center bg-no-repeat" data-alt="AC unit side profile showing slim design" style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuCFs-ZDjCbj485qcay95ym29LQKVqjqB9oMS_XSEl9CxHcpkV0pmU58rKbWIigleH96fFoFg8VY73u4IrYDwwsZ3MoxxGQcdvIOZXMFhAiroarvV6dvE4xGiBrBBQ9guUfZpJzCTY17_7hQBxMNLEsscfAq6u_cIzanvwSLrp2mWYDqbHsCQQN_coApw3NsbZDOUuGnlxmVJ9PN-hG1mijztd7ZsUD7e7pykP8OizBVM3V4JQ6qprtkgf9AqxCanyJkimn_HZOaglM" )' }} />
                            </button>
                        </div>
                    </div>

                    {/* Right: Product Details */}
                    <div className="flex flex-col gap-6">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <span className="material-symbols-outlined text-yellow-500 text-sm">star</span>
                                <span className="text-sm font-bold text-[#111418]">4.8</span>
                                <span className="text-sm text-[#617589]">(124 Reviews)</span>
                            </div>
                            <h1 className="text-[#111418] text-3xl md:text-4xl font-black leading-tight tracking-[-0.033em] mb-2">Midea Xtreme Save Series - 1.5 Ton Inverter AC</h1>
                            <p className="text-[#617589] text-base md:text-lg">Model: MSAG-18HRFN1 | Wall Mounted Split AC</p>
                            <p className="text-primary text-sm font-medium mt-1">Available for installation in Kathmandu, Lalitpur, &amp; Bhaktapur.</p>
                        </div>

                        {/* Price & Tags */}
                        <div className="flex flex-col gap-2">
                            <div className="flex items-baseline gap-2">
                                <span className="text-3xl font-bold text-[#111418]">NPR 85,000</span>
                                <span className="text-lg text-[#617589] line-through decoration-1">NPR 92,000</span>
                            </div>
                            <p className="text-sm text-[#617589]">Price includes VAT. Installation charges calculated separately.</p>
                        </div>

                        {/* Feature Badges */}
                        <div className="flex flex-wrap gap-2">
                            <div className="inline-flex items-center px-3 py-1 rounded-full bg-green-50 text-green-700 border border-green-100 text-sm font-medium">
                                <span className="material-symbols-outlined text-[18px] mr-1">eco</span> 70% Energy Saving
                            </div>
                            <div className="inline-flex items-center px-3 py-1 rounded-full bg-blue-50 text-primary border border-blue-100 text-sm font-medium">
                                <span className="material-symbols-outlined text-[18px] mr-1">wifi</span> Smart Control
                            </div>
                            <div className="inline-flex items-center px-3 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-100 text-sm font-medium">
                                <span className="material-symbols-outlined text-[18px] mr-1">air</span> Dual Filtration
                            </div>
                            <div className="inline-flex items-center px-3 py-1 rounded-full bg-orange-50 text-orange-700 border border-orange-100 text-sm font-medium">
                                <span className="material-symbols-outlined text-[18px] mr-1">bolt</span> 10 Yr Compressor Warranty
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col sm:flex-row gap-4 mt-4 pt-6 border-t border-gray-100">
                            <button className="flex-1 h-12 bg-primary hover:bg-blue-600 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20">
                                <span className="material-symbols-outlined">request_quote</span> Request Quote
                            </button>
                            <button className="flex-1 h-12 bg-white border border-gray-200 hover:bg-gray-50 text-[#111418] font-bold rounded-lg transition-colors flex items-center justify-center gap-2">
                                <span className="material-symbols-outlined">download</span> Download Brochure
                            </button>
                        </div>
                    </div>
                </div>

                {/* Info Tabs Navigation */}
                <div className="flex w-full border-b border-[#f0f2f4] mt-8">
                    <div className="flex gap-8">
                        <button className="border-b-2 border-primary pb-3 text-primary font-bold text-base px-2">Overview</button>
                        <button className="border-b-2 border-transparent pb-3 text-[#617589] font-medium text-base px-2 hover:text-[#111418] transition-colors">Specifications</button>
                        <button className="border-b-2 border-transparent pb-3 text-[#617589] font-medium text-base px-2 hover:text-[#111418] transition-colors">Documents</button>
                        <button className="border-b-2 border-transparent pb-3 text-[#617589] font-medium text-base px-2 hover:text-[#111418] transition-colors">Reviews</button>
                    </div>
                </div>

                {/* Tab Content: Overview & Application Areas */}
                <div className="flex flex-col gap-10 animate-fade-in">
                    {/* Description */}
                    <section className="max-w-[800px]">
                        <h3 className="text-2xl font-bold text-[#111418] mb-4">Ultimate Cooling Comfort</h3>
                        <p className="text-[#111418] leading-relaxed mb-6">The Midea Xtreme Save series is engineered for the extreme weather of Nepal. Featuring the high-frequency Racer Tech inverter compressor, it cools your room faster while consuming significantly less energy. The specialized "Gear Shift" function allows you to control power consumption manually, offering savings of up to 70% compared to conventional units.</p>

                        {/* Application Areas Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
                            <div className="bg-white p-4 rounded-xl border border-gray-100 flex flex-col items-center gap-3 text-center shadow-sm">
                                <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-primary">
                                    <span className="material-symbols-outlined">chair</span>
                                </div>
                                <span className="font-semibold text-sm">Living Room</span>
                            </div>
                            <div className="bg-white p-4 rounded-xl border border-gray-100 flex flex-col items-center gap-3 text-center shadow-sm">
                                <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-primary">
                                    <span className="material-symbols-outlined">bed</span>
                                </div>
                                <span className="font-semibold text-sm">Bedroom</span>
                            </div>
                            <div className="bg-white p-4 rounded-xl border border-gray-100 flex flex-col items-center gap-3 text-center shadow-sm">
                                <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-primary">
                                    <span className="material-symbols-outlined">desk</span>
                                </div>
                                <span className="font-semibold text-sm">Small Office</span>
                            </div>
                            <div className="bg-white p-4 rounded-xl border border-gray-100 flex flex-col items-center gap-3 text-center shadow-sm">
                                <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-primary">
                                    <span className="material-symbols-outlined">meeting_room</span>
                                </div>
                                <span className="font-semibold text-sm">Meeting Room</span>
                            </div>
                        </div>
                    </section>

                    {/* Technical Specifications */}
                    <section>
                        <h3 className="text-2xl font-bold text-[#111418] mb-6">Technical Specifications</h3>
                        <div className="overflow-hidden rounded-xl border border-[#dbe0e6]">
                            <table className="w-full text-left text-sm">
                                <tbody className="divide-y divide-[#dbe0e6]">
                                    <tr className="bg-white">
                                        <td className="px-6 py-4 font-medium text-[#617589] w-1/3">Model</td>
                                        <td className="px-6 py-4 text-[#111418] font-semibold">MSAG-18HRFN1</td>
                                    </tr>
                                    <tr className="bg-[#f6f7f8]">
                                        <td className="px-6 py-4 font-medium text-[#617589]">Cooling Capacity</td>
                                        <td className="px-6 py-4 text-[#111418]">18,000 BTU/h (1.5 Ton)</td>
                                    </tr>
                                    <tr className="bg-white">
                                        <td className="px-6 py-4 font-medium text-[#617589]">Power Input</td>
                                        <td className="px-6 py-4 text-[#111418]">1550 Watts</td>
                                    </tr>
                                    <tr className="bg-[#f6f7f8]">
                                        <td className="px-6 py-4 font-medium text-[#617589]">ISEER Rating</td>
                                        <td className="px-6 py-4 text-[#111418]">4.5 (5 Star Equivalent)</td>
                                    </tr>
                                    <tr className="bg-white">
                                        <td className="px-6 py-4 font-medium text-[#617589]">Refrigerant</td>
                                        <td className="px-6 py-4 text-[#111418]">R32 (Eco-Friendly)</td>
                                    </tr>
                                    <tr className="bg-[#f6f7f8]">
                                        <td className="px-6 py-4 font-medium text-[#617589]">Indoor Noise Level (H/M/L)</td>
                                        <td className="px-6 py-4 text-[#111418]">42 / 36 / 28 dB(A)</td>
                                    </tr>
                                    <tr className="bg-white">
                                        <td className="px-6 py-4 font-medium text-[#617589]">Dimensions (WxDxH)</td>
                                        <td className="px-6 py-4 text-[#111418]">965 x 215 x 319 mm</td>
                                    </tr>
                                    <tr className="bg-[#f6f7f8]">
                                        <td className="px-6 py-4 font-medium text-[#617589]">Voltage</td>
                                        <td className="px-6 py-4 text-[#111418]">220-240V, 50Hz, 1Ph</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </section>

                    {/* Downloads Section */}
                    <section>
                        <h3 className="text-2xl font-bold text-[#111418] mb-6">Downloads &amp; Support</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Download Card 1 */}
                            <div className="flex items-center gap-4 p-4 rounded-xl border border-gray-200 bg-white hover:shadow-md transition-shadow cursor-pointer group">
                                <div className="size-12 rounded-lg bg-red-50 flex items-center justify-center text-red-600 group-hover:bg-red-100 transition-colors">
                                    <span className="material-symbols-outlined">picture_as_pdf</span>
                                </div>
                                <div className="flex-1">
                                    <p className="font-bold text-[#111418]">Product Brochure</p>
                                    <p className="text-sm text-[#617589]">PDF • 2.4 MB</p>
                                </div>
                                <span className="material-symbols-outlined text-[#617589]">download</span>
                            </div>
                            {/* Download Card 2 */}
                            <div className="flex items-center gap-4 p-4 rounded-xl border border-gray-200 bg-white hover:shadow-md transition-shadow cursor-pointer group">
                                <div className="size-12 rounded-lg bg-blue-50 flex items-center justify-center text-primary group-hover:bg-blue-100 transition-colors">
                                    <span className="material-symbols-outlined">menu_book</span>
                                </div>
                                <div className="flex-1">
                                    <p className="font-bold text-[#111418]">User Manual</p>
                                    <p className="text-sm text-[#617589]">PDF • 1.1 MB</p>
                                </div>
                                <span className="material-symbols-outlined text-[#617589]">download</span>
                            </div>
                        </div>
                    </section>
                </div>

                {/* Reviews Section (RatingSummary) */}
                <div className="mt-8 pt-8 border-t border-gray-200">
                    <h3 className="text-2xl font-bold text-[#111418] mb-6">Customer Reviews</h3>
                    <div className="flex flex-wrap gap-x-12 gap-y-8">
                        <div className="flex flex-col gap-2 min-w-[150px]">
                            <p className="text-[#111418] text-5xl font-black leading-tight tracking-[-0.033em]">4.8</p>
                            <div className="flex gap-1 text-yellow-500">
                                <span className="material-symbols-outlined fill-current">star</span>
                                <span className="material-symbols-outlined fill-current">star</span>
                                <span className="material-symbols-outlined fill-current">star</span>
                                <span className="material-symbols-outlined fill-current">star</span>
                                <span className="material-symbols-outlined fill-current">star_half</span>
                            </div>
                            <p className="text-[#617589] text-base font-medium">Based on 124 reviews</p>
                        </div>
                        <div className="grid min-w-[280px] max-w-[500px] flex-1 grid-cols-[20px_1fr_40px] items-center gap-y-3">
                            <p className="text-[#111418] text-sm font-bold">5</p>
                            <div className="flex h-2 flex-1 overflow-hidden rounded-full bg-[#dbe0e6]">
                                <div className="rounded-full bg-primary" style={{ width: '78%' }}></div>
                            </div>
                            <p className="text-[#617589] text-sm font-medium text-right">78%</p>
                            <p className="text-[#111418] text-sm font-bold">4</p>
                            <div className="flex h-2 flex-1 overflow-hidden rounded-full bg-[#dbe0e6]">
                                <div className="rounded-full bg-primary" style={{ width: '15%' }}></div>
                            </div>
                            <p className="text-[#617589] text-sm font-medium text-right">15%</p>
                            <p className="text-[#111418] text-sm font-bold">3</p>
                            <div className="flex h-2 flex-1 overflow-hidden rounded-full bg-[#dbe0e6]">
                                <div className="rounded-full bg-primary" style={{ width: '4%' }}></div>
                            </div>
                            <p className="text-[#617589] text-sm font-medium text-right">4%</p>
                            <p className="text-[#111418] text-sm font-bold">2</p>
                            <div className="flex h-2 flex-1 overflow-hidden rounded-full bg-[#dbe0e6]">
                                <div className="rounded-full bg-primary" style={{ width: '1%' }}></div>
                            </div>
                            <p className="text-[#617589] text-sm font-medium text-right">1%</p>
                            <p className="text-[#111418] text-sm font-bold">1</p>
                            <div className="flex h-2 flex-1 overflow-hidden rounded-full bg-[#dbe0e6]">
                                <div className="rounded-full bg-primary" style={{ width: '2%' }}></div>
                            </div>
                            <p className="text-[#617589] text-sm font-medium text-right">2%</p>
                        </div>
                    </div>
                </div>
            </div>
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
