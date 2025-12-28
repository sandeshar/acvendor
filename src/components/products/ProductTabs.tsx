"use client";

import React from 'react';
import type { ProductWithRelations } from '@/types/product';

export default function ProductTabs({ post }: { post: ProductWithRelations }) {

    return (
        <div>


            <div className="mt-6">
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

                        {/* Application areas are dynamic when available via `post.application_areas` (array or JSON string), otherwise fall back to defaults */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
                            {(() => {
                                // Build areas list from product data when available
                                const defaults = [
                                    { icon: 'chair', label: 'Living Room' },
                                    { icon: 'bed', label: 'Bedroom' },
                                    { icon: 'desk', label: 'Small Office' },
                                    { icon: 'meeting_room', label: 'Meeting Room' },
                                ];

                                let areas: Array<{ icon: string; label: string }> = defaults;

                                try {
                                    const raw = (post as any).application_areas || (post as any).applicationAreas || null;
                                    if (raw) {
                                        if (Array.isArray(raw)) {
                                            // array of strings or objects
                                            if (raw.length && typeof raw[0] === 'string') {
                                                const mapping: Record<string, string> = { 'living room': 'chair', 'bedroom': 'bed', 'small office': 'desk', 'meeting room': 'meeting_room' };
                                                areas = raw.map((s: string) => ({ icon: mapping[s.toLowerCase()] || 'chair', label: s }));
                                            } else {
                                                areas = raw.map((a: any) => ({ icon: a.icon || 'chair', label: a.label || a.name || 'Area' }));
                                            }
                                        } else if (typeof raw === 'string') {
                                            try {
                                                const parsed = JSON.parse(raw);
                                                if (Array.isArray(parsed)) {
                                                    areas = parsed.map((a: any) => ({ icon: a.icon || 'chair', label: a.label || a.name || String(a) }));
                                                } else if (typeof parsed === 'object') {
                                                    areas = Object.keys(parsed).map(k => ({ icon: parsed[k]?.icon || 'chair', label: parsed[k]?.label || k }));
                                                }
                                            } catch (e) {
                                                // fallback: treat as comma-separated labels
                                                const parts = raw.split(',').map((s: string) => s.trim()).filter(Boolean);
                                                if (parts.length) {
                                                    const mapping: Record<string, string> = { 'living room': 'chair', 'bedroom': 'bed', 'small office': 'desk', 'meeting room': 'meeting_room' };
                                                    areas = parts.map((s: string) => ({ icon: mapping[s.toLowerCase()] || 'chair', label: s }));
                                                }
                                            }
                                        }
                                    }
                                } catch (err) {
                                    // ignore parsing errors and use defaults
                                }

                                return areas.map((a) => (
                                    <div key={a.label} className="bg-white p-4 rounded-xl border border-gray-100 flex flex-col items-center gap-3 text-center shadow-sm">
                                        <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-primary"><span className="material-symbols-outlined">{a.icon}</span></div>
                                        <span className="font-semibold text-sm">{a.label}</span>
                                    </div>
                                ));
                            })()}
                        </div>
                    </div>
                </section>

                <section className="mt-10">
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


            </div>
        </div>
    );
}
