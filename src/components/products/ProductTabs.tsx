"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import type { ProductWithRelations } from '@/types/product';

export default function ProductTabs({ post }: { post: ProductWithRelations }) {
    const [active, setActive] = useState<'overview' | 'specs' | 'docs' | 'reviews'>('overview');
    const [testimonials, setTestimonials] = useState<any[]>([]);
    const [loadingReviews, setLoadingReviews] = useState(false);

    useEffect(() => {
        const fetchReviews = async () => {
            if (!post?.id) return;
            setLoadingReviews(true);
            try {
                const res = await fetch(`/api/testimonial?product=${post.id}`);
                const data = await res.json();
                setTestimonials(data || []);
            } catch (err) {
                console.error('Error fetching testimonials for product', err);
                setTestimonials([]);
            } finally {
                setLoadingReviews(false);
            }
        };

        if (active === 'reviews') {
            fetchReviews();
        }
    }, [active, post?.id]);

    const tabs: { key: typeof active; label: string }[] = [
        { key: 'overview', label: 'Overview' },
        { key: 'specs', label: 'Specifications' },
        { key: 'docs', label: 'Documents' },
        { key: 'reviews', label: 'Reviews' },
    ];

    return (
        <div>
            <div className="flex w-full border-b border-[#f0f2f4] mt-8">
                <div className="flex gap-8">
                    {tabs.map((t) => (
                        <button
                            key={t.key}
                            onClick={() => setActive(t.key)}
                            className={`border-b-2 pb-3 px-2 text-base ${active === t.key ? 'border-primary text-primary font-bold' : 'border-transparent text-[#617589] font-medium hover:text-[#111418] transition-colors'}`}>
                            {t.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="mt-6">
                {active === 'overview' && (
                    <section className="flex flex-col gap-10 animate-fade-in">
                        <div className="max-w-[800px]">
                            <h3 className="text-2xl font-bold text-[#111418] mb-4">{post.title}</h3>
                            {post.excerpt ? (
                                <p className="text-[#111418] leading-relaxed mb-6">{post.excerpt}</p>
                            ) : post.content ? (
                                <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: post.content as string }} />
                            ) : (
                                <p className="text-[#617589]">No overview available.</p>
                            )}

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
                                <div className="bg-white p-4 rounded-xl border border-gray-100 flex flex-col items-center gap-3 text-center shadow-sm">
                                    <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-primary"><span className="material-symbols-outlined">chair</span></div>
                                    <span className="font-semibold text-sm">Living Room</span>
                                </div>
                                <div className="bg-white p-4 rounded-xl border border-gray-100 flex flex-col items-center gap-3 text-center shadow-sm">
                                    <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-primary"><span className="material-symbols-outlined">bed</span></div>
                                    <span className="font-semibold text-sm">Bedroom</span>
                                </div>
                                <div className="bg-white p-4 rounded-xl border border-gray-100 flex flex-col items-center gap-3 text-center shadow-sm">
                                    <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-primary"><span className="material-symbols-outlined">desk</span></div>
                                    <span className="font-semibold text-sm">Small Office</span>
                                </div>
                                <div className="bg-white p-4 rounded-xl border border-gray-100 flex flex-col items-center gap-3 text-center shadow-sm">
                                    <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-primary"><span className="material-symbols-outlined">meeting_room</span></div>
                                    <span className="font-semibold text-sm">Meeting Room</span>
                                </div>
                            </div>
                        </div>
                    </section>
                )}

                {active === 'specs' && (
                    <section>
                        <h3 className="text-2xl font-bold text-[#111418] mb-6">Technical Specifications</h3>
                        <div className="overflow-hidden rounded-xl border border-[#dbe0e6]">
                            {(post.model || post.capacity || post.power || post.iseer || post.refrigerant || post.noise || post.dimensions || post.voltage) ? (
                                <table className="w-full text-left text-sm">
                                    <tbody className="divide-y divide-[#dbe0e6]">
                                        {post.model && (
                                            <tr className="bg-white">
                                                <td className="px-6 py-4 font-medium text-[#617589] w-1/3">Model</td>
                                                <td className="px-6 py-4 text-[#111418] font-semibold">{post.model}</td>
                                            </tr>
                                        )}
                                        {post.capacity && (
                                            <tr className="bg-[#f6f7f8]">
                                                <td className="px-6 py-4 font-medium text-[#617589]">Cooling Capacity</td>
                                                <td className="px-6 py-4 text-[#111418]">{post.capacity}</td>
                                            </tr>
                                        )}
                                        {post.power && (
                                            <tr className="bg-white">
                                                <td className="px-6 py-4 font-medium text-[#617589]">Power Input</td>
                                                <td className="px-6 py-4 text-[#111418]">{post.power}</td>
                                            </tr>
                                        )}
                                        {post.iseer && (
                                            <tr className="bg-[#f6f7f8]">
                                                <td className="px-6 py-4 font-medium text-[#617589]">ISEER Rating</td>
                                                <td className="px-6 py-4 text-[#111418]">{post.iseer}</td>
                                            </tr>
                                        )}
                                        {post.refrigerant && (
                                            <tr className="bg-white">
                                                <td className="px-6 py-4 font-medium text-[#617589]">Refrigerant</td>
                                                <td className="px-6 py-4 text-[#111418]">{post.refrigerant}</td>
                                            </tr>
                                        )}
                                        {post.noise && (
                                            <tr className="bg-[#f6f7f8]">
                                                <td className="px-6 py-4 font-medium text-[#617589]">Indoor Noise Level (H/M/L)</td>
                                                <td className="px-6 py-4 text-[#111418]">{post.noise}</td>
                                            </tr>
                                        )}
                                        {post.dimensions && (
                                            <tr className="bg-white">
                                                <td className="px-6 py-4 font-medium text-[#617589]">Dimensions (WxDxH)</td>
                                                <td className="px-6 py-4 text-[#111418]">{post.dimensions}</td>
                                            </tr>
                                        )}
                                        {post.voltage && (
                                            <tr className="bg-[#f6f7f8]">
                                                <td className="px-6 py-4 font-medium text-[#617589]">Voltage</td>
                                                <td className="px-6 py-4 text-[#111418]">{post.voltage}</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            ) : (
                                <div className="p-6 text-sm text-[#617589]">Technical specifications not available.</div>
                            )}
                        </div>
                    </section>
                )}

                {active === 'docs' && (
                    <section>
                        <h3 className="text-2xl font-bold text-[#111418] mb-6">Downloads & Support</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {post.brochure_url ? (
                                <div className="flex items-center gap-4 p-4 rounded-xl border border-gray-200 bg-white hover:shadow-md transition-shadow cursor-pointer group">
                                    <div className="size-12 rounded-lg bg-red-50 flex items-center justify-center text-red-600 group-hover:bg-red-100 transition-colors">
                                        <span className="material-symbols-outlined">picture_as_pdf</span>
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-bold text-[#111418]">Product Brochure</p>
                                        <p className="text-sm text-[#617589]">PDF</p>
                                    </div>
                                    <a className="material-symbols-outlined text-[#617589]" href={post.brochure_url}>download</a>
                                </div>
                            ) : (
                                <div className="p-4 text-sm text-[#617589]">No brochures or documents available.</div>
                            )}
                        </div>
                    </section>
                )}

                {active === 'reviews' && (
                    <section>
                        <h3 className="text-2xl font-bold text-[#111418] mb-6">Customer Reviews</h3>
                        <div className="flex flex-wrap gap-x-12 gap-y-8">
                            <div className="flex flex-col gap-2 min-w-[150px]">
                                <p className="text-[#111418] text-5xl font-black leading-tight tracking-[-0.033em]">{post.rating ?? '--'}</p>
                                <div className="flex gap-1 text-yellow-500">
                                    <span className="material-symbols-outlined fill-current">star</span>
                                    <span className="material-symbols-outlined fill-current">star</span>
                                    <span className="material-symbols-outlined fill-current">star</span>
                                    <span className="material-symbols-outlined fill-current">star</span>
                                    <span className="material-symbols-outlined fill-current">star_half</span>
                                </div>
                                <p className="text-[#617589] text-base font-medium">{post.reviews_count ? `Based on ${post.reviews_count} reviews` : 'No reviews yet'}</p>
                            </div>

                            <div className="grid min-w-[280px] max-w-[500px] flex-1 grid-cols-[20px_1fr_40px] items-center gap-y-3">
                                {loadingReviews ? (
                                    <p className="text-sm text-[#617589]">Loading reviews...</p>
                                ) : testimonials.length === 0 ? (
                                    <p className="text-sm text-[#617589]">No reviews yet</p>
                                ) : (
                                    testimonials.slice(0, 5).map((t, idx) => (
                                        <div key={t.id || idx} className="flex items-start gap-3 col-span-3">
                                            <img src={t.url} alt={t.name} className="h-10 w-10 rounded-full object-cover" />
                                            <div>
                                                <div className="text-sm font-semibold text-[#111418]">{t.name}</div>
                                                <div className="text-sm text-[#617589]">{t.role}</div>
                                                <div className="mt-2 text-sm text-gray-700 whitespace-pre-wrap">{t.content}</div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </section>
                )}
            </div>
        </div>
    );
}
