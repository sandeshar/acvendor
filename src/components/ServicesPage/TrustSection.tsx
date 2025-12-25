export default function TrustSection({ data }: { data?: {
    title?: string;
    description?: string;
    quote_text?: string;
    quote_author?: string;
    quote_role?: string;
    quote_image?: string;
    stat1_value?: string; stat1_label?: string; stat1_sub?: string;
    stat2_value?: string; stat2_label?: string; stat2_sub?: string;
    stat3_value?: string; stat3_label?: string; stat3_sub?: string;
} }) {
    const d = data || {};
    return (
        <section className="bg-slate-50 py-16">
            <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                    <div>
                        <h2 className="text-3xl font-black text-slate-900 mb-6">{d.title || 'Why Nepal trusts our service'}</h2>
                        {d.description ? (
                            <p className="text-slate-600 mb-6">{d.description}</p>
                        ) : null}
                        <div className="flex flex-col gap-6">
                            <div className="flex gap-4 items-start">
                                <span className="text-4xl text-primary font-black">{d.stat1_value || '5k+'}</span>
                                <div>
                                    <h4 className="font-bold text-slate-900">{d.stat1_label || 'Happy Customers'}</h4>
                                    <p className="text-sm text-slate-500">{d.stat1_sub || 'Across Kathmandu, Lalitpur, and Bhaktapur.'}</p>
                                </div>
                            </div>
                            <div className="flex gap-4 items-start">
                                <span className="text-4xl text-primary font-black">{d.stat2_value || '10+'}</span>
                                <div>
                                    <h4 className="font-bold text-slate-900">{d.stat2_label || 'Years Experience'}</h4>
                                    <p className="text-sm text-slate-500">{d.stat2_sub || 'Serving the industry with dedication.'}</p>
                                </div>
                            </div>
                            <div className="flex gap-4 items-start">
                                <span className="text-4xl text-primary font-black">{d.stat3_value || '24/7'}</span>
                                <div>
                                    <h4 className="font-bold text-slate-900">{d.stat3_label || 'Emergency Support'}</h4>
                                    <p className="text-sm text-slate-500">{d.stat3_sub || 'Always available for urgent repairs.'}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 relative">
                        <span className="material-symbols-outlined text-6xl text-primary/10 absolute top-4 right-4">format_quote</span>
                        <p className="text-lg text-slate-600 italic mb-6 relative z-10">{d.quote_text || '"The team was incredibly professional. They installed our office AC system in one day and left the place spotless. Highly recommended!"'}</p>
                        <div className="flex items-center gap-4">
                            {(() => {
                                const fallback = 'https://lh3.googleusercontent.com/aida-public/AB6AXuABFDq2boqSreVjEIXWTgDLRMQ_RYSX41ayzLdnNYJMJbFtH4HzmhK3i3w8-QX85BECmTiey8ai1BxoROX4KD4Mn59_fOLLNJkVpQRE95w9N62vGtPM5JRVmmqG4cTP1OkiZaTQ-n77i5lJNDYyk869p308_2wrBUPfm3j9gJqYo-f89NoLkMTlb2GPv2Qvj-OGfU6OEhFuZebu3LWWpRx5tPOMC3cVtUQJedhHp5pU-0KGNf882TAwuj79STj2BHSRH7yAkvqQXoA';
                                const bg = `url('${d.quote_image || fallback}')`;
                                return (
                                    <div className="w-10 h-10 rounded-full bg-gray-200 bg-cover bg-center" style={{ backgroundImage: bg }} />
                                );
                            })()}
                            <div>
                                <h5 className="font-bold text-slate-900 text-sm">{d.quote_author || 'Rajesh Hamal'}</h5>
                                <p className="text-xs text-slate-500">{d.quote_role || 'Business Owner, Thamel'}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
